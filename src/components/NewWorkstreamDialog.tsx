"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, ArrowLeft, Target, ArrowDown, Activity, FileText, ChevronDown, ChevronRight, TrendingUp, BarChart3, DollarSign } from "lucide-react";
import type { Workstream } from "@/hooks/useWorkstreamsConvex";

interface NewWorkstreamDialogProps {
  onCreateWorkstream: (workstreamData: Omit<Workstream, 'id' | 'flows' | 'createdAt' | 'lastModified'>) => void;
  onUpdateWorkstream?: (id: string, workstreamData: Omit<Workstream, 'id' | 'flows' | 'createdAt' | 'lastModified'>) => void;
  editingWorkstream?: Workstream | null;
  onCancelEdit?: () => void;
}

type WorkstreamType = 'inbound' | 'outbound' | 'background' | 'blank';

interface WorkstreamFormData {
  name: string;
  description: string;
  type: WorkstreamType;
  successDefinition: string;
  volumePerMonth: number;
  successPercentage: number;
  agentsAssigned: number;
  hoursPerAgentPerMonth: number;
  loadedCostPerAgent: number;
  automationPercentage: number;
}

const workstreamTypes = [
  {
    id: 'inbound' as WorkstreamType,
    title: 'Inbound',
    description: 'Customer-initiated interactions and requests',
    icon: <ArrowDown className="h-8 w-8" />,
    color: 'border-blue-200 hover:border-blue-300 bg-blue-50/50'
  },
  {
    id: 'outbound' as WorkstreamType,
    title: 'Outbound',
    description: 'Company-initiated communications and campaigns',
    icon: <Target className="h-8 w-8" />,
    color: 'border-green-200 hover:border-green-300 bg-green-50/50'
  },
  {
    id: 'background' as WorkstreamType,
    title: 'Background',
    description: 'Internal processes with no customer interaction',
    icon: <Activity className="h-8 w-8" />,
    color: 'border-purple-200 hover:border-purple-300 bg-purple-50/50'
  },
  {
    id: 'blank' as WorkstreamType,
    title: 'Blank',
    description: 'Start from scratch with no predefined structure',
    icon: <FileText className="h-8 w-8" />,
    color: 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
  }
];

export function NewWorkstreamDialog({ 
  onCreateWorkstream, 
  onUpdateWorkstream, 
  editingWorkstream, 
  onCancelEdit 
}: NewWorkstreamDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [performanceExpanded, setPerformanceExpanded] = useState(false);
  const [economicsExpanded, setEconomicsExpanded] = useState(false);
  const [formData, setFormData] = useState<WorkstreamFormData>({
    name: '',
    description: '',
    type: 'blank',
    successDefinition: 'Task completed successfully',
    volumePerMonth: 100,
    successPercentage: 80,
    agentsAssigned: 1,
    hoursPerAgentPerMonth: 160,
    loadedCostPerAgent: 5000,
    automationPercentage: 0
  });

  const isEditing = !!editingWorkstream;

  // Initialize form with editing data and handle dialog opening
  useEffect(() => {
    if (editingWorkstream) {
      setFormData({
        name: editingWorkstream.name,
        description: editingWorkstream.description,
        type: editingWorkstream.type,
        successDefinition: editingWorkstream.successDefinition || '',
        volumePerMonth: editingWorkstream.volumePerMonth,
        successPercentage: editingWorkstream.successPercentage,
        agentsAssigned: editingWorkstream.agentsAssigned || 0,
        hoursPerAgentPerMonth: editingWorkstream.hoursPerAgentPerMonth || 0,
        loadedCostPerAgent: editingWorkstream.loadedCostPerAgent || 0,
        automationPercentage: editingWorkstream.automationPercentage || 0
      });
      setStep('form'); // Skip type selection when editing
      // When editing, open both sections for easier access
      setPerformanceExpanded(true);
      setEconomicsExpanded(true);
      setOpen(true);
    }
  }, [editingWorkstream]);

  const resetDialog = () => {
    setStep('type');
    setPerformanceExpanded(false);
    setEconomicsExpanded(false);
    setFormData({
      name: '',
      description: '',
      type: 'blank',
      successDefinition: 'Task completed successfully',
      volumePerMonth: 100,
      successPercentage: 80,
      agentsAssigned: 1,
      hoursPerAgentPerMonth: 160,
      loadedCostPerAgent: 5000,
      automationPercentage: 0
    });
  };

  const handleClose = () => {
    setOpen(false);
    resetDialog();
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (newOpen && !isEditing) {
      // Reset dialog state when opening for new workstream
      resetDialog();
    } else if (!newOpen) {
      // Handle closing dialog (X button or clicking outside)
      handleClose();
      return;
    }
    setOpen(newOpen);
  };

  const handleTypeSelect = (type: WorkstreamType) => {
    setFormData({ ...formData, type });
    setStep('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return; // Name is required
    }

    const workstreamData = {
      name: formData.name,
      description: formData.description || '',
      type: formData.type,
      successDefinition: formData.successDefinition || 'Task completed successfully',
      volumePerMonth: formData.volumePerMonth || 100,
      successPercentage: formData.successPercentage || 80,
      agentsAssigned: formData.agentsAssigned || 1,
      hoursPerAgentPerMonth: formData.hoursPerAgentPerMonth || 160,
      loadedCostPerAgent: formData.loadedCostPerAgent || 5000,
      automationPercentage: formData.automationPercentage || 0
    };

    if (isEditing && onUpdateWorkstream && editingWorkstream) {
      onUpdateWorkstream(editingWorkstream.id, workstreamData);
    } else {
      onCreateWorkstream(workstreamData);
    }

    handleClose();
  };

  const renderTypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Workstream Type</h3>
        <p className="text-sm text-gray-500">Select the type that best describes your workstream</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {workstreamTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all duration-200 ${type.color} ${
              formData.type === type.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleTypeSelect(type.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="text-gray-600">
                  {type.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{type.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm">{type.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Information - Required */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Workstream Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Customer Onboarding"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="text-foreground"
            autoFocus={false}
            autoComplete="off"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what this workstream does..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="text-foreground"
            rows={3}
          />
        </div>
      </div>

      <Separator />

      {/* Performance Metrics Section */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setPerformanceExpanded(!performanceExpanded)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {performanceExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <BarChart3 className="h-4 w-4" />
          <span>Performance Metrics</span>
        </button>
        
        {performanceExpanded && (
          <div className="space-y-4 pl-6 border-l-2 border-gray-100">
            <div className="space-y-2">
              <Label htmlFor="successDefinition">Success Definition</Label>
              <Input
                id="successDefinition"
                placeholder="e.g., Lit Qualified = Yes"
                value={formData.successDefinition}
                onChange={(e) => setFormData({ ...formData, successDefinition: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volumePerMonth" className="flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3 text-blue-500" />
                  <span>Volume / month</span>
                </Label>
                <Input
                  id="volumePerMonth"
                  type="number"
                  placeholder="1400"
                  value={formData.volumePerMonth !== undefined ? formData.volumePerMonth.toString() : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseInt(value);
                    setFormData({ ...formData, volumePerMonth: isNaN(numValue) ? 0 : numValue });
                  }}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="successPercentage" className="flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>Success Rate (%)</span>
                </Label>
                <Input
                  id="successPercentage"
                  type="number"
                  placeholder="85"
                  value={formData.successPercentage !== undefined ? formData.successPercentage.toString() : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseInt(value);
                    setFormData({ ...formData, successPercentage: isNaN(numValue) ? 0 : numValue });
                  }}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Economics Section */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setEconomicsExpanded(!economicsExpanded)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {economicsExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <DollarSign className="h-4 w-4" />
          <span>Economics</span>
        </button>
        
        {economicsExpanded && (
          <div className="space-y-4 pl-6 border-l-2 border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agentsAssigned">Agents Assigned</Label>
                <Input
                  id="agentsAssigned"
                  type="number"
                  placeholder="5"
                  value={formData.agentsAssigned !== undefined ? formData.agentsAssigned.toString() : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseInt(value);
                    setFormData({ ...formData, agentsAssigned: isNaN(numValue) ? 0 : numValue });
                  }}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hoursPerAgentPerMonth">Hours per Agent / month</Label>
                <Input
                  id="hoursPerAgentPerMonth"
                  type="number"
                  placeholder="160"
                  value={formData.hoursPerAgentPerMonth !== undefined ? formData.hoursPerAgentPerMonth.toString() : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseInt(value);
                    setFormData({ ...formData, hoursPerAgentPerMonth: isNaN(numValue) ? 0 : numValue });
                  }}
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loadedCostPerAgent">Loaded Cost per Agent ($)</Label>
                <Input
                  id="loadedCostPerAgent"
                  type="number"
                  placeholder="1000"
                  value={formData.loadedCostPerAgent !== undefined ? formData.loadedCostPerAgent.toString() : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseInt(value);
                    setFormData({ ...formData, loadedCostPerAgent: isNaN(numValue) ? 0 : numValue });
                  }}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="automationPercentage">Automation (%)</Label>
                <Input
                  id="automationPercentage"
                  type="number"
                  placeholder="0"
                  value={formData.automationPercentage !== undefined ? formData.automationPercentage.toString() : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseInt(value);
                    setFormData({ ...formData, automationPercentage: isNaN(numValue) ? 0 : numValue });
                  }}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <DialogFooter className="pt-4">
        {!isEditing && step === 'form' && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep('type')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update Workstream' : 'Create Workstream'}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <Dialog open={open || !!editingWorkstream} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Workstream
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Workstream' : step === 'type' ? 'Create New Workstream' : 'Workstream Details'}
          </DialogTitle>
          {step === 'form' && (
            <DialogDescription>
              {isEditing 
                ? 'Update the workstream information and metrics.' 
                : 'Create a new workstream to represent a business process flow.'
              }
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className={step === 'type' ? 'py-4' : ''}>
          {step === 'type' ? renderTypeSelection() : renderForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
}