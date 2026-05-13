# Backend (`backend`)

> Hereda y respeta las reglas globales del `AGENTS.md` raíz. Este archivo añade convenciones específicas del backend.

## Descripción del proyecto

API REST construida con **NestJS** y **TypeScript**, persistencia con **Mongoose** (MongoDB) y tests con **Jest** + **Supertest**.

***

## Comandos del workspace

Ejecuta siempre desde la raíz del monorepo usando el prefijo de workspace:

```bash
# Desarrollo
npm run start:dev -w backend

# Build
npm run build -w backend

# Lint
npm run lint -w backend

# Tests unitarios
npm run test -w backend

# Tests e2e
npm run test:e2e -w backend

# Cobertura
npm run test:cov -w backend
```

Antes de dar por terminado cualquier cambio: `lint` + `test` + `test:e2e` del workspace deben pasar sin errores.

***

## Estructura de carpetas

Sigue la separación de capas de DDD dentro del módulo correspondiente:

```
backend/
├── src/
│   ├── modules/
│   │   └── <context>/             # Un módulo por Bounded Context
│   │       ├── domain/
│   │       │   ├── entities/      # Entidades y Aggregates del dominio
│   │       │   ├── value-objects/ # Value Objects tipados e inmutables
│   │       │   ├── repositories/  # Interfaces de repositorios (contratos)
│   │       │   ├── services/      # Servicios de dominio
│   │       │   └── events/        # Eventos de dominio
│   │       ├── application/
│   │       │   ├── use-cases/     # Un caso de uso por clase
│   │       │   ├── dtos/          # DTOs de entrada/salida
│   │       │   └── ports/         # Interfaces de servicios externos
│   │       ├── infrastructure/
│   │       │   ├── persistence/
│   │       │   │   ├── schemas/   # Schemas de Mongoose
│   │       │   │   └── repositories/ # Implementaciones de repositorios
│   │       │   └── adapters/      # Adaptadores a servicios externos
│   │       └── interfaces/
│   │           ├── http/
│   │           │   ├── controllers/
│   │           │   └── guards/
│   │           └── <context>.module.ts
│   ├── shared/                    # Abstracciones y utilidades compartidas entre módulos
│   │   ├── domain/
│   │   └── infrastructure/
│   ├── config/                    # Configuración de la aplicación
│   └── main.ts
├── test/                          # Tests e2e con Supertest
├── jest.config.ts
└── nest-cli.json
```

***

## Arquitectura y NestJS

- Cada **Bounded Context** es un módulo NestJS independiente (`@Module`).
- Registra en el módulo solo lo que pertenece a su contexto: controllers, providers, y el módulo de Mongoose.
- Inyecta dependencias usando los tokens de NestJS (`@Inject`) para respetar la inversión de dependencias: las implementaciones concretas se registran en infraestructura, las interfaces se consumen en aplicación y dominio.
- Evita inyectar repositorios directamente en controllers; pásalos siempre a través de un caso de uso o servicio de aplicación.
- No uses decoradores de NestJS (ni Mongoose) dentro de la capa de dominio; esos detalles pertenecen a infraestructura.

***

## Mongoose

- Define schemas en `infrastructure/persistence/schemas/`. Usa `@Schema()` + `@Prop()` de `@nestjs/mongoose`.
- Las implementaciones de repositorio en infraestructura reciben el `Model<T>` de Mongoose y mapean a entidades de dominio antes de devolverlos. **Nunca expongas un documento Mongoose fuera de la capa de infraestructura.**
- Usa `lean()` en consultas de solo lectura para mejorar rendimiento.
- Las migraciones o seeds no van en los schemas; crea scripts separados en `scripts/`.
- Valida datos de entrada con DTOs + `class-validator` en la capa de interfaces, no con lógica dentro de los schemas.

***

## TypeScript

- `strict: true` siempre habilitado.
- No uses `any`; usa `unknown` cuando el tipo sea indeterminado y estrecha con type guards.
- Tipado explícito en firmas de funciones públicas y métodos de clases.
- Value Objects deben ser clases inmutables con validación en el constructor; lanza excepciones de dominio ante valores inválidos.
- Usa `readonly` en propiedades de entidades y value objects que no deban mutar.

***

## Testing con Jest y Supertest

### Unitarios
- Crea el archivo de test junto al archivo fuente: `<nombre>.spec.ts`.
- Testea **comportamiento**, no implementación: una clase de dominio se prueba mediante sus métodos públicos.
- Mockea dependencias de infraestructura (repositorios, servicios externos) con `jest.fn()` o `createMock()`.
- Cada test debe ser independiente: no comparta estado mutable entre tests.
- Nombra los tests con el patrón: `should <comportamiento esperado> when <condición>`.

### E2E
- Los tests e2e viven en `test/` y usan **Supertest** sobre la app compilada con `createNestApplication()`.
- Usa una base de datos MongoDB de test (en memoria con `mongodb-memory-server` o una instancia aislada).
- Limpia el estado de la base de datos antes o después de cada test (`beforeEach`/`afterEach`).
- Testea los contratos HTTP (status codes, forma del body, headers) y no los detalles internos.

### Cobertura
- Mantén cobertura de líneas y ramas por encima del umbral definido en `jest.config.ts`.
- No aumentes umbrales sin añadir tests reales; no bajes umbrales para que el CI pase.

***

## Reglas adicionales

- No importes nada de `frontend` ni de otros paquetes que no sean `packages/shared` o similares explícitamente definidos como shared.
- Lanza excepciones tipadas del dominio (extiende `Error`) en lugar de strings o códigos genéricos.
- Centraliza el manejo de errores HTTP en un `ExceptionFilter` global; no manejes errores HTTP dentro de los casos de uso.
- Los logs de producción usan el `Logger` de NestJS; no uses `console.log` en código no relacionado con scripts o debug temporal.