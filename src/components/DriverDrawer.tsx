"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ExternalLink, Copy, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { ContactDriver } from "@/hooks/useContactDrivers";

interface DriverDrawerProps {
  driver: ContactDriver | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFlow: (flowId: string) => void;
  onDuplicateFlow: (flowId: string) => void;
  onDeleteFlow: (flowId: string) => void;
  onSetFlowAsCurrent: (flowId: string) => void;
  onNewFlow: (driverId: string) => void;
}

export function DriverDrawer({ 
  driver, 
  isOpen, 
  onClose, 
  onOpenFlow, 
  onDuplicateFlow, 
  onDeleteFlow, 
  onSetFlowAsCurrent, 
  onNewFlow 
}: DriverDrawerProps) {
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

  if (!driver) return null;

  const currentFlow = driver.flows.find(flow => flow.type === 'current');
  const draftFlows = driver.flows.filter(flow => flow.type === 'draft');

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
                <h2 className="text-lg font-bold text-gray-900">{driver.name}</h2>
                <Badge className={`${
                  driver.tier === 'Tier 1' 
                    ? 'bg-blue-100 text-blue-800 border-blue-200' 
                    : driver.tier === 'Tier 2'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-orange-100 text-orange-800 border-orange-200'
                }`}>
                  {driver.tier}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{driver.description}</p>
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
          {/* KPI Chips */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-medium">Avg Handle Time</div>
                <div className="text-lg font-semibold text-gray-900">{driver.avgHandleTime}m</div>
              </div>
              <TrendingDown className="h-5 w-5 text-green-500" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-medium">CSAT</div>
                <div className="text-lg font-semibold text-gray-900">{driver.csat}%</div>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-medium">QA Score</div>
                <div className="text-lg font-semibold text-gray-900">98%</div>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-medium">Volume / month</div>
                <div className="text-lg font-semibold text-gray-900">{driver.volumePerMonth.toLocaleString()}</div>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </div>

          {/* Contact Volume List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Contact Volume</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium">{Math.round(driver.volumePerMonth * 0.6).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{Math.round(driver.volumePerMonth * 0.3).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Chat</span>
                <span className="font-medium">{Math.round(driver.volumePerMonth * 0.1).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Current Flow Section */}
          {currentFlow && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Current Flow</h3>
              <Card className="border-l-4 border-l-green-500 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{currentFlow.name}</h4>
                        <Badge variant="secondary" className="bg-green-50 text-green-800 border-green-200">
                          {currentFlow.version || 'v 1.0'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{currentFlow.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Last modified: {currentFlow.lastModified}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => onOpenFlow(currentFlow.id)}
                      className="flex items-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Open</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDuplicateFlow(currentFlow.id)}
                      className="flex items-center space-x-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Duplicate</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Drafts Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Drafts ({draftFlows.length})</h3>
            <div className="space-y-3">
              {draftFlows.map((flow) => (
                <Card key={flow.id} className="border-l-4 border-l-blue-500 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{flow.name}</h4>
                          <Badge variant="secondary" className="bg-blue-50 text-blue-800 border-blue-200">
                            Draft
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{flow.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Last modified: {flow.lastModified}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => onOpenFlow(flow.id)}
                        className="flex items-center space-x-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Open</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onSetFlowAsCurrent(flow.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        Set Live
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onDeleteFlow(flow.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* New Draft Button */}
              <button
                onClick={() => onNewFlow(driver.id)}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="h-5 w-5 mx-auto mb-1" />
                New draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 