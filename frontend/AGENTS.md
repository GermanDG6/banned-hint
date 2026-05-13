# Frontend (`frontend`)

> Hereda y respeta las reglas globales del `AGENTS.md` raíz. Este archivo añade convenciones específicas del frontend.

## Descripción del proyecto

SPA construida con **React**, **TypeScript** y **Vite**, estilos con **Tailwind CSS**, enrutado con **React Router** y tests con **Vitest**.

---

## Comandos del workspace

Ejecuta siempre desde la raíz del monorepo usando el prefijo de workspace:

```bash
# Desarrollo
npm run dev -w frontend

# Build
npm run build -w frontend

# Lint
npm run lint -w frontend

# Tests unitarios y de componente
npm run test -w frontend

# Tests en modo watch
npm run test:watch -w frontend

# Cobertura
npm run test:cov -w frontend
```

Antes de dar por terminado cualquier cambio: `lint` + `test` del workspace deben pasar sin errores.

---

## Estructura de carpetas

Sigue una organización orientada a features que refleja los Bounded Contexts del dominio:

```
frontend/
├── src/
│   ├── features/
│   │   └── <feature>/              # Un directorio por feature/contexto
│   │       ├── domain/
│   │       │   ├── models/         # Tipos e interfaces del dominio (sin lógica de UI)
│   │       │   └── services/       # Lógica de dominio pura (sin efectos secundarios)
│   │       ├── application/
│   │       │   ├── use-cases/      # Lógica de aplicación (hooks de orquestación)
│   │       │   └── ports/          # Interfaces de servicios externos (API, storage)
│   │       ├── infrastructure/
│   │       │   └── api/            # Llamadas HTTP, adaptadores de respuesta
│   │       └── ui/
│   │           ├── components/     # Componentes específicos de la feature
│   │           ├── pages/          # Páginas enrutadas (solo composición, sin lógica)
│   │           └── hooks/          # Hooks de UI locales a la feature
│   ├── shared/
│   │   ├── ui/                     # Componentes reutilizables entre features (design system)
│   │   ├── hooks/                  # Hooks de utilidad transversales
│   │   └── utils/                  # Funciones puras de utilidad
│   ├── routes/                     # Configuración de React Router
│   ├── config/                     # Variables de entorno y constantes globales
│   └── main.tsx
├── public/
└── vite.config.ts                  # Incluye la configuración de Vitest en `test`
```

---

## Arquitectura y React

- Las páginas (`pages/`) solo componen componentes y orquestan rutas; no contienen lógica de negocio.
- La lógica de negocio va en los casos de uso (`application/use-cases/`), implementados como custom hooks o funciones puras.
- Los componentes de `shared/ui/` son genéricos y sin dependencia de ninguna feature concreta.
- Evita prop drilling más de dos niveles; usa composición de componentes o contexto de React solo cuando sea necesario.
- No pongas lógica de transformación de datos dentro del JSX; extráela a funciones o hooks.
- Aplica la **Ley de Demeter**: un componente solo conoce a sus props directas y a los hooks que usa, no navega por objetos profundamente anidados.

---

## React Router

- Define las rutas en `src/routes/` con un objeto de configuración tipado (`RouteObject[]`).
- Usa **lazy loading** (`React.lazy` + `Suspense`) para páginas que no sean críticas en el primer render.
- Los datos de ruta que necesiten carga asíncrona usan **loaders** de React Router cuando sea posible, antes de añadir lógica de carga en el componente.
- Protege rutas privadas con un componente guard; no repitas la lógica de autenticación en cada página.
- Usa `useNavigate` y `Link` para navegación; no manipules `window.location` directamente.

---

## Tailwind CSS

- Aplica clases de Tailwind directamente en el JSX. Evita estilos inline salvo valores dinámicos imposibles de expresar con utilidades.
- Para componentes con variantes usa `cva` (class-variance-authority) o una función simple `cn()`; no concatenes strings de clases con lógica condicional ad-hoc.
- No dupliques conjuntos de clases: si el mismo patrón visual aparece más de dos veces, extráelo a un componente o a una clase semántica en `globals.css` con `@apply`.
- Sigue el sistema de diseño definido en `tailwind.config.ts` (colores, tipografía, espaciados); no uses valores arbitrarios (`[valor]`) para propiedades que ya tienen token.

---

## TypeScript

- `strict: true` siempre habilitado.
- No uses `any`; usa `unknown` cuando el tipo sea indeterminado y estrecha con type guards o `zod`.
- Tipado explícito en props de componentes (interfaces o `type`, nunca solo inferencia implícita en firmas públicas).
- Usa tipos del dominio (`features/<feature>/domain/models/`) en lugar de tipos derivados de la respuesta de la API; mapea en la capa de infraestructura.
- Los formularios usan `react-hook-form` con validación tipada mediante `zod`; no gestiones estado de formulario manualmente.

---

## Testing con Vitest

### Unitarios (lógica de dominio y utils)

- Crea el archivo de test junto al archivo fuente: `<nombre>.test.ts`.
- Testea funciones puras y hooks sin dependencias de UI.
- No uses `describe` anidado más de dos niveles.
- Nombra los tests: `should <comportamiento esperado> when <condición>`.

### Componentes

- Usa **React Testing Library** (`@testing-library/react`) para testear componentes.
- Testea **comportamiento visible** para el usuario: qué se renderiza, qué ocurre al interactuar.
- No testees detalles de implementación (estado interno, nombres de métodos privados).
- Mockea llamadas HTTP con `msw` (Mock Service Worker) en tests que involucren fetch.
- Cada test debe ser independiente; no compartas estado entre tests del mismo archivo.
- Evita `waitFor` anidados; si un test es difícil de escribir, el componente tiene demasiada responsabilidad.

### Cobertura

- Mantén cobertura de líneas y ramas por encima del umbral definido en `vite.config.ts` (sección `test`) o en un `vitest.config.ts` si se separa en el futuro.
- No introduzcas código sin tests cuando añadas lógica de dominio o casos de uso nuevos.

---

## Instrucciones para cambios en el frontend

- Antes de tocar código en `frontend/`:

  - Revisa `docs/` para entender qué significan `Card`, `Round`, `Timer`, etc.
  - Revisa `frontend/README.md` para entender cómo se reflejan esas ideas en la UI.

- El frontend:

  - Debe respetar el significado de los conceptos definidos en `docs/`.
  - No debe cambiar la semántica de `Card`, `Round`, etc. en la interfaz.

- Cualquier lógica de negocio que se añada en el frontend:
  - Debe estar alineada con las reglas descritas en `docs/`.
  - Si introduce nuevas reglas, actualiza primero `docs/` y anótalo en `frontend/README.md`.

## Reglas adicionales

- No importes nada de `backend`. Si en el futuro se crea un paquete compartido (ej. `shared/`), será el único importable entre workspaces.
- Las llamadas a la API van exclusivamente en `infrastructure/api/`; nunca hagas `fetch` dentro de un componente o página.
- Gestión de estado global solo cuando sea imprescindible y la feature lo justifique explícitamente; preferir estado local y composición.
- Accesibilidad mínima: elementos interactivos con atributos ARIA cuando sean necesarios, imágenes con `alt`, formularios con `label` asociado.
- No uses `useEffect` para derivar estado; usa `useMemo` o calcula directamente en el render.
