"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreHorizontal, Trash2, Copy, Upload } from "lucide-react";
import { NewKnowledgeBaseAssetDialog } from "@/components/NewKnowledgeBaseAssetDialog";
import { useKnowledgeBaseAssets, type KnowledgeBaseAsset } from "@/hooks/useKnowledgeBaseAssets";

interface KnowledgeBaseProps {
  onCreateAsset?: (asset: KnowledgeBaseAsset) => void;
  onEditAsset?: (assetId: string) => void;
}

export function KnowledgeBase({ onCreateAsset, onEditAsset }: KnowledgeBaseProps) {
  const {
    knowledgeBaseAssets,
    selectedAssets,
    isLoading,
    addKnowledgeBaseAsset,
    updateKnowledgeBaseAsset,
    deleteKnowledgeBaseAsset,
    deleteSelectedAssets,
    duplicateKnowledgeBaseAsset,
    toggleAssetSelection,
    selectAllAssets,
    clearSelection,
    isAllSelected,
    isPartiallySelected
  } = useKnowledgeBaseAssets();

  const handleAssetRowClick = (assetId: string) => {
    // Disable row click if any checkboxes are selected
    if (selectedAssets.length > 0) {
      return;
    }
    onEditAsset?.(assetId);
  };

  const handleMasterCheckboxChange = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllAssets();
    }
  };

  const handleDuplicateAsset = (assetId: string) => {
    duplicateKnowledgeBaseAsset(assetId);
  };

  const handleDeleteAsset = (assetId: string) => {
    deleteKnowledgeBaseAsset(assetId);
  };

  const handleBulkDelete = () => {
    deleteSelectedAssets();
  };

  const handleCreateAsset = (assetData: {
    name: string;
    type: any;
    isInternal: boolean;
  }) => {
    const newAsset = addKnowledgeBaseAsset(assetData);
    onCreateAsset?.(newAsset);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex-1 overflow-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading knowledge base assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex-1 overflow-auto">
      <div className="space-y-6">
        {/* Bulk Action Bar - Only show when assets are selected */}
        {selectedAssets.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-sm font-medium text-blue-900">
                {selectedAssets.length} asset{selectedAssets.length === 1 ? '' : 's'} selected
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
            <h2 className="text-3xl font-bold tracking-tight">Knowledge Bases</h2>
            <p className="text-muted-foreground mt-1">
              Manage all your knowledge base assets including macros, articles, token points, SOPs, and materials
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Import Data Button */}
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import data
            </Button>
            {/* New Knowledge Base Asset Dialog */}
            <NewKnowledgeBaseAssetDialog 
              onCreateAsset={handleCreateAsset}
            />
          </div>
        </div>

        {/* Knowledge Base Assets Table */}
        <Card className="shadow-md">
          <CardContent>
            <div>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-3 mb-0">
                <div className="col-span-4">
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
                    <span>Name / Title</span>
                  </div>
                </div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Date Created</div>
                <div className="col-span-2">Last Modified</div>
                <div className="col-span-1">Usage</div>
                <div className="col-span-1"></div>
              </div>

              {/* Table Rows */}
              {knowledgeBaseAssets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No knowledge base assets yet. Create your first knowledge base asset to get started!
                </div>
              ) : (
                knowledgeBaseAssets.map((asset) => {
                  const isRowSelected = selectedAssets.includes(asset.id);
                  
                  return (
                    <div 
                      key={asset.id} 
                      className={`grid grid-cols-12 gap-4 items-center py-4 border-b border-t-0 transition-all duration-200 ${
                        selectedAssets.length === 0 
                          ? 'hover:bg-muted/50 hover:shadow-sm cursor-pointer' 
                          : isRowSelected 
                            ? 'bg-blue-50/80 shadow-sm' 
                            : 'hover:bg-muted/30'
                      }`}
                      onClick={() => handleAssetRowClick(asset.id)}
                    >
                      <div className="col-span-4">
                        <div className="flex items-center space-x-3">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 flex-shrink-0" 
                            checked={selectedAssets.includes(asset.id)}
                            onChange={() => toggleAssetSelection(asset.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{asset.name}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                          {asset.type}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(asset.dateCreated).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(asset.lastModified).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          asset.isInternal 
                            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' 
                            : 'bg-green-50 text-green-800 border border-green-200'
                        }`}>
                          {asset.isInternal ? 'Internal' : 'External'}
                        </span>
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
                              handleDuplicateAsset(asset.id);
                            }}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAsset(asset.id);
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
  );
} 