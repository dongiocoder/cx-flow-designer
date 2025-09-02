'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

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
  
  // Use Convex to get companies
  const companies = useQuery(api.companies.getAll);
  const createCompany = useMutation(api.companies.create);
  
  const availableClients = companies?.map(c => c.name) || [];
  const isLoadingClients = companies === undefined;

  // Load current client from localStorage and set it
  useEffect(() => {
    if (companies && companies.length > 0) {
      const savedClient = localStorage.getItem('cx-selected-client');
      const clientNames = companies.map(c => c.name);
      const clientToUse = savedClient && clientNames.includes(savedClient) 
        ? savedClient 
        : clientNames[0];
        
      setCurrentClient(clientToUse);
      localStorage.setItem('cx-selected-client', clientToUse);
    }
  }, [companies]);

  const switchClient = (clientName: string) => {
    console.log(`🔄 Switching to client: ${clientName}`);
    
    // Clear all localStorage cache that might be client-specific
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.includes('workstream') || key.includes('client') || key.includes('cx-')
    );
    keysToRemove.forEach(key => {
      if (key !== 'cx-selected-client') {
        localStorage.removeItem(key);
      }
    });
    
    setCurrentClient(clientName);
    localStorage.setItem('cx-selected-client', clientName);
    
    console.log(`🔄 Client switched to: ${clientName}, reloading page...`);
    // Force page refresh to reload all data for new client
    window.location.reload();
  };

  const createClient = async (clientName: string) => {
    try {
      console.log(`Creating client: ${clientName}`);
      // Create the company in Convex
      const slug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await createCompany({ name: clientName, slug });
      
      // Switch to the new client
      switchClient(clientName);
    } catch (error) {
      console.error('Failed to create client:', error);
      throw error;
    }
  };

  const refreshClients = async () => {
    // No need to refresh - Convex queries are reactive
    console.log('Refresh clients called (Convex handles this automatically)');
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