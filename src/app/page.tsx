"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User, LogOut, MoreHorizontal, Trash2, Copy, Edit, CreditCard, Building2, Wrench, Upload, Info } from "lucide-react";
import { useContactDrivers } from "@/hooks/useContactDrivers";
import { NewContactDriverDialog } from "@/components/NewContactDriverDialog";
import { DriverDrawer } from "@/components/DriverDrawer";
import { FlowEditor } from "@/components/FlowEditor";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { KnowledgeBaseEditor } from "@/components/KnowledgeBaseEditor";
import { Home as Dashboard } from "@/components/Home";
import { useKnowledgeBaseAssets, type KnowledgeBaseAsset } from "@/hooks/useKnowledgeBaseAssets";
import { useState, useEffect } from "react";
import type { Node, Edge } from '@xyflow/react';

type PageMode = 'table' | 'flow-editor' | 'knowledge-editor';
type PageSection = 'contact-drivers' | 'knowledge-bases' | 'dashboard' | 'analytics' | 'users' | 'channels' | 'integrations' | 'actions' | 'settings';

export default function Home() {
  const {
    contactDrivers,
    selectedDrivers,
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
  } = useContactDrivers();

  const {
    getAssetById,
    updateKnowledgeBaseAsset,
    storageStatus: kbStorageStatus
  } = useKnowledgeBaseAssets();

  const [pageMode, setPageMode] = useState<PageMode>('table');
  const [currentSection, setCurrentSection] = useState<PageSection>('dashboard');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [currentAssetId, setCurrentAssetId] = useState<string | null>(null);
  const [currentAssetData, setCurrentAssetData] = useState<KnowledgeBaseAsset | null>(null);

  const selectedDriver = selectedDriverId ? contactDrivers.find(d => d.id === selectedDriverId) || null : null;
  const editingDriver = editingDriverId ? contactDrivers.find(d => d.id === editingDriverId) || null : null;
  const currentFlow = currentFlowId ? getFlowById(currentFlowId) : null;
  const currentFlowDriver = currentFlow ? contactDrivers.find(d => d.flows.some(f => f.id === currentFlowId)) : null;
  const currentAsset = currentAssetData || (currentAssetId ? getAssetById(currentAssetId) : null);

  // Listen for navigation changes from MainNavigation component
  useEffect(() => {
    const handleNavigationChange = (event: CustomEvent) => {
      const section = event.detail;
      setCurrentSection(section as PageSection);
      setPageMode('table');
      setIsDrawerOpen(false);
      setSelectedDriverId(null);
      setCurrentFlowId(null);
    };

    window.addEventListener('navigation-change', handleNavigationChange as EventListener);
    return () => {
      window.removeEventListener('navigation-change', handleNavigationChange as EventListener);
    };
  }, []);

  const handleCreateContactDriver = (driverData: { 
    name: string; 
    description: string;
    kpis?: {
      avgHandleTime?: number;
      csat?: number;
      qaScore?: number;
      volumePerMonth?: number;
      containmentPercentage?: number;
      containmentVolume?: number;
    };
    volumes?: {
      phoneVolume?: number;
      emailVolume?: number;
      chatVolume?: number;
      otherVolume?: number;
    };
  }) => {
    // Extract KPIs and volumes, merge with driver data
    const { kpis, volumes, ...basicData } = driverData;
    const driverWithData = {
      ...basicData,
      avgHandleTime: kpis?.avgHandleTime || 0,
      csat: kpis?.csat || 0,
      qaScore: kpis?.qaScore || 0,
      volumePerMonth: kpis?.volumePerMonth || 0,
      containmentPercentage: kpis?.containmentPercentage || 0,
      containmentVolume: kpis?.containmentVolume || 0,
      phoneVolume: volumes?.phoneVolume || 0,
      emailVolume: volumes?.emailVolume || 0,
      chatVolume: volumes?.chatVolume || 0,
      otherVolume: volumes?.otherVolume || 0
    };
    addContactDriver(driverWithData);
  };

  const handleUpdateContactDriver = (id: string, driverData: { 
    name: string; 
    description: string;
    kpis?: {
      avgHandleTime?: number;
      csat?: number;
      qaScore?: number;
      volumePerMonth?: number;
      containmentPercentage?: number;
      containmentVolume?: number;
    };
    volumes?: {
      phoneVolume?: number;
      emailVolume?: number;
      chatVolume?: number;
      otherVolume?: number;
    };
  }) => {
    // Extract KPIs and volumes, merge with driver data
    const { kpis, volumes, ...basicData } = driverData;
    const updatedData = {
      ...basicData,
      avgHandleTime: kpis?.avgHandleTime || 0,
      csat: kpis?.csat || 0,
      qaScore: kpis?.qaScore || 0,
      volumePerMonth: kpis?.volumePerMonth || 0,
      containmentPercentage: kpis?.containmentPercentage || 0,
      containmentVolume: kpis?.containmentVolume || 0,
      phoneVolume: volumes?.phoneVolume || 0,
      emailVolume: volumes?.emailVolume || 0,
      chatVolume: volumes?.chatVolume || 0,
      otherVolume: volumes?.otherVolume || 0
    };
    updateContactDriver(id, updatedData);
    setEditingDriverId(null);
  };

  const handleCancelEdit = () => {
    setEditingDriverId(null);
  };

  const handleDeleteDriver = (id: string) => {
    deleteContactDriver(id);
  };

  const handleDuplicateDriver = (id: string) => {
    duplicateContactDriver(id);
  };

  const handleEditDriver = (id: string) => {
    setEditingDriverId(id);
  };

  const handleBulkDelete = () => {
    if (selectedDrivers.length > 0) {
      deleteSelectedDrivers();
    }
  };

  const handleMasterCheckboxChange = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllDrivers();
    }
  };

  const handleLogoClick = () => {
    setPageMode('table');
    setCurrentSection('contact-drivers');
    setIsDrawerOpen(false);
    setSelectedDriverId(null);
    setCurrentFlowId(null);
  };

  const handleNavigationChange = (section: string) => {
    setCurrentSection(section as PageSection);
    setPageMode('table');
    setIsDrawerOpen(false);
    setSelectedDriverId(null);
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

  const handleSaveKnowledgeBaseAsset = (assetId: string, updates: Partial<any>) => {
    updateKnowledgeBaseAsset(assetId, updates);
  };

  const handleMenuItemClick = (item: string) => {
    // TODO: Implement modal dialogs for each menu item
    console.log(`Opening ${item} modal`);
  };

  const handleDriverRowClick = (driverId: string) => {
    // Disable drawer opening if any checkboxes are selected
    if (selectedDrivers.length > 0) {
      return;
    }
    setSelectedDriverId(driverId);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedDriverId(null);
  };

  const handleOpenFlow = (flowId: string) => {
    setCurrentFlowId(flowId);
    setPageMode('flow-editor');
    setIsDrawerOpen(false);
  };

  const handleDuplicateFlow = (flowId: string) => {
    duplicateFlow(flowId);
  };

  const handleDeleteFlow = (flowId: string) => {
    deleteFlow(flowId);
  };

  const handleSetFlowAsCurrent = (flowId: string) => {
    setFlowAsCurrent(flowId);
  };

  const handleNewFlow = (driverId: string) => {
    const newFlow = addFlowToDriver(driverId, {
      name: 'New Flow',
      description: 'New flow description',
      type: 'draft'
    });
    if (newFlow) {
      setCurrentFlowId(newFlow.id);
      setPageMode('flow-editor');
      setIsDrawerOpen(false);
    }
  };

  const handleFlowEditorBack = () => {
    setPageMode('table');
    setCurrentFlowId(null);
    // Restore the previous state: re-open drawer if there was a selected driver
    if (selectedDriverId) {
      setIsDrawerOpen(true);
    }
  };

  const handleSaveFlow = (flowId: string, nodes: Node[], edges: Edge[]) => {
    saveFlowData(flowId, nodes, edges);
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Global Header - Never changes */}
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80 flex-shrink-0">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleLogoClick}
              className="text-xl font-semibold text-foreground hover:text-foreground/80 transition-colors"
            >
              Flow Designer
            </button>
          </div>

          {/* Right side - Avatar with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shadow-sm">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem onClick={() => handleMenuItemClick('Profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuItemClick('Billing')}>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuItemClick('Account')}>
                <Building2 className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuItemClick('Tools')}>
                <Wrench className="mr-2 h-4 w-4" />
                Tools
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuItemClick('Log out')}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area - Swaps between sections and modes */}
      <main className={`flex-1 transition-opacity duration-300 ${
        isDrawerOpen && pageMode === 'table' ? 'opacity-85' : 'opacity-100'
      }`}>
        {pageMode === 'table' ? (
          // Table Mode - Different sections
          currentSection === 'dashboard' ? (
            <Dashboard onNavigate={handleNavigationChange} />
          ) : currentSection === 'knowledge-bases' ? (
            <KnowledgeBase 
              onCreateAsset={handleCreateKnowledgeBaseAsset}
              onEditAsset={handleEditKnowledgeBaseAsset}
            />
          ) : currentSection === 'contact-drivers' ? (
            // Contact-Driver Table Mode
            <div className="p-6 flex-1 overflow-auto">
            <div className="space-y-6">
              {/* Bulk Action Bar - Only show when drivers are selected */}
              {selectedDrivers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-blue-900">
                      {selectedDrivers.length} driver{selectedDrivers.length === 1 ? '' : 's'} selected
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear Selection
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleBulkDelete}
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
                  <h2 className="text-3xl font-bold tracking-tight">Contact Drivers</h2>
                  <p className="text-muted-foreground mt-1">
                    Manage customer contact drivers and their associated flows
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Import Data Button */}
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Import data
                  </Button>
                  <NewContactDriverDialog 
                    onCreateContactDriver={handleCreateContactDriver}
                    onUpdateContactDriver={handleUpdateContactDriver}
                    editingDriver={editingDriver}
                    onCancelEdit={handleCancelEdit}
                  />
                </div>
              </div>

              {/* Contact Drivers Table */}
              <Card className="shadow-md">
                <CardContent>
                  <div>
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-3 mb-0">
                      <div className="col-span-3">
                        <div className="flex items-center space-x-3">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300" 
                            checked={isAllSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = isPartiallySelected;
                            }}
                            onChange={handleMasterCheckboxChange}
                          />
                          <span>Name</span>
                        </div>
                      </div>
                      <div className="col-span-1 flex items-center space-x-1">
                        <span>Containment</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <div className="font-medium">AI Containment Rate</div>
                              <div>Percentage of cases resolved by AI</div>
                              <div>without human intervention</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="col-span-1">Volume</div>
                      <div className="col-span-1">Avg Handle Time</div>
                      <div className="col-span-1">CSAT</div>
                      <div className="col-span-2">Flow</div>
                      <div className="col-span-1">Drafts count</div>
                      <div className="col-span-1">Last modified</div>
                      <div className="col-span-1"></div>
                    </div>

                    {/* Table Rows */}
                    {contactDrivers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No contact drivers yet. Create your first contact driver to get started!
                      </div>
                    ) : (
                      contactDrivers.map((driver) => {
                        const currentFlow = driver.flows.find(flow => flow.type === 'current');
                        const draftsCount = driver.flows.filter(flow => flow.type === 'draft').length;
                        const isRowSelected = selectedDrivers.includes(driver.id);
                        
                        return (
                          <div 
                            key={driver.id} 
                            className={`grid grid-cols-12 gap-4 items-center py-4 border-b border-t-0 transition-all duration-200 ${
                              selectedDrivers.length === 0 
                                ? 'hover:bg-muted/50 hover:shadow-sm cursor-pointer' 
                                : isRowSelected 
                                  ? 'bg-blue-50/80 shadow-sm' 
                                  : 'hover:bg-muted/30'
                            }`}
                            onClick={() => handleDriverRowClick(driver.id)}
                          >
                            <div className="col-span-3">
                              <div className="flex items-center space-x-3">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-gray-300 flex-shrink-0" 
                                  checked={selectedDrivers.includes(driver.id)}
                                  onChange={() => toggleDriverSelection(driver.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate">{driver.name}</div>
                                  <div className="text-sm text-muted-foreground line-clamp-1">{driver.description}</div>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-1">
                              <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium">{driver.containmentPercentage}%</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs">
                                      <div className="font-medium">Containment Details</div>
                                      <div>Rate: {driver.containmentPercentage}%</div>
                                      <div>Volume: {driver.containmentVolume.toLocaleString()} cases</div>
                                      <div>Total: {driver.volumePerMonth.toLocaleString()} cases</div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                            <div className="col-span-1">
                              <div className="text-sm">{driver.volumePerMonth.toLocaleString()}</div>
                            </div>
                            <div className="col-span-1">
                              <div className="text-sm">{driver.avgHandleTime}m</div>
                            </div>
                            <div className="col-span-1">
                              <div className="text-sm">{driver.csat}%</div>
                            </div>
                            <div className="col-span-2">
                              {currentFlow ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-800 border border-green-200">
                                  {currentFlow.name}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">No current flow</span>
                              )}
                            </div>
                            <div className="col-span-1">
                              {draftsCount > 0 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200">
                                  +{draftsCount}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">0</span>
                              )}
                            </div>
                            <div className="col-span-1">
                              <div className="text-sm text-muted-foreground">{driver.lastModified}</div>
                            </div>
                            <div className="col-span-1 flex justify-center">
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
                                    handleEditDriver(driver.id);
                                  }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateDriver(driver.id);
                                  }}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteDriver(driver.id);
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
          ) : (
            // Other sections placeholder
            <div className="p-6 flex-1 overflow-auto">
              <div className="text-center py-8 text-muted-foreground">
                <h3 className="text-lg font-medium text-gray-900">{currentSection.charAt(0).toUpperCase() + currentSection.slice(1).replace('-', ' ')}</h3>
                <p className="text-sm text-gray-500">This section is coming soon.</p>
              </div>
            </div>
          )
        ) : pageMode === 'flow-editor' ? (
          // Flow Editor Mode
          currentFlow && currentFlowDriver ? (
            <FlowEditor
              flowId={currentFlow.id}
              flowName={currentFlow.name}
              driverName={currentFlowDriver.name}
              onBack={handleFlowEditorBack}
              onSave={handleSaveFlow}
              updateFlow={updateFlow}
              initialNodes={currentFlow.data?.nodes || []}
              initialEdges={currentFlow.data?.edges || []}
              storageStatus={storageStatus}
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
        ) : (
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
        )}
      </main>

      {/* Driver Drawer */}
      <DriverDrawer
        driver={selectedDriver}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        onOpenFlow={handleOpenFlow}
        onDuplicateFlow={handleDuplicateFlow}
        onDeleteFlow={handleDeleteFlow}
        onSetFlowAsCurrent={handleSetFlowAsCurrent}
        onNewFlow={handleNewFlow}
      />
    </div>
  );
}
