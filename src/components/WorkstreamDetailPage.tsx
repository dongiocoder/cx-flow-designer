"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Plus, MoreHorizontal, Edit, Copy, Trash2 } from "lucide-react";
import { Workstream, ContactDriver, Campaign, Process } from "@/hooks/useWorkstreams";
import { SubEntityDialog } from "@/components/SubEntityDialog";

type SubEntityData = Omit<ContactDriver | Campaign | Process, 'id' | 'createdAt' | 'lastModified' | 'flows'>;

interface WorkstreamDetailPageProps {
  workstreamId: string;
  subEntityType: 'contact-drivers' | 'campaigns' | 'processes' | 'flows';
  workstreams: Workstream[];
  onBack: () => void;
  // CRUD operations
  onCreateContactDriver?: (workstreamId: string, data: SubEntityData) => void;
  onUpdateContactDriver?: (workstreamId: string, id: string, data: Partial<SubEntityData>) => void;
  onDeleteContactDriver?: (workstreamId: string, id: string) => void;
  onCreateCampaign?: (workstreamId: string, data: SubEntityData) => void;
  onUpdateCampaign?: (workstreamId: string, id: string, data: Partial<SubEntityData>) => void;
  onDeleteCampaign?: (workstreamId: string, id: string) => void;
  onCreateProcess?: (workstreamId: string, data: SubEntityData) => void;
  onUpdateProcess?: (workstreamId: string, id: string, data: Partial<SubEntityData>) => void;
  onDeleteProcess?: (workstreamId: string, id: string) => void;
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
}: WorkstreamDetailPageProps) {
  const [editingSubEntity, setEditingSubEntity] = useState<ContactDriver | Campaign | Process | null>(null);
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
  const handleCreateSubEntity = (subEntityData: SubEntityData) => {
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
    }
  };

  const handleUpdateSubEntity = (id: string, subEntityData: Partial<SubEntityData>) => {
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
    }
    setEditingSubEntity(null);
  };

  const handleEditSubEntity = (entity: ContactDriver | Campaign | Process) => {
    setEditingSubEntity(entity);
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
    }
  };

  return (
    <div className="p-6 flex-1 overflow-auto">
      <div className="space-y-6">
        {/* Header with breadcrumb */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              Workstreams &gt; {workstream.name}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
            <p className="text-muted-foreground mt-1">
              Manage {displayName.toLowerCase()} for the {workstream.name} workstream
            </p>
          </div>
        </div>

        {/* Workstream Context Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{workstream.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{workstream.description}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    workstream.type === 'inbound' ? 'bg-blue-100 text-blue-800' :
                    workstream.type === 'outbound' ? 'bg-green-100 text-green-800' :
                    workstream.type === 'background' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {workstream.type.charAt(0).toUpperCase() + workstream.type.slice(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {workstream.volumePerMonth.toLocaleString()} runs/month
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {workstream.successPercentage}% success rate
                  </span>
                </div>
              </div>
              {subEntityType !== 'flows' && (
                <SubEntityDialog
                  subEntityType={subEntityType}
                  onCreateSubEntity={handleCreateSubEntity}
                  onUpdateSubEntity={handleUpdateSubEntity}
                  editingSubEntity={editingSubEntity}
                  onCancelEdit={() => setEditingSubEntity(null)}
                />
              )}
              {subEntityType === 'flows' && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Flow
                </Button>
              )}
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
                <div className="text-center py-8 text-muted-foreground">
                  <h4 className="text-lg font-medium text-gray-900">No {displayName.toLowerCase()} yet</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Create your first {subEntityType === 'contact-drivers' ? 'contact driver' : 
                                      subEntityType === 'campaigns' ? 'campaign' :
                                      subEntityType === 'processes' ? 'process' : 'flow'} to get started!
                  </p>
                  {subEntityType !== 'flows' ? (
                    <SubEntityDialog
                      subEntityType={subEntityType}
                      onCreateSubEntity={handleCreateSubEntity}
                      onUpdateSubEntity={handleUpdateSubEntity}
                      editingSubEntity={editingSubEntity}
                      onCancelEdit={() => setEditingSubEntity(null)}
                    />
                  ) : (
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Flow
                    </Button>
                  )}
                </div>
              ) : (
                subEntities.map((entity) => {
                  const currentFlow = entity.flows?.find(flow => flow.type === 'current');
                  const draftsCount = entity.flows?.filter(flow => flow.type === 'draft').length || 0;
                  
                  return (
                    <div 
                      key={entity.id} 
                      className="grid grid-cols-12 gap-4 items-center py-4 border-b border-t-0 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm cursor-pointer"
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
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSubEntity(entity)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {/* TODO: Duplicate */}}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteSubEntity(entity.id)}
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
  );
}
