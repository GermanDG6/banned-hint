# Frontend (React + Vite)

## Estado actual

Scaffold inicial con página de inicio básica (`HomePage`).

### Estructura actual

```
src/
├── pages/
│   └── HomePage.tsx      # Página de inicio (placeholder)
├── components/
│   └── ui/               # Componentes de shadcn/ui
├── routes/
│   └── index.tsx         # Configuración de React Router
├── lib/
│   └── utils.ts          # Helper cn() para Tailwind
├── App.tsx
└── main.tsx
```

## Objetivo

Proporcionar la interfaz para jugar a Banned Hint:

- Mostrar la `Card` actual (palabra objetivo y palabras prohibidas).
- Gestionar el cronómetro (`Timer`).
- Permitir controlar el inicio/fin de cada ronda.
- Permitir pasar a la siguiente carta.

## Componentes previstos

| Componente | Descripción                               |
| ---------- | ----------------------------------------- |
| `GamePage` | Pantalla principal del juego              |
| `CardView` | Muestra la carta (`word` + `bannedWords`) |
| `Timer`    | Muestra el tiempo restante de la ronda    |

## Reglas de negocio manejadas en el frontend (MVP)

Según la [documentación de dominio](../docs/overview.md):

- El cronómetro de la ronda se ejecuta solo en el cliente.
- Cuando el tiempo llega a 0, la ronda termina y se informa al usuario.

El frontend nunca modifica la estructura de una `Card`: solo consume el contrato definido por el backend.
