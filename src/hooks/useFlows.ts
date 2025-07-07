import { useState, useEffect } from 'react';

export interface Flow {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  status: 'Active' | 'Draft';
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  createdAt: string;
}

const STORAGE_KEY = 'cx-flows';

// Initial mock data
const initialFlows: Flow[] = [
  {
    id: '1',
    name: "Customer Support Flow",
    description: "Main customer support contact driver mapping",
    lastModified: new Date().toISOString().split('T')[0],
    status: "Active",
    tier: "Tier 1",
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: "Sales Inquiry Flow",
    description: "Lead generation and sales intent mapping",
    lastModified: new Date().toISOString().split('T')[0],
    status: "Draft",
    tier: "Tier 2",
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: "Product Return Flow",
    description: "Return process and refund request mapping",
    lastModified: new Date().toISOString().split('T')[0],
    status: "Active",
    tier: "Tier 3",
    createdAt: new Date().toISOString()
  }
];

export function useFlows() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);

  // Load flows from localStorage on mount
  useEffect(() => {
    const savedFlows = localStorage.getItem(STORAGE_KEY);
    if (savedFlows) {
      setFlows(JSON.parse(savedFlows));
    } else {
      // If no saved flows, use initial data
      setFlows(initialFlows);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialFlows));
    }
  }, []);

  // Save flows to localStorage whenever flows change
  useEffect(() => {
    if (flows.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
    }
  }, [flows]);

  const addFlow = (flowData: Omit<Flow, 'id' | 'createdAt' | 'lastModified'>) => {
    const newFlow: Flow = {
      id: Date.now().toString(),
      ...flowData,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString().split('T')[0]
    };
    setFlows(prev => [...prev, newFlow]);
    return newFlow;
  };

  const updateFlow = (id: string, updates: Partial<Flow>) => {
    setFlows(prev => prev.map(flow => 
      flow.id === id 
        ? { ...flow, ...updates, lastModified: new Date().toISOString().split('T')[0] }
        : flow
    ));
  };

  const deleteFlow = (id: string) => {
    setFlows(prev => prev.filter(flow => flow.id !== id));
    setSelectedFlows(prev => prev.filter(flowId => flowId !== id));
  };

  const deleteSelectedFlows = () => {
    setFlows(prev => prev.filter(flow => !selectedFlows.includes(flow.id)));
    setSelectedFlows([]);
  };

  const duplicateFlow = (id: string) => {
    const flowToDuplicate = flows.find(flow => flow.id === id);
    if (flowToDuplicate) {
      const duplicatedFlow: Flow = {
        ...flowToDuplicate,
        id: Date.now().toString(),
        name: `${flowToDuplicate.name} (Copy)`,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString().split('T')[0]
      };
      setFlows(prev => [...prev, duplicatedFlow]);
      return duplicatedFlow;
    }
  };

  const toggleFlowSelection = (id: string) => {
    setSelectedFlows(prev => 
      prev.includes(id) 
        ? prev.filter(flowId => flowId !== id)
        : [...prev, id]
    );
  };

  const selectAllFlows = () => {
    setSelectedFlows(flows.map(flow => flow.id));
  };

  const clearSelection = () => {
    setSelectedFlows([]);
  };

  const isAllSelected = selectedFlows.length === flows.length && flows.length > 0;
  const isPartiallySelected = selectedFlows.length > 0 && selectedFlows.length < flows.length;

  return {
    flows,
    selectedFlows,
    addFlow,
    updateFlow,
    deleteFlow,
    deleteSelectedFlows,
    duplicateFlow,
    toggleFlowSelection,
    selectAllFlows,
    clearSelection,
    isAllSelected,
    isPartiallySelected
  };
} 