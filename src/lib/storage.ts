import type { ContactDriver } from '@/hooks/useContactDrivers';

const STORAGE_KEY = 'cx-contact-drivers';
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

  constructor() {
    if (typeof window !== 'undefined') {
      // Check if we're online
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => { this.isOnline = true; });
      window.addEventListener('offline', () => { this.isOnline = false; });
    }
  }

  async saveData(data: ContactDriver[]): Promise<void> {
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

  async loadData(): Promise<ContactDriver[]> {
    try {
      // Try to load from GitHub Gist first if we have credentials and are online
      if (this.isOnline && GITHUB_TOKEN && GIST_ID) {
        const gistData = await this.loadFromGist();
        if (gistData && gistData.length > 0) {
          // Update localStorage with the latest data from Gist
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gistData));
          }
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
        return JSON.parse(savedData);
      }
    }

    // Return empty array if nothing is found
    return [];
  }

  private async saveToGist(data: ContactDriver[]): Promise<void> {
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

  private async loadFromGist(): Promise<ContactDriver[] | null> {
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
      return JSON.parse(fileContent);
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