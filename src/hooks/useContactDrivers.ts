import { useState, useEffect } from 'react';

export interface Flow {
  id: string;
  name: string;
  description: string;
  type: 'current' | 'future';
  lastModified: string;
  createdAt: string;
}

export interface ContactDriver {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  flows: Flow[];
  createdAt: string;
}

const STORAGE_KEY = 'cx-contact-drivers';

// Initial mock data
const initialContactDrivers: ContactDriver[] = [
  {
    id: '1',
    name: "Account Access Issues",
    description: "Customer cannot access their account due to login problems",
    lastModified: new Date().toISOString().split('T')[0],
    tier: "Tier 1",
    flows: [
      {
        id: '1-1',
        name: "Current Login Process",
        description: "Existing password reset flow",
        type: 'current',
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: '1-2',
        name: "Enhanced Login Process",
        description: "Improved multi-factor authentication flow",
        type: 'future',
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: "Product Purchase Inquiry",
    description: "Customer wants information about products before purchasing",
    lastModified: new Date().toISOString().split('T')[0],
    tier: "Tier 2",
    flows: [
      {
        id: '2-1',
        name: "Current Sales Process",
        description: "Existing product consultation flow",
        type: 'current',
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: "Return and Refund Request",
    description: "Customer wants to return a product and get a refund",
    lastModified: new Date().toISOString().split('T')[0],
    tier: "Tier 3",
    flows: [
      {
        id: '3-1',
        name: "Current Return Process",
        description: "Manual return authorization process",
        type: 'current',
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: '3-2',
        name: "Automated Return Process",
        description: "Self-service return portal",
        type: 'future',
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  }
];

export function useContactDrivers() {
  const [contactDrivers, setContactDrivers] = useState<ContactDriver[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);

  // Load contact drivers from localStorage on mount
  useEffect(() => {
    const savedDrivers = localStorage.getItem(STORAGE_KEY);
    if (savedDrivers) {
      setContactDrivers(JSON.parse(savedDrivers));
    } else {
      // If no saved drivers, use initial data
      setContactDrivers(initialContactDrivers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialContactDrivers));
    }
  }, []);

  // Save contact drivers to localStorage whenever they change
  useEffect(() => {
    if (contactDrivers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contactDrivers));
    }
  }, [contactDrivers]);

  const addContactDriver = (driverData: Omit<ContactDriver, 'id' | 'createdAt' | 'lastModified' | 'flows'>) => {
    const newDriver: ContactDriver = {
      id: Date.now().toString(),
      ...driverData,
      flows: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString().split('T')[0]
    };
    setContactDrivers(prev => [...prev, newDriver]);
    return newDriver;
  };

  const updateContactDriver = (id: string, updates: Partial<ContactDriver>) => {
    setContactDrivers(prev => prev.map(driver => 
      driver.id === id 
        ? { ...driver, ...updates, lastModified: new Date().toISOString().split('T')[0] }
        : driver
    ));
  };

  const deleteContactDriver = (id: string) => {
    setContactDrivers(prev => prev.filter(driver => driver.id !== id));
    setSelectedDrivers(prev => prev.filter(driverId => driverId !== id));
  };

  const deleteSelectedDrivers = () => {
    setContactDrivers(prev => prev.filter(driver => !selectedDrivers.includes(driver.id)));
    setSelectedDrivers([]);
  };

  const duplicateContactDriver = (id: string) => {
    const driverToDuplicate = contactDrivers.find(driver => driver.id === id);
    if (driverToDuplicate) {
      const duplicatedDriver: ContactDriver = {
        ...driverToDuplicate,
        id: Date.now().toString(),
        name: `${driverToDuplicate.name} (Copy)`,
        flows: driverToDuplicate.flows.map(flow => ({
          ...flow,
          id: `${Date.now()}-${Math.random()}`,
        })),
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString().split('T')[0]
      };
      setContactDrivers(prev => [...prev, duplicatedDriver]);
      return duplicatedDriver;
    }
  };

  const addFlowToDriver = (driverId: string, flowData: Omit<Flow, 'id' | 'createdAt' | 'lastModified'>) => {
    const newFlow: Flow = {
      id: `${driverId}-${Date.now()}`,
      ...flowData,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString().split('T')[0]
    };

    setContactDrivers(prev => prev.map(driver => 
      driver.id === driverId 
        ? { 
            ...driver, 
            flows: [...driver.flows, newFlow],
            lastModified: new Date().toISOString().split('T')[0]
          }
        : driver
    ));

    return newFlow;
  };

  const toggleDriverSelection = (id: string) => {
    setSelectedDrivers(prev => 
      prev.includes(id) 
        ? prev.filter(driverId => driverId !== id)
        : [...prev, id]
    );
  };

  const selectAllDrivers = () => {
    setSelectedDrivers(contactDrivers.map(driver => driver.id));
  };

  const clearSelection = () => {
    setSelectedDrivers([]);
  };

  const isAllSelected = selectedDrivers.length === contactDrivers.length && contactDrivers.length > 0;
  const isPartiallySelected = selectedDrivers.length > 0 && selectedDrivers.length < contactDrivers.length;

  return {
    contactDrivers,
    selectedDrivers,
    addContactDriver,
    updateContactDriver,
    deleteContactDriver,
    deleteSelectedDrivers,
    duplicateContactDriver,
    addFlowToDriver,
    toggleDriverSelection,
    selectAllDrivers,
    clearSelection,
    isAllSelected,
    isPartiallySelected
  };
} 