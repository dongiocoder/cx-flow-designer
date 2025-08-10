"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ContactDriver, Campaign, Process } from "@/hooks/useWorkstreams";

interface SubEntityDialogProps {
  subEntityType: 'contact-drivers' | 'campaigns' | 'processes';
  onCreateSubEntity: (subEntityData: any) => void;
  onUpdateSubEntity?: (id: string, subEntityData: any) => void;
  editingSubEntity?: ContactDriver | Campaign | Process | null;
  onCancelEdit?: () => void;
}

export function SubEntityDialog({
  subEntityType,
  onCreateSubEntity,
  onUpdateSubEntity,
  editingSubEntity,
  onCancelEdit,
}: SubEntityDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    volumePerMonth: 0,
    avgHandleTime: 0,
    csat: 0,
    qaScore: 98,
    containmentPercentage: 60,
    containmentVolume: 0,
    phoneVolume: 0,
    emailVolume: 0,
    chatVolume: 0,
    otherVolume: 0,
  });

  const isEditing = !!editingSubEntity;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (editingSubEntity) {
      setFormData({
        name: editingSubEntity.name,
        description: editingSubEntity.description,
        volumePerMonth: editingSubEntity.volumePerMonth,
        avgHandleTime: editingSubEntity.avgHandleTime,
        csat: editingSubEntity.csat,
        qaScore: editingSubEntity.qaScore,
        containmentPercentage: editingSubEntity.containmentPercentage,
        containmentVolume: editingSubEntity.containmentVolume,
        phoneVolume: editingSubEntity.phoneVolume,
        emailVolume: editingSubEntity.emailVolume,
        chatVolume: editingSubEntity.chatVolume,
        otherVolume: editingSubEntity.otherVolume,
      });
      setOpen(true);
    }
  }, [editingSubEntity]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      volumePerMonth: 0,
      avgHandleTime: 0,
      csat: 0,
      qaScore: 98,
      containmentPercentage: 60,
      containmentVolume: 0,
      phoneVolume: 0,
      emailVolume: 0,
      chatVolume: 0,
      otherVolume: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate containment volume if not set
    const finalData = {
      ...formData,
      containmentVolume: formData.containmentVolume || Math.round(formData.volumePerMonth * (formData.containmentPercentage / 100)),
    };

    if (isEditing && editingSubEntity && onUpdateSubEntity) {
      onUpdateSubEntity(editingSubEntity.id, finalData);
      if (onCancelEdit) onCancelEdit();
    } else {
      onCreateSubEntity(finalData);
    }
    
    setOpen(false);
    resetForm();
  };

  const handleCancel = () => {
    setOpen(false);
    resetForm();
    if (onCancelEdit) onCancelEdit();
  };

  const getDisplayName = () => {
    switch (subEntityType) {
      case 'contact-drivers':
        return 'Contact Driver';
      case 'campaigns':
        return 'Campaign';
      case 'processes':
        return 'Process';
      default:
        return 'Item';
    }
  };

  const getMetricLabels = () => {
    switch (subEntityType) {
      case 'contact-drivers':
        return {
          containment: 'AI Containment',
          containmentDesc: 'Percentage of cases resolved by AI',
          avgTime: 'Avg Handle Time (minutes)',
          satisfaction: 'CSAT (%)',
        };
      case 'campaigns':
        return {
          containment: 'Automation Rate',
          containmentDesc: 'Percentage of automated campaign actions',
          avgTime: 'Avg Campaign Duration (minutes)',
          satisfaction: 'Conversion Rate (%)',
        };
      case 'processes':
        return {
          containment: 'Process Automation',
          containmentDesc: 'Percentage of automated process steps',
          avgTime: 'Avg Processing Time (minutes)',
          satisfaction: 'Internal Satisfaction (%)',
        };
      default:
        return {
          containment: 'Automation',
          containmentDesc: 'Percentage automated',
          avgTime: 'Avg Time (minutes)',
          satisfaction: 'Satisfaction (%)',
        };
    }
  };

  const displayName = getDisplayName();
  const labels = getMetricLabels();

  return (
    <Dialog open={isEditing || open} onOpenChange={isEditing ? handleCancel : setOpen}>
      {!isEditing && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New {displayName}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${displayName}` : `Create New ${displayName}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Update the ${displayName.toLowerCase()} details and metrics.`
              : `Add a new ${displayName.toLowerCase()} with performance metrics and volume data.`
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3 min-h-[60px]"
                  required
                />
              </div>
            </div>

            {/* KPIs Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 border-t pt-4">Key Performance Indicators</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="avgHandleTime" className="text-right text-xs">
                    {labels.avgTime}
                  </Label>
                  <Input
                    id="avgHandleTime"
                    type="number"
                    step="0.1"
                    value={formData.avgHandleTime}
                    onChange={(e) => setFormData({ ...formData, avgHandleTime: parseFloat(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="csat" className="text-right text-xs">
                    {labels.satisfaction}
                  </Label>
                  <Input
                    id="csat"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.csat}
                    onChange={(e) => setFormData({ ...formData, csat: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="volumePerMonth" className="text-right text-xs">
                    Volume/Month
                  </Label>
                  <Input
                    id="volumePerMonth"
                    type="number"
                    value={formData.volumePerMonth}
                    onChange={(e) => setFormData({ ...formData, volumePerMonth: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="qaScore" className="text-right text-xs">
                    QA Score (%)
                  </Label>
                  <Input
                    id="qaScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.qaScore}
                    onChange={(e) => setFormData({ ...formData, qaScore: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
              </div>
            </div>

            {/* Automation/Containment Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 border-t pt-4">{labels.containment}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="containmentPercentage" className="text-right text-xs">
                    Rate (%)
                  </Label>
                  <Input
                    id="containmentPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.containmentPercentage}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      containmentPercentage: parseInt(e.target.value) || 0,
                      containmentVolume: Math.round(formData.volumePerMonth * (parseInt(e.target.value) || 0) / 100)
                    })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="containmentVolume" className="text-right text-xs">
                    Volume
                  </Label>
                  <Input
                    id="containmentVolume"
                    type="number"
                    value={formData.containmentVolume}
                    onChange={(e) => setFormData({ ...formData, containmentVolume: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
              </div>
            </div>

            {/* Channel Breakdown */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 border-t pt-4">Channel Volume Breakdown</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="phoneVolume" className="text-right text-xs">
                    Phone
                  </Label>
                  <Input
                    id="phoneVolume"
                    type="number"
                    value={formData.phoneVolume}
                    onChange={(e) => setFormData({ ...formData, phoneVolume: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="emailVolume" className="text-right text-xs">
                    Email
                  </Label>
                  <Input
                    id="emailVolume"
                    type="number"
                    value={formData.emailVolume}
                    onChange={(e) => setFormData({ ...formData, emailVolume: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="chatVolume" className="text-right text-xs">
                    Chat
                  </Label>
                  <Input
                    id="chatVolume"
                    type="number"
                    value={formData.chatVolume}
                    onChange={(e) => setFormData({ ...formData, chatVolume: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="otherVolume" className="text-right text-xs">
                    Other
                  </Label>
                  <Input
                    id="otherVolume"
                    type="number"
                    value={formData.otherVolume}
                    onChange={(e) => setFormData({ ...formData, otherVolume: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? `Update ${displayName}` : `Create ${displayName}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
