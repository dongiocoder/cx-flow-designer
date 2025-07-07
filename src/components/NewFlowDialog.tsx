"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface NewFlowDialogProps {
  onCreateFlow: (flowData: { name: string; description: string; status: 'Active' | 'Draft'; tier: 'Tier 1' | 'Tier 2' | 'Tier 3' }) => void;
}

export function NewFlowDialog({ onCreateFlow }: NewFlowDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Draft' as 'Active' | 'Draft',
    tier: 'Tier 1' as 'Tier 1' | 'Tier 2' | 'Tier 3'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onCreateFlow(formData);
      setFormData({ name: '', description: '', status: 'Draft', tier: 'Tier 1' });
      setOpen(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Flow
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Flow</DialogTitle>
            <DialogDescription>
              Create a new customer experience flow to map contact drivers and intents.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Flow Name</Label>
              <Input
                id="name"
                placeholder="e.g., Customer Support Flow"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of this flow..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Draft' }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tier">Tier</Label>
              <select
                id="tier"
                value={formData.tier}
                onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as 'Tier 1' | 'Tier 2' | 'Tier 3' }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Tier 1">Tier 1</option>
                <option value="Tier 2">Tier 2</option>
                <option value="Tier 3">Tier 3</option>
              </select>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Flow</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 