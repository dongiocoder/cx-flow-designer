"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, MoreHorizontal, Trash2, Copy, Share } from "lucide-react";
import { useFlows } from "@/hooks/useFlows";
import { NewFlowDialog } from "@/components/NewFlowDialog";

export default function Home() {
  const {
    flows,
    selectedFlows,
    addFlow,
    deleteFlow,
    deleteSelectedFlows,
    duplicateFlow,
    toggleFlowSelection,
    selectAllFlows,
    clearSelection,
    isAllSelected,
    isPartiallySelected
  } = useFlows();

  const handleCreateFlow = (flowData: { name: string; description: string; status: 'Active' | 'Draft'; tier: 'Tier 1' | 'Tier 2' | 'Tier 3' }) => {
    addFlow(flowData);
  };

  const handleDeleteFlow = (id: string) => {
    deleteFlow(id);
  };

  const handleDuplicateFlow = (id: string) => {
    duplicateFlow(id);
  };

  const handleBulkDelete = () => {
    if (selectedFlows.length > 0) {
      deleteSelectedFlows();
    }
  };

  const handleMasterCheckboxChange = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllFlows();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="border-b bg-white/50 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left side - Brand */}
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-foreground">Flow Designer</h1>
          </div>

          {/* Right side - Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
                  <User className="h-5 w-5 text-stone-600" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Flows</h2>
              <p className="text-muted-foreground">
                Manage your customer experience flows and contact drivers
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Bulk Delete Button - Only show when multiple flows are selected */}
              {selectedFlows.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedFlows.length})
                </Button>
              )}
              <NewFlowDialog onCreateFlow={handleCreateFlow} />
            </div>
          </div>

          {/* Flows Table */}
          <Card>
            <CardContent>
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-3">
                  <div className="col-span-1">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300" 
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onChange={handleMasterCheckboxChange}
                    />
                  </div>
                  <div className="col-span-3">Name</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">Last Modified</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Tier</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {/* Table Rows */}
                {flows.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No flows yet. Create your first flow to get started!
                  </div>
                ) : (
                  flows.map((flow) => (
                    <div key={flow.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-b-0 hover:bg-muted/50">
                      <div className="col-span-1">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300" 
                          checked={selectedFlows.includes(flow.id)}
                          onChange={() => toggleFlowSelection(flow.id)}
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="font-medium">{flow.name}</div>
                      </div>
                      <div className="col-span-3">
                        <div className="text-sm text-muted-foreground">{flow.description}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-muted-foreground">{flow.lastModified}</div>
                      </div>
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          flow.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {flow.status}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          flow.tier === 'Tier 1' 
                            ? 'bg-blue-100 text-blue-800' 
                            : flow.tier === 'Tier 2'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {flow.tier}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log('Edit flow:', flow.id)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateFlow(flow.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('Share flow:', flow.id)}>
                              <Share className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteFlow(flow.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
