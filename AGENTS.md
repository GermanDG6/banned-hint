# AGENTS.md

## Propósito
Este repositorio es un monorepo con npm workspaces. Aplica reglas globales para todo el código. Los archivos `AGENTS.md` más cercanos a cada proyecto pueden añadir o refinar estas normas.

## Alcance y precedencia
- Estas reglas aplican a todo el repositorio.
- Si existe un `AGENTS.md` dentro de un paquete o aplicación, sus instrucciones complementan estas reglas y prevalecen en ese contexto.
- No contradigas estas normas globales salvo que el subproyecto lo justifique explícitamente.

## Trabajo en monorepo
- Antes de hacer cambios, identifica el workspace afectado y limita el alcance a ese workspace.
- Evita cambios transversales innecesarios en varios paquetes.
- Reutiliza paquetes compartidos antes de duplicar lógica.
- Si una funcionalidad es común a varios proyectos, extrae una abstracción compartida solo cuando el caso de uso sea estable.
- Workspaces actuales del monorepo: `backend/`, `frontend/` y `e2e/` (definidos en `package.json`).
- Para ejecutar scripts por workspace usa `-w <workspace>` con los nombres reales (`backend`, `frontend`, `e2e`), no rutas legacy tipo `apps/*`.

## Arquitectura
- Diseña el código siguiendo **DDD** siempre que el problema de negocio lo justifique.
- Organiza el código con separación explícita entre:
    - Dominio
    - Aplicación
    - Infraestructura
    - Interfaces/entrega
- El dominio debe contener la lógica de negocio y no depender de frameworks, APIs externas, bases de datos ni detalles de infraestructura.
- Modela el dominio con lenguaje ubicuo: usa nombres que reflejen conceptos de negocio reales.
- Favorece agregados, entidades, value objects, servicios de dominio y repositorios cuando aporten claridad.
- Define contratos en capas internas e implementaciones en capas externas.
- Las dependencias deben apuntar hacia dentro: infraestructura depende de aplicación/dominio, nunca al revés.
- Límites actuales del sistema:
    - `backend/`: API REST con NestJS (prefijo global `/api`, ver `backend/src/main.ts`).
    - `frontend/`: SPA React/Vite y enrutado en `frontend/src/routes/index.tsx`.
    - `e2e/`: suite Playwright de extremo a extremo contra la UI (`e2e/playwright.config.ts`, `e2e/tests/`).

## Diseño de código
Aplica estos principios en todo cambio:
- **SOLID**
    - Single Responsibility: cada módulo debe tener una única razón de cambio.
    - Open/Closed: extiende mediante composición o nuevas implementaciones, evita modificar comportamiento estable sin necesidad.
    - Liskov Substitution: las abstracciones deben poder sustituirse sin comportamientos inesperados.
    - Interface Segregation: usa interfaces pequeñas y orientadas al caso de uso.
    - Dependency Inversion: depende de abstracciones, no de detalles.
- **DRY**: evita duplicación de lógica, reglas de negocio y conocimiento accidental.
- **KISS**: prefiere la solución más simple que cumpla el caso de uso.
- **Ley de Demeter**: evita cadenas largas de navegación y acoplamiento innecesario entre objetos o módulos.
- Favorece composición frente a herencia.
- Mantén funciones y módulos cohesionados, pequeños y fáciles de probar.
- Evita utilidades genéricas sin contexto de dominio si ocultan intención de negocio.

## Testing
- Aplica **TDD** siempre que sea razonable: escribe primero una prueba que defina el comportamiento esperado, implementa lo mínimo para pasarla y luego refactoriza.
- Todo cambio de comportamiento debe ir acompañado de pruebas.
- Los tests deben centrarse en comportamiento observable, no en detalles de implementación.
- Prioriza tests de dominio y aplicación sobre mocks excesivos.
- Usa tests unitarios para reglas de negocio y tests de integración para adaptadores, persistencia y flujos entre capas.
- No des por terminado un cambio con tests rotos, incompletos o pendientes.

## Calidad y mantenibilidad
- Refactoriza cuando detectes complejidad accidental.
- Evita “quick fixes” que aumenten deuda técnica.
- No mezcles lógica de negocio con detalles de UI, transporte, persistencia o framework.
- Mantén nombres explícitos y consistentes.
- Documenta decisiones arquitectónicas relevantes cuando introduzcan nuevos patrones, límites de contexto o contratos compartidos.

## Cambios y dependencias
- No añadas dependencias nuevas sin necesidad clara.
- Antes de crear una abstracción, verifica que resuelve una duplicación real o un límite de dominio claro.
- Si rompes una convención global, explica el motivo en el cambio.

## Validación
- Ejecuta los checks del workspace afectado antes de dar por terminado el trabajo.
- Corrige errores de lint, tipos y tests antes de cerrar una tarea.
- Si un subproyecto define comandos específicos en su propio `AGENTS.md`, usa esos comandos.
- Comandos raíz disponibles para validación rápida: `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run build`.
- Si el cambio es aislado, prioriza comandos del workspace: `npm run <script> -w backend|frontend|e2e`.
