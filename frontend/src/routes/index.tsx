import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import App from '../App';
import { HomePage } from '../pages/home/HomePage';
import { LobbyDependenciesProvider } from '../features/lobby/infrastructure/lobby-dependencies.context';

const CreateLobbyPage = lazy(() =>
  import('../features/lobby/ui/pages').then((m) => ({ default: m.CreateLobbyPage })),
);

const WaitingRoomPage = lazy(() =>
  import('../features/lobby/ui/pages').then((m) => ({ default: m.WaitingRoomPage })),
);

const RoundPage = lazy(() =>
  import('../pages/round/RoundPage').then((m) => ({ default: m.RoundPage })),
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'lobby/new',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LobbyDependenciesProvider>
              <CreateLobbyPage />
            </LobbyDependenciesProvider>
          </Suspense>
        ),
      },
      {
        path: 'lobby/:code',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LobbyDependenciesProvider>
              <WaitingRoomPage />
            </LobbyDependenciesProvider>
          </Suspense>
        ),
      },
      {
        path: 'round',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LobbyDependenciesProvider>
              <RoundPage />
            </LobbyDependenciesProvider>
          </Suspense>
        ),
      },
      {
        path: 'round/guess',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LobbyDependenciesProvider>
              <div>GuesserPage - Coming soon</div>
            </LobbyDependenciesProvider>
          </Suspense>
        ),
      },
    ],
  },
]);
