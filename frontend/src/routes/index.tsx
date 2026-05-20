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

const GuesserPage = lazy(() =>
  import('../features/lobby/ui/pages').then((m) => ({ default: m.GuesserPage })),
);

const DescriberPage = lazy(() =>
  import('../features/lobby/ui/pages').then((m) => ({ default: m.DescriberPage })),
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
            <RoundPage />
          </Suspense>
        ),
      },
      {
        path: 'round/describe',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LobbyDependenciesProvider>
              <DescriberPage />
            </LobbyDependenciesProvider>
          </Suspense>
        ),
      },
      {
        path: 'round/guess',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LobbyDependenciesProvider>
              <GuesserPage />
            </LobbyDependenciesProvider>
          </Suspense>
        ),
      },
    ],
  },
]);
