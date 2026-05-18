import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { CardDependenciesProvider } from './features/card/infrastructure/card-dependencies.context';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CardDependenciesProvider>
      <RouterProvider router={router} />
    </CardDependenciesProvider>
  </React.StrictMode>,
);
