# Frontend (`frontend`)

> Hereda y respeta las reglas globales del `AGENTS.md` raíz. Este archivo añade convenciones específicas del frontend.

## Descripción del proyecto

SPA construida con **React**, **TypeScript** y **Vite**, estilos con **CSS Modules** (Tailwind CSS se aplica dentro de los módulos CSS mediante `@apply`, nunca en el JSX), enrutado con **React Router** y tests con **Vitest**.

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
│   │   └── <feature>/              # Un directorio por feature/contexto, usando lenguaje ubicuo
│   │       ├── domain/
│   │       │   ├── models/         # Tipos e interfaces del dominio (sin lógica de UI)
│   │       │   ├── entities/       # Entidades con identidad propia y comportamiento
│   │       │   ├── value-objects/  # Value objects con invariantes propias (opcional)
│   │       │   ├── aggregates/     # Agregados si existen límites transpuestos (opcional)
│   │       │   └── services/       # Servicios de dominio puro (sin efectos secundarios)
│   │       ├── application/
│   │       │   ├── use-cases/      # Clases que orquestan el dominio
│   │       │   └── ports/          # Interfaces para servicios externos (API, storage)
│   │       ├── infrastructure/
│   │       │   └── api/            # Llamadas HTTP, adaptadores de respuesta
│   │       └── ui/
│   │           ├── components/     # Componentes específicos de la feature
│   │           ├── pages/          # Páginas enrutadas (solo composición, sin lógica)
│   │           └── hooks/          # Hooks de UI locales a la feature
│   ├── components/
│   │   └── ui/                     # Componentes reutilizables entre features (design system)
│   │       └── <component>/        # Un directorio por componente compartido
│   ├── shared/
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

### Separación de capas (DDD)

- La **lógica de negocio** reside en `domain/` (entidades, value objects, servicios de dominio, agregados); contiene las reglas de negocio puras, sin dependencias de frameworks ni efectos secundarios.
- Los **casos de uso** en `application/use-cases/` son **clases** que orquestan el dominio, nunca hooks de React. Cada caso de uso es una clase con un método público (ej. `execute()`) que orquesta las operaciones del dominio. Se testean instanciando la clase sin montar React. Ejemplo:

  ```typescript
  // application/use-cases/CreateCard.ts
  export class CreateCard {
    constructor(
      private cardRepository: CardRepository,
      private cardFactory: CardFactory
    ) {}

    async execute(input: CreateCardInput): Promise<Card> {
      const card = this.cardFactory.create(input.word, input.bannedWords);
      await this.cardRepository.save(card);
      return card;
    }
  }
  ```

- Los **hooks adaptadores** en `ui/hooks/` son wrappers delgados de los casos de uso que exponen **solo estado de UI** (`loading`, `error`, `data`). Regla explícita: *si hay un `if` que no sea para manejar loading/error, debe estar en el caso de uso, en el dominio o en un servicio de dominio*.
- Los `ports/` en `application/` definen interfaces; sus implementaciones concretas viven en `infrastructure/`. Ningún componente ni hook de UI importa directamente de `infrastructure/`.

### Diseño de componentes

- Las páginas (`pages/`) solo componen componentes y orquestan rutas; no contienen lógica de negocio.
- Los componentes de `components/ui/` son genéricos y sin dependencia de ninguna feature concreta (design system compartido).
- Evita prop drilling más de dos niveles; usa composición de componentes o contexto de React solo cuando sea necesario.
- No pongas lógica de transformación de datos dentro del JSX; extráela a funciones o hooks.
- Aplica la **Ley de Demeter**: un componente solo conoce a sus props directas y a los hooks que usa, no navega por objetos profundamente anidados.

---

## Programación Orientada a Objetos

El frontend sigue principios **OOP** (Object-Oriented Programming) en el dominio, aplicación e infraestructura:

- **Encapsulación**: las clases (entidades, value objects, casos de uso, adaptadores) encapsulan su estado y exponen solo métodos públicos bien definidos. No exponen atributos directamente.
- **Herencia y composición**: favorece **composición sobre herencia**; los casos de uso componen servicios de dominio, repositorios y adaptadores mediante inyección de dependencias, no herencia profunda.
- **Polimorfismo**: implementa interfaces (ports) en la capa de infraestructura para intercambiar adaptadores sin cambiar la lógica de negocio. Ejemplo: un `CardRepository` puede tener múltiples implementaciones (fake para tests, HTTP para producción).
- **SOLID** (respetando el AGENTS.md global):
  - **S**ingle Responsibility: cada clase tiene una única razón de cambio (una entidad gestiona su identidad, un caso de uso orquesta un flujo, un adaptador comunica con una API).
  - **O**pen/Closed: extiende mediante nuevas clases y puertos, no modificando las existentes.
  - **L**iskov Substitution: una implementación de un puerto puede sustituir a otra sin romper el contrato.
  - **I**nterface Segregation: define puertos pequeños y orientados al caso de uso (ej. `CreateCardRepository` en lugar de un repositorio genérico monolítico).
  - **D**ependency Inversion: inyecta interfaces (puertos), no implementaciones concretas.

---

## React Router

- Define las rutas en `src/routes/` con un objeto de configuración tipado (`RouteObject[]`).
- Usa **lazy loading** (`React.lazy` + `Suspense`) para páginas que no sean críticas en el primer render.
- Los datos de ruta que necesiten carga asíncrona usan **loaders** de React Router cuando sea posible, antes de añadir lógica de carga en el componente.
- Protege rutas privadas con un componente guard; no repitas la lógica de autenticación en cada página.
- Usa `useNavigate` y `Link` para navegación; no manipules `window.location` directamente.

---

## CSS Modules + Tailwind CSS

- **Nunca** escribas clases de Tailwind directamente en el JSX. Las clases de utilidad viven exclusivamente dentro de archivos `.module.css`.
- Cada componente React tiene su archivo `.module.css` asociado con clases **semánticas** que usan `@apply` internamente para aplicar utilidades de Tailwind. Ejemplo:

  ```css
  /* CardComponent.module.css */
  .card {
    @apply rounded-lg border border-gray-200 shadow-md p-4;
  }
  .cardTitle {
    @apply text-lg font-bold text-gray-900;
  }
  ```

  ```tsx
  // CardComponent.tsx
  import styles from './CardComponent.module.css';
  
  export function CardComponent() {
    return (
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Mi tarjeta</h2>
      </div>
    );
  }
  ```

- Si un patrón de `@apply` se repite más de dos veces, extráelo a una clase global en `globals.css` (usando el selector de clase de Tailwind).
- Sigue siempre los tokens de diseño definidos en `tailwind.config.ts` (colores, tipografía, espaciados); no uses valores arbitrarios (`[valor]`) dentro de `@apply`.
- **Excepción única permitida**: `style={{ }}` con valores completamente dinámicos imposibles de expresar en CSS estático (ej. colores generados en runtime). Documenta tales excepciones con un comentario explicando por qué no pueden resolverse en el `.module.css`.

---

## TypeScript

- `strict: true` siempre habilitado.
- No uses `any`; usa `unknown` cuando el tipo sea indeterminado y estrecha con type guards o `zod`.
- Tipado explícito en props de componentes (interfaces o `type`, nunca solo inferencia implícita en firmas públicas).
- Usa tipos del dominio (`features/<feature>/domain/models/`, `domain/entities/`, `domain/value-objects/`) en lugar de tipos derivados de la respuesta de la API; mapea siempre en la capa de infraestructura.
- Los formularios usan `react-hook-form` con validación tipada mediante `zod`; no gestiones estado de formulario manualmente.

### Value Objects con conjunto acotado de valores

Cuando un Value Object contiene un **conjunto fijo y bien definido de valores** (ej. `PlayerRole` con `describer` | `guesser`), define el tipo usando **`as const` + type alias** en lugar de union de string literals. Esto elimina magic strings en todo el codebase:

```typescript
// ✅ Recomendado: patrón as const
export const PlayerRoleType = {
  Describer: 'describer',
  Guesser: 'guesser',
} as const;

export type PlayerRoleType = typeof PlayerRoleType[keyof typeof PlayerRoleType];

export class PlayerRole {
  readonly value: PlayerRoleType;

  private constructor(value: PlayerRoleType) {
    this.value = value;
  }

  static create(value: string): PlayerRole {
    if (value !== PlayerRoleType.Describer && value !== PlayerRoleType.Guesser) {
      throw new Error(`Invalid PlayerRole: "${value}". Expected "${PlayerRoleType.Describer}" or "${PlayerRoleType.Guesser}".`);
    }
    return new PlayerRole(value as PlayerRoleType);
  }

  // Métodos estáticos y validación usan PlayerRoleType.Describer, etc.
}
```

**Ventajas del patrón `as const`**:
- Cero overhead en runtime (borrado durante compilación).
- Los callers usan `PlayerRoleType.Describer` en lugar de magic string `'describer'` — seguridad de tipos refactorizable.
- Deserialización desde infraestructura (API responses, JSON) permanece typesafe: `PlayerRole.create(value: string)` recibe un `string` sin garantías, valida en tiempo de ejecución.
- Compatible con `isolatedModules: true` (obligatorio en frontend) — `const enum` quedaría descartado.

**No uses**:
- `string enum Foo { Describer = 'describer' }` — emite código innecesario en runtime.
- `const enum` — **incompatible con `isolatedModules: true`**.
- Union de string literals sin referenciación nombrada (`'describer' | 'guesser'`) — permite magic strings, dificulta refactoring.

---

## Testing con Vitest

### Casos de uso y dominio (OOP puro)

- **Casos de uso** (clases en `application/use-cases/`) y **dominio** (entidades, value objects, servicios de dominio) se testean instanciando las clases sin montar React.
- Cada test crea instancias de las clases necesarias (inyectando dependencias como fakes o mocks), invoca los métodos públicos y verifica el estado resultante.
- Crea el archivo de test junto al archivo fuente: `<nombre>.test.ts`.
- No uses `describe` anidado más de dos niveles.
- Nombra los tests: `should <comportamiento esperado> when <condición>`.
- Mockea dependencias inyectadas (adaptadores de API, repositorios, servicios externos) usando fakes o mocks simples que implementen los puertos (interfaces).

### Hooks adaptadores (UI)

- Los hooks en `ui/hooks/` que adaptan casos de uso se testean con `renderHook` de **React Testing Library**, instanciando el caso de uso y mockeándolo.
- El test verifica que el hook expone correctamente el estado de UI (`loading`, `error`, `data`).
- Evita tests que verifiquen lógica de negocio en el hook; esa lógica ya está testada en las clases del caso de uso.

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

  - Revisa `docs/ubiquitous-language.md` para entender el lenguaje ubicuo del dominio.
  - Revisa `docs/overview.md` para entender las reglas de negocio.
  - Revisa `frontend/README.md` para entender cómo se reflejan esas ideas en la UI.

- **Nombrado de features**: los directorios bajo `features/` deben usar términos definidos en `docs/ubiquitous-language.md`. Prohibido crear features con nombres genéricos sin respaldo en el lenguaje ubicuo (ej. no `features/game/` o `features/controller/` si no figuran en el ubiquitous language).

- El frontend:

  - Debe respetar el significado de los conceptos definidos en `docs/`.
  - No debe cambiar la semántica de los términos del lenguaje ubicuo en la interfaz.

- Cualquier lógica de negocio que se añada en el frontend:
  - Debe estar alineada con las reglas descritas en `docs/`.
  - Si introduce nuevas reglas, actualiza primero `docs/` y anótalo en `frontend/README.md`.

## Reglas adicionales

- **Importaciones entre capas**: Los componentes e `ui/hooks/` importan de `application/` (casos de uso, ports si es estrictamente necesario). Nunca importan directamente de `infrastructure/`. La inyección de dependencias de adaptadores concretos ocurre en la raíz de la aplicación o en un fichero de configuración central.
- **Componentes compartidos**: Los componentes del design system en `components/ui/` se importan desde cualquier feature mediante `@/components/ui/<component-name>`. No tienen dependencias de features específicas.
- No importes nada de `backend`. Si en el futuro se crea un paquete compartido (ej. `shared/`), será el único importable entre workspaces.
- Las llamadas a la API van exclusivamente en `infrastructure/api/` (adaptadores que implementan los ports); nunca hagas `fetch` dentro de un componente, página o caso de uso.
- Gestión de estado global solo cuando sea imprescindible y la feature lo justifique explícitamente; preferir estado local y composición.
- Accesibilidad mínima: elementos interactivos con atributos ARIA cuando sean necesarios, imágenes con `alt`, formularios con `label` asociado.
- No uses `useEffect` para derivar estado; usa `useMemo` o calcula directamente en el render.
