"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, MoreHorizontal, Trash2, Copy, Share, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useContactDrivers } from "@/hooks/useContactDrivers";
import { NewContactDriverDialog } from "@/components/NewContactDriverDialog";
import { useState } from "react";

export default function Home() {
  const {
    contactDrivers,
    selectedDrivers,
    addContactDriver,
    deleteContactDriver,
    deleteSelectedDrivers,
    duplicateContactDriver,
    toggleDriverSelection,
    selectAllDrivers,
    clearSelection,
    isAllSelected,
    isPartiallySelected
  } = useContactDrivers();

  const [expandedDrivers, setExpandedDrivers] = useState<string[]>([]);

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

  const toggleDriverExpansion = (driverId: string) => {
    setExpandedDrivers(prev => 
      prev.includes(driverId)
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
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
              <h2 className="text-2xl font-semibold tracking-tight">Contact Drivers</h2>
              <p className="text-muted-foreground">
                Manage customer contact drivers and their associated flows
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Bulk Delete Button - Only show when multiple drivers are selected */}
              {selectedDrivers.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedDrivers.length})
                </Button>
              )}
              <NewContactDriverDialog onCreateContactDriver={handleCreateContactDriver} />
            </div>
          </div>

          {/* Contact Drivers Table */}
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
                  <div className="col-span-1"></div> {/* Expand/Collapse */}
                  <div className="col-span-4">Contact Driver</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-1">Last Modified</div>
                  <div className="col-span-1">Tier</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {/* Table Rows */}
                {contactDrivers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No contact drivers yet. Create your first contact driver to get started!
                  </div>
                ) : (
                  contactDrivers.map((driver) => (
                    <div key={driver.id} className="space-y-2">
                      {/* Contact Driver Row */}
                      <div className="grid grid-cols-12 gap-4 items-center py-3 border-b hover:bg-muted/50">
                        <div className="col-span-1">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300" 
                            checked={selectedDrivers.includes(driver.id)}
                            onChange={() => toggleDriverSelection(driver.id)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleDriverExpansion(driver.id)}
                          >
                            {expandedDrivers.includes(driver.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="col-span-4">
                          <div className="font-medium">{driver.name}</div>
                        </div>
                        <div className="col-span-3">
                          <div className="text-sm text-muted-foreground">{driver.description}</div>
                        </div>
                        <div className="col-span-1">
                          <div className="text-sm text-muted-foreground">{driver.lastModified}</div>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => console.log('Edit driver:', driver.id)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateDriver(driver.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log('Share driver:', driver.id)}>
                                <Share className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteDriver(driver.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Nested Flows - Show when expanded */}
                      {expandedDrivers.includes(driver.id) && (
                        <div className="ml-8 space-y-2">
                          {driver.flows.length === 0 ? (
                            <div className="text-sm text-muted-foreground py-2 flex items-center justify-between">
                              <span>No flows yet.</span>
                              <Button variant="outline" size="sm">
                                <Plus className="mr-2 h-3 w-3" />
                                Add Flow
                              </Button>
                            </div>
                          ) : (
                            <>
                              {/* Current State Flows */}
                              {driver.flows.filter(flow => flow.type === 'current').length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Current State Flows
                                  </div>
                                  {driver.flows.filter(flow => flow.type === 'current').map(flow => (
                                    <div key={flow.id} className="grid grid-cols-10 gap-4 items-center py-2 pl-4 bg-green-50 rounded-md text-sm">
                                      <div className="col-span-4 font-medium text-green-800">{flow.name}</div>
                                      <div className="col-span-4 text-green-700">{flow.description}</div>
                                      <div className="col-span-1 text-green-600">{flow.lastModified}</div>
                                      <div className="col-span-1">
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Future State Flows */}
                              {driver.flows.filter(flow => flow.type === 'future').length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Future State Flows
                                  </div>
                                  {driver.flows.filter(flow => flow.type === 'future').map(flow => (
                                    <div key={flow.id} className="grid grid-cols-10 gap-4 items-center py-2 pl-4 bg-blue-50 rounded-md text-sm">
                                      <div className="col-span-4 font-medium text-blue-800">{flow.name}</div>
                                      <div className="col-span-4 text-blue-700">{flow.description}</div>
                                      <div className="col-span-1 text-blue-600">{flow.lastModified}</div>
                                      <div className="col-span-1">
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add Flow Button */}
                              <div className="pt-2">
                                <Button variant="outline" size="sm">
                                  <Plus className="mr-2 h-3 w-3" />
                                  Add Flow
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
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
