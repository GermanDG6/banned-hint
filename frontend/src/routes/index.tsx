import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import App from '../App';
import { HomePage } from '../pages/HomePage';

const RoundPage = lazy(() => import('../pages/RoundPage').then((m) => ({ default: m.RoundPage })));

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
        path: 'round',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <RoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);
