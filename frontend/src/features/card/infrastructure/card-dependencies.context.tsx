import React, { createContext, useMemo } from 'react';
import { GetRandomCard } from '../application/use-cases/get-random-card.use-case';
import { HttpCardRepository } from './api/http-card.repository';
import { FetchHttpClient } from '@/shared/http/fetch-http-client.ts';

interface CardDependencies {
  getRandomCard: GetRandomCard;
}

const CardDependenciesContext = createContext<CardDependencies | undefined>(undefined);

interface CardDependenciesProviderProps {
  children: React.ReactNode;
}

export function CardDependenciesProvider({ children }: CardDependenciesProviderProps) {
  const dependencies = useMemo(() => {
    const httpClient = new FetchHttpClient();
    const cardRepository = new HttpCardRepository(httpClient);
    const getRandomCard = new GetRandomCard(cardRepository);

    return {
      getRandomCard,
    };
  }, []);

  return (
    <CardDependenciesContext.Provider value={dependencies}>
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
