"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Plus } from "lucide-react";

// Knowledge base asset types
const KNOWLEDGE_BASE_TYPES = [
  'Article',
  'Macro', 
  'Token Point',
  'SOP',
  'Product Description Sheet',
  'PDF Material'
] as const;

type KnowledgeBaseType = typeof KNOWLEDGE_BASE_TYPES[number];

interface KnowledgeBaseAssetData {
  name: string;
  type: KnowledgeBaseType;
  isInternal: boolean;
}

interface NewKnowledgeBaseAssetDialogProps {
  onCreateAsset: (assetData: KnowledgeBaseAssetData) => Promise<void>;
}

export function NewKnowledgeBaseAssetDialog({ onCreateAsset }: NewKnowledgeBaseAssetDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<KnowledgeBaseAssetData>({
    name: '',
    type: 'Article',
    isInternal: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || isCreating) {
      return;
    }

    setIsCreating(true);
    
    try {
      await onCreateAsset(formData);
      
      // Reset form and close dialog
      setFormData({
        name: '',
        type: 'Article',
        isInternal: true
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create asset:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    if (isCreating) return; // Prevent cancel while creating
    
    // Reset form and close dialog
    setFormData({
      name: '',
      type: 'Article',
      isInternal: true
    });
    setIsCreating(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-black text-white hover:bg-gray-800"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Knowledge Base Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Knowledge Base Asset</DialogTitle>
          <DialogDescription>
            Fill in the basic details for your new knowledge base asset. You&apos;ll be able to edit the content after creation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Asset Name */}
            <div className="space-y-2">
              <Label htmlFor="asset-name">Asset Name *</Label>
              <Input
                id="asset-name"
                type="text"
                placeholder="Enter asset name..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            {/* Asset Type */}
            <div className="space-y-2">
              <Label htmlFor="asset-type">Asset Type *</Label>
              <select
                id="asset-type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as KnowledgeBaseType }))}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                {KNOWLEDGE_BASE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Usage Type */}
            <div className="space-y-3">
              <Label>Usage Type *</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="internal"
                    name="usage-type"
                    value="internal"
                    checked={formData.isInternal}
                    onChange={(e) => setFormData(prev => ({ ...prev, isInternal: e.target.checked }))}
                    className="h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <Label htmlFor="internal" className="text-sm font-normal">
                    Internal Use - For team members and internal processes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="external"
                    name="usage-type"
                    value="external"
                    checked={!formData.isInternal}
                    onChange={(e) => setFormData(prev => ({ ...prev, isInternal: !e.target.checked }))}
                    className="h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <Label htmlFor="external" className="text-sm font-normal">
                    External Use - For customers and public-facing content
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!formData.name.trim() || isCreating}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isCreating ? 'Creating...' : 'Create Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 