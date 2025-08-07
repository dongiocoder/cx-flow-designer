import type { ContactDriver } from '@/hooks/useContactDrivers';
import type { KnowledgeBaseAsset } from '@/hooks/useKnowledgeBaseAssets';
import type { Workstream } from '@/hooks/useWorkstreams';

const STORAGE_KEY = 'cx-flow-designer-data';

interface AppData {
  contactDrivers: ContactDriver[];
  knowledgeBaseAssets: KnowledgeBaseAsset[];
  workstreams: Workstream[];
}
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GIST_ID = process.env.NEXT_PUBLIC_GIST_ID;

interface GistResponse {
  files: {
    [key: string]: {
      content: string;
    };
  };
}

class StorageService {
  private isOnline = true;
  private cachedData: AppData | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Check if we're online
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => { this.isOnline = true; });
      window.addEventListener('offline', () => { this.isOnline = false; });
    }
  }

  // Load all data (contact drivers + knowledge base assets)
  async loadAllData(): Promise<AppData> {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      // Try to load from GitHub Gist first if we have credentials and are online
      if (this.isOnline && GITHUB_TOKEN && GIST_ID) {
        const gistData = await this.loadFromGist();
        if (gistData) {
          // Update localStorage with the latest data from Gist
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gistData));
          }
          this.cachedData = gistData;
          return gistData;
        }
      }
    } catch (error) {
      console.warn('Failed to load from GitHub Gist, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // Handle both old format (just contact drivers) and new format (combined data)
          if (Array.isArray(parsed)) {
            // Old format - just contact drivers
            const data: AppData = {
              contactDrivers: parsed,
              knowledgeBaseAssets: [],
              workstreams: []
            };
            this.cachedData = data;
            return data;
          } else {
            // New format - combined data
            this.cachedData = parsed;
            return parsed;
          }
        } catch (e) {
          console.warn('Failed to parse stored data:', e);
        }
      }

                // Check for old contact drivers key
      const oldContactDrivers = localStorage.getItem('cx-contact-drivers');
      if (oldContactDrivers) {
        try {
          const parsed = JSON.parse(oldContactDrivers);
          const data: AppData = {
            contactDrivers: Array.isArray(parsed) ? parsed : [],
            knowledgeBaseAssets: [],
            workstreams: []
          };
          this.cachedData = data;
          return data;
        } catch (e) {
          console.warn('Failed to parse old contact drivers data:', e);
        }
      }
    }

    // Return empty data if nothing is found
    const emptyData: AppData = {
      contactDrivers: [],
      knowledgeBaseAssets: [],
      workstreams: []
    };
    this.cachedData = emptyData;
    return emptyData;
  }

  // Save all data
  async saveAllData(data: AppData): Promise<void> {
    this.cachedData = data; // Update cache

    try {
      // Always save to localStorage first (instant backup)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }

      // Then try to save to GitHub Gist if we have credentials and are online
      if (this.isOnline && GITHUB_TOKEN && GIST_ID) {
        await this.saveToGist(data);
      }
    } catch (error) {
      console.warn('Failed to save to GitHub Gist, using localStorage only:', error);
      // localStorage save already happened above, so we're good
    }
  }

  // Backward compatibility methods for contact drivers
  async saveData(contactDrivers: ContactDriver[]): Promise<void> {
    const allData = await this.loadAllData();
    allData.contactDrivers = contactDrivers;
    await this.saveAllData(allData);
  }

  async loadData(): Promise<ContactDriver[]> {
    const allData = await this.loadAllData();
    return allData.contactDrivers;
  }

  // New methods for knowledge base assets
  async saveKnowledgeBaseAssets(assets: KnowledgeBaseAsset[]): Promise<void> {
    const allData = await this.loadAllData();
    allData.knowledgeBaseAssets = assets;
    await this.saveAllData(allData);
  }

  async loadKnowledgeBaseAssets(): Promise<KnowledgeBaseAsset[]> {
    const allData = await this.loadAllData();
    return allData.knowledgeBaseAssets;
  }

  // New methods for workstreams
  async saveWorkstreams(workstreams: Workstream[]): Promise<void> {
    const allData = await this.loadAllData();
    allData.workstreams = workstreams;
    await this.saveAllData(allData);
  }

  async loadWorkstreams(): Promise<Workstream[]> {
    const allData = await this.loadAllData();
    return allData.workstreams;
  }

  private async saveToGist(data: AppData): Promise<void> {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        files: {
          'cx-flow-designer-data.json': {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
  }

  private async loadFromGist(): Promise<AppData | null> {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const gist: GistResponse = await response.json();
    const fileContent = gist.files['cx-flow-designer-data.json']?.content;
    
    if (fileContent) {
      const parsed = JSON.parse(fileContent);
      // Handle both old format (just contact drivers) and new format (combined data)
      if (Array.isArray(parsed)) {
        // Old format - just contact drivers
        return {
          contactDrivers: parsed,
          knowledgeBaseAssets: [],
          workstreams: []
        };
      } else {
        // New format - combined data, ensure all properties exist
        return {
          contactDrivers: parsed.contactDrivers || [],
          knowledgeBaseAssets: parsed.knowledgeBaseAssets || [],
          workstreams: parsed.workstreams || []
        };
      }
    }

    return null;
  }

  // Helper method to check if GitHub integration is available
  isGitHubAvailable(): boolean {
    return !!(GITHUB_TOKEN && GIST_ID && this.isOnline);
  }

  // Helper method to get storage status for UI
  getStorageStatus(): { type: 'github' | 'localStorage' | 'none', online: boolean } {
    if (this.isGitHubAvailable()) {
      return { type: 'github', online: this.isOnline };
    }
    if (typeof window !== 'undefined') {
      return { type: 'localStorage', online: this.isOnline };
    }
    return { type: 'none', online: false };
  }
}

// Export singleton instance
export const storageService = new StorageService(); 