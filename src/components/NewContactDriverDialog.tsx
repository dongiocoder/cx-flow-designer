"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Phone, Mail, MessageCircle, BarChart3 } from "lucide-react";

interface ContactDriverKPIs {
  avgHandleTime?: number;
  csat?: number;
  qaScore?: number;
  volumePerMonth?: number;
  containmentPercentage?: number;
  containmentVolume?: number;
}

interface ContactVolumes {
  phoneVolume?: number;
  emailVolume?: number;
  chatVolume?: number;
  otherVolume?: number;
}

interface NewContactDriverDialogProps {
  onCreateContactDriver: (driverData: { 
    name: string; 
    description: string;
    kpis?: ContactDriverKPIs;
    volumes?: ContactVolumes;
  }) => void;
  onUpdateContactDriver?: (id: string, driverData: { 
    name: string; 
    description: string;
    kpis?: ContactDriverKPIs;
    volumes?: ContactVolumes;
  }) => void;
  editingDriver?: {
    id: string;
    name: string;
    description: string;
    avgHandleTime: number;
    csat: number;
    qaScore: number;
    volumePerMonth: number;
    containmentPercentage: number;
    containmentVolume: number;
    phoneVolume: number;
    emailVolume: number;
    chatVolume: number;
    otherVolume: number;
  } | null;
  onCancelEdit?: () => void;
}

export function NewContactDriverDialog({ 
  onCreateContactDriver, 
  onUpdateContactDriver, 
  editingDriver, 
  onCancelEdit 
}: NewContactDriverDialogProps) {
  const [open, setOpen] = useState(false);
  const [showKPIs, setShowKPIs] = useState(false);
  const [showVolumes, setShowVolumes] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = !!editingDriver;
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [kpis, setKPIs] = useState<ContactDriverKPIs>({
    avgHandleTime: undefined,
    csat: undefined,
    qaScore: undefined,
    volumePerMonth: undefined,
    containmentPercentage: undefined,
    containmentVolume: undefined
  });
  const [volumes, setVolumes] = useState<ContactVolumes>({
    phoneVolume: undefined,
    emailVolume: undefined,
    chatVolume: undefined,
    otherVolume: undefined
  });

  // Handle editing mode
  useEffect(() => {
    if (editingDriver) {
      setOpen(true);
      setFormData({
        name: editingDriver.name,
        description: editingDriver.description
      });
      setKPIs({
        avgHandleTime: editingDriver.avgHandleTime || undefined,
        csat: editingDriver.csat || undefined,
        qaScore: editingDriver.qaScore || undefined,
        volumePerMonth: editingDriver.volumePerMonth || undefined,
        containmentPercentage: editingDriver.containmentPercentage || undefined,
        containmentVolume: editingDriver.containmentVolume || undefined
      });
      setVolumes({
        phoneVolume: editingDriver.phoneVolume || undefined,
        emailVolume: editingDriver.emailVolume || undefined,
        chatVolume: editingDriver.chatVolume || undefined,
        otherVolume: editingDriver.otherVolume || undefined
      });
      // Keep sections closed by default
      setShowKPIs(false);
      setShowVolumes(false);
    }
  }, [editingDriver]);

  // Clear text selection when dialog opens in edit mode
  useEffect(() => {
    if (open && isEditing) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        // Clear any text selection in the entire document
        window.getSelection()?.removeAllRanges();
        
        // Also blur any focused elements
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      });
    }
  }, [open, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      // Only include sections if at least one field is filled
      const hasKPIs = Object.values(kpis).some(value => value !== undefined && value !== '');
      const hasVolumes = Object.values(volumes).some(value => value !== undefined && value !== '');
      
      const data = {
        ...formData,
        kpis: hasKPIs ? kpis : undefined,
        volumes: hasVolumes ? volumes : undefined
      };

      if (isEditing && editingDriver && onUpdateContactDriver) {
        onUpdateContactDriver(editingDriver.id, data);
      } else {
        onCreateContactDriver(data);
      }
      
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setKPIs({
      avgHandleTime: undefined,
      csat: undefined,
      qaScore: undefined,
      volumePerMonth: undefined,
      containmentPercentage: undefined,
      containmentVolume: undefined
    });
    setVolumes({
      phoneVolume: undefined,
      emailVolume: undefined,
      chatVolume: undefined,
      otherVolume: undefined
    });
    setShowKPIs(false);
    setShowVolumes(false);
    setOpen(false);
    
    if (isEditing && onCancelEdit) {
      onCancelEdit();
    }
  };

  const updateKPI = (key: keyof ContactDriverKPIs, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setKPIs(prev => ({ ...prev, [key]: numValue }));
    
    // Auto-calculate containment volume if percentage and total volume are available
    if (key === 'containmentPercentage' && kpis.volumePerMonth) {
      const newVolume = numValue ? Math.round((numValue / 100) * kpis.volumePerMonth) : undefined;
      setKPIs(prev => ({ ...prev, containmentVolume: newVolume }));
    } else if (key === 'volumePerMonth') {
      if (kpis.containmentPercentage) {
        const newVolume = numValue ? Math.round((kpis.containmentPercentage / 100) * numValue) : undefined;
        setKPIs(prev => ({ ...prev, containmentVolume: newVolume }));
      }
      
      // Auto-update contact volumes based on default percentages
      if (numValue) {
        setVolumes(prev => ({
          ...prev,
          phoneVolume: prev.phoneVolume || Math.round(numValue * 0.6),
          emailVolume: prev.emailVolume || Math.round(numValue * 0.3),
          chatVolume: prev.chatVolume || Math.round(numValue * 0.1),
          otherVolume: prev.otherVolume || 0
        }));
      }
    }
  };

  const updateVolume = (key: keyof ContactVolumes, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setVolumes(prev => ({ ...prev, [key]: numValue }));
    
    // Auto-calculate total volume for KPIs
    const newVolumes = { ...volumes, [key]: numValue };
    const total = (newVolumes.phoneVolume || 0) + (newVolumes.emailVolume || 0) + 
                 (newVolumes.chatVolume || 0) + (newVolumes.otherVolume || 0);
    
    if (total > 0) {
      setKPIs(prev => ({ ...prev, volumePerMonth: total }));
    }
  };

  return (
    <>
      {!isEditing && (
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Contact Driver
        </Button>
      )}
      
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Contact Driver' : 'Create New Contact Driver'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the contact driver information and metrics.' 
                : 'Create a new contact driver to represent why customers reach out to your organization.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information - Required */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Contact Driver Name *</Label>
                <Input
                  ref={nameInputRef}
                  id="name"
                  placeholder="e.g., Account Access Issues"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus={false}
                  className="text-foreground"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the customer situation or reason for contact..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="text-foreground"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* KPIs Section */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowKPIs(!showKPIs)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {showKPIs ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <BarChart3 className="h-4 w-4" />
                <span>Key Performance Indicators</span>
              </button>
              
              {showKPIs && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="avgHandleTime" className="flex items-center space-x-2">
                        <TrendingDown className="h-3 w-3 text-green-500" />
                        <span>Avg Handle Time (min)</span>
                      </Label>
                      <Input
                        id="avgHandleTime"
                        type="number"
                        step="0.1"
                        placeholder="8.5"
                        value={kpis.avgHandleTime || ''}
                        onChange={(e) => updateKPI('avgHandleTime', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="csat" className="flex items-center space-x-2">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span>CSAT (%)</span>
                      </Label>
                      <Input
                        id="csat"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="92"
                        value={kpis.csat || ''}
                        onChange={(e) => updateKPI('csat', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="qaScore" className="flex items-center space-x-2">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span>QA Score (%)</span>
                      </Label>
                      <Input
                        id="qaScore"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="98"
                        value={kpis.qaScore || ''}
                        onChange={(e) => updateKPI('qaScore', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="volumePerMonth" className="flex items-center space-x-2">
                        <TrendingUp className="h-3 w-3 text-blue-500" />
                        <span>Volume / month</span>
                      </Label>
                      <Input
                        id="volumePerMonth"
                        type="number"
                        placeholder="1250"
                        value={kpis.volumePerMonth || ''}
                        onChange={(e) => updateKPI('volumePerMonth', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="containmentPercentage">Containment (%)</Label>
                      <Input
                        id="containmentPercentage"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="78"
                        value={kpis.containmentPercentage || ''}
                        onChange={(e) => updateKPI('containmentPercentage', e.target.value)}
                      />
                    </div>
                    
                    {kpis.containmentVolume && (
                      <div className="space-y-2">
                        <Label htmlFor="containmentVolume">Containment Volume (Auto-calculated)</Label>
                        <Input
                          id="containmentVolume"
                          type="number"
                          value={kpis.containmentVolume}
                          onChange={(e) => updateKPI('containmentVolume', e.target.value)}
                          className="bg-gray-50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Contact Volume Section */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowVolumes(!showVolumes)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {showVolumes ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Phone className="h-4 w-4" />
                <span>Contact Volume</span>
              </button>
              
              {showVolumes && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneVolume" className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-gray-600" />
                        <span>Phone</span>
                      </Label>
                      <Input
                        id="phoneVolume"
                        type="number"
                        placeholder="750"
                        value={volumes.phoneVolume || ''}
                        onChange={(e) => updateVolume('phoneVolume', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emailVolume" className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 text-gray-600" />
                        <span>Email</span>
                      </Label>
                      <Input
                        id="emailVolume"
                        type="number"
                        placeholder="375"
                        value={volumes.emailVolume || ''}
                        onChange={(e) => updateVolume('emailVolume', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chatVolume" className="flex items-center space-x-2">
                        <MessageCircle className="h-3 w-3 text-gray-600" />
                        <span>Chat</span>
                      </Label>
                      <Input
                        id="chatVolume"
                        type="number"
                        placeholder="125"
                        value={volumes.chatVolume || ''}
                        onChange={(e) => updateVolume('chatVolume', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="otherVolume" className="flex items-center space-x-2">
                        <MessageCircle className="h-3 w-3 text-gray-600" />
                        <span>Other</span>
                      </Label>
                      <Input
                        id="otherVolume"
                        type="number"
                        placeholder="0"
                        value={volumes.otherVolume || ''}
                        onChange={(e) => updateVolume('otherVolume', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Contact volumes will auto-calculate monthly total in KPIs. Individual volumes can be customized.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Contact Driver' : 'Create Contact Driver'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 