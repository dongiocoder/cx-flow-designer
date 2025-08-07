import { useState, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { storageService } from '@/lib/storage';

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
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

export interface Workstream {
  id: string;
  name: string;
  description: string;
  type: 'inbound' | 'outbound' | 'background' | 'blank';
  successDefinition?: string; // e.g., "Lit Qualified = Yes"
  volumePerMonth: number; // how many times workstream runs per month
  successPercentage: number; // percentage of runs considered successful
  // Economics section
  agentsAssigned?: number; // number of people assigned
  hoursPerAgentPerMonth?: number;
  loadedCostPerAgent?: number;
  automationPercentage?: number;
  lastModified: string;
  flows: Flow[];
  createdAt: string;
}

// Initial mock data
const initialWorkstreams: Workstream[] = [
  {
    id: '1',
    name: "Customer Onboarding",
    description: "Complete customer onboarding process from signup to first use",
    type: 'inbound',
    successDefinition: "Customer Activated = Yes",
    volumePerMonth: 1400,
    successPercentage: 85,
    agentsAssigned: 5,
    hoursPerAgentPerMonth: 160,
    loadedCostPerAgent: 8500,
    automationPercentage: 65,
    lastModified: new Date().toISOString().split('T')[0],
    flows: [
      {
        id: '1-1',
        name: "Standard Onboarding Flow",
        description: "Current standard onboarding process",
        type: 'current',
        version: "v 2.1",
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: '1-2',
        name: "Express Onboarding",
        description: "Streamlined onboarding for enterprise customers",
        type: 'draft',
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: "Order Fulfillment",
    description: "End-to-end order processing and fulfillment workflow",
    type: 'background',
    successDefinition: "Order Delivered = Yes",
    volumePerMonth: 1320,
    successPercentage: 92,
    agentsAssigned: 8,
    hoursPerAgentPerMonth: 150,
    loadedCostPerAgent: 7200,
    automationPercentage: 45,
    lastModified: new Date().toISOString().split('T')[0],
    flows: [
      {
        id: '2-1',
        name: "Standard Fulfillment",
        description: "Current order fulfillment process",
        type: 'current',
        version: "v 3.0",
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: '2-2',
        name: "Priority Fulfillment",
        description: "Express fulfillment for premium customers",
        type: 'draft',
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  }
];

export function useWorkstreams() {
  const [workstreams, setWorkstreams] = useState<Workstream[]>([]);
  const [selectedWorkstreams, setSelectedWorkstreams] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageStatus, setStorageStatus] = useState<'github' | 'localStorage' | 'none'>('none');

  // Load workstreams from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const savedWorkstreams = await storageService.loadWorkstreams();
        
        if (savedWorkstreams && savedWorkstreams.length > 0) {
          // Migrate existing data to include new fields if needed
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const migratedWorkstreams = savedWorkstreams.map((workstream: any) => {
            const volume = workstream.volumePerMonth || 0;
            return {
              id: workstream.id,
              name: workstream.name,
              description: workstream.description,
              type: workstream.type || 'blank',
              successDefinition: workstream.successDefinition,
              volumePerMonth: volume,
              successPercentage: workstream.successPercentage || (workstream.containmentPercentage || 60),
              agentsAssigned: workstream.agentsAssigned,
              hoursPerAgentPerMonth: workstream.hoursPerAgentPerMonth,
              loadedCostPerAgent: workstream.loadedCostPerAgent,
              automationPercentage: workstream.automationPercentage,
              lastModified: workstream.lastModified,
              createdAt: workstream.createdAt,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              flows: workstream.flows ? workstream.flows.map((flow: any) => ({
                ...flow,
                type: flow.type === 'future' ? 'draft' : flow.type,
                version: flow.version || (flow.type === 'current' ? 'v 1.0' : undefined)
              })) : []
            };
          });
          setWorkstreams(migratedWorkstreams);
        } else {
          // If no saved workstreams, use initial data
          setWorkstreams(initialWorkstreams);
          // Save initial data to storage
          await storageService.saveWorkstreams(initialWorkstreams);
        }
        
        // Update storage status
        const status = storageService.getStorageStatus();
        setStorageStatus(status.type);
      } catch (error) {
        console.error('Failed to load workstreams data:', error);
        // Fallback to initial data
        setWorkstreams(initialWorkstreams);
        setStorageStatus('localStorage');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save workstreams to storage whenever they change
  useEffect(() => {
    if (workstreams.length > 0 && !isLoading) {
      const saveData = async () => {
        try {
          await storageService.saveWorkstreams(workstreams);
          // Update storage status after successful save
          const status = storageService.getStorageStatus();
          setStorageStatus(status.type);
        } catch (error) {
          console.error('Failed to save workstreams data:', error);
        }
      };
      
      saveData();
    }
  }, [workstreams, isLoading]);

  const addWorkstream = (workstreamData: Omit<Workstream, 'id' | 'createdAt' | 'lastModified' | 'flows'>) => {
    const newWorkstream: Workstream = {
      id: Date.now().toString(),
      ...workstreamData,
      flows: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString().split('T')[0]
    };
    setWorkstreams(prev => [...prev, newWorkstream]);
    return newWorkstream;
  };

  const updateWorkstream = (id: string, updates: Partial<Workstream>) => {
    setWorkstreams(prev => prev.map(workstream => 
      workstream.id === id 
        ? { ...workstream, ...updates, lastModified: new Date().toISOString().split('T')[0] }
        : workstream
    ));
  };

  const deleteWorkstream = (id: string) => {
    setWorkstreams(prev => prev.filter(workstream => workstream.id !== id));
    setSelectedWorkstreams(prev => prev.filter(workstreamId => workstreamId !== id));
  };

  const deleteSelectedWorkstreams = () => {
    setWorkstreams(prev => prev.filter(workstream => !selectedWorkstreams.includes(workstream.id)));
    setSelectedWorkstreams([]);
  };

  const duplicateWorkstream = (id: string) => {
    const workstreamToDuplicate = workstreams.find(workstream => workstream.id === id);
    if (workstreamToDuplicate) {
      const duplicatedWorkstream: Workstream = {
        ...workstreamToDuplicate,
        id: Date.now().toString(),
        name: `${workstreamToDuplicate.name} (Copy)`,
        flows: workstreamToDuplicate.flows.map(flow => ({
          ...flow,
          id: `${Date.now()}-${Math.random()}`,
        })),
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString().split('T')[0]
      };
      setWorkstreams(prev => [...prev, duplicatedWorkstream]);
      return duplicatedWorkstream;
    }
  };

  const addFlowToWorkstream = (workstreamId: string, flowData: Omit<Flow, 'id' | 'createdAt' | 'lastModified'>) => {
    const newFlow: Flow = {
      id: `${workstreamId}-${Date.now()}`,
      ...flowData,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString().split('T')[0]
    };

    setWorkstreams(prev => prev.map(workstream => 
      workstream.id === workstreamId 
        ? { 
            ...workstream, 
            flows: [...workstream.flows, newFlow],
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    ));

    return newFlow;
  };

  const deleteFlow = (flowId: string) => {
    setWorkstreams(prev => prev.map(workstream => ({
      ...workstream,
      flows: workstream.flows.filter(flow => flow.id !== flowId),
      lastModified: new Date().toISOString().split('T')[0]
    })));
  };

  const setFlowAsCurrent = (flowId: string) => {
    setWorkstreams(prev => prev.map(workstream => {
      // Only update flows if this workstream contains the target flow
      const hasTargetFlow = workstream.flows.some(flow => flow.id === flowId);
      
      if (!hasTargetFlow) {
        // This workstream doesn't contain the target flow, leave it unchanged
        return workstream;
      }

      // This workstream contains the target flow, update its flows
      return {
        ...workstream,
        flows: workstream.flows.map(flow => ({
          ...flow,
          type: flow.id === flowId ? 'current' : (flow.type === 'current' ? 'draft' : flow.type),
          version: flow.id === flowId ? `v ${(Math.random() * 10).toFixed(1)}` : flow.version
        })),
        lastModified: new Date().toISOString().split('T')[0]
      };
    }));
  };

  const duplicateFlow = (flowId: string) => {
    setWorkstreams(prev => prev.map(workstream => {
      const flowToDuplicate = workstream.flows.find(flow => flow.id === flowId);
      if (flowToDuplicate) {
        const duplicatedFlow: Flow = {
          ...flowToDuplicate,
          id: `${workstream.id}-${Date.now()}`,
          name: `${flowToDuplicate.name} (Copy)`,
          type: 'draft',
          version: undefined,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString().split('T')[0]
        };
        return {
          ...workstream,
          flows: [...workstream.flows, duplicatedFlow],
          lastModified: new Date().toISOString().split('T')[0]
        };
      }
      return workstream;
    }));
  };

  const saveFlowData = (flowId: string, nodes: Node[], edges: Edge[]) => {
    setWorkstreams(prev => prev.map(workstream => ({
      ...workstream,
      flows: workstream.flows.map(flow => 
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
    setWorkstreams(prev => prev.map(workstream => ({
      ...workstream,
      flows: workstream.flows.map(flow => 
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
    for (const workstream of workstreams) {
      const flow = workstream.flows.find(f => f.id === flowId);
      if (flow) return flow;
    }
    return undefined;
  };

  const toggleWorkstreamSelection = (id: string) => {
    setSelectedWorkstreams(prev => 
      prev.includes(id) 
        ? prev.filter(workstreamId => workstreamId !== id)
        : [...prev, id]
    );
  };

  const selectAllWorkstreams = () => {
    setSelectedWorkstreams(workstreams.map(workstream => workstream.id));
  };

  const clearSelection = () => {
    setSelectedWorkstreams([]);
  };

  const isAllSelected = selectedWorkstreams.length === workstreams.length && workstreams.length > 0;
  const isPartiallySelected = selectedWorkstreams.length > 0 && selectedWorkstreams.length < workstreams.length;

  return {
    workstreams,
    selectedWorkstreams,
    isLoading,
    storageStatus,
    addWorkstream,
    updateWorkstream,
    deleteWorkstream,
    deleteSelectedWorkstreams,
    duplicateWorkstream,
    addFlowToWorkstream,
    deleteFlow,
    setFlowAsCurrent,
    duplicateFlow,
    saveFlowData,
    updateFlow,
    getFlowById,
    toggleWorkstreamSelection,
    selectAllWorkstreams,
    clearSelection,
    isAllSelected,
    isPartiallySelected
  };
}