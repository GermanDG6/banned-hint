# Backend (NestJS)

## Estado actual

Implementado el módulo `card` con arquitectura DDD completa: dominio (entidad `Card` con value objects `CardId`, `Word`, `BannedWords`), aplicación (caso de uso `GetRandomCardUseCase`), infraestructura (`FakeCardRepository` para desarrollo + `MongoCardRepository` listo para BD), e interfaces (controller HTTP + exception filter).

### Endpoints implementados

| Método | Ruta          | Descripción                          |
| ------ | ------------- | ------------------------------------ |
| GET    | `/api/health` | Verifica que el servidor está activo |
| GET    | `/api/cards/random` | Devuelve una carta aleatoria |

## Arquitectura actual

El backend sigue un enfoque **Domain-Driven Design** con separación clara de capas:

### Bounded Context: Card

- **Dominio** (`domain/`):
  - Entidades: `Card`
  - Value Objects: `CardId`, `Word`, `BannedWords`
  - Excepciones: `EmptyWordException`, `EmptyBannedWordsException`, `CardNotFoundException`
  - Repositorio (interfaz): `CardRepository`
  - Testing: `CardMother` (Object Mother para tests)

- **Aplicación** (`application/`):
  - Caso de uso: `GetRandomCardUseCase` — obtiene una carta aleatoria del repositorio y mapea a DTO.
  - DTO: `CardDto` — salida estandarizada con `id`, `word` y `bannedWords`.

- **Infraestructura** (`infrastructure/persistence/`):
  - Mongoose Schema: `CardSchema` en MongoDB.
  - Repositorios:
    - `FakeCardRepository` — devuelve cartas predefinidas (desarrollo sin BD real). **Activo por defecto.**
    - `MongoCardRepository` — implementación real con `$sample` para queries aleatorias. (Listo para cuando esté la BD configurada.)

- **Interfaces** (`interfaces/`):
  - Controller: `CardController` con endpoint `GET /random`.
  - Exception Filter: `CardNotFoundExceptionFilter` — mapea `CardNotFoundException` a HTTP 404.
  - Módulo: `CardModule` — integra todas las capas.

### Reglas de negocio implementadas

- `word` no puede estar vacía (validación en `Word` value object).
- `bannedWords` debe contener al menos una palabra (validación en `BannedWords` value object).
- `GET /api/cards/random` devuelve `404 Not Found` si no hay cartas disponibles.

### Testing

- **Unitarios**: todos los componentes (`Card`, `CardId`, `Word`, `BannedWords`, `GetRandomCardUseCase`, repositorios, controller) tienen tests que verifican comportamiento.
- **Object Mother**: `CardMother` proporciona instancias predefinidas de `Card` reutilizables en tests y en `FakeCardRepository`.
- Ejecución: `npm run test -w backend`.

### Token de inyección de dependencias

Usa `Symbol('CardRepository')` exportado como `CARD_REPOSITORY` en `domain/repositories/card.repository.ts` para evitar colisiones entre módulos.

### Nota sobre `FakeCardRepository`

Durante el desarrollo sin un MongoDB real configurado, `CardModule` inyecta `FakeCardRepository` bajo el token `CARD_REPOSITORY`. Cuando la BD esté lista, cambia el provider a `MongoCardRepository`. El cambio es local al módulo (1 línea); no requiere cambios en aplicación ni interfaces.

## Próximos pasos

- Configurar MongoDB.
- Integrar seed de datos iniciales en `scripts/seed-cards.ts`.
- Cambiar `FakeCardRepository` → `MongoCardRepository` en `CardModule`.
- Tests e2e contra el endpoint real.
