import { useState, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { storageService } from '@/lib/storage';
import { useClient } from '@/contexts/ClientContext';

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

// Sub-entity interfaces (copying ContactDriver structure)
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

export interface Campaign {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  containmentPercentage: number; // percentage of automated campaign actions
  containmentVolume: number; // actual volume of automated actions
  volumePerMonth: number;
  avgHandleTime: number; // in minutes
  csat: number; // percentage
  qaScore: number; // percentage
  // Campaign volume breakdown
  phoneVolume: number;
  emailVolume: number;
  chatVolume: number;
  otherVolume: number;
  flows: Flow[];
  createdAt: string;
}

export interface Process {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  containmentPercentage: number; // percentage of automated process steps
  containmentVolume: number; // actual volume of automated steps
  volumePerMonth: number;
  avgHandleTime: number; // in minutes
  csat: number; // percentage (internal satisfaction)
  qaScore: number; // percentage
  // Process volume breakdown
  phoneVolume: number;
  emailVolume: number;
  chatVolume: number;
  otherVolume: number;
  flows: Flow[];
  createdAt: string;
}

export interface FlowEntity {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  containmentPercentage: number; // percentage of automated flow steps
  containmentVolume: number; // actual volume of automated steps
  volumePerMonth: number;
  avgHandleTime: number; // in minutes
  csat: number; // percentage
  qaScore: number; // percentage
  // Flow volume breakdown
  phoneVolume: number;
  emailVolume: number;
  chatVolume: number;
  otherVolume: number;
  flows: Flow[]; // Canvas workflows within this flow entity
  createdAt: string;
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
  // Sub-entities based on workstream type
  contactDrivers?: ContactDriver[]; // for inbound
  campaigns?: Campaign[]; // for outbound
  processes?: Process[]; // for background
  flows: FlowEntity[]; // for blank workstreams - Flow entities (like Contact Drivers)
  createdAt: string;
}

// Initial mock data
const initialWorkstreams: Workstream[] = [
  {
    id: '1',
    name: "Customer Support",
    description: "Handle all inbound customer inquiries and support requests",
    type: 'inbound',
    successDefinition: "Customer Issue Resolved = Yes",
    volumePerMonth: 1400,
    successPercentage: 85,
    agentsAssigned: 5,
    hoursPerAgentPerMonth: 160,
    loadedCostPerAgent: 8500,
    automationPercentage: 65,
    lastModified: new Date().toISOString().split('T')[0],
    flows: [], // Legacy flows - will move to sub-entities
    contactDrivers: [
      {
        id: 'cd-1',
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
            id: 'cd-1-f-1',
            name: "Password Reset Flow",
            description: "Current password reset process",
            type: 'current',
            version: "v 3.2",
            lastModified: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'cd-2',
        name: "Billing Inquiries",
        description: "Questions about billing, charges, and payment issues",
        lastModified: new Date().toISOString().split('T')[0],
        containmentPercentage: 65,
        containmentVolume: 520,
        volumePerMonth: 800,
        avgHandleTime: 12.3,
        csat: 88,
        qaScore: 95,
        phoneVolume: 480,
        emailVolume: 240,
        chatVolume: 80,
        otherVolume: 0,
        flows: [
          {
            id: 'cd-2-f-1',
            name: "Billing Inquiry Flow",
            description: "Standard billing question resolution",
            type: 'current',
            version: "v 2.1",
            lastModified: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: "Marketing Campaigns",
    description: "Outbound marketing and customer acquisition campaigns",
    type: 'outbound',
    successDefinition: "Lead Generated = Yes",
    volumePerMonth: 2500,
    successPercentage: 68,
    agentsAssigned: 3,
    hoursPerAgentPerMonth: 140,
    loadedCostPerAgent: 7500,
    automationPercentage: 85,
    lastModified: new Date().toISOString().split('T')[0],
    flows: [], // Legacy flows
    campaigns: [
      {
        id: 'c-1',
        name: "Email Newsletter Campaign",
        description: "Weekly email newsletter to engaged subscribers",
        lastModified: new Date().toISOString().split('T')[0],
        containmentPercentage: 90,
        containmentVolume: 2250,
        volumePerMonth: 2500,
        avgHandleTime: 2.0,
        csat: 75,
        qaScore: 92,
        phoneVolume: 0,
        emailVolume: 2500,
        chatVolume: 0,
        otherVolume: 0,
        flows: [
          {
            id: 'c-1-f-1',
            name: "Newsletter Content Flow",
            description: "Automated newsletter generation and sending",
            type: 'current',
            version: "v 1.5",
            lastModified: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: "Order Processing",
    description: "Back-office order fulfillment and inventory management",
    type: 'background',
    successDefinition: "Order Processed Successfully = Yes",
    volumePerMonth: 1320,
    successPercentage: 92,
    agentsAssigned: 8,
    hoursPerAgentPerMonth: 150,
    loadedCostPerAgent: 7200,
    automationPercentage: 45,
    lastModified: new Date().toISOString().split('T')[0],
    flows: [], // Legacy flows
    processes: [
      {
        id: 'p-1',
        name: "Order Fulfillment Process",
        description: "Standard order processing from payment to shipping",
        lastModified: new Date().toISOString().split('T')[0],
        containmentPercentage: 70,
        containmentVolume: 924,
        volumePerMonth: 1320,
        avgHandleTime: 45.0,
        csat: 85,
        qaScore: 96,
        phoneVolume: 0,
        emailVolume: 400,
        chatVolume: 0,
        otherVolume: 920,
        flows: [
          {
            id: 'p-1-f-1',
            name: "Standard Fulfillment Flow",
            description: "Current order fulfillment process",
            type: 'current',
            version: "v 3.0",
            lastModified: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  }
];

export function useWorkstreams() {
  const { currentClient } = useClient();
  const [workstreams, setWorkstreams] = useState<Workstream[]>([]);
  const [selectedWorkstreams, setSelectedWorkstreams] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<'github' | 'none'>('none');
  const [isManualOperation, setIsManualOperation] = useState(false);

  // Load workstreams from GitHub Gist on mount
  useEffect(() => {
    // Don't load if currentClient is not set yet
    if (!currentClient) {
      return;
    }
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const savedWorkstreams = await storageService.loadWorkstreams(currentClient);
        
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
              // Preserve sub-entities
              contactDrivers: workstream.contactDrivers || [],
              campaigns: workstream.campaigns || [],
              processes: workstream.processes || [],
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
          // If no saved workstreams, just use empty array - don't overwrite existing data
          setWorkstreams([]);
        }
        
        // Update storage status
        const status = storageService.getStorageStatus();
        setStorageStatus(status.type as 'github' | 'none');
        
      } catch (error) {
        console.error('Failed to load workstreams data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
        // Only set initial data as fallback if it's a connection issue
        if (errorMessage.includes('internet connection') || errorMessage.includes('not configured')) {
          setWorkstreams(initialWorkstreams);
        }
        setStorageStatus('none');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentClient]); // Reload when client changes

  // Save workstreams to GitHub Gist whenever they change
  useEffect(() => {
    if (workstreams.length > 0 && !isLoading && !isManualOperation) {
      const saveData = async () => {
        try {
          await storageService.saveWorkstreams(workstreams, currentClient);
          // Update storage status after successful save
          const status = storageService.getStorageStatus();
          setStorageStatus(status.type as 'github' | 'none');
          // Clear any previous errors on successful save
          setError(null);
        } catch (saveError) {
          // Only show error if GitHub is properly configured
          const status = storageService.getStorageStatus();
          if (status.configured) {
            console.error('Failed to save workstreams data:', saveError);
            const errorMessage = saveError instanceof Error ? saveError.message : 'Unknown error occurred';
            setError(errorMessage);
          }
        }
      };
      
      saveData();
    }
  }, [workstreams, isLoading, currentClient, isManualOperation]); // Include currentClient and isManualOperation in deps

  const addWorkstream = async (workstreamData: Omit<Workstream, 'id' | 'createdAt' | 'lastModified' | 'flows'>) => {
    // Set manual operation flag to prevent automatic save
    setIsManualOperation(true);
    
    const newWorkstream: Workstream = {
      id: Date.now().toString(),
      ...workstreamData,
      flows: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    const updatedWorkstreams = [...workstreams, newWorkstream];
    
    // Optimistic update: Update UI immediately
    setWorkstreams(updatedWorkstreams);
    setError(null);
    
    // Save to GitHub in the background
    try {
      await storageService.saveWorkstreams(updatedWorkstreams, currentClient);
      const status = storageService.getStorageStatus();
      setStorageStatus(status.type as 'github' | 'none');
    } catch (saveError) {
      // Only show error if GitHub is properly configured
      const status = storageService.getStorageStatus();
      if (status.configured) {
        console.error('Failed to save new workstream:', saveError);
        const errorMessage = saveError instanceof Error ? saveError.message : 'Unknown error occurred';
        setError(`Failed to save workstream: ${errorMessage}`);
        // Rollback optimistic update
        setWorkstreams(workstreams); // Revert to original state
        throw saveError; // Re-throw to let UI handle the error
      }
    } finally {
      // Reset manual operation flag
      setIsManualOperation(false);
    }
    
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

  // Selection functions
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

  // CRUD operations for ContactDrivers
  const addContactDriverToWorkstream = async (workstreamId: string, driverData: Omit<ContactDriver, 'id' | 'createdAt' | 'lastModified' | 'flows'>) => {
    const newDriver: ContactDriver = {
      id: Date.now().toString(),
      ...driverData,
      flows: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString().split('T')[0]
    };

    const updatedWorkstreams = workstreams.map(workstream => 
      workstream.id === workstreamId 
        ? { 
            ...workstream, 
            contactDrivers: [...(workstream.contactDrivers || []), newDriver],
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    );
    setWorkstreams(updatedWorkstreams);
    
    try {
      await storageService.saveWorkstreams(updatedWorkstreams, currentClient);
    } catch (error) {
      console.error('Failed to save new contact driver:', error);
    }
    
    return newDriver;
  };

  const updateContactDriverInWorkstream = (workstreamId: string, driverId: string, updates: Partial<ContactDriver>) => {
    setWorkstreams(prev => prev.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            contactDrivers: (workstream.contactDrivers || []).map(driver =>
              driver.id === driverId
                ? { ...driver, ...updates, lastModified: new Date().toISOString().split('T')[0] }
                : driver
            ),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    ));
  };

  const deleteContactDriverFromWorkstream = (workstreamId: string, driverId: string) => {
    setWorkstreams(prev => prev.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            contactDrivers: (workstream.contactDrivers || []).filter(driver => driver.id !== driverId),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    ));
  };

  // CRUD operations for Campaigns
  const addCampaignToWorkstream = async (workstreamId: string, campaignData: Omit<Campaign, 'id' | 'createdAt' | 'lastModified' | 'flows'>) => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      ...campaignData,
      flows: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString().split('T')[0]
    };

    const updatedWorkstreams = workstreams.map(workstream => 
      workstream.id === workstreamId 
        ? { 
            ...workstream, 
            campaigns: [...(workstream.campaigns || []), newCampaign],
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    );
    setWorkstreams(updatedWorkstreams);
    
    try {
      await storageService.saveWorkstreams(updatedWorkstreams, currentClient);
    } catch (error) {
      console.error('Failed to save new campaign:', error);
    }
    
    return newCampaign;
  };

  const updateCampaignInWorkstream = (workstreamId: string, campaignId: string, updates: Partial<Campaign>) => {
    setWorkstreams(prev => prev.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            campaigns: (workstream.campaigns || []).map(campaign =>
              campaign.id === campaignId
                ? { ...campaign, ...updates, lastModified: new Date().toISOString().split('T')[0] }
                : campaign
            ),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    ));
  };

  const deleteCampaignFromWorkstream = (workstreamId: string, campaignId: string) => {
    setWorkstreams(prev => prev.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            campaigns: (workstream.campaigns || []).filter(campaign => campaign.id !== campaignId),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    ));
  };

  // CRUD operations for Processes
  const addProcessToWorkstream = async (workstreamId: string, processData: Omit<Process, 'id' | 'createdAt' | 'lastModified' | 'flows'>) => {
    const newProcess: Process = {
      id: Date.now().toString(),
      ...processData,
      flows: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString().split('T')[0]
    };

    const updatedWorkstreams = workstreams.map(workstream => 
      workstream.id === workstreamId 
        ? { 
            ...workstream, 
            processes: [...(workstream.processes || []), newProcess],
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    );
    setWorkstreams(updatedWorkstreams);
    
    try {
      await storageService.saveWorkstreams(updatedWorkstreams, currentClient);
    } catch (error) {
      console.error('Failed to save new process:', error);
    }
    
    return newProcess;
  };

  const updateProcessInWorkstream = (workstreamId: string, processId: string, updates: Partial<Process>) => {
    setWorkstreams(prev => prev.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            processes: (workstream.processes || []).map(process =>
              process.id === processId
                ? { ...process, ...updates, lastModified: new Date().toISOString().split('T')[0] }
                : process
            ),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    ));
  };

  const deleteProcessFromWorkstream = (workstreamId: string, processId: string) => {
    setWorkstreams(prev => prev.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            processes: (workstream.processes || []).filter(process => process.id !== processId),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    ));
  };

  // CRUD operations for FlowEntity (blank workstreams)
  const addFlowEntityToWorkstream = async (workstreamId: string, flowEntityData: Omit<FlowEntity, 'id' | 'createdAt' | 'lastModified' | 'flows'>) => {
    const newFlowEntity: FlowEntity = {
      id: Date.now().toString(),
      ...flowEntityData,
      flows: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString().split('T')[0]
    };

    const updatedWorkstreams = workstreams.map(workstream => 
      workstream.id === workstreamId 
        ? { 
            ...workstream, 
            flows: [...workstream.flows, newFlowEntity],
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    );
    setWorkstreams(updatedWorkstreams);
    
    try {
      await storageService.saveWorkstreams(updatedWorkstreams, currentClient);
    } catch (error) {
      console.error('Failed to save new flow entity:', error);
    }
    
    return newFlowEntity;
  };

  const updateFlowEntityInWorkstream = (workstreamId: string, flowEntityId: string, updates: Partial<FlowEntity>) => {
    setWorkstreams(prev => prev.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            flows: workstream.flows.map(flowEntity =>
              flowEntity.id === flowEntityId
                ? { ...flowEntity, ...updates, lastModified: new Date().toISOString().split('T')[0] }
                : flowEntity
            ),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    ));
  };

  const deleteFlowEntityFromWorkstream = (workstreamId: string, flowEntityId: string) => {
    setWorkstreams(prev => prev.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            flows: workstream.flows.filter(flowEntity => flowEntity.id !== flowEntityId),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    ));
  };

  // Flow operations within sub-entities
  const addFlowToSubEntity = async (workstreamId: string, subEntityId: string, subEntityType: 'contactDrivers' | 'campaigns' | 'processes' | 'flows', flowData: Omit<Flow, 'id' | 'createdAt' | 'lastModified'>) => {
    const newFlow: Flow = {
      id: `${subEntityId}-${Date.now()}`,
      ...flowData,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString().split('T')[0]
    };

    const updatedWorkstreams = workstreams.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            [subEntityType]: (workstream[subEntityType] || []).map((entity: ContactDriver | Campaign | Process | FlowEntity) =>
              entity.id === subEntityId
                ? { 
                    ...entity, 
                    flows: [...entity.flows, newFlow],
                    lastModified: new Date().toISOString().split('T')[0]
                  }
                : entity
            ),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    );

    setWorkstreams(updatedWorkstreams);

    // Save to storage
    try {
      await storageService.saveWorkstreams(updatedWorkstreams, currentClient);
    } catch (error) {
      console.error('Failed to save new flow to sub-entity:', error);
    }

    return newFlow;
  };

  const saveFlowDataForSubEntity = (workstreamId: string, subEntityType: 'contactDrivers' | 'campaigns' | 'processes' | 'flows', flowId: string, nodes: Node[], edges: Edge[]) => {
    setWorkstreams(prev => prev.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            [subEntityType]: (workstream[subEntityType] || []).map((entity: ContactDriver | Campaign | Process | FlowEntity) => ({
              ...entity,
              flows: entity.flows.map((flow: Flow) => 
                flow.id === flowId 
                  ? { 
                      ...flow, 
                      data: { nodes, edges },
                      lastModified: new Date().toISOString().split('T')[0]
                    }
                  : flow
              ),
              lastModified: new Date().toISOString().split('T')[0]
            })),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    ));
  };

  const updateFlowInSubEntity = async (workstreamId: string, subEntityType: 'contactDrivers' | 'campaigns' | 'processes' | 'flows', flowId: string, updates: Partial<Pick<Flow, 'name' | 'description'>>) => {
    const updatedWorkstreams = workstreams.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            [subEntityType]: (workstream[subEntityType] || []).map((entity: ContactDriver | Campaign | Process | FlowEntity) => ({
              ...entity,
              flows: entity.flows.map((flow: Flow) => 
                flow.id === flowId 
                  ? { 
                      ...flow, 
                      ...updates,
                      lastModified: new Date().toISOString().split('T')[0]
                    }
                  : flow
              ),
              lastModified: new Date().toISOString().split('T')[0]
            })),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    );
    
    setWorkstreams(updatedWorkstreams);
    await storageService.saveWorkstreams(updatedWorkstreams, currentClient);
  };

  const deleteFlowFromSubEntity = async (workstreamId: string, subEntityType: 'contactDrivers' | 'campaigns' | 'processes' | 'flows', flowId: string) => {
    const updatedWorkstreams = workstreams.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            [subEntityType]: (workstream[subEntityType] || []).map((entity: ContactDriver | Campaign | Process | FlowEntity) => ({
              ...entity,
              flows: entity.flows.filter((flow: Flow) => flow.id !== flowId),
              lastModified: new Date().toISOString().split('T')[0]
            })),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    );
    
    setWorkstreams(updatedWorkstreams);
    await storageService.saveWorkstreams(updatedWorkstreams, currentClient);
  };

  const setFlowAsCurrentForSubEntity = async (workstreamId: string, subEntityType: 'contactDrivers' | 'campaigns' | 'processes' | 'flows', flowId: string) => {
    const updatedWorkstreams = workstreams.map(workstream => 
      workstream.id === workstreamId
        ? {
            ...workstream,
            [subEntityType]: (workstream[subEntityType] || []).map((entity: ContactDriver | Campaign | Process | FlowEntity) => {
              // Only update flows if this entity contains the target flow
              const hasTargetFlow = entity.flows.some(flow => flow.id === flowId);
              
              if (!hasTargetFlow) {
                // This entity doesn't contain the target flow, leave it unchanged
                return entity;
              }

              // This entity contains the target flow, update its flows
              return {
                ...entity,
                flows: entity.flows.map((flow: Flow) => ({
                  ...flow,
                  type: flow.id === flowId ? 'current' : (flow.type === 'current' ? 'draft' : flow.type),
                  version: flow.id === flowId ? `v ${(Math.random() * 10).toFixed(1)}` : flow.version,
                  lastModified: new Date().toISOString().split('T')[0]
                })),
                lastModified: new Date().toISOString().split('T')[0]
              };
            }),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : workstream
    );
    
    setWorkstreams(updatedWorkstreams);
    await storageService.saveWorkstreams(updatedWorkstreams, currentClient);
  };

  const duplicateFlowInSubEntity = async (workstreamId: string, subEntityType: 'contactDrivers' | 'campaigns' | 'processes' | 'flows', flowId: string): Promise<Flow | null> => {
    let duplicatedFlow: Flow | null = null;
    
    const updatedWorkstreams = workstreams.map(workstream => {
      if (workstream.id === workstreamId) {
        const updatedSubEntities = (workstream[subEntityType] || []).map((entity: ContactDriver | Campaign | Process | FlowEntity) => {
          const flowToDuplicate = entity.flows.find((f: Flow) => f.id === flowId);
          if (flowToDuplicate) {
            duplicatedFlow = {
              ...flowToDuplicate,
              id: `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: `${flowToDuplicate.name} (Copy)`,
              type: 'draft' as const,
              version: 'v 1.0',
              lastModified: new Date().toISOString().split('T')[0]
            };
            return {
              ...entity,
              flows: [...entity.flows, duplicatedFlow],
              lastModified: new Date().toISOString().split('T')[0]
            };
          }
          return entity;
        });
        
        return {
          ...workstream,
          [subEntityType]: updatedSubEntities,
          lastModified: new Date().toISOString().split('T')[0]
        };
      }
      return workstream;
    });
    
    setWorkstreams(updatedWorkstreams);
    await storageService.saveWorkstreams(updatedWorkstreams);
    return duplicatedFlow;
  };

  return {
    workstreams,
    selectedWorkstreams,
    isLoading,
    error,
    storageStatus,
    addWorkstream,
    updateWorkstream,
    deleteWorkstream,
    deleteSelectedWorkstreams,
    duplicateWorkstream,

    toggleWorkstreamSelection,
    selectAllWorkstreams,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
    // Sub-entity CRUD operations
    addContactDriverToWorkstream,
    updateContactDriverInWorkstream,
    deleteContactDriverFromWorkstream,
    addCampaignToWorkstream,
    updateCampaignInWorkstream,
    deleteCampaignFromWorkstream,
    addProcessToWorkstream,
    updateProcessInWorkstream,
    deleteProcessFromWorkstream,
    addFlowEntityToWorkstream,
    updateFlowEntityInWorkstream,
    deleteFlowEntityFromWorkstream,
    addFlowToSubEntity,
    deleteFlowFromSubEntity,
    setFlowAsCurrentForSubEntity,
    duplicateFlowInSubEntity,
    saveFlowDataForSubEntity,
    updateFlowInSubEntity
  };
}