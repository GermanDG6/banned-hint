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
  end-round                        → EndRound use-case    (solo Describer, al expirar timer)

◄─────────WS──────────────────  Eventos emitidos a la sala:
  lobby-updated                    (players conectados)
  round-started  { card?, startAt, durationSeconds }   → card solo al Describer
                                                        → también al reconectar si hay ronda activa
  card-changed   { card?, startAt }                    → card solo al Describer
  guess-result   { correct: bool }                     → solo al emisor
  round-ended    {}                                    → a toda la sala al terminar la ronda

RoundPage (Describer) ◄── card + startAt desde WS (no llama a GET /api/cards/random)
GuesserPage (Guesser) ◄── startAt desde WS (no ve la card)

Reconexión (recarga de página):
  join-lobby (con playerId) ───►  handleJoinLobby detecta ronda activa
  ◄── round-started              → emitido solo al cliente reconectado
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
{ code: string; playerName: string; role: 'describer' | 'guesser'; playerId?: string }

// start-round  (solo Describer, valida en backend)
{ durationSeconds: number }

// next-card    (solo Describer, valida en backend)
{}

// submit-guess (solo Guessers)
{ word: string }

// end-round    (solo Describer, cuando el timer expira en el cliente)
{}
```

**Eventos que emite el servidor:**

```typescript
// → a toda la sala
'lobby-updated':  { players: { id: string; name: string; role: string }[] }
'round-ended':    {}

// → a toda la sala (card solo al Describer; al Guesser sin card)
// También emitido individualmente al cliente que se reconecta si hay ronda activa
'round-started':  { startAt: number; durationSeconds: number; card?: CardDto }
'card-changed':   { startAt: number; card?: CardDto }

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
- `domain/models/card-data.model.ts` — tipo plano `CardData` (sin acoplamiento a `features/card/`).
- `domain/models/lobby.model.ts` — interfaces `Lobby`, `Player`, `RoundSession`; tipo `PlayerRole` con patrón `as const`.
- `domain/value-objects/lobby-code.value-object.ts` — valida formato 6 chars `[A-Z0-9]`; incluye tests.
- `domain/exceptions/lobby-not-found.exception.ts` — excepción tipada de dominio.
- `application/ports/lobby-http.port.ts` — interfaz `LobbyHttpPort` (métodos `createLobby`, `getLobby`).
- `application/ports/lobby-socket.port.ts` — interfaz `LobbySocket` (ver §4.5).
- `application/use-cases/create-lobby.use-case.ts` — llama a `LobbyHttpPort.createLobby()`, devuelve `{ code, playerId, role }`; incluye tests.
- `application/use-cases/join-lobby.use-case.ts` — verifica existencia del Lobby con `LobbyHttpPort.getLobby()`, lanza `LobbyNotFoundException` si no existe, luego conecta socket; incluye tests.

**Tests**: todos los casos de uso + value objects pasan con fakes de los ports.

**Verificación**: ✅ `npm run test -w frontend` — 19 test files, 133 tests passed.

---

### Tarea 7 — `frontend`: Infraestructura de la feature `lobby`

**Alcance**: `frontend/src/features/lobby/infrastructure/`.  
**Cambios glogales previos**:
- Extendido `shared/http/http-client.port.ts` añadiendo método `post<T>(url, body): Promise<T>`.
- Implementado `post` en `shared/http/fetch-http-client.ts` siguiendo el mismo patrón que `get`.
- Actualizado `shared/http/fetch-http-client.test.ts` con 6 nuevos tests para `post` (incluyendo serialización de objetos, errores 4xx/5xx, etc.).

**Nuevos ficheros**:
- `http/lobby-api-response.type.ts` — tipo que mapea la respuesta de `GET /api/lobby/:code`.
- `http/http-lobby.repository.ts` — implementa `LobbyHttpPort` usando `FetchHttpClient`. Captura status 404 y devuelve `null` (resultado válido, no excepción).
- `http/http-lobby.repository.test.ts` — 8 tests unitarios con mocks de `HttpClient`.
- `ws/socket-io-lobby-socket.ts` — implementa `LobbySocket` usando `socket.io-client`. Gestiona `connect()` / `disconnect()`, 5 métodos de emisión y 5 handlers de eventos con validación de conexión.
- `ws/socket-io-lobby-socket.test.ts` — 27 tests unitarios mockeando `socket.io-client` al nivel de módulo con `vi.mock`.

**Instalación de dependencias**: ✅ `npm install socket.io-client -w frontend`.

**Tests**: todos los tests pasan.
- FetchHttpClient: 9 tests (incluyendo métodos `get` y `post`)
- HttpLobbyRepository: 8 tests (cases de `createLobby` y `getLobby` con 404 handling)
- SocketIOLobbySocket: 27 tests (conexión, emisión de eventos, registro de handlers)

**Verificación**: ✅ `npm run test -w frontend` — 21 test files, 173 tests passed; `npm run lint -w frontend` — sin errores.

---

### Tarea 8 — `frontend`: `LobbyProvider` y contexto de dependencias (+ refactor de `card`)

**Alcance**: 
- `frontend/src/features/lobby/infrastructure/` (nuevos archivos)
- `frontend/src/features/card/infrastructure/` (refactorización)

**Descripción**: Implementar el patrón **singleton container** para aislar la creación de dependencias a nivel de módulo. Refactorizar `card` para mantener coherencia entre ambas features.

**Nuevos ficheros (lobby)**:
- `lobby-dependencies.container.ts` — contenedor singleton que instancia `FetchHttpClient` → `HttpLobbyRepository`, `SocketIOLobbySocket`, `CreateLobby(repository)`, `JoinLobby(repository, socket)`. Exporta `lobbyContainer` como `const`.
- `lobby-dependencies.context.tsx` — React Context que expone `lobbyContainer` mediante cinco hooks:
  - `useLobbyDependencies()` — acceso al contexto completo; lanza error fuera del provider
  - `useLobbySocket()` — acceso a `LobbySocket`
  - `useCreateLobby()` — acceso a `CreateLobby`
  - `useJoinLobby()` — acceso a `JoinLobby`
- `lobby-dependencies.context.test.tsx` — 3 tests que verifican acceso correcto dentro del provider usando wrapper.

**Cambios en card (refactorización)**:
- Extraer `card-dependencies.container.ts` — contenedor singleton de `GetRandomCard`.
- Simplificar `card-dependencies.context.tsx` — eliminar `useMemo`, usar `cardContainer` directamente como `value`.
- Añadir `card-dependencies.context.test.tsx` — test que verifica acceso correcto dentro del provider.

**Ventajas del patrón singleton**:
- Instancias perduran durante todo el ciclo de vida de la app (reconexiones WebSocket controladas explícitamente con `connect()`/`disconnect()`).
- Fácil testabilidad: mock a nivel de módulo con `vi.mock('./lobby-dependencies.container')`.
- Referencia estable entre renders sin necesidad de `useMemo`.

**Nota**: `LobbyProvider` **no se registra** en `App.tsx` en esta tarea — se añade en la Tarea 14 como layout route padre de `/lobby/*` y `/round/*`.

**Tests**: 
- `card-dependencies.context.test.tsx`: 1 test
- `lobby-dependencies.context.test.tsx`: 3 tests
- Total: ✅ 177 tests passed

**Verificación**: ✅ `npm run test -w frontend` — 23 test files, 177 tests passed; `npm run lint -w frontend` — sin errores.

---

### Tarea 9 — `frontend`: Hook `useServerSyncedCountdown`

**Alcance**: `frontend/src/shared/hooks/use-server-synced-countdown.hook.ts`.  
**Descripción**: reemplaza `useCountdown` para el contexto multijugador. Recibe `{ startAt: number; durationSeconds: number; onExpire?: () => void }`. Calcula `remaining = Math.max(0, durationSeconds - (Date.now() - startAt) / 1000)`. Usa `setInterval` de 500 ms para mayor precisión visual. No tiene `pause`/`resume` (el timer es del servidor). Expone `{ remainingSeconds, formatted }`.

**Tests**: `use-server-synced-countdown.hook.test.ts` con `vi.useFakeTimers()` y `renderHook`.

**Nota**: `useCountdown` existente **no se modifica** — sigue funcionando para el modo en solitario.

**Verificación**: `npm run test -w frontend`.

---

### Tarea 10 — `frontend`: Hook `useLobby`

**Alcance**: 
- `frontend/src/features/lobby/application/ports/lobby-socket.port.ts` (actualizar)
- `frontend/src/features/lobby/infrastructure/ws/socket-io-lobby-socket.ts` (implementar cleanups)
- `frontend/src/features/lobby/infrastructure/ws/socket-io-lobby-socket.test.ts` (actualizar tests)
- `frontend/src/features/lobby/ui/hooks/use-lobby.hook.ts` (nuevo)
- `frontend/src/features/lobby/ui/hooks/use-lobby.hook.test.ts` (nuevo)

**Descripción**: 
1. **Extender `LobbySocket` port** con método `onConnect(handler: () => void): () => void` y cambiar retorno de todos los `on*` de `void` → `() => void`. Cada método devuelve una función cleanup que desuscribe el listener.
2. **Implementar cleanups en `SocketIOLobbySocket`**: guardar referencias de handlers y devolver `() => socket.off(event, handler)` en cada método, garantizando que el cleanup elimina exactamente el listener registrado.
3. **Crear hook `useLobby`** que recibe `{ myRole: PlayerRole | null }` como parámetro. Integra:
   - Obtención de `LobbySocket` mediante `useLobbySocket()`.
   - Registro de handlers en `useEffect` con estrategia explícita de cleanup: `useEffect(() => { const cleanup1 = socket.onConnect(...); const cleanup2 = ...; return () => { cleanup1(); cleanup2(); ... } }, [socket])`.
   - Expone estado de UI: `{ players, roundSession, myRole, isConnected, startRound, nextCard, submitGuess }`.
   - **Importante**: `myRole` se recibe como parámetro (host = `'describer'`, invitado = `'guesser'`). En futuras iteraciones, cuando los roles roten por ronda, se derivará del array `players` (ver comentario TODO en el código).

**Tests**: 
- `use-lobby.hook.test.ts`: renderHook con socket fake. Verificar:
  - `isConnected` cambia cuando `onConnect` se dispara.
  - `players` se actualiza con `onLobbyUpdated`.
  - `roundSession` se actualiza con `onRoundStarted` y `onCardChanged`.
  - Las funciones de cleanup se llaman correctamente al desmontar.
  - No hay re-registro de handlers duplicados en remonturas.
- `socket-io-lobby-socket.test.ts`: añadir mock para `socket.off`, tests para `onConnect`, y verificar que todos los métodos `on*` devuelven cleanups que llaman a `socket.off`.

**Ventajas del patrón de cleanups explícitos**:
- Previene memory leaks en remonturas en modo desarrollo.
- El singleton `SocketIOLobbySocket` nunca acumula listeners duplicados.
- Testeable: los cleanups se pueden verificar explícitamente.

**Verificación**: 
- `npm run test -w frontend` — 206 tests passed (incluyendo 11 tests de `use-lobby.hook`).
- `npm run lint -w frontend` — sin errores.

------

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

### Tarea 13 — `frontend`: Crear `DescriberPage` para modo multijugador

**Alcance**: `frontend/src/features/lobby/ui/pages/DescriberPage/` y actualizar rutas.  
**Nuevos ficheros**:
- `DescriberPage.tsx` — página para el rol `Describer` en modo multijugador. Estructura idéntica a `GuesserPage` pero sin formulario; renderiza `ActiveCardView` y botón "Siguiente".
- `DescriberPage.test.tsx` — tests RTL: timer visible, card renderizada, botón "Siguiente" llama a `nextCard()`, redirección sin state, actualización reactiva de card.
- `DescriberPage.module.css` — estilos con Tailwind + `@apply`.

**Cambios en `features/lobby/ui/components/ActiveCardView/`** (nuevo componente):
- `ActiveCardView.tsx` — renderiza `CardData` (tipo plano). Acepta `card: CardData | undefined` y `loading?: boolean`. Muestra palabra en mayúsculas y lista de palabras prohibidas.
- `ActiveCardView.test.tsx` — tests RTL básicos.
- `ActiveCardView.module.css` — estilos.

**Cambios en `features/lobby/ui/pages/WaitingRoomPage/ConnectedWaitingRoom.tsx`**:
- Redirigir `Describer` a `/round/describe` en lugar de `/round`.

**Cambios en `routes/index.tsx`**:
- Añadir ruta `/round/describe` → `<DescriberPage>` con lazy + `LobbyDependenciesProvider`.
- Restaurar ruta `/round` → `<RoundPage>` sin `LobbyDependenciesProvider` (modo solo).

**Tests**:
- `ActiveCardView.test.tsx`: 5 tests (renderizado de palabra, palabras prohibidas, loading, null).
- `DescriberPage.test.tsx`: 7 tests (redirección, timer visible, card renderizada, botón, nextCard, countdown params, actualización reactiva).

**Nota**: `RoundPage` se mantiene intacta para modo en solitario; no es adaptada al multijugador.

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

> ⚠️ Esta tarea debe ejecutarse **después de las Tareas 16–23** (reconexión implementada) para cubrir el flujo completo incluyendo el ciclo `round-ended` → sala de espera → siguiente ronda.

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
                          ├─► Tarea 18 (backend: emit on reconnect)
                          └─► Tarea 19 (backend: round-ended + EndRound)

Tarea 6 (frontend dominio + ports)  ◄─── requiere Tarea 1
  └─► Tarea 7 (frontend infra)  ◄─── instala socket.io-client
        └─► Tarea 8 (LobbyProvider)
              └─► Tarea 10 (useLobby hook)
                    ├─► Tarea 11 (CreateLobbyPage + WaitingRoomPage)
                    ├─► Tarea 12 (GuesserPage)  ◄─── requiere Tarea 9
                    └─► Tarea 13 (adaptar RoundPage)
                          └─► Tarea 14 (rutas)

Tarea 9 (useServerSyncedCountdown) — independiente de Tareas 6-8

── Reconexión ──────────────────────────────────────────────────────────

Tarea 16 (frontend: socket resiliente)  — independiente; elimina el crash visible
  └─► Tarea 17 (frontend: RoundSessionStorage + lobbyCode)
        ├─► Tarea 20 (frontend: RejoinRound use case)    ◄── tb. necesita T16
        ├─► Tarea 21 (frontend: ConnectedWaitingRoom save)
        └─► Tarea 22 (frontend: onRoundEnded hook)        ◄── tb. necesita T16 + T19

Tarea 18 (backend: emit on reconnect)   — requiere T5; independiente del frontend
Tarea 19 (backend: round-ended)         — requiere T5; independiente del frontend
  └─► Tarea 22 (frontend: onRoundEnded hook)

Tarea 20 + T21 + T22 → Tarea 23 (frontend: páginas integración final)

── E2E ─────────────────────────────────────────────────────────────────

Tarea 14 + Tarea 23 → Tarea 15 (e2e: flujo completo con reconexión)
```

Cada tarea se puede implementar, pasar lint + tests y mergear de forma autónoma. Las tareas 16-17 (frontend infra) y 18-19 (backend) son independientes entre sí y pueden desarrollarse en paralelo.


---

## 8. Reconexión al recargar páginas de ronda

### 9.1 Problema

Al recargar `/round/describe` o `/round/guess`:

1. El singleton de `SocketIOLobbySocket` se reinicializa con `socket = null` (el runtime JS se resetea completamente).
2. `location.state` se pierde (React Router solo mantiene el state en navegaciones en memoria).
3. `useLobby` intenta registrar handlers (`onConnect`, `onLobbyUpdated`, etc.) en un socket nulo y lanza `"Socket not connected. Call connect() first."`.

### 9.2 Ciclo de vida de las sesiones en `sessionStorage`

| Sesión | Contenido | Se crea | Se destruye |
|---|---|---|---|
| `LobbyPlayerSession` | `playerId`, `playerName`, `role`, `durationSeconds`, `lobbyCode` | Al unirse al lobby (`WaitingRoomPage`) | Al terminar la **partida** (fuera del alcance actual) |
| `RoundSessionStorage` | `startAt`, `durationSeconds`, `card?` | Al navegar desde `ConnectedWaitingRoom` a la página de ronda | Al recibir `round-ended` del servidor |

**Regla clave**: `LobbyPlayerSession` persiste durante **toda la partida** (múltiples rondas). Solo `RoundSessionStorage` se limpia al terminar una ronda, dado que al inicio de la siguiente ronda se sobreescribirá con los nuevos datos.

### 9.3 Flujo de reconexión

```
Recarga de /round/describe o /round/guess
 │
 ├─ location.state === null
 │   └─ Cargar RoundSessionStorage.load()   → mostrar datos mientras se sincroniza
 │   └─ Cargar LobbyPlayerSession.load()    → obtener lobbyCode, playerId, playerName, role
 │
 ├─ RejoinRound.execute(code, playerName, role, playerId)
 │   └─ lobbySocket.connect()
 │   └─ lobbySocket.joinLobby(code, playerName, role, playerId)
 │
 ├─ Backend: handleJoinLobby detecta ronda activa
 │   └─ Emite round-started solo al cliente reconectado (con card si es Describer)
 │
 └─ useLobby recibe round-started → actualiza roundSession en UI
```

### 9.4 Evento `round-ended`

- **Quién lo emite**: solo el **Describer** desde el frontend mediante el evento `end-round` cuando el timer llega a cero. El Guesser nunca emite `end-round` (evita race conditions).
- **Qué hace el backend**: el handler `end-round` en el gateway llama a `EndRound` use case (llama a `lobby.endRound()`) y emite `round-ended` a toda la sala.
- **Qué hace el frontend**: `useLobby` escucha `round-ended`, llama a `RoundSessionStorage.clear()` (**no** limpia `LobbyPlayerSession`) y expone `roundEnded: boolean`. Las páginas navegan a `/lobby/:code` (sala de espera para la siguiente ronda).

### 9.5 Contrato WebSocket ampliado

**Nuevo evento de entrada:**

```typescript
// end-round (solo Describer)
{}
```

**Nuevos eventos de salida:**

```typescript
// → a toda la sala (al reconectar, solo al cliente)
'round-started': { startAt: number; durationSeconds: number; card?: CardDto }

// → a toda la sala
'round-ended': {}
```

### 9.6 Consideraciones adicionales

- **`assignDescriberId`**: al reconectar, el backend reemplaza el id del Describer por el nuevo `socket.id`. Esto es una limitación MVP documentada: el `playerId` guardado en sesión solo es relevante para el Guesser al reconectar.
- **Resiliencia del socket**: los métodos `on*` de `SocketIOLobbySocket` deben soportar ser llamados antes de `connect()`. Los handlers se almacenan en un buffer interno y se registran en el socket real cuando se llama a `connect()`. Esto elimina el crash inmediato sin cambiar la API del port.
- **`onExpire` en `useServerSyncedCountdown`**: el Describer pasa un callback `onExpire` que emite `end-round`. El Guesser no pasa `onExpire`.

---

## 9. Tareas de reconexión (detalle)

### Tarea 16 — `frontend`: Hacer resiliente `SocketIOLobbySocket`

**Alcance**: `frontend/src/features/lobby/infrastructure/ws/socket-io-lobby-socket.ts` y su test.

**Descripción**: actualmente todos los métodos `on*` lanzan si `this.socket` es null. Cambiar la implementación para que almacenen handlers en un buffer interno (`pendingListeners`) cuando el socket no está conectado, y los registren al llamar a `connect()`. Los métodos `on*` devuelven una función cleanup que elimina el handler del buffer o del socket real, según el estado de conexión en el momento del cleanup. **Esta tarea elimina el crash visible de inmediato.**

**Estructura interna propuesta:**

```typescript
type PendingListener = { event: string; handler: (...args: unknown[]) => void };
private pendingListeners: PendingListener[] = [];

connect(): void {
  if (this.socket) return;
  this.socket = io(this.serverUrl, { ... });
  for (const { event, handler } of this.pendingListeners) {
    this.socket.on(event, handler);
  }
  this.pendingListeners = [];
}

private registerListener(event: string, handler: (...args: unknown[]) => void): () => void {
  if (this.socket) {
    this.socket.on(event, handler);
    return () => this.socket?.off(event, handler);
  }
  this.pendingListeners.push({ event, handler });
  return () => {
    this.pendingListeners = this.pendingListeners.filter(l => l.handler !== handler);
    this.socket?.off(event, handler);
  };
}
```

**Tests a añadir** (`socket-io-lobby-socket.test.ts`):
- `should not throw when calling on* before connect`.
- `should register pending listeners when connect is called after on*`.
- `should cleanup pending listener before connect is called`.
- `should cleanup registered listener after connect is called`.

**Verificación**: `npm run test -w frontend` — todos los tests existentes siguen pasando.

---

### Tarea 17 — `frontend`: `RoundSessionStorage` y `lobbyCode` en `LobbyPlayerSession`

**Alcance**:
- Nuevo: `frontend/src/features/lobby/infrastructure/round-session.storage.ts`
- Nuevo: `frontend/src/features/lobby/infrastructure/round-session.storage.test.ts`
- Modificar: `frontend/src/features/lobby/infrastructure/lobby-player.session.ts`
- Modificar: `frontend/src/features/lobby/infrastructure/lobby-player.session.test.ts`
- Modificar: `frontend/src/features/lobby/ui/pages/WaitingRoomPage/WaitingRoomPage.tsx`

**`RoundSessionStorage`**: clase con `save(session: RoundSession)`, `load(): RoundSession | null`, `clear()`. Serializa a `sessionStorage` bajo la clave `'round-session'`. Valida estructura al cargar (`isValid`).

**`LobbyPlayerSession`**: añadir campo `lobbyCode: string` a la interfaz `LobbyPlayerData` y al validador `isValid`. **No cambiar** ningún otro comportamiento.

**`WaitingRoomPage`**: actualizar las dos llamadas a `LobbyPlayerSession.save()` para incluir el `code` del lobby (disponible en `useParams`).

**Tests**:
- `RoundSessionStorage`: `should save and load a valid RoundSession`, `should return null when storage is empty`, `should return null when stored data is invalid`, `should clear the stored session`.
- `LobbyPlayerSession`: añadir tests que verifiquen `lobbyCode` en save/load/isValid.

**Verificación**: `npm run test -w frontend`.

---

### Tarea 18 — `backend`: Emitir estado actual al reconectar

**Alcance**: `backend/src/modules/lobby/interfaces/ws/lobby.gateway.ts` y su spec.

**Descripción**: en `handleJoinLobby`, tras unirse a la sala y actualizar `socketMap`, verificar si `lobby.getRoundSession() !== null`. Si hay ronda activa, emitir `round-started` **solo al cliente que se reconecta** (`client.emit`, no `server.to(code).emit`) con los datos actuales. El payload incluye `card` únicamente si el rol del jugador reconectado es `describer`.

**Cambios en `handleJoinLobby`** (al final, antes del `catch`):

```typescript
const activeSession = lobby.getRoundSession();
if (activeSession) {
  const isDescriber = payload.role === 'describer';
  const roundStartedPayload = {
    startAt: activeSession.startAt,
    durationSeconds: activeSession.durationSeconds,
    ...(isDescriber && { card: { /* mapear card desde activeSession */ } }),
  };
  client.emit('round-started', roundStartedPayload);
}
```

**Tests a añadir** (`lobby.gateway.spec.ts`):
- `should emit round-started to reconnecting describer when round is active`.
- `should emit round-started without card to reconnecting guesser when round is active`.
- `should not emit round-started when no active round`.

**Verificación**: `npm run test -w backend`.

---

### Tarea 19 — `backend`: Evento `round-ended` y caso de uso `EndRound`

**Alcance**:
- Modificar: `backend/src/modules/lobby/domain/entities/lobby.entity.ts`
- Nuevo: `backend/src/modules/lobby/application/use-cases/end-round.use-case.ts`
- Nuevo: `backend/src/modules/lobby/application/use-cases/end-round.use-case.spec.ts`
- Modificar: `backend/src/modules/lobby/interfaces/ws/lobby.gateway.ts`
- Modificar: `backend/src/modules/lobby/interfaces/lobby.module.ts`

**`Lobby.endRound()`**: nuevo método que cambia `status` a `waiting` y pone `roundSession` a `null`. Lanza si no hay ronda activa.

**`EndRound` use case**: busca lobby por código (obtenido de `socketMap`), valida que el solicitante es Describer, llama `lobby.endRound()`, persiste.

**Gateway**: nuevo handler `@SubscribeMessage('end-round')` que llama `EndRound.execute()` y emite `round-ended` a toda la sala (`server.to(code).emit('round-ended', {})`). Solo el Describer puede emitir `end-round`; si no lo es, emitir `error`.

**Tests**:
- `Lobby.endRound()`: cambia status a `waiting`, limpia `roundSession`; lanza si no hay ronda activa.
- `EndRound` use case: llama `endRound()` y persiste; lanza si no es Describer.
- Gateway: `should emit round-ended to the room when describer emits end-round`; `should emit error when guesser emits end-round`.

**Verificación**: `npm run test -w backend`.

---

### Tarea 20 — `frontend`: Caso de uso `RejoinRound`

**Alcance**:
- Nuevo: `frontend/src/features/lobby/application/use-cases/rejoin-round.use-case.ts`
- Nuevo: `frontend/src/features/lobby/application/use-cases/rejoin-round.use-case.test.ts`
- Modificar: `frontend/src/features/lobby/infrastructure/lobby-dependencies.container.ts` (exponer instancia)
- Modificar: `frontend/src/features/lobby/infrastructure/lobby-dependencies.context.tsx` (añadir hook `useRejoinRound`)

**`RejoinRound`**: caso de uso que recibe `lobbySocket: LobbySocket` en el constructor y expone `execute(code: string, playerName: string, role: PlayerRole, playerId: string): void`. Llama a `lobbySocket.connect()` y luego `lobbySocket.joinLobby(code, playerName, role, playerId)`. No hace verificación HTTP (el lobby ya existe, se viene de una ronda activa).

**Diferencia con `JoinLobby`**: `JoinLobby` verifica la existencia del lobby vía HTTP y no requiere `playerId`; `RejoinRound` asume que el lobby existe y usa `playerId` para identificar al jugador en el servidor.

**Tests**:
- `should call connect and joinLobby with correct args`.
- `should pass playerId to joinLobby`.

**Verificación**: `npm run test -w frontend`.

---

### Tarea 21 — `frontend`: Persistir `RoundSession` en `ConnectedWaitingRoom`

**Alcance**: `frontend/src/features/lobby/ui/pages/WaitingRoomPage/ConnectedWaitingRoom.tsx` y su test.

**Descripción**: en el `useEffect` que escucha `lobby.roundSession` y navega, llamar a `RoundSessionStorage.save(lobby.roundSession)` **antes** de `navigate(...)`. Así el dato persiste si el usuario recarga nada más llegar a la página de ronda.

**Tests a añadir** (crear `ConnectedWaitingRoom.test.tsx` si no existe):
- `should save RoundSession to storage before navigating to describer page`.
- `should save RoundSession to storage before navigating to guesser page`.

**Verificación**: `npm run test -w frontend`.

---

### Tarea 22 — `frontend`: `onRoundEnded` en puerto, socket y `useLobby`

**Alcance**:
- Modificar: `frontend/src/features/lobby/application/ports/lobby-socket.port.ts`
- Modificar: `frontend/src/features/lobby/infrastructure/ws/socket-io-lobby-socket.ts`
- Modificar: `frontend/src/features/lobby/infrastructure/ws/socket-io-lobby-socket.test.ts`
- Modificar: `frontend/src/features/lobby/ui/hooks/use-lobby.hook.ts`
- Modificar: `frontend/src/features/lobby/ui/hooks/use-lobby.hook.test.ts`

**Puerto**: añadir `onRoundEnded(handler: () => void): () => void` y `endRound(): void` a `LobbySocket`.

**`SocketIOLobbySocket`**:
- `onRoundEnded`: implementar usando el método privado `registerListener('round-ended', handler)` introducido en la Tarea 16.
- `endRound()`: emitir `end-round` al servidor.

**`useLobby`**:
- Añadir handler `onRoundEnded` en el `useEffect` que llama a `RoundSessionStorage.clear()` y actualiza estado `roundEnded: boolean` a `true`.
- Exponer `roundEnded` y `endRound` en el resultado del hook.
- **No** limpiar `LobbyPlayerSession` (los datos del jugador persisten para la siguiente ronda).

**Tests a añadir** (`use-lobby.hook.test.ts`):
- `should set roundEnded to true when round-ended event is received`.
- `should clear RoundSessionStorage when round-ended is received`.
- `should not clear LobbyPlayerSession when round-ended is received`.

**Verificación**: `npm run test -w frontend`.

---

### Tarea 23 — `frontend`: Reconexión en `DescriberPage` y `GuesserPage`

**Alcance**:
- Modificar: `frontend/src/features/lobby/ui/pages/DescriberPage/DescriberPage.tsx`
- Modificar: `frontend/src/features/lobby/ui/pages/DescriberPage/DescriberPage.test.tsx`
- Modificar: `frontend/src/features/lobby/ui/pages/GuesserPage/GuesserPage.tsx`
- Modificar: `frontend/src/features/lobby/ui/pages/GuesserPage/GuesserPage.test.tsx`
- Modificar: `frontend/src/shared/hooks/use-server-synced-countdown.hook.ts` (añadir `onExpire`)

**`useServerSyncedCountdown`**: añadir parámetro opcional `onExpire?: () => void` que se llama una sola vez cuando `remaining` llega a 0 (usar ref para evitar retriggering en cada tick).

**`DescriberPage`**:
1. Si `location.state` es null: cargar `RoundSessionStorage.load()` como `roundSession` inicial y llamar `RejoinRound.execute(...)` con datos de `LobbyPlayerSession`.
2. Si no hay ni state ni storage: navegar a `/` (sesión completamente perdida).
3. Pasar `onExpire` a `useServerSyncedCountdown` que llama a `lobby.endRound()`.
4. Cuando `lobby.roundEnded` sea `true`: navegar a `/lobby/:code` (sala de espera para la siguiente ronda).

**`GuesserPage`**:
1. Mismo patrón de restauración que `DescriberPage`.
2. No pasa `onExpire` (el Guesser no emite `end-round`).
3. Cuando `lobby.roundEnded` sea `true`: navegar a `/lobby/:code`.

**Tests**:
- `DescriberPage`: `should reconnect using session data when location.state is null`, `should call endRound when countdown expires`, `should navigate to lobby when roundEnded`.
- `GuesserPage`: `should reconnect using session data when location.state is null`, `should navigate to lobby when roundEnded`.

**Verificación**: `npm run test -w frontend` + `npm run lint -w frontend`.

---

## 10. Estado de implementación

| # | Tarea | Estado |
|---|---|---|
| 1 | `docs/`: Actualizar lenguaje ubicuo y overview | ✅ Completada |
| 2 | `backend`: Dominio del módulo `lobby` | ✅ Completada |
| 3 | `backend`: Casos de uso del módulo `lobby` | ✅ Completada |
| 4 | `backend`: Infraestructura del módulo `lobby` | ✅ Completada |
| 5 | `backend`: Interfaces HTTP + WebSocket del módulo `lobby` | ✅ Completada |
| 6 | `frontend`: Dominio + puerto de la feature `lobby` | ✅ Completada |
| 7 | `frontend`: Infraestructura de la feature `lobby` | ✅ Completada |
| 8 | `frontend`: `LobbyProvider` y contexto de dependencias | ✅ Completada |
| 9 | `frontend`: Hook `useServerSyncedCountdown` | ✅ Completada |
| 10 | `frontend`: Hook `useLobby` | ✅ Completada |
| 11 | `frontend`: Páginas `CreateLobbyPage` y `WaitingRoomPage` | ✅ Completada |
| 12 | `frontend`: Nueva `GuesserPage` | ✅ Completada |
| 13 | `frontend`: Crear `DescriberPage` para modo multijugador | ✅ Completada |
| 14 | `frontend`: Actualizar rutas | ✅ Completada |
| 16 | `frontend`: Hacer resiliente `SocketIOLobbySocket` (buffer de listeners) | ✅ Completada |
| 17 | `frontend`: `RoundSessionStorage` y `lobbyCode` en `LobbyPlayerSession` | ⬜ Pendiente |
| 18 | `backend`: Emitir estado actual al reconectar (`join-lobby`) | ⬜ Pendiente |
| 19 | `backend`: Evento `round-ended` y caso de uso `EndRound` | ⬜ Pendiente |
| 20 | `frontend`: Caso de uso `RejoinRound` | ⬜ Pendiente |
| 21 | `frontend`: Persistir `RoundSession` en `ConnectedWaitingRoom` | ⬜ Pendiente |
| 22 | `frontend`: `onRoundEnded` en puerto, socket y `useLobby` | ⬜ Pendiente |
| 23 | `frontend`: Reconexión en `DescriberPage` y `GuesserPage` | ⬜ Pendiente |
| 15 | `e2e`: Test de flujo completo | ⬜ Pendiente |
