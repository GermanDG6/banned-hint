import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import {
  LobbyDependenciesProvider,
  useLobbySocket,
  useCreateLobby,
  useJoinLobby,
} from './lobby-dependencies.context';

// Mock del contenedor singleton
vi.mock('./lobby-dependencies.container', () => {
  const mockLobbySocket = {
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  const mockCreateLobby = {
    execute: vi.fn(),
  };

  const mockJoinLobby = {
    execute: vi.fn(),
  };

  return {
    lobbyContainer: {
      lobbySocket: mockLobbySocket,
      createLobby: mockCreateLobby,
      joinLobby: mockJoinLobby,
    },
  };
});

describe('LobbyDependenciesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide LobbySocket instance when used inside LobbyDependenciesProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(LobbyDependenciesProvider, null, children);

    const { result } = renderHook(() => useLobbySocket(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.connect).toBeDefined();
    expect(result.current.disconnect).toBeDefined();
  });

  it('should provide CreateLobby instance when used inside LobbyDependenciesProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(LobbyDependenciesProvider, null, children);

    const { result } = renderHook(() => useCreateLobby(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('execute');
  });

  it('should provide JoinLobby instance when used inside LobbyDependenciesProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(LobbyDependenciesProvider, null, children);

    const { result } = renderHook(() => useJoinLobby(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('execute');
  });
});
