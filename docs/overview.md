# Dominio del juego Banned Hint (MVP)

## Objetivo

Un jugador debe conseguir que el resto adivinen la palabra objetivo de una carta sin decir ninguna de las palabras prohibidas, dentro de un tiempo limitado.

## Flujo de una ronda (MVP)

1. La aplicación selecciona una `Card` aleatoria.
2. Se muestra al jugador que describe:
   - `word`: la palabra que el equipo debe adivinar.
   - `bannedWords`: palabras que **no** puede usar al describir.
3. Se inicia un cronómetro (por ejemplo, 60 segundos).
4. El equipo intenta adivinar antes de que se acabe el tiempo.
5. Si aciertan, se registra un acierto para esa ronda (lógica de puntuación básica en esta fase).

## Reglas principales (MVP)

- Cada carta debe tener:
  - Una `word` no vacía.
  - Al menos una palabra en `bannedWords`.
- El jugador que describe no puede usar ninguna palabra incluida en `bannedWords`.
- El cronómetro limita la duración de la ronda, pero inicialmente la gestión del tiempo es local al dispositivo (no se sincroniza entre varios clientes).
