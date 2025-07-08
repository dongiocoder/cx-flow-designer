import { useState, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { storageService } from '@/lib/storage';

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

interface LegacyFlow {
  id: string;
  name: string;
  description: string;
  type: string;
  lastModified: string;
  createdAt: string;
  version?: string;
  data?: FlowData;
}

interface LegacyDriver {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  tier?: 'Tier 1' | 'Tier 2' | 'Tier 3';
  containmentPercentage?: number;
  containmentVolume?: number;
  volumePerMonth?: number;
  avgHandleTime?: number;
  csat?: number;
  qaScore?: number;
  phoneVolume?: number;
  emailVolume?: number;
  chatVolume?: number;
  otherVolume?: number;
  flows?: LegacyFlow[];
  createdAt: string;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  type: 'current' | 'draft';
  lastModified: string;
  createdAt: string;
  version?: string;
  data?: FlowData;
}

export interface ContactDriver {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  containmentPercentage: number; // percentage of cases AI contained
  containmentVolume: number; // actual volume of cases AI contained
  volumePerMonth: number;
  avgHandleTime: number; // in minutes
  csat: number; // percentage
  qaScore: number; // percentage
  // Contact volume breakdown
  phoneVolume: number;
  emailVolume: number;
  chatVolume: number;
  otherVolume: number;
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
    containmentPercentage: 78,
    containmentVolume: 975,
    volumePerMonth: 1250,
    avgHandleTime: 8.5,
    csat: 92,
    qaScore: 98,
    phoneVolume: 750,
    emailVolume: 375,
    chatVolume: 125,
    otherVolume: 0,
    flows: [
      {
        id: '1-1',
        name: "Password Reset Flow",
        description: "Current password reset process",
        type: 'current',
        version: "v 3.2",
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: '1-2',
        name: "Enhanced MFA Flow",
        description: "Improved multi-factor authentication flow",
        type: 'draft',
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: '1-3',
        name: "Biometric Login",
        description: "Future biometric authentication option",
        type: 'draft',
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
    containmentPercentage: 65,
    containmentVolume: 579,
    volumePerMonth: 890,
    avgHandleTime: 12.3,
    csat: 88,
    qaScore: 95,
    phoneVolume: 534,
    emailVolume: 267,
    chatVolume: 89,
    otherVolume: 0,
    flows: [
      {
        id: '2-1',
        name: "Sales Consultation",
        description: "Current product consultation process",
        type: 'current',
        version: "v 2.1",
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
    containmentPercentage: 45,
    containmentVolume: 153,
    volumePerMonth: 340,
    avgHandleTime: 15.8,
    csat: 78,
    qaScore: 92,
    phoneVolume: 204,
    emailVolume: 102,
    chatVolume: 34,
    otherVolume: 0,
    flows: [
      {
        id: '3-1',
        name: "Return Authorization",
        description: "Manual return approval process",
        type: 'current',
        version: "v 1.9",
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: '3-2',
        name: "Self-Service Returns",
        description: "Automated return portal",
        type: 'draft',
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
  const [isLoading, setIsLoading] = useState(true);
  const [storageStatus, setStorageStatus] = useState<'github' | 'localStorage' | 'none'>('none');

  // Load contact drivers from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const savedDrivers = await storageService.loadData();
        
        if (savedDrivers.length > 0) {
          // Migrate existing data to include new fields if needed
          const migratedDrivers = savedDrivers.map((driver: any) => {
            // Remove tier and add containment fields if missing
            const { tier, ...driverWithoutTier } = driver;
            const volume = driver.volumePerMonth || 0;
            return {
              ...driverWithoutTier,
              volumePerMonth: volume,
              avgHandleTime: driver.avgHandleTime || 0,
              csat: driver.csat || 0,
              qaScore: driver.qaScore || 98,
              containmentPercentage: driver.containmentPercentage || 60,
              containmentVolume: driver.containmentVolume || Math.round(volume * 0.6),
              phoneVolume: driver.phoneVolume || Math.round(volume * 0.6),
              emailVolume: driver.emailVolume || Math.round(volume * 0.3),
              chatVolume: driver.chatVolume || Math.round(volume * 0.1),
              otherVolume: driver.otherVolume || 0,
              flows: driver.flows ? driver.flows.map((flow: any) => ({
                ...flow,
                type: flow.type === 'future' ? 'draft' : flow.type,
                version: flow.version || (flow.type === 'current' ? 'v 1.0' : undefined)
              })) : []
            };
          });
          setContactDrivers(migratedDrivers);
        } else {
          // If no saved drivers, use initial data
          setContactDrivers(initialContactDrivers);
          // Save initial data to storage
          await storageService.saveData(initialContactDrivers);
        }
        
        // Update storage status
        const status = storageService.getStorageStatus();
        setStorageStatus(status.type);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to initial data
        setContactDrivers(initialContactDrivers);
        setStorageStatus('localStorage');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save contact drivers to storage whenever they change
  useEffect(() => {
    if (contactDrivers.length > 0 && !isLoading) {
      const saveData = async () => {
        try {
          await storageService.saveData(contactDrivers);
          // Update storage status after successful save
          const status = storageService.getStorageStatus();
          setStorageStatus(status.type);
        } catch (error) {
          console.error('Failed to save data:', error);
        }
      };
      
      saveData();
    }
  }, [contactDrivers, isLoading]);

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

  const deleteFlow = (flowId: string) => {
    setContactDrivers(prev => prev.map(driver => ({
      ...driver,
      flows: driver.flows.filter(flow => flow.id !== flowId),
      lastModified: new Date().toISOString().split('T')[0]
    })));
  };

  const setFlowAsCurrent = (flowId: string) => {
    setContactDrivers(prev => prev.map(driver => {
      // Only update flows if this driver contains the target flow
      const hasTargetFlow = driver.flows.some(flow => flow.id === flowId);
      
      if (!hasTargetFlow) {
        // This driver doesn't contain the target flow, leave it unchanged
        return driver;
      }

      // This driver contains the target flow, update its flows
      return {
        ...driver,
        flows: driver.flows.map(flow => ({
          ...flow,
          type: flow.id === flowId ? 'current' : (flow.type === 'current' ? 'draft' : flow.type),
          version: flow.id === flowId ? `v ${(Math.random() * 10).toFixed(1)}` : flow.version
        })),
        lastModified: new Date().toISOString().split('T')[0]
      };
    }));
  };

  const duplicateFlow = (flowId: string) => {
    setContactDrivers(prev => prev.map(driver => {
      const flowToDuplicate = driver.flows.find(flow => flow.id === flowId);
      if (flowToDuplicate) {
        const duplicatedFlow: Flow = {
          ...flowToDuplicate,
          id: `${driver.id}-${Date.now()}`,
          name: `${flowToDuplicate.name} (Copy)`,
          type: 'draft',
          version: undefined,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString().split('T')[0]
        };
        return {
          ...driver,
          flows: [...driver.flows, duplicatedFlow],
          lastModified: new Date().toISOString().split('T')[0]
        };
      }
      return driver;
    }));
  };

  const saveFlowData = (flowId: string, nodes: Node[], edges: Edge[]) => {
    setContactDrivers(prev => prev.map(driver => ({
      ...driver,
      flows: driver.flows.map(flow => 
        flow.id === flowId 
          ? { 
              ...flow, 
              data: { nodes, edges },
              lastModified: new Date().toISOString().split('T')[0]
            }
          : flow
      ),
      lastModified: new Date().toISOString().split('T')[0]
    })));
  };

  const updateFlow = (flowId: string, updates: Partial<Pick<Flow, 'name' | 'description'>>) => {
    setContactDrivers(prev => prev.map(driver => ({
      ...driver,
      flows: driver.flows.map(flow => 
        flow.id === flowId 
          ? { 
              ...flow, 
              ...updates,
              lastModified: new Date().toISOString().split('T')[0]
            }
          : flow
      ),
      lastModified: new Date().toISOString().split('T')[0]
    })));
  };

  const getFlowById = (flowId: string): Flow | undefined => {
    for (const driver of contactDrivers) {
      const flow = driver.flows.find(f => f.id === flowId);
      if (flow) return flow;
    }
    return undefined;
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
    isLoading,
    storageStatus,
    addContactDriver,
    updateContactDriver,
    deleteContactDriver,
    deleteSelectedDrivers,
    duplicateContactDriver,
    addFlowToDriver,
    deleteFlow,
    setFlowAsCurrent,
    duplicateFlow,
    saveFlowData,
    updateFlow,
    getFlowById,
    toggleDriverSelection,
    selectAllDrivers,
    clearSelection,
    isAllSelected,
    isPartiallySelected
  };
} 