"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ArrowLeft, MoreHorizontal, Edit, Copy, Trash2, BarChart3 } from "lucide-react";
import { Workstream, ContactDriver, Campaign, Process, FlowEntity } from "@/hooks/useWorkstreamsConvex";
import { SubEntityDialog } from "@/components/SubEntityDialog";
import { UniversalSubEntityDrawer } from "@/components/UniversalSubEntityDrawer";

interface WorkstreamDetailPageProps {
  workstreamId: string;
  subEntityType: 'contact-drivers' | 'campaigns' | 'processes' | 'flows';
  workstreams: Workstream[];
  onBack: () => void;
  // CRUD operations
  onCreateContactDriver?: (workstreamId: string, data: Omit<ContactDriver, 'id' | 'flows' | 'lastModified' | 'createdAt'>) => void;
  onUpdateContactDriver?: (workstreamId: string, id: string, data: Omit<ContactDriver, 'id' | 'flows' | 'lastModified' | 'createdAt'>) => void;
  onDeleteContactDriver?: (workstreamId: string, id: string) => void;
  onCreateCampaign?: (workstreamId: string, data: Omit<Campaign, 'id' | 'flows' | 'lastModified' | 'createdAt'>) => void;
  onUpdateCampaign?: (workstreamId: string, id: string, data: Omit<Campaign, 'id' | 'flows' | 'lastModified' | 'createdAt'>) => void;
  onDeleteCampaign?: (workstreamId: string, id: string) => void;
  onCreateProcess?: (workstreamId: string, data: Omit<Process, 'id' | 'flows' | 'lastModified' | 'createdAt'>) => void;
  onUpdateProcess?: (workstreamId: string, id: string, data: Omit<Process, 'id' | 'flows' | 'lastModified' | 'createdAt'>) => void;
  onDeleteProcess?: (workstreamId: string, id: string) => void;
  onCreateFlowEntity?: (workstreamId: string, data: Omit<FlowEntity, 'id' | 'flows' | 'lastModified' | 'createdAt'>) => void;
  onUpdateFlowEntity?: (workstreamId: string, id: string, data: Omit<FlowEntity, 'id' | 'flows' | 'lastModified' | 'createdAt'>) => void;
  onDeleteFlowEntity?: (workstreamId: string, id: string) => void;
  // Flow management operations  
  onOpenFlow?: (flowId: string) => void;
  onDuplicateFlow?: (flowId: string) => void;
  onDeleteFlow?: (flowId: string) => void;
  onSetFlowAsCurrent?: (flowId: string) => void;
  onNewFlow?: (subEntityId: string) => void;
}

export function WorkstreamDetailPage({ 
  workstreamId, 
  subEntityType, 
  workstreams, 
  onBack,
  onCreateContactDriver,
  onUpdateContactDriver,
  onDeleteContactDriver,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onCreateProcess,
  onUpdateProcess,
  onDeleteProcess,
  onCreateFlowEntity,
  onUpdateFlowEntity,
  onDeleteFlowEntity,
  onOpenFlow,
  onDuplicateFlow,
  onDeleteFlow,
  onSetFlowAsCurrent,
  onNewFlow,
}: WorkstreamDetailPageProps) {
  const [editingSubEntity, setEditingSubEntity] = useState<ContactDriver | Campaign | Process | FlowEntity | null>(null);
  const [selectedSubEntityId, setSelectedSubEntityId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMetricsMode, setIsMetricsMode] = useState(false);
  const workstream = workstreams.find(w => w.id === workstreamId);
  
  if (!workstream) {
    return (
      <div className="p-6 flex-1 overflow-auto">
        <div className="text-center py-8 text-muted-foreground">
          <h3 className="text-lg font-medium text-gray-900">Workstream not found</h3>
          <p className="text-sm text-gray-500">The requested workstream could not be found.</p>
          <Button onClick={onBack} className="mt-4">
            Back to Workstreams
          </Button>
        </div>
      </div>
    );
  }

  // Get the appropriate sub-entities based on type
  const getSubEntities = () => {
    switch (subEntityType) {
      case 'contact-drivers':
        return workstream.contactDrivers || [];
      case 'campaigns':
        return workstream.campaigns || [];
      case 'processes':
        return workstream.processes || [];
      case 'flows':
        return workstream.flows || [];
      default:
        return [];
    }
  };

  // Get fresh sub-entity data by ID
  const getSelectedSubEntity = (): ContactDriver | Campaign | Process | FlowEntity | null => {
    if (!selectedSubEntityId) return null;
    const entities = getSubEntities();
    return entities.find(e => e.id === selectedSubEntityId) || null;
  };

  const getSubEntityDisplayName = () => {
    switch (subEntityType) {
      case 'contact-drivers':
        return 'Contact Drivers';
      case 'campaigns':
        return 'Campaigns';
      case 'processes':
        return 'Processes';
      case 'flows':
        return 'Flows';
      default:
        return 'Items';
    }
  };

  const subEntities = getSubEntities();
  const displayName = getSubEntityDisplayName();

  // CRUD handlers
  const handleCreateSubEntity = (subEntityData: Omit<ContactDriver | Campaign | Process | FlowEntity, 'id' | 'flows' | 'lastModified' | 'createdAt'>) => {
    switch (subEntityType) {
      case 'contact-drivers':
        onCreateContactDriver?.(workstreamId, subEntityData);
        break;
      case 'campaigns':
        onCreateCampaign?.(workstreamId, subEntityData);
        break;
      case 'processes':
        onCreateProcess?.(workstreamId, subEntityData);
        break;
      case 'flows':
        onCreateFlowEntity?.(workstreamId, subEntityData);
        break;
    }
  };

  const handleUpdateSubEntity = (id: string, subEntityData: Omit<ContactDriver | Campaign | Process | FlowEntity, 'id' | 'flows' | 'lastModified' | 'createdAt'>) => {
    switch (subEntityType) {
      case 'contact-drivers':
        onUpdateContactDriver?.(workstreamId, id, subEntityData);
        break;
      case 'campaigns':
        onUpdateCampaign?.(workstreamId, id, subEntityData);
        break;
      case 'processes':
        onUpdateProcess?.(workstreamId, id, subEntityData);
        break;
      case 'flows':
        onUpdateFlowEntity?.(workstreamId, id, subEntityData);
        break;
    }
    setEditingSubEntity(null);
    setIsMetricsMode(false);
  };

  const handleEditSubEntity = (entity: ContactDriver | Campaign | Process | FlowEntity) => {
    setEditingSubEntity(entity);
    setIsMetricsMode(false);
  };

  const handleEditMetrics = (entity: ContactDriver | Campaign | Process | FlowEntity) => {
    setEditingSubEntity(entity);
    setIsMetricsMode(true);
  };

  const handleDeleteSubEntity = (id: string) => {
    switch (subEntityType) {
      case 'contact-drivers':
        onDeleteContactDriver?.(workstreamId, id);
        break;
      case 'campaigns':
        onDeleteCampaign?.(workstreamId, id);
        break;
      case 'processes':
        onDeleteProcess?.(workstreamId, id);
        break;
      case 'flows':
        onDeleteFlowEntity?.(workstreamId, id);
        break;
    }
  };

  const handleSubEntityClick = (entity: ContactDriver | Campaign | Process | FlowEntity) => {
    setSelectedSubEntityId(entity.id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedSubEntityId(null);
  };

  return (
    <div className="relative">
    <div className="p-6 flex-1 overflow-auto">
      <div className="space-y-6">
        {/* Workstream Context Card */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            {/* Header row with navigation, type, title, metrics, and action */}
            <div className="flex items-center justify-between">
              {/* Left section: Navigation + Type + Title */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onBack} 
                  className="p-1 hover:bg-gray-100 rounded-md flex-shrink-0"
                >
                  <ArrowLeft className="h-3 w-3 text-gray-500" />
                </Button>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  workstream.type === 'inbound' ? 'bg-blue-100 text-blue-800' :
                  workstream.type === 'outbound' ? 'bg-green-100 text-green-800' :
                  workstream.type === 'background' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {workstream.type === 'background' ? 'Back-Office' : 
                   workstream.type.charAt(0).toUpperCase() + workstream.type.slice(1)}
                </span>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-gray-900 truncate">{workstream.name}</h1>
                  <p className="text-sm text-gray-500 truncate">{workstream.description}</p>
                </div>
              </div>

              {/* Center section: Metrics */}
              <div className="hidden md:flex items-center space-x-6 mx-6">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Total {displayName}</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {subEntities.length} {subEntities.length === 1 ? 
                      (subEntityType === 'contact-drivers' ? 'driver' : 
                       subEntityType === 'campaigns' ? 'campaign' :
                       subEntityType === 'processes' ? 'process' : 'flow') :
                      (subEntityType === 'contact-drivers' ? 'drivers' : 
                       subEntityType === 'campaigns' ? 'campaigns' :
                       subEntityType === 'processes' ? 'processes' : 'flows')
                    }
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-gray-500">Monthly Volume</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {subEntities.reduce((total, entity) => total + (entity.volumePerMonth || 0), 0).toLocaleString()} runs
                  </div>
                </div>
              </div>

              {/* Right section: Action button */}
              <div className="flex-shrink-0">
                <SubEntityDialog
                  subEntityType={subEntityType}
                  onCreateSubEntity={handleCreateSubEntity}
                  onUpdateSubEntity={handleUpdateSubEntity}
                  editingSubEntity={editingSubEntity}
                  onCancelEdit={() => {
                    setEditingSubEntity(null);
                    setIsMetricsMode(false);
                  }}
                  isMetricsMode={isMetricsMode}
                />
              </div>
            </div>

            {/* Mobile metrics row (visible only on small screens) */}
            <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-xs text-gray-500">Total {displayName}</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {subEntities.length} {subEntities.length === 1 ? 
                      (subEntityType === 'contact-drivers' ? 'driver' : 
                       subEntityType === 'campaigns' ? 'campaign' :
                       subEntityType === 'processes' ? 'process' : 'flow') :
                      (subEntityType === 'contact-drivers' ? 'drivers' : 
                       subEntityType === 'campaigns' ? 'campaigns' :
                       subEntityType === 'processes' ? 'processes' : 'flows')
                    }
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">Monthly Volume</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {subEntities.reduce((total, entity) => total + (entity.volumePerMonth || 0), 0).toLocaleString()} runs
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sub-entities Table */}
        <Card>
          <CardContent>
            <div>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-3 mb-0">
                <div className="col-span-3">Name</div>
                <div className="col-span-1">AI Containment</div>
                <div className="col-span-1">Volume</div>
                <div className="col-span-1">Avg Handle Time</div>
                <div className="col-span-1">CSAT</div>
                <div className="col-span-2">Current Flow</div>
                <div className="col-span-1">Drafts</div>
                <div className="col-span-1">Last Modified</div>
                <div className="col-span-1"></div>
              </div>

              {/* Table Rows */}
              {subEntities.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="mx-auto max-w-sm">
                    <div className="rounded-full bg-gray-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-6">
                      <svg 
                        className="w-8 h-8 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth={1.5}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M12 4.5v15m7.5-7.5h-15" 
                        />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      No {displayName.toLowerCase()} yet
                    </h4>
                    <p className="text-base text-gray-500 mb-8 leading-relaxed">
                      Create your first {subEntityType === 'contact-drivers' ? 'contact driver' : 
                                        subEntityType === 'campaigns' ? 'campaign' :
                                        subEntityType === 'processes' ? 'process' : 'flow'} to get started with this workstream.
                    </p>
                    <div className="flex justify-center">
                      <SubEntityDialog
                        subEntityType={subEntityType}
                        onCreateSubEntity={handleCreateSubEntity}
                        onUpdateSubEntity={handleUpdateSubEntity}
                        editingSubEntity={editingSubEntity}
                        onCancelEdit={() => {
                          setEditingSubEntity(null);
                          setIsMetricsMode(false);
                        }}
                        isMetricsMode={isMetricsMode}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                subEntities.map((entity) => {
                  const currentFlow = entity.flows?.find(flow => flow.type === 'current');
                  const draftsCount = entity.flows?.filter(flow => flow.type === 'draft').length || 0;
                  
                  return (
                    <div 
                      key={entity.id} 
                      className="grid grid-cols-12 gap-4 items-center py-4 border-b border-t-0 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm cursor-pointer"
                      onClick={() => handleSubEntityClick(entity)}
                    >
                      <div className="col-span-3">
                        <div className="font-medium truncate">{entity.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{entity.description}</div>
                      </div>
                      <div className="col-span-1">
                        <div className="text-sm font-medium">{entity.containmentPercentage}%</div>
                      </div>
                      <div className="col-span-1">
                        <div className="text-sm">{entity.volumePerMonth.toLocaleString()}</div>
                      </div>
                      <div className="col-span-1">
                        <div className="text-sm">{entity.avgHandleTime}m</div>
                      </div>
                      <div className="col-span-1">
                        <div className="text-sm">{entity.csat}%</div>
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
                        <div className="text-sm text-muted-foreground">{entity.lastModified}</div>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEditSubEntity(entity);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEditMetrics(entity);
                            }}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Edit Metrics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              /* TODO: Duplicate */
                            }}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubEntity(entity.id);
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

    {/* Universal Sub-Entity Drawer */}
    <UniversalSubEntityDrawer
      subEntity={getSelectedSubEntity()}
      subEntityType={subEntityType}
      isOpen={isDrawerOpen}
      onClose={handleCloseDrawer}
      onOpenFlow={onOpenFlow || (() => {})}
      onDuplicateFlow={onDuplicateFlow || (() => {})}
      onDeleteFlow={onDeleteFlow || (() => {})}
      onSetFlowAsCurrent={onSetFlowAsCurrent || (() => {})}
      onNewFlow={onNewFlow || (() => {})}
    />
    </div>
  );
}
