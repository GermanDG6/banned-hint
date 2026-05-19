# Lenguaje ubicuo

- **Card**: tarjeta con la palabra objetivo (`word`) y una lista de palabras prohibidas (`bannedWords`).
- **CardId**: identificador único de una `Card`, representado como un UUID.
- **Word**: palabra que el equipo debe adivinar a partir de las pistas.
- **Banned word**: palabra que el jugador que describe no puede pronunciar al dar pistas.
- **Round**: intervalo de tiempo en el que se juega con una carta y un cronómetro activo.
- **Timer**: límite de tiempo de una `Round`, expresado en minutos y segundos. En el MVP solo se gestiona en el frontend.
- **RoundConfig**: configuración elegida por el jugador antes de iniciar una ronda; contiene los minutos y segundos del `Timer`. Se persiste en `sessionStorage` durante la partida y se descarta al salir.
- **InvalidTimer**: excepción de dominio que se lanza cuando la configuración del `Timer` no es válida (valores negativos, fuera de rango o duración total igual a cero).
