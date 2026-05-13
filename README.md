# banned-hint

Monorepo con backend en NestJS y frontend en React, gestionado con npm workspaces.

---

## Tabla de contenidos

- [Requisitos previos](#requisitos-previos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Stack tecnológico](#stack-tecnológico)
- [Variables de entorno](#variables-de-entorno)
- [Instalación](#instalación)
- [Desarrollo](#desarrollo)
- [Scripts disponibles](#scripts-disponibles)
- [Tests](#tests)
- [Git hooks](#git-hooks)
- [Añadir componentes de shadcn/ui](#añadir-componentes-de-shadcnui)

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 24 (LTS "Krypton") |
| npm | 10+ |
| MongoDB | 7+ (instancia local o remota) |

Se recomienda usar [nvm](https://github.com/nvm-sh/nvm) para gestionar la versión de Node:

```bash
nvm install   # lee la versión de .nvmrc
nvm use
```

---

## Estructura del proyecto

```
banned-hint/
├── backend/                  # API REST — NestJS + Mongoose
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── test/                 # Tests e2e de NestJS (Jest + Supertest)
│   ├── jest.config.ts
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── .env.example
├── docs/                     # Documentación de dominio (lenguaje ubicuo, reglas)
│   ├── overview.md           # Objetivo y flujo del juego
│   └── ubiquitous-language.md # Definición de términos de dominio
├── frontend/                 # SPA — React + Vite + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── components/ui/    # Componentes generados por shadcn/ui
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── lib/utils.ts      # Helper cn() para Tailwind
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/                # Setup de Vitest + Testing Library
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── components.json       # Configuración de shadcn/ui
├── e2e/                      # Tests end-to-end — Playwright
│   ├── tests/
│   └── playwright.config.ts
├── .husky/                   # Git hooks
├── eslint.config.js          # ESLint v9 flat config (compartido)
├── .prettierrc
└── package.json              # Raíz del workspace
```

---

## Documentación de dominio

El directorio `docs/` contiene la documentación del dominio del juego Banned Hint:

| Archivo | Contenido |
|---|---|
| [`docs/overview.md`](docs/overview.md) | Objetivo del juego, flujo de una ronda y reglas principales |
| [`docs/ubiquitous-language.md`](docs/ubiquitous-language.md) | Definición de términos: Card, Word, Banned word, Round, Timer |

> **Importante**: Antes de implementar o modificar lógica de negocio, consulta estos documentos para entender el contexto y usar el lenguaje ubicuo definido.

---

## Stack tecnológico

### Backend (`/backend`)

| Paquete | Rol |
|---|---|
| [NestJS](https://nestjs.com/) `^10` | Framework principal |
| [Mongoose](https://mongoosejs.com/) `^8` + `@nestjs/mongoose` | ODM para MongoDB |
| [Jest](https://jestjs.io/) `^29` + `ts-jest` | Tests unitarios |
| [Supertest](https://github.com/ladjs/supertest) | Tests e2e del API |
| TypeScript `^5` | Lenguaje |

### Frontend (`/frontend`)

| Paquete | Rol |
|---|---|
| [React](https://react.dev/) `^18` + [Vite](https://vitejs.dev/) `^5` | UI + bundler |
| [React Router](https://reactrouter.com/) `^6` | Enrutamiento |
| [Tailwind CSS](https://tailwindcss.com/) `^3` | Estilos |
| [shadcn/ui](https://ui.shadcn.com/) | Componentes accesibles (Radix UI) |
| [Vitest](https://vitest.dev/) `^1` | Test runner |
| [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) `^15` | Utilidades de testing |
| TypeScript `^5` | Lenguaje |

### E2E (`/e2e`)

| Paquete | Rol |
|---|---|
| [Playwright](https://playwright.dev/) `^1.44` | Tests end-to-end (Chromium + Firefox) |

### Raíz

| Paquete | Rol |
|---|---|
| [Husky](https://typicode.github.io/husky/) `^9` | Git hooks |
| [lint-staged](https://github.com/lint-staged/lint-staged) `^15` | Linting sobre archivos staged |
| [ESLint](https://eslint.org/) `^9` + `typescript-eslint` | Linting (flat config) |
| [Prettier](https://prettier.io/) `^3` | Formateo de código |

---

## Variables de entorno

El backend requiere un archivo `.env` en `backend/`. Copia el ejemplo y ajusta los valores:

```bash
cp backend/.env.example backend/.env
```

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto en el que escucha el servidor | `3000` |
| `MONGODB_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/banned-hint` |
| `NODE_ENV` | Entorno de ejecución | `development` |

---

## Instalación

```bash
# Clona el repositorio
git clone <url-del-repo>
cd banned-hint

# Instala todas las dependencias de los tres paquetes
# También activa los hooks de Husky automáticamente
npm install

# Instala los navegadores de Playwright
npx playwright install --with-deps
```

---

## Desarrollo

Arranca el backend y el frontend en terminales separadas:

```bash
# Terminal 1 — API en http://localhost:3000/api
npm run dev:backend

# Terminal 2 — App en http://localhost:5173
npm run dev:frontend
```

Asegúrate de tener MongoDB corriendo antes de arrancar el backend:

```bash
# Con Docker (opcional)
docker run -d -p 27017:27017 --name mongo mongo:7
```

---

## Scripts disponibles

Todos los scripts se ejecutan desde la raíz del monorepo:

| Script | Descripción |
|---|---|
| `npm run dev:backend` | Inicia NestJS en modo watch |
| `npm run dev:frontend` | Inicia Vite dev server |
| `npm run build` | Compila backend y frontend |
| `npm run build:backend` | Compila solo el backend |
| `npm run build:frontend` | Compila solo el frontend |
| `npm run test` | Ejecuta tests unitarios (Jest + Vitest) |
| `npm run test:backend` | Tests unitarios del backend (Jest) |
| `npm run test:frontend` | Tests unitarios del frontend (Vitest) |
| `npm run test:e2e` | Tests end-to-end (Playwright) |
| `npm run lint` | Analiza el código con ESLint |
| `npm run lint:fix` | Analiza y corrige automáticamente |
| `npm run format` | Formatea todo el código con Prettier |
| `npm run format:check` | Verifica el formato sin modificar archivos |

Los scripts de cada paquete también se pueden ejecutar de forma aislada:

```bash
# Solo el backend
npm run test:watch -w backend
npm run test:e2e -w backend     # Tests e2e de NestJS (Supertest)

# Solo el frontend
npm run test:watch -w frontend
npm run test:ui -w frontend     # UI de Vitest en el navegador
```

---

## Tests

### Unitarios — Backend (Jest)

```bash
npm run test:backend
# Con cobertura
npm run test:cov -w backend
```

Los tests unitarios viven junto al código fuente (`*.spec.ts`). Los tests e2e del API están en `backend/test/` y se ejecutan con:

```bash
npm run test:e2e -w backend
```

> Los tests e2e del backend requieren una instancia de MongoDB activa.

### Unitarios — Frontend (Vitest + Testing Library)

```bash
npm run test:frontend
# Modo watch
npm run test:watch -w frontend
# Con cobertura
npm run test:cov -w frontend
```

Los tests del frontend se colocan junto al componente con extensión `.test.tsx`.

### End-to-end — Playwright

```bash
npm run test:e2e
# Con interfaz gráfica
npm run test:ui -w e2e
# Solo un navegador
npx playwright test --project=chromium
# Ver reporte tras ejecución
npx playwright show-report
```

Playwright arranca automáticamente el servidor de Vite antes de ejecutar los tests. En CI se ejecuta en modo headless con reintentos configurados.

---

## Git hooks

Gestionados con Husky v9. Se activan automáticamente al ejecutar `npm install`.

### `pre-commit`

Ejecuta **lint-staged** sobre los archivos en staging:

- `backend/**/*.ts` → `eslint --fix` + `prettier --write`
- `frontend/**/*.{ts,tsx}` → `eslint --fix` + `prettier --write`
- `e2e/**/*.ts` → `prettier --write`

### `pre-push`

Ejecuta los **tests unitarios** de ambos paquetes antes de hacer push:

```bash
npm run test -w backend && npm run test -w frontend
```

Si algún test falla, el push queda bloqueado.

---

## Añadir componentes de shadcn/ui

Los componentes se generan dentro de `frontend/src/components/ui/` y están excluidos del linting (son código generado).

```bash
# Desde la raíz del monorepo
cd frontend

# Ejemplo: añadir el componente Button
npx shadcn add button

# Otros componentes disponibles
npx shadcn add card dialog input label toast
```

La configuración de shadcn/ui se encuentra en `frontend/components.json`.
