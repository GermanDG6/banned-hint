# Dominio del juego Banned Hint (MVP)

## Objetivo

Un jugador debe conseguir que el resto adivinen la palabra objetivo de una carta sin decir ninguna de las palabras prohibidas, dentro de un tiempo limitado.

## Flujo de una ronda (MVP)

1. El jugador configura la duración de la ronda (`RoundConfig`): elige minutos y segundos para el `Timer`. La duración debe ser mayor que cero.
2. La aplicación selecciona una `Card` aleatoria.
3. Se muestra al jugador que describe:
   - `word`: la palabra que el equipo debe adivinar.
   - `bannedWords`: palabras que **no** puede usar al describir.
4. Se inicia el cronómetro con la duración configurada en el paso 1.
5. El equipo intenta adivinar antes de que se acabe el tiempo.
6. Si aciertan, el jugador pulsa «Siguiente» para cargar otra carta y reiniciar el cronómetro.
7. Cuando el tiempo llega a 0, se carga automáticamente una nueva carta y el cronómetro se reinicia.

## Reglas principales (MVP)

- La duración de la ronda debe ser mayor que cero (minutos ≥ 0, segundos ≥ 0, total > 0).
- Cada carta debe tener:
  - Una `word` no vacía.
  - Al menos 4 palabras en `bannedWords`.
- El jugador que describe no puede usar ninguna palabra incluida en `bannedWords`.
- El cronómetro limita la duración de la ronda, pero la gestión del tiempo es local al dispositivo (no se sincroniza entre varios clientes).
