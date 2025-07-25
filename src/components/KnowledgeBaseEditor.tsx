"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";

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

interface KnowledgeBaseAsset {
  id: string;
  name: string;
  type: KnowledgeBaseType;
  content: string;
  dateCreated: string;
  lastModified: string;
  isInternal: boolean;
}

interface KnowledgeBaseEditorProps {
  asset: KnowledgeBaseAsset;
  onBack: () => void;
  onSave: (assetId: string, updates: Partial<KnowledgeBaseAsset>) => void;
}

export function KnowledgeBaseEditor({ asset, onBack, onSave }: KnowledgeBaseEditorProps) {
  const [assetName, setAssetName] = useState(asset.name);
  const [content, setContent] = useState(asset.content || '');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditingAssetName, setIsEditingAssetName] = useState(false);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedInitialData = useRef(false);

  // Load initial data
  useEffect(() => {
    setAssetName(asset.name);
    setContent(asset.content || '');
    setLastSaved(asset.lastModified ? new Date(asset.lastModified) : null);
    setIsDirty(false);
    hasLoadedInitialData.current = true;
  }, [asset]);

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    if (!hasLoadedInitialData.current) {
      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      onSave(asset.id, {
        name: assetName,
        content: content,
        lastModified: new Date().toISOString()
      });
      setLastSaved(new Date());
      setIsDirty(false);
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [asset.id, assetName, content, onSave]);

  // Track changes to content and name
  useEffect(() => {
    if (hasLoadedInitialData.current && (content !== asset.content || assetName !== asset.name)) {
      setIsDirty(true);
      triggerAutoSave();
    }
  }, [content, assetName, asset.content, asset.name, triggerAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleAssetNameChange = (newName: string) => {
    setAssetName(newName);
  };

  const handleAssetNameBlur = () => {
    setIsEditingAssetName(false);
  };

  const handleAssetNameClick = () => {
    setIsEditingAssetName(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleManualSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    onSave(asset.id, {
      name: assetName,
      content: content,
      lastModified: new Date().toISOString()
    });
    setLastSaved(new Date());
    setIsDirty(false);
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }
  };

  const getTypeColor = (type: KnowledgeBaseType) => {
    switch (type) {
      case 'Article': return 'bg-blue-100 text-blue-800';
      case 'Macro': return 'bg-green-100 text-green-800';
      case 'Token Point': return 'bg-purple-100 text-purple-800';
      case 'SOP': return 'bg-orange-100 text-orange-800';
      case 'Product Description Sheet': return 'bg-cyan-100 text-cyan-800';
      case 'PDF Material': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Top Bar */}
      <div className="border-b bg-white/50 backdrop-blur supports-[backdrop-filter]:bg-white/50 flex-shrink-0">
        <div className="flex h-14 items-center justify-between px-6">
          {/* Left side - Breadcrumb rail */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Knowledge Base:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Asset:</span>
              {isEditingAssetName ? (
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => handleAssetNameChange(e.target.value)}
                  onBlur={handleAssetNameBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAssetNameBlur();
                    if (e.key === 'Escape') {
                      setAssetName(asset.name);
                      setIsEditingAssetName(false);
                    }
                  }}
                  className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <button
                  onClick={handleAssetNameClick}
                  className="text-sm font-medium hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                >
                  {assetName}
                </button>
              )}
            </div>

            {/* Asset metadata badges */}
            <div className="flex items-center space-x-2">
              <Badge className={getTypeColor(asset.type)}>
                {asset.type}
              </Badge>
              <Badge variant={asset.isInternal ? "secondary" : "outline"}>
                {asset.isInternal ? 'Internal' : 'External'}
              </Badge>
            </div>
          </div>
          
          {/* Right side - Actions and status */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManualSave}
              disabled={!isDirty}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {isDirty ? 'Unsaved changes' : lastSaved ? `Auto-saved ${formatLastSaved(lastSaved)}` : 'No changes yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Content Editor */}
      <div className="flex-1 flex">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder={`Start writing your ${asset.type.toLowerCase()}...`}
                className="w-full h-full resize-none border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Sidebar with metadata */}
        <div className="w-80 border-l bg-gray-50 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Asset Information</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{assetName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</dt>
                  <dd className="mt-1">
                    <Badge className={getTypeColor(asset.type)}>
                      {asset.type}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Usage</dt>
                  <dd className="mt-1">
                    <Badge variant={asset.isInternal ? "secondary" : "outline"}>
                      {asset.isInternal ? 'Internal Use' : 'External Use'}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(asset.dateCreated).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Modified</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {asset.lastModified ? new Date(asset.lastModified).toLocaleDateString() : 'Never'}
                  </dd>
                </div>
              </div>
            </div>

            {/* Content Statistics */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Content Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Characters:</span>
                  <span className="font-medium">{content.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Words:</span>
                  <span className="font-medium">{content.trim() ? content.trim().split(/\s+/).length : 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lines:</span>
                  <span className="font-medium">{content.split('\n').length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Export as PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Copy to Clipboard
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  View History
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 