import { describe, it, expect } from 'vitest';
import { useGetRandomCard } from './card-dependencies.context';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { CardDependenciesProvider } from './card-dependencies.context';

describe('CardDependenciesContext', () => {
  it('should provide GetRandomCard instance when used inside CardDependenciesProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(CardDependenciesProvider, null, children);

    const { result } = renderHook(() => useGetRandomCard(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('execute');
  });
});
