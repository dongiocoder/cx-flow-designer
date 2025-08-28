"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Copy, Edit } from "lucide-react";

import { useWorkstreams, type Workstream, type ContactDriver, type Campaign, type Process, type FlowEntity } from "@/hooks/useWorkstreams";
import { NewWorkstreamDialog } from "@/components/NewWorkstreamDialog";

import { WorkstreamDetailPage } from "@/components/WorkstreamDetailPage";
import { FlowEditor } from "@/components/FlowEditor";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { KnowledgeBaseEditor } from "@/components/KnowledgeBaseEditor";
import { Home as Dashboard } from "@/components/Home";
import { PerformanceCalculator } from "@/components/PerformanceCalculator";
import { useKnowledgeBaseAssets, type KnowledgeBaseAsset } from "@/hooks/useKnowledgeBaseAssets";
import { useState, useEffect } from "react";
import type { Node, Edge } from '@xyflow/react';
import { useClient } from "@/contexts/ClientContext";

type PageMode = 'table' | 'flow-editor' | 'knowledge-editor';
type PageSection = 'workstreams' | 'workstream-detail' | 'knowledge-bases' | 'dashboard' | 'analytics' | 'calculator' | 'users' | 'channels' | 'integrations' | 'actions' | 'settings';
type SubEntityType = 'contact-drivers' | 'campaigns' | 'processes' | 'flows';

export default function Home() {
  const { currentClient, availableClients, switchClient, createClient } = useClient();

  const {
    workstreams,
    selectedWorkstreams,
    isLoading: workstreamsLoading,
    error: workstreamsError,
    storageStatus: workstreamStorageStatus,
    addWorkstream,
    updateWorkstream,
    deleteWorkstream,
    deleteSelectedWorkstreams,
    duplicateWorkstream,
    toggleWorkstreamSelection,
    selectAllWorkstreams,
    clearSelection: clearWorkstreamSelection,
    isAllSelected: isAllWorkstreamsSelected,
    isPartiallySelected: isWorkstreamsPartiallySelected,
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
  } = useWorkstreams();

  const {
    getAssetById,
    updateKnowledgeBaseAsset,
    isLoading: kbLoading,
    error: kbError,
    storageStatus: kbStorageStatus
  } = useKnowledgeBaseAssets();

  const [pageMode, setPageMode] = useState<PageMode>('table');
  const [currentSection, setCurrentSection] = useState<PageSection>('workstreams');

  const [selectedWorkstreamId, setSelectedWorkstreamId] = useState<string | null>(null);

  const [_isWorkstreamDrawerOpen, _setIsWorkstreamDrawerOpen] = useState(false);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);

  const [editingWorkstreamId, setEditingWorkstreamId] = useState<string | null>(null);
  const [currentAssetId, setCurrentAssetId] = useState<string | null>(null);
  const [currentAssetData, setCurrentAssetData] = useState<KnowledgeBaseAsset | null>(null);
  
  // New state for workstream navigation
  const [currentWorkstreamId, setCurrentWorkstreamId] = useState<string | null>(null);
  const [currentSubEntityType, setCurrentSubEntityType] = useState<SubEntityType | null>(null);

  // Client switching is now handled by ClientContext


  // Initialize and persist current section from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedSection = localStorage.getItem('cx-current-section') as PageSection;
    const storedWorkstreamId = localStorage.getItem('cx-current-workstream-id');
    const storedSubEntityType = localStorage.getItem('cx-current-sub-entity-type') as SubEntityType;
    
    if (storedSection && ['workstreams', 'workstream-detail', 'knowledge-bases', 'dashboard', 'analytics', 'calculator', 'users', 'channels', 'integrations', 'actions', 'settings'].includes(storedSection)) {
      setCurrentSection(storedSection);
      
      // Restore workstream detail state if needed
      if (storedSection === 'workstream-detail' && storedWorkstreamId && storedSubEntityType) {
        setCurrentWorkstreamId(storedWorkstreamId);
        setCurrentSubEntityType(storedSubEntityType);
      }
    }
  }, []);

  // Save current section to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cx-current-section', currentSection);
    }
  }, [currentSection]);

  // Initialize page mode and related state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedPageMode = localStorage.getItem('cx-page-mode') as PageMode;
    const storedCurrentFlowId = localStorage.getItem('cx-current-flow-id');
    const storedCurrentAssetId = localStorage.getItem('cx-current-asset-id');
    const storedSelectedWorkstreamId = localStorage.getItem('cx-selected-workstream-id');
    const storedIsWorkstreamDrawerOpen = localStorage.getItem('cx-is-workstream-drawer-open') === 'true';
    
    if (storedPageMode && ['table', 'flow-editor', 'knowledge-editor'].includes(storedPageMode)) {
      setPageMode(storedPageMode);
      
      // Restore associated state based on page mode
      if (storedPageMode === 'flow-editor' && storedCurrentFlowId) {
        setCurrentFlowId(storedCurrentFlowId);
      }
      if (storedPageMode === 'knowledge-editor' && storedCurrentAssetId) {
        setCurrentAssetId(storedCurrentAssetId);
      }
    }
    

    if (storedSelectedWorkstreamId) {
      setSelectedWorkstreamId(storedSelectedWorkstreamId);
      _setIsWorkstreamDrawerOpen(storedIsWorkstreamDrawerOpen);
    }
  }, []);

  // Save page mode and related state to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cx-page-mode', pageMode);
    }
  }, [pageMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentFlowId) {
        localStorage.setItem('cx-current-flow-id', currentFlowId);
      } else {
        localStorage.removeItem('cx-current-flow-id');
      }
    }
  }, [currentFlowId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentAssetId) {
        localStorage.setItem('cx-current-asset-id', currentAssetId);
      } else {
        localStorage.removeItem('cx-current-asset-id');
      }
    }
  }, [currentAssetId]);



  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedWorkstreamId) {
        localStorage.setItem('cx-selected-workstream-id', selectedWorkstreamId);
      } else {
        localStorage.removeItem('cx-selected-workstream-id');
      }
    }
  }, [selectedWorkstreamId]);



  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cx-is-workstream-drawer-open', _isWorkstreamDrawerOpen.toString());
    }
  }, [_isWorkstreamDrawerOpen]);

  // Save workstream navigation state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentWorkstreamId) {
        localStorage.setItem('cx-current-workstream-id', currentWorkstreamId);
      } else {
        localStorage.removeItem('cx-current-workstream-id');
      }
    }
  }, [currentWorkstreamId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentSubEntityType) {
        localStorage.setItem('cx-current-sub-entity-type', currentSubEntityType);
      } else {
        localStorage.removeItem('cx-current-sub-entity-type');
      }
    }
  }, [currentSubEntityType]);



  const editingWorkstream = editingWorkstreamId ? workstreams.find(w => w.id === editingWorkstreamId) || null : null;
  
  // Generic flow finding that works across workstreams and sub-entities
  const findFlowById = (flowId: string) => {
    // Try sub-entities within workstreams
    for (const workstream of workstreams) {
      // Check contact drivers
      if (workstream.contactDrivers) {
        for (const driver of workstream.contactDrivers) {
          const flow = driver.flows.find(f => f.id === flowId);
          if (flow) return flow;
        }
      }
      
      // Check campaigns
      if (workstream.campaigns) {
        for (const campaign of workstream.campaigns) {
          const flow = campaign.flows.find(f => f.id === flowId);
          if (flow) return flow;
        }
      }
      
      // Check processes
      if (workstream.processes) {
        for (const process of workstream.processes) {
          const flow = process.flows.find(f => f.id === flowId);
          if (flow) return flow;
        }
      }
      
      // Check flow entities (for blank workstreams)
      if (workstream.flows) {
        for (const flowEntity of workstream.flows) {
          if (flowEntity.flows && Array.isArray(flowEntity.flows)) {
            const flow = flowEntity.flows.find(f => f.id === flowId);
            if (flow) return flow;
          }
        }
      }
    }
    
    return null;
  };

  const currentFlow = currentFlowId ? findFlowById(currentFlowId) : null;
  
  // Check for flows within sub-entities
  const currentFlowSubEntity = currentFlow ? (() => {
    for (const workstream of workstreams) {
      // Check contact drivers
      if (workstream.contactDrivers) {
        for (const driver of workstream.contactDrivers) {
          if (driver.flows.some(f => f.id === currentFlowId)) {
            return { type: 'contactDriver', entity: driver, workstream };
          }
        }
      }
      
      // Check campaigns
      if (workstream.campaigns) {
        for (const campaign of workstream.campaigns) {
          if (campaign.flows.some(f => f.id === currentFlowId)) {
            return { type: 'campaign', entity: campaign, workstream };
          }
        }
      }
      
      // Check processes
      if (workstream.processes) {
        for (const process of workstream.processes) {
          if (process.flows.some(f => f.id === currentFlowId)) {
            return { type: 'process', entity: process, workstream };
          }
        }
      }
      
      // Check flow entities (for blank workstreams)
      if (workstream.flows) {
        for (const flowEntity of workstream.flows) {
          if (flowEntity.flows && Array.isArray(flowEntity.flows) && flowEntity.flows.some(f => f.id === currentFlowId)) {
            return { type: 'flowEntity', entity: flowEntity, workstream };
          }
        }
      }
    }
    return null;
  })() : null;
  
  const currentAsset = currentAssetData || (currentAssetId ? getAssetById(currentAssetId) : null);

  // Listen for navigation changes from MainNavigation component
  useEffect(() => {
    const handleNavigationChange = (event: CustomEvent) => {
      const section = event.detail;
      setCurrentSection(section as PageSection);
      setPageMode('table');
      _setIsWorkstreamDrawerOpen(false);
      setSelectedWorkstreamId(null);
      setCurrentFlowId(null);
    };

    window.addEventListener('navigation-change', handleNavigationChange as EventListener);
    return () => {
      window.removeEventListener('navigation-change', handleNavigationChange as EventListener);
    };
  }, []);



  // Flow management handlers for sub-entities
  const handleNewFlowForSubEntity = async (subEntityId: string) => {
    if (!currentWorkstreamId || !currentSubEntityType) return;
    
    const subEntityTypeMapping = {
      'contact-drivers': 'contactDrivers',
      'campaigns': 'campaigns', 
      'processes': 'processes',
      'flows': 'flows'
    } as const;
    
    const newFlow = await addFlowToSubEntity(
      currentWorkstreamId,
      subEntityId,
      subEntityTypeMapping[currentSubEntityType],
      {
        name: 'New Flow',
        description: 'Flow description', 
        type: 'draft'
      }
    );
    
    if (newFlow) {
      setCurrentFlowId(newFlow.id);
      setPageMode('flow-editor');
    }
  };

  const handleOpenFlow = (flowId: string) => {
    setCurrentFlowId(flowId);
    setPageMode('flow-editor');
  };

  const handleDuplicateFlowForSubEntity = async (flowId: string) => {
    if (!currentWorkstreamId || !currentSubEntityType) return;
    
    const subEntityTypeMapping = {
      'contact-drivers': 'contactDrivers',
      'campaigns': 'campaigns', 
      'processes': 'processes',
      'flows': 'flows'
    } as const;
    
    await duplicateFlowInSubEntity(
      currentWorkstreamId,
      subEntityTypeMapping[currentSubEntityType],
      flowId
    );
  };

  const handleDeleteFlowForSubEntity = async (flowId: string) => {
    if (!currentWorkstreamId || !currentSubEntityType) return;
    
    const subEntityTypeMapping = {
      'contact-drivers': 'contactDrivers',
      'campaigns': 'campaigns', 
      'processes': 'processes',
      'flows': 'flows'
    } as const;
    
    await deleteFlowFromSubEntity(
      currentWorkstreamId,
      subEntityTypeMapping[currentSubEntityType],
      flowId
    );
  };

  const handleSetFlowAsCurrentForSubEntity = async (flowId: string) => {
    if (!currentWorkstreamId || !currentSubEntityType) return;
    
    const subEntityTypeMapping = {
      'contact-drivers': 'contactDrivers',
      'campaigns': 'campaigns', 
      'processes': 'processes',
      'flows': 'flows'
    } as const;
    
    await setFlowAsCurrentForSubEntity(
      currentWorkstreamId,
      subEntityTypeMapping[currentSubEntityType],
      flowId
    );
  };

  // Sub-entity flow save handler
  const handleSaveSubEntityFlow = (flowId: string, nodes: Node[], edges: Edge[]) => {
    if (!currentFlowSubEntity) return;
    
    const { workstream } = currentFlowSubEntity;
    const { type } = currentFlowSubEntity;
    
    // Update the flow within the sub-entity
    const subEntityType = type === 'contactDriver' ? 'contactDrivers' :
                         type === 'campaign' ? 'campaigns' : 
                         type === 'process' ? 'processes' : 
                         type === 'flowEntity' ? 'flows' : 'flows';
    
    saveFlowDataForSubEntity(workstream.id, subEntityType, flowId, nodes, edges);
  };

  // Sub-entity flow metadata update handler
  const handleUpdateSubEntityFlow = async (flowId: string, updates: Partial<{ name: string; description: string }>) => {
    if (!currentFlowSubEntity) return;
    
    const { workstream } = currentFlowSubEntity;
    const { type } = currentFlowSubEntity;
    
    // Update the flow metadata within the sub-entity
    const subEntityType = type === 'contactDriver' ? 'contactDrivers' :
                         type === 'campaign' ? 'campaigns' : 
                         type === 'process' ? 'processes' : 
                         type === 'flowEntity' ? 'flows' : 'flows';
    
    await updateFlowInSubEntity(workstream.id, subEntityType, flowId, updates);
  };

  // Workstream handlers
  const handleCreateWorkstream = async (workstreamData: Omit<Workstream, 'id' | 'flows' | 'createdAt' | 'lastModified'>) => {
    await addWorkstream(workstreamData);
  };

  const handleUpdateWorkstream = (id: string, workstreamData: Omit<Workstream, 'id' | 'flows' | 'createdAt' | 'lastModified'>) => {
    updateWorkstream(id, workstreamData);
    setEditingWorkstreamId(null);
  };

  const handleCancelWorkstreamEdit = () => {
    setEditingWorkstreamId(null);
  };

  const handleDeleteWorkstream = (id: string) => {
    deleteWorkstream(id);
  };

  const handleDuplicateWorkstream = (id: string) => {
    duplicateWorkstream(id);
  };

  const handleEditWorkstream = (id: string) => {
    setEditingWorkstreamId(id);
  };

  const handleBulkDeleteWorkstreams = () => {
    if (selectedWorkstreams.length > 0) {
      deleteSelectedWorkstreams();
    }
  };

  const handleMasterWorkstreamCheckboxChange = () => {
    if (isAllWorkstreamsSelected) {
      clearWorkstreamSelection();
    } else {
      selectAllWorkstreams();
    }
  };


  const handleNavigationChange = (section: string) => {
    setCurrentSection(section as PageSection);
    setPageMode('table');
    _setIsWorkstreamDrawerOpen(false);
    setSelectedWorkstreamId(null);
    setCurrentFlowId(null);
    setCurrentAssetId(null);
    setCurrentAssetData(null);
  };

  const handleCreateKnowledgeBaseAsset = (asset: KnowledgeBaseAsset) => {
    setCurrentAssetId(asset.id);
    setCurrentAssetData(asset);
    setPageMode('knowledge-editor');
  };

  const handleEditKnowledgeBaseAsset = (assetId: string) => {
    setCurrentAssetId(assetId);
    setCurrentAssetData(null); // Clear direct data, will use lookup for existing assets
    setPageMode('knowledge-editor');
  };

  const handleKnowledgeBaseEditorBack = () => {
    setPageMode('table');
    setCurrentAssetId(null);
    setCurrentAssetData(null);
  };

  const handleSaveKnowledgeBaseAsset = (assetId: string, updates: Partial<KnowledgeBaseAsset>) => {
    updateKnowledgeBaseAsset(assetId, updates);
  };




  const handleWorkstreamRowClick = (workstreamId: string) => {
    // Disable navigation if any checkboxes are selected
    if (selectedWorkstreams.length > 0) {
      return;
    }
    
    const workstream = workstreams.find(w => w.id === workstreamId);
    if (!workstream) return;
    
    // Determine sub-entity type based on workstream type
    let subEntityType: SubEntityType;
    switch (workstream.type) {
      case 'inbound':
        subEntityType = 'contact-drivers';
        break;
      case 'outbound':
        subEntityType = 'campaigns';
        break;
      case 'background':
        subEntityType = 'processes';
        break;
      case 'blank':
        subEntityType = 'flows';
        break;
      default:
        subEntityType = 'flows';
    }
    
    // Navigate to workstream detail page
    setCurrentWorkstreamId(workstreamId);
    setCurrentSubEntityType(subEntityType);
    setCurrentSection('workstream-detail');
    setPageMode('table');
  };





  const handleFlowEditorBack = () => {
    setPageMode('table');
    setCurrentFlowId(null);
    // Restore the previous state: re-open drawer if there was a selected workstream
    if (selectedWorkstreamId) {
      _setIsWorkstreamDrawerOpen(true);
    }
  };





  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Main Content Area - Swaps between sections and modes */}
      <main className={`flex-1 transition-opacity duration-300 overflow-auto ${
        _isWorkstreamDrawerOpen && pageMode === 'table' ? 'opacity-85' : 'opacity-100'
      }`}>
        {/* Rate Limit Warning */}
        {((workstreamsError && workstreamsError.includes('rate limit')) || (kbError && kbError.includes('rate limit'))) && (
          <div className="mx-6 mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full" />
              <span className="font-medium text-orange-800">GitHub Rate Limited</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              {workstreamsError || kbError}
            </p>
            <p className="text-xs text-orange-600 mt-2">
              Changes are saved locally and will sync automatically when the rate limit resets.
            </p>
          </div>
        )}

        {/* Other GitHub Errors */}
        {(workstreamsError || kbError) && 
         workstreamStorageStatus !== 'none' && 
         !((workstreamsError && workstreamsError.includes('rate limit')) || (kbError && kbError.includes('rate limit'))) && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full" />
              <span className="font-medium text-red-800">GitHub Sync Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {workstreamsError || kbError}
            </p>
            <p className="text-xs text-red-600 mt-2">
              Please check your internet connection and GitHub token permissions.
            </p>
          </div>
        )}

        {/* Configuration Help - Only show when not configured */}
        {workstreamStorageStatus === 'none' && (
          <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full" />
              <span className="font-medium text-blue-800">Local Mode</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Data is saved locally only. Configure GitHub Repository for cloud sync.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Set NEXT_PUBLIC_GITHUB_TOKEN and NEXT_PUBLIC_GITHUB_REPO in your .env.local file.
            </p>
          </div>
        )}

        {/* Loading State */}
        {(workstreamsLoading || kbLoading) && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading data from GitHub Repository...</p>
            </div>
          </div>
        )}

        {pageMode === 'table' && !workstreamsLoading && !kbLoading ? (
          // Table Mode - Different sections
          currentSection === 'dashboard' ? (
            <Dashboard onNavigate={handleNavigationChange} />
          ) : currentSection === 'knowledge-bases' ? (
            <KnowledgeBase 
              onCreateAsset={handleCreateKnowledgeBaseAsset}
              onEditAsset={handleEditKnowledgeBaseAsset}
            />
          ) : currentSection === 'calculator' ? (
            <PerformanceCalculator />
          ) : currentSection === 'workstreams' ? (
            // Workstreams Table Mode
            <div className="p-6 flex-1">
            <div className="space-y-6">
              {/* Bulk Action Bar - Only show when workstreams are selected */}
              {selectedWorkstreams.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-blue-900">
                      {selectedWorkstreams.length} workstream{selectedWorkstreams.length === 1 ? '' : 's'} selected
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearWorkstreamSelection}
                    >
                      Clear Selection
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleBulkDeleteWorkstreams}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              )}

              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Workstreams</h2>
                  <p className="text-muted-foreground mt-1">
                    Manage workstreams and their associated flows
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <NewWorkstreamDialog 
                    onCreateWorkstream={handleCreateWorkstream}
                    onUpdateWorkstream={handleUpdateWorkstream}
                    editingWorkstream={editingWorkstream}
                    onCancelEdit={handleCancelWorkstreamEdit}
                  />
                </div>
              </div>

              {/* Workstreams Table */}
              <Card className="shadow-md">
                <CardContent>
                  <div>
                    {/* Table Header */}
                    <div className="grid gap-4 text-sm font-medium text-muted-foreground border-b pb-3 mb-0" style={{gridTemplateColumns: '4fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr 0.5fr'}}>
                      <div>
                        <div className="flex items-center space-x-3">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300" 
                            checked={isAllWorkstreamsSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = isWorkstreamsPartiallySelected;
                            }}
                            onChange={handleMasterWorkstreamCheckboxChange}
                          />
                          <span>Name</span>
                        </div>
                      </div>
                      <div className="text-center">Type</div>
                      <div className="text-center">Runs / mo</div>
                      <div className="text-center">Success %</div>
                      <div className="text-center">Cost / Run</div>
                      <div className="text-center">Automation %</div>
                      <div className="text-center">Monthly Spend</div>
                      <div className="text-center">Last modified</div>
                      <div className="text-center"></div>
                    </div>

                    {/* Table Rows */}
                    {workstreams.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No workstreams yet. Create your first workstream to get started!
                      </div>
                    ) : (
                      workstreams.map((workstream) => {
                        const isRowSelected = selectedWorkstreams.includes(workstream.id);
                        
                        // Calculate derived values - CORRECTED FORMULAS
                        const monthlyCost = (workstream.agentsAssigned || 0) * (workstream.loadedCostPerAgent || 0);
                        const costPerRun = workstream.volumePerMonth > 0 ? monthlyCost / workstream.volumePerMonth : 0;
                        
                        // Format volume display
                        const formatVolume = (volume: number) => {
                          if (volume >= 1000) {
                            return `${(volume / 1000).toFixed(volume >= 10000 ? 0 : 1)}k`;
                          }
                          return volume.toString();
                        };
                        
                        // Format currency display
                        const formatCurrency = (amount: number, compact = false) => {
                          if (compact && amount >= 1000) {
                            return `$${(amount / 1000).toFixed(1)}k`;
                          }
                          return `$${amount.toFixed(2)}`;
                        };
                        
                        // Create automation percentage visual
                        const automationBoxes = () => {
                          const percentage = workstream.automationPercentage || 0;
                          const filledBoxes = Math.round(percentage / 20); // 5 boxes, each represents 20%
                          return (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm mr-2">{percentage}%</span>
                              {Array.from({ length: 5 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-3 h-3 border ${
                                    i < filledBoxes 
                                      ? 'bg-green-500 border-green-500' 
                                      : 'bg-gray-200 border-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          );
                        };
                        
                        return (
                          <div 
                            key={workstream.id} 
                            className={`grid gap-4 items-center py-4 border-b border-t-0 transition-all duration-200 ${
                              selectedWorkstreams.length === 0 
                                ? 'hover:bg-muted/50 hover:shadow-sm cursor-pointer' 
                                : isRowSelected 
                                  ? 'bg-blue-50/80 shadow-sm' 
                                  : 'hover:bg-muted/30'
                            }`}
                            style={{gridTemplateColumns: '4fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr 0.5fr'}}
                            onClick={() => handleWorkstreamRowClick(workstream.id)}
                          >
                            {/* Name */}
                            <div>
                              <div className="flex items-center space-x-3">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-gray-300 flex-shrink-0" 
                                  checked={selectedWorkstreams.includes(workstream.id)}
                                  onChange={() => toggleWorkstreamSelection(workstream.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate text-blue-600 hover:text-blue-800">
                                    {workstream.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {workstream.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Type */}
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                workstream.type === 'inbound' ? 'bg-blue-100 text-blue-800' :
                                workstream.type === 'outbound' ? 'bg-green-100 text-green-800' :
                                workstream.type === 'background' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {workstream.type === 'background' ? 'Back-Office' : 
                                 workstream.type.charAt(0).toUpperCase() + workstream.type.slice(1)}
                              </span>
                            </div>
                            
                            {/* Runs / mo */}
                            <div className="text-center">
                              <div className="text-sm font-medium">
                                {formatVolume(workstream.volumePerMonth)}
                              </div>
                            </div>
                            
                            {/* Success % */}
                            <div className="text-center">
                              <div className={`text-sm font-medium ${
                                workstream.successPercentage >= 80 ? 'text-green-600' :
                                workstream.successPercentage >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {workstream.successPercentage}%
                              </div>
                            </div>
                            
                            {/* Cost / Run */}
                            <div className="text-center">
                              <div className="text-sm font-medium">
                                {formatCurrency(costPerRun)}
                              </div>
                            </div>
                            
                            {/* Automation % */}
                            <div className="flex justify-center">
                              {automationBoxes()}
                            </div>
                            
                            {/* Monthly Spend */}
                            <div className="text-center">
                              <div className="text-sm font-medium">
                                {formatCurrency(monthlyCost, true)}
                              </div>
                            </div>
                            
                            {/* Last modified */}
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">
                                {new Date(workstream.lastModified).toLocaleDateString('en-US', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                            <div className="flex justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditWorkstream(workstream.id);
                                  }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateWorkstream(workstream.id);
                                  }}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteWorkstream(workstream.id);
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          ) : currentSection === 'workstream-detail' ? (
            // Workstream Detail Page
            currentWorkstreamId && currentSubEntityType ? (
              <WorkstreamDetailPage
                workstreamId={currentWorkstreamId}
                subEntityType={currentSubEntityType}
                workstreams={workstreams}
                onBack={() => {
                  setCurrentSection('workstreams');
                  setCurrentWorkstreamId(null);
                  setCurrentSubEntityType(null);
                }}
                onCreateContactDriver={addContactDriverToWorkstream}
                onUpdateContactDriver={updateContactDriverInWorkstream}
                onDeleteContactDriver={deleteContactDriverFromWorkstream}
                onCreateCampaign={addCampaignToWorkstream}
                onUpdateCampaign={updateCampaignInWorkstream}
                onDeleteCampaign={deleteCampaignFromWorkstream}
                onCreateProcess={addProcessToWorkstream}
                onUpdateProcess={updateProcessInWorkstream}
                onDeleteProcess={deleteProcessFromWorkstream}
                onCreateFlowEntity={addFlowEntityToWorkstream}
                onUpdateFlowEntity={updateFlowEntityInWorkstream}
                onDeleteFlowEntity={deleteFlowEntityFromWorkstream}
                onOpenFlow={handleOpenFlow}
                onDuplicateFlow={handleDuplicateFlowForSubEntity}
                onDeleteFlow={handleDeleteFlowForSubEntity}
                onSetFlowAsCurrent={handleSetFlowAsCurrentForSubEntity}
                onNewFlow={handleNewFlowForSubEntity}
              />
            ) : (
              <div className="p-6 flex-1">
                <div className="text-center py-8 text-muted-foreground">
                  <h3 className="text-lg font-medium text-gray-900">Workstream not found</h3>
                  <p className="text-sm text-gray-500">Please select a workstream from the main page.</p>
                  <Button 
                    onClick={() => setCurrentSection('workstreams')} 
                    className="mt-4"
                  >
                    Back to Workstreams
                  </Button>
                </div>
              </div>
            )
          ) : (
            // Other sections placeholder
            <div className="p-6 flex-1">
              <div className="text-center py-8 text-muted-foreground">
                <h3 className="text-lg font-medium text-gray-900">{currentSection.charAt(0).toUpperCase() + currentSection.slice(1).replace('-', ' ')}</h3>
                <p className="text-sm text-gray-500">This section is coming soon.</p>
              </div>
            </div>
          )
        ) : pageMode === 'flow-editor' && !workstreamsLoading ? (
          // Flow Editor Mode
          currentFlow && currentFlowSubEntity ? (
            <FlowEditor
              flowId={currentFlow.id}
              flowName={currentFlow.name}
              driverName={(currentFlowSubEntity?.entity as ContactDriver | Campaign | Process | FlowEntity)?.name || 'Unknown'}
              onBack={handleFlowEditorBack}
              onSave={handleSaveSubEntityFlow}
              updateFlow={handleUpdateSubEntityFlow}
              initialNodes={currentFlow.data?.nodes || []}
              initialEdges={currentFlow.data?.edges || []}
              storageStatus={workstreamStorageStatus}
            />
          ) : (
            <div className="flex-1 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Flow Not Found</h3>
                <p className="text-sm text-gray-500">The requested flow could not be found.</p>
                <Button 
                  onClick={() => setPageMode('table')} 
                  className="mt-4"
                >
                  Back to Drivers
                </Button>
              </div>
            </div>
          )
        ) : pageMode === 'knowledge-editor' && !kbLoading ? (
          // Knowledge Base Editor Mode
          currentAsset ? (
            <KnowledgeBaseEditor
              asset={currentAsset}
              onBack={handleKnowledgeBaseEditorBack}
              onSave={handleSaveKnowledgeBaseAsset}
              storageStatus={kbStorageStatus}
            />
          ) : (
            <div className="flex-1 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Asset Not Found</h3>
                <p className="text-sm text-gray-500">The requested knowledge base asset could not be found.</p>
                <Button 
                  onClick={() => setPageMode('table')} 
                  className="mt-4"
                >
                  Back to Knowledge Base
                </Button>
              </div>
            </div>
          )
        ) : null}
      </main>




    </div>
  );
}
