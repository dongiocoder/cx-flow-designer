import { useState, useEffect } from 'react';
import { storageService } from '@/lib/storage';

// Knowledge base asset types
export const KNOWLEDGE_BASE_TYPES = [
  'Article',
  'Macro', 
  'Token Point',
  'SOP',
  'Product Description Sheet',
  'PDF Material'
] as const;

type KnowledgeBaseType = typeof KNOWLEDGE_BASE_TYPES[number];

export interface KnowledgeBaseAsset {
  id: string;
  name: string;
  type: KnowledgeBaseType;
  content: string;
  dateCreated: string;
  lastModified: string;
  isInternal: boolean;
  createdAt: string;
}

// Initial mock data
const initialKnowledgeBaseAssets: KnowledgeBaseAsset[] = [
  {
    id: '1',
    name: 'Customer Support FAQ',
    type: 'Article',
    content: '# Customer Support FAQ\n\nThis is a comprehensive FAQ document for customer support representatives...',
    dateCreated: '2024-01-15',
    lastModified: '2024-01-20',
    isInternal: false,
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: '2', 
    name: 'Password Reset Macro',
    type: 'Macro',
    content: 'Dear {{customer_name}},\n\nTo reset your password, please follow these steps:\n1. Go to our login page\n2. Click "Forgot Password"\n3. Enter your email address\n\nBest regards,\nSupport Team',
    dateCreated: '2024-01-10',
    lastModified: '2024-01-18',
    isInternal: true,
    createdAt: new Date('2024-01-10').toISOString()
  },
  {
    id: '3',
    name: 'Product Return SOP',
    type: 'SOP', 
    content: '## Product Return Standard Operating Procedure\n\n### Purpose\nThis SOP outlines the process for handling product returns.\n\n### Procedure\n1. Verify customer information\n2. Check return eligibility\n3. Generate return authorization\n4. Process refund',
    dateCreated: '2024-01-05',
    lastModified: '2024-01-15',
    isInternal: true,
    createdAt: new Date('2024-01-05').toISOString()
  },
  {
    id: '4',
    name: 'Product Features Overview',
    type: 'Product Description Sheet',
    content: '# Product Features Overview\n\n## Key Features\n- Feature 1: Advanced analytics\n- Feature 2: Real-time monitoring\n- Feature 3: Automated workflows\n\n## Benefits\n- Increased efficiency\n- Better customer experience\n- Cost savings',
    dateCreated: '2024-01-08',
    lastModified: '2024-01-22',
    isInternal: false,
    createdAt: new Date('2024-01-08').toISOString()
  }
];

export function useKnowledgeBaseAssets() {
  const [knowledgeBaseAssets, setKnowledgeBaseAssets] = useState<KnowledgeBaseAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageStatus, setStorageStatus] = useState<'github' | 'localStorage' | 'none'>('none');

  // Load knowledge base assets from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const savedAssets = await storageService.loadKnowledgeBaseAssets();
        
        if (savedAssets.length > 0) {
          setKnowledgeBaseAssets(savedAssets);
        } else {
          // If no saved assets, use initial data
          setKnowledgeBaseAssets(initialKnowledgeBaseAssets);
          // Save initial data to storage
          await storageService.saveKnowledgeBaseAssets(initialKnowledgeBaseAssets);
        }
        
        // Update storage status
        const status = storageService.getStorageStatus();
        setStorageStatus(status.type);
      } catch (error) {
        console.error('Failed to load knowledge base assets:', error);
        // Fallback to initial data
        setKnowledgeBaseAssets(initialKnowledgeBaseAssets);
        setStorageStatus('localStorage');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save knowledge base assets to storage whenever they change
  useEffect(() => {
    if (knowledgeBaseAssets.length > 0 && !isLoading) {
      const saveData = async () => {
        try {
          await storageService.saveKnowledgeBaseAssets(knowledgeBaseAssets);
          // Update storage status after successful save
          const status = storageService.getStorageStatus();
          setStorageStatus(status.type);
        } catch (error) {
          console.error('Failed to save knowledge base assets:', error);
        }
      };
      
      saveData();
    }
  }, [knowledgeBaseAssets, isLoading]);

  const addKnowledgeBaseAsset = async (assetData: {
    name: string;
    type: KnowledgeBaseType;
    isInternal: boolean;
    content?: string;
  }) => {
    const newAsset: KnowledgeBaseAsset = {
      id: Date.now().toString(),
      name: assetData.name,
      type: assetData.type,
      content: assetData.content || '',
      isInternal: assetData.isInternal,
      dateCreated: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    
    const updatedAssets = [...knowledgeBaseAssets, newAsset];
    setKnowledgeBaseAssets(updatedAssets);
    
    // Immediately save to storage
    try {
      await storageService.saveKnowledgeBaseAssets(updatedAssets);
      const status = storageService.getStorageStatus();
      setStorageStatus(status.type);
    } catch (error) {
      console.error('Failed to save new knowledge base asset:', error);
    }
    
    return newAsset;
  };

  const updateKnowledgeBaseAsset = (id: string, updates: Partial<KnowledgeBaseAsset>) => {
    setKnowledgeBaseAssets(prev => prev.map(asset => 
      asset.id === id 
        ? { ...asset, ...updates, lastModified: new Date().toISOString().split('T')[0] }
        : asset
    ));
  };

  const deleteKnowledgeBaseAsset = (id: string) => {
    setKnowledgeBaseAssets(prev => prev.filter(asset => asset.id !== id));
    setSelectedAssets(prev => prev.filter(assetId => assetId !== id));
  };

  const deleteSelectedAssets = () => {
    setKnowledgeBaseAssets(prev => prev.filter(asset => !selectedAssets.includes(asset.id)));
    setSelectedAssets([]);
  };

  const duplicateKnowledgeBaseAsset = (id: string) => {
    const assetToDuplicate = knowledgeBaseAssets.find(asset => asset.id === id);
    if (assetToDuplicate) {
      const duplicatedAsset: KnowledgeBaseAsset = {
        ...assetToDuplicate,
        id: Date.now().toString(),
        name: `${assetToDuplicate.name} (Copy)`,
        dateCreated: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      setKnowledgeBaseAssets(prev => [...prev, duplicatedAsset]);
      return duplicatedAsset;
    }
  };

  const getAssetById = (assetId: string): KnowledgeBaseAsset | undefined => {
    return knowledgeBaseAssets.find(asset => asset.id === assetId);
  };

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets(prev => 
      prev.includes(id) 
        ? prev.filter(assetId => assetId !== id)
        : [...prev, id]
    );
  };

  const selectAllAssets = () => {
    setSelectedAssets(knowledgeBaseAssets.map(asset => asset.id));
  };

  const clearSelection = () => {
    setSelectedAssets([]);
  };

  const isAllSelected = selectedAssets.length === knowledgeBaseAssets.length && knowledgeBaseAssets.length > 0;
  const isPartiallySelected = selectedAssets.length > 0 && selectedAssets.length < knowledgeBaseAssets.length;

  return {
    knowledgeBaseAssets,
    selectedAssets,
    isLoading,
    storageStatus,
    addKnowledgeBaseAsset,
    updateKnowledgeBaseAsset,
    deleteKnowledgeBaseAsset,
    deleteSelectedAssets,
    duplicateKnowledgeBaseAsset,
    getAssetById,
    toggleAssetSelection,
    selectAllAssets,
    clearSelection,
    isAllSelected,
    isPartiallySelected
  };
} 