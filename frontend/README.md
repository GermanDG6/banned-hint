# Frontend (React + Vite)

## Estado actual

Implementadas las features `card` y `round` con arquitectura DDD completa, más dos pantallas enrutadas y un design system básico.

- **Feature `card`**: dominio (`Card`, `CardId`, `Word`, `BannedWords`, excepciones), caso de uso `GetRandomCard`, adaptador HTTP (`HttpCardRepository`) e inyección de dependencias via contexto (`CardDependenciesProvider`).
- **Feature `round`**: value object `Timer` con validación, excepción `InvalidTimerException`, hook de cuenta regresiva (`useCountdown`) y componente `TimerDisplay`.
- **Sesión**: `RoundConfigSession` persiste la `RoundConfig` (minutos y segundos del timer) en `sessionStorage` entre la pantalla de inicio y la ronda.

### Estructura actual

```
src/
├── features/
│   ├── card/
│   │   ├── domain/          # Card, CardId, Word, BannedWords, excepciones, testing
│   │   ├── application/     # Caso de uso GetRandomCard
│   │   ├── infrastructure/  # HttpCardRepository + CardDependenciesProvider (contexto DI)
│   │   └── ui/              # Componente GameCard, hook useRandomCard
│   └── round/
│       ├── domain/          # Timer (value object), InvalidTimerException
│       └── ui/              # Componente TimerDisplay, hook useCountdown
├── pages/
│   ├── home/                # HomePage — configuración del timer e inicio de ronda
│   └── round/               # RoundPage — pantalla principal del juego
├── components/
│   └── ui/                  # Componentes del design system (CTAButton, …)
├── shared/
│   ├── http/                # FetchHttpClient (implementación del port HTTP)
│   └── session/             # RoundConfigSession
├── routes/
│   └── index.tsx            # Configuración de React Router
├── lib/
│   └── utils.ts             # Helper cn() para Tailwind
├── App.tsx
└── main.tsx
```

## Objetivo

Proporcionar la interfaz para jugar a Banned Hint:

- Permitir al jugador configurar la duración de la ronda (`RoundConfig`).
- Mostrar la `Card` actual (palabra objetivo y palabras prohibidas).
- Gestionar el cronómetro (`Timer`).
- Permitir pasar a la siguiente carta y pausar/reanudar la ronda.

## Pantallas implementadas

| Página | Ruta | Descripción |
| --- | --- | --- |
| `HomePage` | `/` | El jugador configura los minutos y segundos del `Timer` y pulsa «Jugar» |
| `RoundPage` | `/round` | Muestra el `Timer`, la `GameCard` y acciones (Siguiente, Pausa/Continuar, Salir) |

## Componentes implementados

| Componente | Descripción |
| --- | --- |
| `GameCard` | Muestra la carta (`word` + `bannedWords`) |
| `TimerDisplay` | Muestra el tiempo restante de la ronda formateado |
| `CTAButton` | Botón de acción principal del design system |

## Reglas de negocio manejadas en el frontend (MVP)

Según la [documentación de dominio](../docs/overview.md):

- El jugador debe configurar una duración válida (> 0) antes de iniciar la ronda; en caso contrario el botón «Jugar» queda deshabilitado.
- El cronómetro de la ronda se ejecuta solo en el cliente.
- Cuando el tiempo llega a 0, se carga automáticamente una nueva carta y el cronómetro se reinicia.
- El frontend nunca modifica la estructura de una `Card`: solo consume el contrato definido por el backend.

## Próximos pasos

- Implementar registro de aciertos durante la ronda.
- Mostrar resumen de resultados al finalizar la partida.
