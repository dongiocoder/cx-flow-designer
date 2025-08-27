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
import { ContactDriver, Campaign, Process, FlowEntity } from "@/hooks/useWorkstreams";

interface SubEntityDialogProps {
  subEntityType: 'contact-drivers' | 'campaigns' | 'processes' | 'flows';
  onCreateSubEntity: (subEntityData: Omit<ContactDriver | Campaign | Process | FlowEntity, 'id' | 'flows' | 'lastModified' | 'createdAt'>) => void;
  onUpdateSubEntity?: (id: string, subEntityData: Omit<ContactDriver | Campaign | Process | FlowEntity, 'id' | 'flows' | 'lastModified' | 'createdAt'>) => void;
  editingSubEntity?: ContactDriver | Campaign | Process | FlowEntity | null;
  onCancelEdit?: () => void;
  isMetricsMode?: boolean; // New prop to distinguish between basic creation and metrics editing
}

export function SubEntityDialog({
  subEntityType,
  onCreateSubEntity,
  onUpdateSubEntity,
  editingSubEntity,
  onCancelEdit,
  isMetricsMode = false,
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
    if (isMetricsMode) {
      // In metrics mode, only reset metrics, keep name and description
      setFormData(prev => ({
        ...prev,
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
      }));
    } else {
      // In creation mode, reset everything to defaults
      setFormData({
        name: "",
        description: "",
        volumePerMonth: 0,
        avgHandleTime: 0,
        csat: 85,
        qaScore: 95,
        containmentPercentage: 70,
        containmentVolume: 0,
        phoneVolume: 0,
        emailVolume: 0,
        chatVolume: 0,
        otherVolume: 0,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      return;
    }
    
    let finalData;
    
    if (isMetricsMode || (isEditing && editingSubEntity)) {
      // Full metrics data for metrics mode or editing
      finalData = {
        ...formData,
        containmentVolume: formData.containmentVolume || Math.round(formData.volumePerMonth * (formData.containmentPercentage / 100)),
      };
    } else {
      // Minimal data for new entity creation
      finalData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        // Set reasonable defaults for metrics
        volumePerMonth: 0,
        avgHandleTime: 0,
        csat: 85,
        qaScore: 95,
        containmentPercentage: 70,
        containmentVolume: 0,
        phoneVolume: 0,
        emailVolume: 0,
        chatVolume: 0,
        otherVolume: 0,
      };
    }

    try {
      if (isEditing && editingSubEntity && onUpdateSubEntity) {
        onUpdateSubEntity(editingSubEntity.id, finalData);
        if (onCancelEdit) onCancelEdit();
      } else {
        onCreateSubEntity(finalData);
      }
      
      // Close dialog and reset form
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving sub-entity:', error);
      // Don't close the dialog if there's an error
    }
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
      case 'flows':
        return 'Flow';
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
      case 'flows':
        return {
          containment: 'Flow Automation',
          containmentDesc: 'Percentage of automated flow steps',
          avgTime: 'Avg Flow Time (minutes)',
          satisfaction: 'Flow Success (%)',
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

  const getPlaceholderName = () => {
    switch (subEntityType) {
      case 'contact-drivers':
        return 'Account Setup, Password Reset, Billing Question';
      case 'campaigns':
        return 'Summer Sale, Product Launch, Re-engagement';
      case 'processes':
        return 'Employee Onboarding, Expense Processing, Compliance Check';
      case 'flows':
        return 'User Registration, Data Processing, Report Generation';
      default:
        return 'Enter a descriptive name';
    }
  };

  const displayName = getDisplayName();
  const labels = getMetricLabels();

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (isEditing) {
      // For editing mode, only allow closing
      if (!newOpen) {
        handleCancel();
      }
    } else {
      // For normal creation mode
      setOpen(newOpen);
    }
  };

  return (
    <Dialog open={isEditing || open} onOpenChange={handleDialogOpenChange}>
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
            {isMetricsMode ? `Edit ${displayName} Metrics` : 
             isEditing ? `Edit ${displayName}` : 
             `Create New ${displayName}`}
          </DialogTitle>
          <DialogDescription>
            {isMetricsMode 
              ? `Update performance metrics and volume data for this ${displayName.toLowerCase()}.`
              : isEditing 
              ? `Update the ${displayName.toLowerCase()} details and metrics.`
              : `Give your ${displayName.toLowerCase()} a name and description. You can add performance metrics later from the menu.`
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
                  placeholder={`e.g., ${getPlaceholderName()}`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  autoFocus={!isEditing}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder={`Describe what this ${displayName.toLowerCase()} handles...`}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3 min-h-[60px]"
                  rows={3}
                />
              </div>
            </div>

            {/* Show metrics only in metrics mode or when editing */}
            {(isMetricsMode || isEditing) && (
              <>
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
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isMetricsMode ? `Save Metrics` : 
               isEditing ? `Update ${displayName}` : 
               `Create ${displayName}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
