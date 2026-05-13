# Backend (NestJS)

## Estado actual

Scaffold inicial de NestJS con un único endpoint de health check.

### Endpoints implementados

| Método | Ruta          | Descripción                          |
| ------ | ------------- | ------------------------------------ |
| GET    | `/api/health` | Verifica que el servidor está activo |

## Arquitectura objetivo

El backend seguirá un enfoque **Domain-Driven Design** una vez se implemente la lógica de negocio.

### Capas previstas

- `domain/`: entidades de dominio (`Card`), value objects, reglas de negocio puras.
- `application/`: casos de uso (ej. `GetRandomCardUseCase`).
- `infrastructure/`: persistencia (Mongoose), adaptadores externos.
- `api/`: controllers HTTP, DTOs, filtros de excepciones.

### Entidad principal: Card (por implementar)

Según el [lenguaje ubicuo](../docs/ubiquitous-language.md):

- `word`: palabra que el equipo debe adivinar.
- `bannedWords`: lista de palabras prohibidas.
- Reglas de negocio:
  - `word` no puede estar vacía.
  - `bannedWords` debe contener al menos un elemento.
  - Opcionalmente puede tener `language` y `category`.

### Casos de uso previstos

- `GetRandomCardUseCase`: seleccionará una carta aleatoria del repositorio.

### API prevista

| Método | Ruta                | Descripción                  |
| ------ | ------------------- | ---------------------------- |
| GET    | `/api/cards/random` | Devuelve una carta aleatoria |

Las reglas de negocio se aplicarán en el dominio. El backend nunca devolverá una carta inválida.
