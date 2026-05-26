# Frontend (React + Vite)

## Estado actual

Implementadas las features `card` y `round`, dos modos de juego, y un design system básico.

- **Feature `card`**: dominio (`Card`, `CardId`, `Word`, `BannedWords`, excepciones), caso de uso `GetRandomCard`, adaptador HTTP (`HttpCardRepository`) e inyección de dependencias via contexto (`CardDependenciesProvider`).
- **Feature `round`**: value object `Timer` con validación, excepción `InvalidTimerException`, hook de cuenta regresiva (`useCountdown`) y componente `TimerDisplay`.
- **Sesión**: `RoundConfigSession` persiste la `RoundConfig` (minutos y segundos del timer) en `sessionStorage` entre `LocalSetupPage` y `RoundPage`.

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
│   ├── home/                # HomePage — selección de modo de juego
│   ├── local-setup/         # LocalSetupPage — configuración del timer (Modo Local)
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

Proporcionar la interfaz para jugar a Banned Hint en dos modos:

- **Modo Local**: un solo dispositivo. El jugador configura la duración de la ronda (`RoundConfig`) en `/local/setup` y luego juega en `/round`.
- **Modo Sala**: multijugador. El host crea un `Lobby` en `/lobby/new`; el flujo multijugador sigue la descripción en la [documentación de dominio](../docs/overview.md).

## Pantallas implementadas

| Página | Ruta | Descripción |
| --- | --- | --- |
| `HomePage` | `/` | Selección de modo de juego (Modo Local o Modo Sala) |
| `LocalSetupPage` | `/local/setup` | Configuración del `Timer` antes de iniciar una ronda en Modo Local |
| `RoundPage` | `/round` | Muestra el `Timer`, la `GameCard` y acciones (Siguiente, Pausa/Continuar, Salir) |

## Componentes implementados

| Componente | Descripción |
| --- | --- |
| `GameCard` | Muestra la carta (`word` + `bannedWords`) |
| `TimerDisplay` | Muestra el tiempo restante de la ronda formateado |
| `CTAButton` | Botón de acción principal del design system |

## Reglas de negocio manejadas en el frontend (MVP)

Según la [documentación de dominio](../docs/overview.md):

- **En `LocalSetupPage`**: el jugador debe configurar una duración válida (> 0) antes de iniciar la ronda; en caso contrario el botón «¡JUGAR!» queda deshabilitado.
- **En `RoundPage` (Modo Local)**: el cronómetro de la ronda se ejecuta solo en el cliente. Cuando el tiempo llega a 0, se carga automáticamente una nueva carta y el cronómetro se reinicia.
- El frontend nunca modifica la estructura de una `Card`: solo consume el contrato definido por el backend.

## Próximos pasos

- Implementar registro de aciertos durante la ronda.
- Mostrar resumen de resultados al finalizar la partida.
