'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService } from '@/lib/storage';

interface ClientContextType {
  currentClient: string;
  availableClients: string[];
  isLoadingClients: boolean;
  switchClient: (clientName: string) => void;
  createClient: (clientName: string) => Promise<void>;
  refreshClients: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [currentClient, setCurrentClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  // Load clients and current selection from storage
  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoadingClients(true);
        
        // Load available clients from GitHub
        const clients = await storageService.loadClients();
        setAvailableClients(clients);
        
        // Load current client from localStorage (UI state)
        const savedClient = localStorage.getItem('cx-selected-client');
        const clientToUse = savedClient && clients.includes(savedClient) 
          ? savedClient 
          : clients[0] || 'HelloFresh';
          
        setCurrentClient(clientToUse);
        localStorage.setItem('cx-selected-client', clientToUse);
        
      } catch (error) {
        console.error('Failed to load clients:', error);
        // Fallback to default
        const defaultClients = ['HelloFresh', 'Warby Parker'];
        setAvailableClients(defaultClients);
        setCurrentClient('HelloFresh');
        localStorage.setItem('cx-selected-client', 'HelloFresh');
      } finally {
        setIsLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  const switchClient = (clientName: string) => {
    // Clear storage cache before switching
    storageService.clearCache();
    setCurrentClient(clientName);
    localStorage.setItem('cx-selected-client', clientName);
    // Force page refresh to reload all data for new client
    window.location.reload();
  };

  const createClient = async (clientName: string) => {
    try {
      // Clear cache before creating new client
      storageService.clearCache();
      await storageService.createClient(clientName);
      // Clear cache again after creation
      storageService.clearCache();
      await refreshClients();
      switchClient(clientName);
    } catch (error) {
      console.error('Failed to create client:', error);
      throw error;
    }
  };

  const refreshClients = async () => {
    try {
      // Clear cache to ensure fresh client data
      storageService.clearCache();
      const clients = await storageService.loadClients();
      setAvailableClients(clients);
    } catch (error) {
      console.error('Failed to refresh clients:', error);
    }
  };

  return (
    <ClientContext.Provider value={{
      currentClient,
      availableClients,
      isLoadingClients,
      switchClient,
      createClient,
      refreshClients
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}