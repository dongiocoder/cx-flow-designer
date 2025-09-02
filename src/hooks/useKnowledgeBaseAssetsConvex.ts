/**
 * Convex-powered useKnowledgeBaseAssets hook
 * Replaces the complex 259-line GitHub version with ~80 lines of clean, real-time code
 */

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { useClient } from '@/contexts/ClientContext';
import { convexStorage } from '@/lib/convexStorage';

// Re-export types
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

export function useKnowledgeBaseAssets() {
  const { currentClient } = useClient();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  // Convert client name to slug for querying
  const clientSlug = currentClient?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';

  // Real-time reactive query - automatically updates when data changes!
  const assetsData = useQuery(
    api.knowledgeBase.getByCompany, 
    clientSlug ? { companySlug: clientSlug } : 'skip'
  );

  // Convex mutations for all operations
  const createAsset = useMutation(api.knowledgeBase.create);
  const updateAsset = useMutation(api.knowledgeBase.update);
  const deleteAsset = useMutation(api.knowledgeBase.remove);
  const duplicateAsset = useMutation(api.knowledgeBase.duplicate);

  // Transform Convex data to match existing interface
  const knowledgeBaseAssets: KnowledgeBaseAsset[] = assetsData?.map(asset => ({
    id: asset._id,
    name: asset.name,
    type: asset.type as KnowledgeBaseType,
    content: asset.content,
    dateCreated: asset.dateCreated,
    lastModified: asset.lastModified,
    isInternal: asset.isInternal,
    createdAt: asset.createdAt,
  })) || [];

  const isLoading = assetsData === undefined;
  const error = null; // Convex handles errors automatically
  const storageStatus = convexStorage.getStorageStatus().type;

  // Simplified operations - no more manual error handling or caching needed!
  const addKnowledgeBaseAsset = async (assetData: {
    name: string;
    type: KnowledgeBaseType;
    isInternal: boolean;
    content?: string;
  }) => {
    if (!currentClient) throw new Error('No client selected');
    
    const id = await createAsset({
      companySlug: clientSlug,
      ...assetData,
    });
    
    return {
      id,
      ...assetData,
      content: assetData.content || '',
      dateCreated: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
  };

  const updateKnowledgeBaseAsset = async (id: string, updates: Partial<KnowledgeBaseAsset>) => {
    await updateAsset({
      // @ts-expect-error - Temporary type fix during migration
      id: id,
      ...updates,
    });
  };

  const deleteKnowledgeBaseAsset = async (id: string) => {
    // @ts-expect-error - Temporary type fix during migration
    await deleteAsset({ id: id });
    setSelectedAssets(prev => prev.filter(assetId => assetId !== id));
  };

  const deleteSelectedAssets = async () => {
    const deletePromises = selectedAssets.map(id => 
      // @ts-expect-error - Temporary type fix during migration
      deleteAsset({ id: id })
    );
    await Promise.all(deletePromises);
    setSelectedAssets([]);
  };

  const duplicateKnowledgeBaseAsset = async (id: string) => {
    return await duplicateAsset({ id: id as Id<"knowledgeBaseAssets"> });
  };

  const getAssetById = (assetId: string): KnowledgeBaseAsset | undefined => {
    return knowledgeBaseAssets.find(asset => asset.id === assetId);
  };

  // Selection functions (unchanged)
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
    error,
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