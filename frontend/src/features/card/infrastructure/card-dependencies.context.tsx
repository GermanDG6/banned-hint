import React, { createContext } from 'react';
import { GetRandomCard } from '../application/use-cases/get-random-card.use-case';
import { cardContainer } from './card-dependencies.container';

interface CardDependencies {
  getRandomCard: GetRandomCard;
}

const CardDependenciesContext = createContext<CardDependencies | undefined>(undefined);

interface CardDependenciesProviderProps {
  children: React.ReactNode;
}

export function CardDependenciesProvider({ children }: CardDependenciesProviderProps) {
  return (
    <CardDependenciesContext.Provider value={cardContainer}>
      {children}
    </CardDependenciesContext.Provider>
  );
}

export function useCardDependencies(): CardDependencies {
  const context = React.useContext(CardDependenciesContext);
  if (context === undefined) {
    throw new Error('useCardDependencies must be used within CardDependenciesProvider');
  }
  return context;
}

export function useGetRandomCard(): GetRandomCard {
  return useCardDependencies().getRandomCard;
}
