"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, MoreHorizontal, Trash2, Copy, Share, CreditCard, Building2, Wrench, Upload } from "lucide-react";
import { useContactDrivers } from "@/hooks/useContactDrivers";
import { NewContactDriverDialog } from "@/components/NewContactDriverDialog";
import { DriverDrawer } from "@/components/DriverDrawer";
import { FlowEditor } from "@/components/FlowEditor";
import { useState } from "react";
import type { Node, Edge } from '@xyflow/react';

type PageMode = 'table' | 'flow-editor';

export default function Home() {
  const {
    contactDrivers,
    selectedDrivers,
    addContactDriver,
    deleteContactDriver,
    deleteSelectedDrivers,
    duplicateContactDriver,
    addFlowToDriver,
    deleteFlow,
    setFlowAsCurrent,
    duplicateFlow,
    saveFlowData,
    getFlowById,
    toggleDriverSelection,
    selectAllDrivers,
    clearSelection,
    isAllSelected,
    isPartiallySelected
  } = useContactDrivers();

  const [pageMode, setPageMode] = useState<PageMode>('table');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);

  const selectedDriver = selectedDriverId ? contactDrivers.find(d => d.id === selectedDriverId) || null : null;
  const currentFlow = currentFlowId ? getFlowById(currentFlowId) : null;
  const currentFlowDriver = currentFlow ? contactDrivers.find(d => d.flows.some(f => f.id === currentFlowId)) : null;

  const handleCreateContactDriver = (driverData: { name: string; description: string; tier: 'Tier 1' | 'Tier 2' | 'Tier 3' }) => {
    addContactDriver(driverData);
  };

  const handleDeleteDriver = (id: string) => {
    deleteContactDriver(id);
  };

  const handleDuplicateDriver = (id: string) => {
    duplicateContactDriver(id);
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
    setIsDrawerOpen(false);
    setSelectedDriverId(null);
    setCurrentFlowId(null);
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
    <div className="min-h-screen bg-background">
      {/* Global Header - Never changes */}
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80">
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

      {/* Main Content Area - Swaps between modes */}
      <main className={`flex-1 h-[calc(100vh-64px)] transition-opacity duration-300 ${
        isDrawerOpen && pageMode === 'table' ? 'opacity-85' : 'opacity-100'
      }`}>
        {pageMode === 'table' ? (
          // Contact-Driver Table Mode
          <div className="p-6 h-full overflow-auto">
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
                  <NewContactDriverDialog onCreateContactDriver={handleCreateContactDriver} />
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
                      <div className="col-span-1">Tier</div>
                      <div className="col-span-1">Volume / month</div>
                      <div className="col-span-1">Avg Handle Time</div>
                      <div className="col-span-1">CSAT</div>
                      <div className="col-span-1">Current Flow</div>
                      <div className="col-span-1">Drafts count</div>
                      <div className="col-span-2">Last modified</div>
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
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                driver.tier === 'Tier 1' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : driver.tier === 'Tier 2'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {driver.tier}
                              </span>
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
                            <div className="col-span-1">
                              {currentFlow ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-800 border border-green-200">
                                  {currentFlow.version || 'v 1.0'}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">No current flow</span>
                              )}
                            </div>
                            <div className="col-span-1">
                              {draftsCount > 0 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                                  +{draftsCount}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">0</span>
                              )}
                            </div>
                            <div className="col-span-2">
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
                                  <DropdownMenuItem onClick={() => handleDuplicateDriver(driver.id)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Share className="mr-2 h-4 w-4" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteDriver(driver.id)}
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
          // Flow Editor Mode
          currentFlow && currentFlowDriver ? (
            <FlowEditor
              flowId={currentFlow.id}
              flowName={currentFlow.name}
              driverName={currentFlowDriver.name}
              onBack={handleFlowEditorBack}
              onSave={handleSaveFlow}
            />
          ) : (
            <div className="h-full bg-gray-50 flex items-center justify-center">
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
