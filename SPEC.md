# Especificación Técnica: Lobby Multijugador

## 1. Objetivo

Permitir que múltiples jugadores se conecten a una misma partida mediante un código de sala (`LobbyCode`). El **Describer** ve la `Card` con la `word` y las `bannedWords` (pantalla `/round`, ya existente y adaptada). Los **Guessers** ven una pantalla nueva (`/round/guess`) con un `input` para escribir su intento. El `Timer` se sincroniza entre todos los clientes usando un `timestamp` emitido por el servidor al inicio de cada `Round`.

---

## 2. Nuevos conceptos de dominio

> Estos términos deben añadirse a `docs/ubiquitous-language.md` **antes de implementar cualquier tarea**.

| Término | Definición |
|---|---|
| **Lobby** | Sala identificada por un `LobbyCode` donde los jugadores se reúnen antes de iniciar una `Round`. Contiene la lista de `Player`s y el estado de la partida (`waiting` \| `playing`). |
| **LobbyCode** | Código alfanumérico único de 6 caracteres (mayúsculas) que identifica un `Lobby`. |
| **Player** | Participante conectado a un `Lobby`. Tiene un `playerName` y un `PlayerRole`. |
| **PlayerRole** | Rol asignado a un `Player`: `describer` o `guesser`. Solo puede haber un `describer` por `Lobby`. |
| **Describer** | `Player` con rol `describer`. Ve la `Card` activa y da pistas. Puede avanzar a la siguiente carta. |
| **Guesser** | `Player` con rol `guesser`. No ve la `Card`. Escribe su intento en un `input`. |
| **Guess** | Intento de un `Guesser` de acertar la `word` activa. El servidor valida si es correcto. |
| **ActiveCard** | La `Card` activa en un `Lobby` durante una `Round`. Solo la ve el `Describer`. |
| **RoundSession** | Estado de una ronda activa en el servidor: `card`, `startAt` (timestamp ms), `durationSeconds`. |

Actualizar también la definición de `Timer` en `docs/overview.md`:
> ~~El cronómetro se gestiona en el frontend (no se sincroniza entre clientes).~~
> El servidor emite un `startAt` (Unix timestamp en ms) y un `durationSeconds` al iniciar cada `Round`. Cada cliente calcula el tiempo restante como `durationSeconds - (Date.now() - startAt) / 1000`.

---

## 3. Arquitectura general

```
Frontend                          Backend (NestJS)
────────────────────              ──────────────────────────────────────
CreateLobbyPage ──HTTP POST──►  POST /api/lobby          → CreateLobby use-case
WaitingRoomPage ─────WS──────►  LobbyGateway (socket.io)
  join-lobby                       → JoinLobby use-case
  start-round                      → StartRound use-case  (solo Describer)
  next-card                        → NextCard use-case    (solo Describer)
  submit-guess                     → SubmitGuess use-case (solo Guessers)

◄─────────WS──────────────────  Eventos emitidos a la sala:
  lobby-updated                    (players conectados)
  round-started  { card, startAt, durationSeconds }
  card-changed   { card, startAt }
  guess-result   { correct: bool } → solo al emisor

RoundPage (Describer) ◄── card + startAt desde WS (no llama a GET /api/cards/random)
GuesserPage (Guesser) ◄── startAt desde WS (no ve la card)
```

**Nota sobre seguridad**: el servidor nunca envía la `Card` (ni `word` ni `bannedWords`) al cliente con rol `guesser`. La validación de `Guess` ocurre en el backend.

---

## 4. Estructura de datos

### 4.1 Backend — entidades de dominio

```typescript
// Lobby aggregate
class Lobby {
  readonly id: LobbyId          // UUID interno
  readonly code: LobbyCode      // "ABC123"
  readonly players: Player[]
  readonly status: LobbyStatus  // 'waiting' | 'playing'
  readonly roundSession: RoundSession | null

  join(player: Player): void        // lanza LobbyFullException si ya hay describer y el rol es describer
  assignDescriber(playerId: string): void
  startRound(card: Card, durationSeconds: number): RoundSession
  nextCard(card: Card): RoundSession
  findDescriber(): Player | undefined
  isDescriber(playerId: string): boolean
}

// Player entity
class Player {
  readonly id: string        // socket.id
  readonly name: string
  readonly role: PlayerRole  // 'describer' | 'guesser'
}

// Value objects
class LobbyCode { readonly value: string }   // 6 chars [A-Z0-9]
type LobbyStatus = 'waiting' | 'playing'
type PlayerRole = 'describer' | 'guesser'

// RoundSession (parte del aggregate Lobby)
interface RoundSession {
  cardId: string
  word: string           // solo se usa internamente para validar Guess
  startAt: number        // Date.now() en ms cuando el servidor arrancó la round
  durationSeconds: number
}
```

### 4.2 Backend — contratos WebSocket

**Eventos que recibe el servidor:**

```typescript
// join-lobby
{ code: string; playerName: string; role: 'describer' | 'guesser' }

// start-round  (solo Describer, valida en backend)
{ durationSeconds: number }

// next-card    (solo Describer, valida en backend)
{}

// submit-guess (solo Guessers)
{ word: string }
```

**Eventos que emite el servidor:**

```typescript
// → a toda la sala
'lobby-updated':  { players: { id: string; name: string; role: string }[] }
'round-started':  { startAt: number; durationSeconds: number; card: CardDto }
'card-changed':   { startAt: number; card: CardDto }

// → solo al Guesser emisor
'guess-result':   { correct: boolean }

// → solo al cliente con error
'error':          { message: string }
```

> **Importante**: `card` en `round-started` y `card-changed` solo se envía al socket del `Describer`. Al resto de la sala se emite solo `{ startAt, durationSeconds }` sin `card`.

### 4.3 Backend — contratos HTTP

```
POST /api/lobby
Body: { playerName: string; durationSeconds: number }
Response 201: { code: string; playerId: string; role: 'describer' }

GET /api/lobby/:code
Response 200: { code: string; status: string; players: [...] }
Response 404: { message: 'Lobby not found' }
```

### 4.4 Frontend — modelos de dominio (`features/lobby/domain/`)

```typescript
// models/lobby.model.ts
interface Lobby {
  code: string
  status: 'waiting' | 'playing'
  players: Player[]
}

// models/player.model.ts
interface Player {
  id: string
  name: string
  role: PlayerRole
}

type PlayerRole = 'describer' | 'guesser'

// models/round-session.model.ts   (lo que el cliente recibe por WS)
interface RoundSession {
  startAt: number
  durationSeconds: number
  card?: CardData   // solo lo tiene el componente Describer
}
```

### 4.5 Frontend — port del WebSocket

```typescript
// features/lobby/application/ports/lobby-socket.port.ts
interface LobbySocket {
  connect(): void
  disconnect(): void
  joinLobby(code: string, playerName: string, role: PlayerRole): void
  startRound(durationSeconds: number): void
  nextCard(): void
  submitGuess(word: string): void
  onLobbyUpdated(handler: (players: Player[]) => void): void
  onRoundStarted(handler: (session: RoundSession) => void): void
  onCardChanged(handler: (session: RoundSession) => void): void
  onGuessResult(handler: (result: { correct: boolean }) => void): void
  onError(handler: (error: { message: string }) => void): void
}
```

---

## 5. Dependencias nuevas

| Paquete | Workspace | Justificación |
|---|---|---|
| `@nestjs/websockets` | `backend` | Decoradores para Gateway WebSocket en NestJS |
| `@nestjs/platform-socket.io` | `backend` | Adaptador Socket.IO para NestJS |
| `socket.io` | `backend` | Servidor WebSocket (peer dep de platform-socket.io) |
| `socket.io-client` | `frontend` | Conexión al LobbyGateway desde el SPA |
| `react-hook-form` | `frontend` | Gestión del formulario de Guess (ya previsto en AGENTS.md) |
| `zod` | `frontend` | Validación del campo Guess |

---

## 6. Plan de tareas (en orden, aisladas por módulo)

Cada tarea toca **un solo módulo** y puede implementarse y verificarse de forma independiente.

---

### Tarea 1 — `docs/`: Actualizar lenguaje ubicuo y overview

**Alcance**: solo `docs/ubiquitous-language.md` y `docs/overview.md`.  
**Cambios**:
- Añadir los 8 nuevos términos definidos en §2.
- Actualizar la regla del `Timer` para reflejar sincronización por `startAt`.
- Actualizar el flujo de una ronda para incluir el lobby y los dos roles.

**Verificación**: revisión manual; ningún test.

---

### Tarea 2 — `backend`: Dominio del módulo `lobby`

**Alcance**: `backend/src/modules/lobby/domain/`.  
**Nuevos ficheros**:
- `value-objects/lobby-code.value-object.ts` — genera un código de 6 chars `[A-Z0-9]`, valida formato.
- `value-objects/player-role.value-object.ts` — enum `'describer' | 'guesser'`.
- `value-objects/lobby-status.value-object.ts` — enum `'waiting' | 'playing'`.
- `entities/player.entity.ts` — `id`, `name`, `role`.
- `entities/lobby.entity.ts` — aggregate con `code`, `players`, `status`, `roundSession`, y métodos `join()`, `startRound()`, `nextCard()`, `isDescriber()`, `findDescriber()`.
- `exceptions/lobby-not-found.exception.ts`
- `exceptions/describer-already-exists.exception.ts`
- `exceptions/only-describer-can.exception.ts`
- `repositories/lobby.repository.ts` — interfaz con `save(lobby)`, `findByCode(code)`.

**Tests** (`*.spec.ts` junto a cada fichero):
- `LobbyCode`: genera válido, rechaza formato incorrecto.
- `Lobby`: join añade player; join segundo describer lanza excepción; `startRound` cambia status a `playing`; `isDescriber` distingue roles correctamente.

**Verificación**: `npm run test -w backend` solo los specs nuevos.

---

### Tarea 3 — `backend`: Casos de uso del módulo `lobby`

**Alcance**: `backend/src/modules/lobby/application/use-cases/`.  
**Nuevos ficheros** (uno por caso de uso):
- `create-lobby.use-case.ts` — crea un `Lobby` con el host como `Describer`, persiste, devuelve `{ code, playerId }`.
- `join-lobby.use-case.ts` — busca por `code`, añade `Player` como `Guesser`, persiste.
- `start-round.use-case.ts` — busca lobby, valida que el solicitante es `Describer`, llama a `CardRepository.findRandom()`, llama a `lobby.startRound(card, durationSeconds)`, persiste, devuelve `RoundSession + card`.
- `next-card.use-case.ts` — igual que `start-round` pero solo cambia la carta y el `startAt`, sin cambiar `status`.
- `submit-guess.use-case.ts` — compara el intento con `lobby.roundSession.word` (case-insensitive, trim), devuelve `{ correct: boolean }`.

**DTOs** (`application/dtos/`):
- `create-lobby.dto.ts`: `{ playerName, durationSeconds }`.
- `join-lobby.dto.ts`: `{ code, playerName }`.
- `round-session.dto.ts`: `{ startAt, durationSeconds }` (sin `word`).

**Tests**: cada caso de uso con repositorios fake (implementaciones en memoria de `LobbyRepository` y `CardRepository`).

**Verificación**: `npm run test -w backend`.

---

### Tarea 4 — `backend`: Infraestructura del módulo `lobby`

**Alcance**: `backend/src/modules/lobby/infrastructure/`.  
**Nuevos ficheros**:
- `persistence/in-memory-lobby.repository.ts` — implementa `LobbyRepository` con un `Map<string, Lobby>`. Válido para MVP; se sustituirá por Mongoose si se necesita persistencia entre reinicios.

**No se añade schema Mongoose** en esta tarea (MVP en memoria).

**Tests**: `in-memory-lobby.repository.spec.ts` — verifica `save` y `findByCode`.

**Verificación**: `npm run test -w backend`.

---

### Tarea 5 — `backend`: Interfaces HTTP + WebSocket del módulo `lobby`

**Alcance**: `backend/src/modules/lobby/interfaces/`.  
**Nuevos ficheros**:
- `http/controllers/lobby.controller.ts` — `POST /api/lobby` → `CreateLobby`; `GET /api/lobby/:code` → consulta directa al repositorio.
- `ws/lobby.gateway.ts` — `@WebSocketGateway` que maneja los 4 eventos de entrada y emite los eventos de salida (ver §4.2). Usa `@Inject` para los casos de uso. **Valida el rol del emisor** antes de ejecutar `StartRound`, `NextCard`.
- `lobby.module.ts` — registra el gateway, el controller, los use-cases y el repositorio en memoria.

**Tests**:
- `lobby.controller.spec.ts` — unit con mocks de use-cases.
- `lobby.gateway.spec.ts` — unit con mocks de use-cases y server WS simulado.

**Instalación de dependencias** (antes de implementar):
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io -w backend
```

**Registro en `AppModule`**: añadir `LobbyModule` a `imports`.

**Verificación**: `npm run test -w backend` + `npm run test:e2e -w backend`.

---

### Tarea 6 — `frontend`: Dominio + puerto de la feature `lobby`

**Alcance**: `frontend/src/features/lobby/domain/` y `frontend/src/features/lobby/application/`.  
**Nuevos ficheros**:
- `domain/models/lobby.model.ts` — interfaces `Lobby`, `Player`, `PlayerRole`, `RoundSession`.
- `domain/value-objects/lobby-code.value-object.ts` — valida formato 6 chars `[A-Z0-9]`.
- `application/ports/lobby-socket.port.ts` — interfaz `LobbySocket` (ver §4.5).
- `application/use-cases/create-lobby.use-case.ts` — llama al port HTTP (no WS) `POST /api/lobby`, devuelve `{ code, role }`.
- `application/use-cases/join-lobby.use-case.ts` — llama al port HTTP `GET /api/lobby/:code` para verificar que existe, luego conecta el socket con `joinLobby(code, name, role)`.
- `application/ports/lobby-http.port.ts` — interfaz HTTP para `createLobby` y `getLobby`.

**Tests**: casos de uso con fakes de los ports.

**Verificación**: `npm run test -w frontend`.

---

### Tarea 7 — `frontend`: Infraestructura de la feature `lobby`

**Alcance**: `frontend/src/features/lobby/infrastructure/`.  
**Nuevos ficheros**:
- `ws/socket-io-lobby-socket.ts` — implementa `LobbySocket` usando `socket.io-client`. Gestiona la conexión, el `connect()` / `disconnect()` y tutti los eventos.
- `http/http-lobby.repository.ts` — implementa `LobbyHttpPort` usando `FetchHttpClient` existente.

**Instalación de dependencias**:
```bash
npm install socket.io-client -w frontend
```

**Tests**: `socket-io-lobby-socket.test.ts` con un servidor Socket.IO real levantado en el test (o mock de la librería). `http-lobby.repository.test.ts` con `msw`.

**Verificación**: `npm run test -w frontend`.

---

### Tarea 8 — `frontend`: `LobbyProvider` y contexto de dependencias

**Alcance**: `frontend/src/features/lobby/infrastructure/lobby-dependencies.context.tsx`.  
**Descripción**: Context de React que instancia `SocketIOLobbySocket`, `HttpLobbyRepository`, `CreateLobby` y `JoinLobby`, y los expone mediante hooks (`useLobbySocket`, `useCreateLobby`, `useJoinLobby`). Sigue exactamente el patrón de `card-dependencies.context.tsx`.

El `LobbyProvider` se añade en `App.tsx` envolviendo los `Outlet` (o solo las rutas `/lobby/*` y `/round/*` mediante un layout route).

**Tests**: test que verifica que los hooks lanzan error fuera del provider.

**Verificación**: `npm run test -w frontend`.

---

### Tarea 9 — `frontend`: Hook `useServerSyncedCountdown`

**Alcance**: `frontend/src/shared/hooks/use-server-synced-countdown.hook.ts`.  
**Descripción**: reemplaza `useCountdown` para el contexto multijugador. Recibe `{ startAt: number; durationSeconds: number; onExpire?: () => void }`. Calcula `remaining = Math.max(0, durationSeconds - (Date.now() - startAt) / 1000)`. Usa `setInterval` de 500 ms para mayor precisión visual. No tiene `pause`/`resume` (el timer es del servidor). Expone `{ remainingSeconds, formatted }`.

**Tests**: `use-server-synced-countdown.hook.test.ts` con `vi.useFakeTimers()` y `renderHook`.

**Nota**: `useCountdown` existente **no se modifica** — sigue funcionando para el modo en solitario.

**Verificación**: `npm run test -w frontend`.

---

### Tarea 10 — `frontend`: Hook `useLobby`

**Alcance**: `frontend/src/features/lobby/ui/hooks/use-lobby.hook.ts`.  
**Descripción**: hook adaptador que suscribe al `LobbySocket` del contexto y expone el estado de UI:
```typescript
{
  players: Player[]
  roundSession: RoundSession | null
  myRole: PlayerRole | null
  isConnected: boolean
  startRound: (durationSeconds: number) => void
  nextCard: () => void
  submitGuess: (word: string) => void
}
```
Escucha `lobby-updated`, `round-started`, `card-changed`. Al recibir `round-started` o `card-changed`, actualiza `roundSession`. **No navega** — la navegación la hace el componente.

**Tests**: con `renderHook` + socket fake.

**Verificación**: `npm run test -w frontend`.

---

### Tarea 11 — `frontend`: Páginas `CreateLobbyPage` y `WaitingRoomPage`

**Alcance**: `frontend/src/features/lobby/ui/pages/`.  
**`CreateLobbyPage`** (`/lobby/new`):
- Formulario (`react-hook-form` + `zod`): campo `playerName` (requerido) y selector de duración de ronda (reutiliza los inputs de minutos/segundos de `HomePage`).
- Al enviar: llama a `useCreateLobby` → navega a `/lobby/:code`.

**`WaitingRoomPage`** (`/lobby/:code`):
- Muestra el `LobbyCode` copiable.
- Muestra lista de `players` conectados.
- Botón "Iniciar ronda" solo visible si `myRole === 'describer'`.
- Al recibir evento `round-started` desde `useLobby`: navega a `/round` si `describer`, o a `/round/guess` si `guesser`. Este es el único `if` de negocio permitido en la UI.

**Componentes auxiliares** (en `ui/components/`):
- `LobbyCodeDisplay` — muestra el código con botón copiar.
- `PlayerList` — lista de players con badges de rol.
- `JoinLobbyForm` — formulario de nombre para entrar como Guesser (ruta `/lobby/:code` visitada sin ser host).

**Tests**: RTL, comportamiento visible.

**Verificación**: `npm run test -w frontend`.

---

### Tarea 12 — `frontend`: Nueva `GuesserPage`

**Alcance**: `frontend/src/features/lobby/ui/pages/GuesserPage/`.  
**Contenido**:
- `TimerDisplay` sincronizado usando `useServerSyncedCountdown` (Tarea 9).
- Formulario controlado con `react-hook-form` + `zod`: `input[type=text]` para la palabra (`minLength: 1`, `trim`).
- Botón "Enviar" → llama a `submitGuess(word)` del hook `useLobby`.
- Feedback: mensaje `✅ ¡Correcto!` o `❌ Inténtalo de nuevo` al recibir `guess-result`.
- **No ve** ningún elemento de la `Card` (ni `word` ni `bannedWords`).

**Tests**: RTL — renderiza timer, input y feedback según estado del hook.

**Verificación**: `npm run test -w frontend`.

---

### Tarea 13 — `frontend`: Adaptar `RoundPage` al modo multijugador

**Alcance**: `frontend/src/pages/round/RoundPage.tsx` (y su test).  
**Cambios**:
- Sustituir `useRandomCard` por la `card` que llega de `useLobby().roundSession.card`.
- Sustituir `useCountdown` por `useServerSyncedCountdown` con `startAt` y `durationSeconds` de `roundSession`.
- El botón "Siguiente" llama a `useLobby().nextCard()` en lugar de `reload()`.
- Eliminar botón "Pausa/Continuar" (timer sincronizado, no local).
- `RoundConfigSession` deja de usarse en esta página (la config viene del servidor).

**Tests**: actualizar `RoundPage.test.tsx` para mockear `useLobby`.

**Nota**: `useRandomCard` y `useCountdown` siguen existiendo sin modificar (respetan OCP).

**Verificación**: `npm run test -w frontend`.

---

### Tarea 14 — `frontend`: Actualizar rutas

**Alcance**: `frontend/src/routes/index.tsx`.  
**Cambios**:
```
/                     → HomePage (sin cambios)
/lobby/new            → CreateLobbyPage (lazy)
/lobby/:code          → WaitingRoomPage (lazy)
/round                → RoundPage (lazy, sin cambios en la ruta)
/round/guess          → GuesserPage (lazy)
```
El `LobbyProvider` se añade como layout route padre de `/lobby/*` y `/round/*`.

**Tests**: actualizar rutas en el test existente de `RoundPage` si referencia `MemoryRouter`.

**Verificación**: `npm run test -w frontend` + `npm run build -w frontend`.

---

### Tarea 15 — `e2e`: Test de flujo completo

**Alcance**: `e2e/tests/lobby.spec.ts`.  
**Flujo cubierto**:
1. Host abre `/lobby/new`, introduce nombre, crea sala.
2. Guesser abre `/lobby/:code` en otra pestaña, introduce nombre.
3. Host pulsa "Iniciar ronda".
4. Host es redirigido a `/round` y ve la `Card`.
5. Guesser es redirigido a `/round/guess` y ve el timer y el input.
6. Guesser escribe la `word` correcta → ve `✅ ¡Correcto!`.
7. Host pulsa "Siguiente" → Guesser ve el timer reiniciarse.

**Verificación**: `npm run test:e2e -w e2e`.

---

## 7. Resumen de dependencias entre tareas

```
Tarea 1 (docs)
  └─► Tarea 2 (backend dominio)
        └─► Tarea 3 (backend use-cases)
              └─► Tarea 4 (backend infra)
                    └─► Tarea 5 (backend interfaces + WS)  ◄─── instala @nestjs/websockets
                          └─► Tarea 15 (e2e)

Tarea 6 (frontend dominio + ports)  ◄─── requiere Tarea 1
  └─► Tarea 7 (frontend infra)  ◄─── instala socket.io-client
        └─► Tarea 8 (LobbyProvider)
              └─► Tarea 10 (useLobby hook)
                    ├─► Tarea 11 (CreateLobbyPage + WaitingRoomPage)
                    ├─► Tarea 12 (GuesserPage)  ◄─── requiere Tarea 9
                    └─► Tarea 13 (adaptar RoundPage)
                          └─► Tarea 14 (rutas)
                                └─► Tarea 15 (e2e)

Tarea 9 (useServerSyncedCountdown) — independiente de Tareas 6-8
```

Cada tarea se puede implementar, pasar lint + tests y mergear de forma autónoma. Las dependencias son **en vertical** (una tarea necesita la anterior del mismo workspace) pero ninguna tarea cruza los dos workspaces simultáneamente.


---

## 8. Estado de implementación

| # | Tarea | Estado |
|---|---|---|
| 1 | `docs/`: Actualizar lenguaje ubicuo y overview | ✅ Completada |
| 2 | `backend`: Dominio del módulo `lobby` | ⬜ Pendiente |
| 3 | `backend`: Casos de uso del módulo `lobby` | ⬜ Pendiente |
| 4 | `backend`: Infraestructura del módulo `lobby` | ⬜ Pendiente |
| 5 | `backend`: Interfaces HTTP + WebSocket del módulo `lobby` | ⬜ Pendiente |
| 6 | `frontend`: Dominio + puerto de la feature `lobby` | ⬜ Pendiente |
| 7 | `frontend`: Infraestructura de la feature `lobby` | ⬜ Pendiente |
| 8 | `frontend`: `LobbyProvider` y contexto de dependencias | ⬜ Pendiente |
| 9 | `frontend`: Hook `useServerSyncedCountdown` | ⬜ Pendiente |
| 10 | `frontend`: Hook `useLobby` | ⬜ Pendiente |
| 11 | `frontend`: Páginas `CreateLobbyPage` y `WaitingRoomPage` | ⬜ Pendiente |
| 12 | `frontend`: Nueva `GuesserPage` | ⬜ Pendiente |
| 13 | `frontend`: Adaptar `RoundPage` al modo multijugador | ⬜ Pendiente |
| 14 | `frontend`: Actualizar rutas | ⬜ Pendiente |
| 15 | `e2e`: Test de flujo completo | ⬜ Pendiente |

