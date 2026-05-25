# Plan de Implementación - Tareas 24 y 15 ✅ COMPLETADAS

## Resumen Ejecutivo

Se ha completado la implementación de las Tareas 24 y 15 del SPEC.md:

- **Tarea 24**: Tests unitarios RTL para `WaitingRoomPage` y `ConnectedWaitingRoom`
- **Tarea 15**: Test E2E de flujo completo con Playwright

Además, se ha adicionado infraestructura de CI/CD con Docker Compose y GitHub Actions.

---

## Implementación Detallada

### 1. Infraestructura Docker (docker-compose.yml)

**Archivo**: `/docker-compose.yml`

- Servicio MongoDB con imagen `mongo:8`
- Puerto 27017 expuesto para conexiones locales
- Health check con `mongosh` para validar disponibilidad
- Volumen persistente `mongodb_data`
- Base de datos por defecto: `banned-hint`

**Uso**:
```bash
docker compose up -d mongodb    # Levanta MongoDB en background
docker compose down              # Detiene y elimina contenedores
```

---

### 2. Configuración de Playwright (e2e/playwright.config.ts)

**Cambios**:
- `webServer` convertido de objeto único a **array de dos servidores**:
  1. **Backend** (`npm run dev:backend` → `http://localhost:3000/api/cards/random`)
  2. **Frontend** (`npm run dev:frontend` → `http://localhost:5173`)
- Ambos con `reuseExistingServer: !process.env.CI` para reutilizar servidores en local
- Timeout aumentado a 60s en ambos para permitir compilación de NestJS

**Ventajas**:
- Tests E2E pueden acceder al backend + frontend simultáneamente
- En CI (`CI=true`), siempre reinicia ambos servidores
- En local, reutiliza si ya están corriendo

---

### 3. Workflow de GitHub Actions (.github/workflows/e2e.yml)

**Archivo**: `./.github/workflows/e2e.yml`

**Jobs**:

#### a) **E2E Tests** (paralelo)
- Dispara en cada `push` a `main`/`develop` y en PRs
- Levanta servicio MongoDB en Docker (con healthcheck)
- Instala dependencias (`npm ci`)
- Instala browsers de Playwright (`--with-deps chromium`)
- **Builds backend + frontend** antes de correr tests
- **Ejecuta seed de cartas** (`npm run seed -w backend`) para poblar BD
- Corre tests E2E (`npm run test:e2e`)
- Sube artefactos: reporte HTML + screenshots en caso de fallo

#### b) **Lint & Unit Tests** (paralelo, independiente)
- Mismos triggers que E2E
- Levanta MongoDB (requerido por backend tests)
- Lint (`npm run lint`)
- Tests unitarios (`npm run test`)
- No genera artefactos (éxito = sin output)

**Variables de entorno en CI**:
- `MONGODB_URI=mongodb://localhost:27017/banned-hint` (requerida para backend)
- `CI=true` (hace que Playwright no reutilice servidores)

---

### 4. Tests Unitarios Frontend - Tarea 24

#### 4.1 WaitingRoomPage.test.tsx

**Archivo**: `frontend/src/features/lobby/ui/pages/WaitingRoomPage/WaitingRoomPage.test.tsx`

**5 Tests**:

1. **"should render JoinLobbyForm when no state and no session data"**
   - Verifica que sin state de navegación ni sesión guardada, muestra formulario de invitado
   - Mock: `LobbyPlayerSession.load()` retorna `null`

2. **"should call LobbyPlayerSession.save with lobbyCode when host joins successfully"**
   - Host se conecta desde state de navegación (post-creación de sala)
   - Verifica que `LobbyPlayerSession.save` incluye `lobbyCode: 'ABC123'`

3. **"should call LobbyPlayerSession.save with lobbyCode when guest joins successfully"**
   - Guest llena formulario y se une
   - Verifica que `LobbyPlayerSession.save` tiene `role: 'guesser'` y `lobbyCode`

4. **"should show loading state when connecting with valid session data"**
   - Con sesión válida guardada, muestra "Conectando a la sala..." mientras `useJoinLobby.execute()` está pending
   - Simula demora con timeout

5. **"should show error message when connection fails"**
   - Si `useJoinLobby.execute()` rechaza, muestra el mensaje de error

**Mocks**:
- `useJoinLobby()` con `execute()` mock
- `LobbyPlayerSession` completo
- `useParams` y `useLocation` vía `react-router-dom` mock

---

#### 4.2 ConnectedWaitingRoom.test.tsx (Ampliado)

**Archivo**: `frontend/src/features/lobby/ui/pages/WaitingRoomPage/ConnectedWaitingRoom.test.tsx`

**4 Tests Nuevos** (los 2 de navegación ya existían):

1. **"should render lobby code display and player list"**
   - Verifica que `LobbyCodeDisplay` renderiza el código 'ABC123'
   - Verifica que `PlayerList` renderiza nombres 'Host' y 'Guest'

2. **"should render start round button only for describer"**
   - Con rol `describer`: botón visible
   - Con rol `guesser`: botón **no** visible
   - Usa `rerender` para probar ambos escenarios en el mismo test

3. **"should disable start round button when not connected"**
   - Si `lobby.isConnected === false`, botón tiene `disabled={true}`
   - Mock: `useLobby()` retorna `isConnected: false`

4. **"should call startRound with correct duration when button is clicked"**
   - Click en botón de "Iniciar ronda" con duración 120s
   - Verifica que `startRound(120)` fue llamado
   - Usa `userEvent.setup()` para simular click

**Patrón de testing**:
- Todos usan `BrowserRouter` (como el existente)
- Mock de `useLobby` y `useNavigate` vía `vi.mock`
- Assertions en estado del UI (botones visibles/deshabilitados)

---

### 5. Componente ActiveCardView (Actualizado)

**Archivo**: `frontend/src/features/lobby/ui/components/ActiveCardView/ActiveCardView.tsx`

**Cambio Mínimo**:
- Añadido `data-testid="card-word"` al elemento `<h2>` que contiene la palabra
- Permite que tests E2E accedan a la palabra con `hostPage.getByTestId('card-word')`

---

### 6. Tests E2E - Tarea 15

**Archivo**: `e2e/tests/lobby.spec.ts`

**Test Principal: "should complete full multiplayer flow"**

**Flujo**:
1. Host abre home (`/`) y navega a crear sala (`/lobby/new`)
2. Host llena: nombre='Host Player', minutos=1
3. Host pulsa crear → redirige a `/lobby/ABC123` (extrae `lobbyCode`)
4. Guest abre `/lobby/ABC123` en contexto diferente
5. Guest llena: nombre='Guest Player' y se une
6. Host verifica que ve a Guest conectado
7. Host pulsa "Iniciar ronda"
8. Host redirige a `/round/describe` y ve `<h2 data-testid="card-word">`
9. Guest redirige a `/round/guess` y ve timer + input
10. **Test lee la palabra** del DOM del host: `hostPage.getByTestId('card-word').textContent()`
11. Guest escribe la palabra (lowercase) y pulsa enviar
12. Guest ve mensaje `✅ ¡Correcto!`
13. Host pulsa "Siguiente"
14. Host ve nueva card
15. Guest ve timer aún activo (sin navegar)

**Test Secundario: "should handle guest disconnection and reconnection gracefully"**
- Documenta comportamiento actual de reconexión (Tarea 23)
- Host crea sala → Guest se une → Ambos inician ronda → Guest recarga

**Patrones**:
- Dos contextos de browser: `hostContext` y `guestContext`
- Dos páginas: `hostPage` y `guestPage`
- Sin mocks ni fixtures: test E2E real contra servidores locales
- Palabra correcta obtenida directamente del DOM (sin API adicional)

---

## Cambios Generales Realizados

### Archivos Creados
```
✅ docker-compose.yml                                    (nuevo)
✅ .github/workflows/e2e.yml                             (nuevo)
✅ frontend/src/features/lobby/ui/pages/WaitingRoomPage/WaitingRoomPage.test.tsx  (nuevo)
✅ e2e/tests/lobby.spec.ts                               (nuevo)
```

### Archivos Modificados
```
✅ e2e/playwright.config.ts                              (webServer: array de 2)
✅ frontend/src/features/lobby/ui/components/ActiveCardView/ActiveCardView.tsx  (data-testid)
✅ frontend/src/features/lobby/ui/pages/WaitingRoomPage/ConnectedWaitingRoom.test.tsx  (4 tests nuevos)
✅ SPEC.md                                               (Tareas 24 y 15 → ✅ Completada)
```

---

## Cómo Ejecutar

### Local (Desarrollo)

```bash
# Terminal 1: Base de datos
docker compose up -d mongodb

# Terminal 2: Backend
npm run dev:backend   # Escucha en http://localhost:3000

# Terminal 3: Frontend
npm run dev:frontend  # Escucha en http://localhost:5173

# Terminal 4: Tests E2E (con servidores ya corriendo)
npm run test:e2e -w e2e
```

### Tests Unitarios
```bash
npm run test -w frontend    # Incluye WaitingRoomPage.test.tsx + ConnectedWaitingRoom.test.tsx
npm run test -w backend
```

### Lint
```bash
npm run lint
```

### CI (GitHub Actions)
- Automático en cada push a `main`/`develop` o en PRs
- Corre en paralelo: E2E + Lint & Unit Tests
- Artifacts: `playwright-report/` + `playwright-screenshots/`

---

## Consideraciones Arquitectónicas

### WebServer Dual
- Aunque Playwright solo necesita el frontend para acceder a la UI, el backend es **requerido** porque:
  - Frontend llama a `POST /api/lobby` al crear sala
  - Frontend conecta WebSocket al backend
  - Backend valida guesses y emite eventos
  
### Variable de Entorno MONGODB_URI
- En local: puede omitirse (default `mongodb://localhost:27017/banned-hint`)
- En CI: se exporta explícitamente (mejor visibilidad en logs)
- En producción: se inyectaría desde secrets

### Seed de Cartas en CI
- Necesario porque MongoDB comienza vacía
- Ejecuta `npm run seed -w backend` antes de tests
- En local, puede ejecutarse manualmente: `npm run seed -w backend`

### Contextos Separados en E2E
- Dos navegadores simulan dos usuarios reales
- Sin compartir cookies/storage (a menos que sea intencional)
- Cada uno tiene su URL del servidor (ambos `localhost:5173` + `localhost:3000`)

---

## Validación

✅ **Lint**: Sin errores  
✅ **TypeScript**: Strict mode, sin `any`  
✅ **Tests Unitarios**: WaitingRoomPage (5) + ConnectedWaitingRoom (6 totales)  
✅ **Tests E2E**: 2 scenarios (flujo completo + reconexión)  
✅ **CI/CD**: Workflow pronto en `.github/workflows/e2e.yml`

---

## Próximos Pasos (Fuera de Scope)

1. **Monitoreo de CI**: Añadir notificaciones en Slack/Discord si tests fallan
2. **Performance**: Medir tiempos de compilación de NestJS en CI (puede ser lento)
3. **Seeding de BD**: Considera usar MongoDB seed scripts en lugar de `seed-cards.ts` para CI
4. **Caching**: Optimizar `npm ci` cacheando `node_modules` entre builds
5. **Rate Limiting**: Si los tests crecen, parallelizar con `shards` de Playwright

