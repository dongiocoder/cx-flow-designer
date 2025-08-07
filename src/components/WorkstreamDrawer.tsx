"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Plus, 
  Copy, 
  Trash2, 
  TrendingUp, 
  MoreHorizontal 
} from "lucide-react";
import { Workstream } from "@/hooks/useWorkstreams";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface WorkstreamDrawerProps {
  workstream: Workstream | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFlow: (flowId: string) => void;
  onDuplicateFlow: (flowId: string) => void;
  onDeleteFlow: (flowId: string) => void;
  onSetFlowAsCurrent: (flowId: string) => void;
  onNewFlow: (workstreamId: string) => void;
}

export function WorkstreamDrawer({ 
  workstream, 
  isOpen, 
  onClose, 
  onOpenFlow, 
  onDuplicateFlow, 
  onDeleteFlow, 
  onSetFlowAsCurrent, 
  onNewFlow 
}: WorkstreamDrawerProps) {
  const [showAllDrafts, setShowAllDrafts] = useState(false);
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!workstream) return null;

  const currentFlow = workstream.flows.find(flow => flow.type === 'current');
  const draftFlows = workstream.flows.filter(flow => flow.type === 'draft');
  const visibleDrafts = showAllDrafts ? draftFlows : draftFlows.slice(0, 3);
  const hiddenDraftsCount = draftFlows.length - 3;

  // Flow card component with new styling
  const FlowCard = ({ 
    flow, 
    isCurrentFlow = false, 
    onClick 
  }: { 
    flow: { 
      id: string;
      name: string;
      description: string;
      version?: string;
      lastModified: string;
    }, 
    isCurrentFlow?: boolean, 
    onClick: () => void 
  }) => (
    <div
      className={`
        relative group cursor-pointer rounded-lg transition-all duration-200
        ${isCurrentFlow ? 'bg-green-50/30' : 'bg-yellow-50/30'}
        hover:shadow-md hover:-translate-y-0.5
        focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
        border-l-4 ${isCurrentFlow ? 'border-l-green-400' : 'border-l-yellow-400'}
      `}
      style={{ 
        padding: '12px',
        maxHeight: '96px',
        minHeight: '96px'
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${flow.name} flow`}
    >
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-gray-900 truncate text-base">
              {flow.name}
            </h4>
            <Badge variant="secondary" className="text-xs">
              {flow.version || 'v 3.4'}
            </Badge>
          </div>
          <p className="text-sm text-gray-700 line-clamp-1 mb-1">
            {flow.description}
          </p>
          <p className="text-xs text-gray-500">
            Last edited {flow.lastModified}
          </p>
        </div>
        
        <div className="flex flex-col items-end space-y-1 ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onDuplicateFlow(flow.id);
              }}>
                <Copy className="h-3 w-3 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {!isCurrentFlow && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFlow(flow.id);
                }}>
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {!isCurrentFlow && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSetFlowAsCurrent(flow.id);
              }}
              className="text-xs h-6 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
            >
              Set Live
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/15 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Wide Inspector Drawer */}
      <div className={`fixed top-0 right-0 h-full bg-white border-l shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: 'min(960px, 60vw)' }}
      >
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-lg font-bold text-gray-900">{workstream.name}</h2>
                <Badge className={`${
                  workstream.type === 'inbound' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  workstream.type === 'outbound' ? 'bg-green-100 text-green-800 border-green-200' :
                  workstream.type === 'background' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {workstream.type.charAt(0).toUpperCase() + workstream.type.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{workstream.description}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="ml-4 h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-120px)]">
          {/* Performance Metrics */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Volume / month</div>
                  <div className="text-lg font-semibold text-gray-900">{workstream.volumePerMonth.toLocaleString()}</div>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Success Rate</div>
                  <div className="text-lg font-semibold text-gray-900">{workstream.successPercentage}%</div>
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Automation</div>
                  <div className="text-lg font-semibold text-gray-900">{workstream.automationPercentage || 0}%</div>
                </div>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Agents Assigned</div>
                  <div className="text-lg font-semibold text-gray-900">{workstream.agentsAssigned || 0}</div>
                </div>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Success Definition */}
          {workstream.successDefinition && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Success Definition</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-900">{workstream.successDefinition}</div>
              </div>
            </div>
          )}

          {/* Economics */}
          {(workstream.agentsAssigned || workstream.hoursPerAgentPerMonth || workstream.loadedCostPerAgent) && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Economics</h3>
              <div className="grid grid-cols-2 gap-4">
                {workstream.hoursPerAgentPerMonth && (
                  <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center text-center">
                    <div className="text-xs text-gray-500 font-medium">Hours/Agent/Month</div>
                    <div className="text-sm font-semibold text-gray-900">{workstream.hoursPerAgentPerMonth}h</div>
                  </div>
                )}
                {workstream.loadedCostPerAgent && (
                  <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center text-center">
                    <div className="text-xs text-gray-500 font-medium">Cost/Agent</div>
                    <div className="text-sm font-semibold text-gray-900">${workstream.loadedCostPerAgent.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Flow Section */}
          {currentFlow && (
            <div className="space-y-4">
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                CURRENT FLOW
              </h3>
              <FlowCard 
                flow={currentFlow} 
                isCurrentFlow={true}
                onClick={() => onOpenFlow(currentFlow.id)}
              />
            </div>
          )}

          {/* Drafts Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              DRAFTS ({draftFlows.length})
            </h3>
            <div className="space-y-4">
              {visibleDrafts.map((flow) => (
                <FlowCard 
                  key={flow.id}
                  flow={flow} 
                  isCurrentFlow={false}
                  onClick={() => onOpenFlow(flow.id)}
                />
              ))}
              
              {/* Draft overflow toggle */}
              {draftFlows.length > 3 && !showAllDrafts && (
                <button
                  onClick={() => setShowAllDrafts(true)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  style={{ minHeight: '64px' }}
                >
                  <Plus className="h-4 w-4 mx-auto mb-1" />
                  Show {hiddenDraftsCount} more draft{hiddenDraftsCount > 1 ? 's' : ''}
                </button>
              )}
              
              {/* New Draft Button */}
              <button
                onClick={() => onNewFlow(workstream.id)}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                style={{ minHeight: '64px' }}
              >
                <Plus className="h-4 w-4 mx-auto mb-1" />
                New draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}