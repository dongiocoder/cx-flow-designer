import type { ContactDriver } from '@/hooks/useContactDrivers';
import type { KnowledgeBaseAsset } from '@/hooks/useKnowledgeBaseAssets';
import type { Workstream } from '@/hooks/useWorkstreams';

interface AppData {
  contactDrivers: ContactDriver[];
  knowledgeBaseAssets: KnowledgeBaseAsset[];
  workstreams: Workstream[];
}

// Access environment variables
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;

// Validate required environment variables
if (!GITHUB_TOKEN || !GITHUB_REPO) {
  console.warn('⚠️ GitHub storage not configured. Please set NEXT_PUBLIC_GITHUB_TOKEN and NEXT_PUBLIC_GITHUB_REPO environment variables.');
  console.warn('Token exists:', !!GITHUB_TOKEN);
  console.warn('Repo exists:', !!GITHUB_REPO);
}

interface GitHubFileResponse {
  content: string;
  sha: string;
  size: number;
  encoding: 'base64';
}


class StorageService {
  private isOnline = true;
  private cachedData: Map<string, AppData> = new Map(); // Cache per client
  private isLoading = false;
  private hasConfigError = false;
  private saveTimeout: NodeJS.Timeout | null = null;
  private lastSaveTime = 0;
  private isRateLimited = false;
  private rateLimitResetTime = 0;
  private lastRequestTime = 0;
  private requestQueue: Array<() => Promise<unknown>> = [];
  private isProcessingQueue = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Check if we're online
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => { this.isOnline = true; });
      window.addEventListener('offline', () => { this.isOnline = false; });
    }
    
    // Check configuration
    this.hasConfigError = !GITHUB_TOKEN || !GITHUB_REPO;
  }

  // Load all data from GitHub Repository (single source of truth)
  async loadAllData(clientName: string = 'HelloFresh'): Promise<AppData> {
    console.log(`🚀 loadAllData called for client: ${clientName}`);
    
    // Check configuration dynamically
    const currentlyConfigured = !!(GITHUB_TOKEN && GITHUB_REPO);
    console.log(`⚙️ GitHub configured: ${currentlyConfigured}`);
    
    // If configuration is missing, return empty data without error
    if (!currentlyConfigured) {
      console.log(`❌ GitHub not configured, returning empty data`);
      const emptyData: AppData = {
        contactDrivers: [],
        knowledgeBaseAssets: [],
        workstreams: []
      };
      return emptyData;
    }

    // Return cached data if available
    if (this.cachedData.has(clientName) && !this.isLoading) {
      console.log(`💾 Using cached data for client: ${clientName}`);
      return this.cachedData.get(clientName)!;
    }

    if (!this.isOnline) {
      throw new Error('No internet connection. Cannot load data from GitHub Repository.');
    }

    try {
      this.isLoading = true;
      const repoData = await this.queueRequest(() => this.loadFromRepo(clientName));
      
      if (repoData) {
        this.cachedData.set(clientName, repoData);
        console.log(`✅ Successfully loaded data for client: ${clientName}`, {
          workstreams: repoData.workstreams.length,
          contactDrivers: repoData.contactDrivers.length,
          knowledgeBaseAssets: repoData.knowledgeBaseAssets.length
        });
        return repoData;
      }
      
      // If no data in repo, this is an error condition - don't return empty data
      // because it might get saved back and overwrite existing data
      throw new Error(`No data found for client: ${clientName}. This might indicate a loading error or missing files.`);
    } catch (error) {
      console.error('Failed to load from GitHub Repository:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // Save all data to GitHub Repository with debouncing and rate limit handling
  async saveAllData(data: AppData, clientName: string = 'HelloFresh'): Promise<void> {
    // Check configuration dynamically
    const currentlyConfigured = !!(GITHUB_TOKEN && GITHUB_REPO);
    
    // If configuration is missing, silently update cache only
    if (!currentlyConfigured) {
      this.cachedData.set(clientName, data);
      return;
    }

    if (!this.isOnline) {
      throw new Error('No internet connection. Cannot save data to GitHub Gist.');
    }

    // Check if we're rate limited
    if (this.isRateLimited && Date.now() < this.rateLimitResetTime) {
      // Still rate limited, just update cache
      this.cachedData.set(clientName, data);
      const remainingMinutes = Math.ceil((this.rateLimitResetTime - Date.now()) / 60000);
      throw new Error(`GitHub API rate limit exceeded. Try again in ${remainingMinutes} minutes.`);
    }

    // Clear any pending save
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Update cache immediately
    this.cachedData.set(clientName, data);

    // Debounce saves to avoid rate limiting (wait 2 seconds)
    return new Promise((resolve, reject) => {
      this.saveTimeout = setTimeout(async () => {
        try {
          await this.queueRequest(() => this.saveToRepo(data, clientName));
          this.isRateLimited = false;
          resolve();
        } catch (error) {
          if (error instanceof Error && error.message.includes('rate limit')) {
            this.isRateLimited = true;
            this.rateLimitResetTime = Date.now() + (60 * 60 * 1000); // Reset in 1 hour
          }
          console.error('Failed to save to GitHub Repository:', error);
          reject(error);
        }
      }, 2000);
    });
  }

  // Contact drivers methods
  async saveData(contactDrivers: ContactDriver[], clientName: string = 'HelloFresh'): Promise<void> {
    const allData = await this.loadAllData(clientName);
    allData.contactDrivers = contactDrivers;
    await this.saveAllData(allData, clientName);
  }

  async loadData(clientName: string = 'HelloFresh'): Promise<ContactDriver[]> {
    const allData = await this.loadAllData(clientName);
    return allData.contactDrivers;
  }

  // Knowledge base assets methods
  async saveKnowledgeBaseAssets(assets: KnowledgeBaseAsset[], clientName: string = 'HelloFresh'): Promise<void> {
    const allData = await this.loadAllData(clientName);
    allData.knowledgeBaseAssets = assets;
    await this.saveAllData(allData, clientName);
  }

  async loadKnowledgeBaseAssets(clientName: string = 'HelloFresh'): Promise<KnowledgeBaseAsset[]> {
    const allData = await this.loadAllData(clientName);
    return allData.knowledgeBaseAssets;
  }

  // Workstreams methods
  async saveWorkstreams(workstreams: Workstream[], clientName: string = 'HelloFresh'): Promise<void> {
    const allData = await this.loadAllData(clientName);
    allData.workstreams = workstreams;
    await this.saveAllData(allData, clientName);
  }

  async loadWorkstreams(clientName: string = 'HelloFresh'): Promise<Workstream[]> {
    const allData = await this.loadAllData(clientName);
    return allData.workstreams;
  }

  // Client management methods
  async loadClients(): Promise<string[]> {
    try {
      const clientsFile = await this.queueRequest(() => this.getFileFromRepo('clients.json'));
      const clientsContent = atob(clientsFile.content);
      return JSON.parse(clientsContent);
    } catch {
      // If clients.json doesn't exist, return default clients
      return ['HelloFresh', 'Warby Parker'];
    }
  }

  async saveClients(clients: string[]): Promise<void> {
    await this.queueRequest(() => this.saveFileToRepo('clients.json', JSON.stringify(clients, null, 2)));
  }

  async createClient(clientName: string): Promise<void> {
    // Create data files with initial sample data for new client
    const initialData = this.getInitialDataForClient(clientName);
    
    await this.saveAllData(initialData, clientName);
    
    // Add client to clients list
    const clients = await this.loadClients();
    if (!clients.includes(clientName)) {
      clients.push(clientName);
      await this.saveClients(clients);
    }
  }

  async ensureClientFilesExist(clientName: string): Promise<void> {
    // Check if client files exist by trying to load them directly from repo
    try {
      const existingData = await this.loadFromRepo(clientName);
      // If we successfully loaded data, we're good - don't overwrite
      if (existingData && (existingData.workstreams.length > 0 || existingData.contactDrivers.length > 0 || existingData.knowledgeBaseAssets.length > 0)) {
        console.log(`✅ Client files already exist for: ${clientName}`);
        return;
      }
    } catch (error) {
      console.warn(`⚠️ Error loading client files for ${clientName}:`, error);
    }
    
    // Only create initial data if no existing data was found
    console.log(`📝 Creating initial files for client: ${clientName}`);
    const initialData = this.getInitialDataForClient(clientName);
    await this.saveToRepo(initialData, clientName);
  }

  private getInitialDataForClient(clientName: string): AppData {
    return {
      workstreams: [
        {
          id: Date.now().toString(),
          name: "Customer Support",
          type: "inbound" as const,
          description: "Handle incoming customer inquiries and support requests",
          successDefinition: "Issue resolved within 24 hours",
          volumePerMonth: 500,
          successPercentage: 85,
          agentsAssigned: 5,
          hoursPerAgentPerMonth: 160,
          loadedCostPerAgent: 4500,
          automationPercentage: 30,
          flows: [],
          lastModified: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        }
      ],
      knowledgeBaseAssets: [
        {
          id: Date.now().toString(),
          name: `${clientName} Support FAQ`,
          type: "Article" as const,
          content: `# ${clientName} Support FAQ\n\nThis is a sample FAQ document for ${clientName} customer support...`,
          dateCreated: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0],
          isInternal: false,
          createdAt: new Date().toISOString()
        }
      ],
      contactDrivers: [
        {
          id: Date.now().toString(),
          name: `${clientName} Account Access`,
          description: "Customer account access and login issues",
          lastModified: new Date().toISOString().split('T')[0],
          containmentPercentage: 75,
          containmentVolume: 450,
          volumePerMonth: 600,
          avgHandleTime: 8.0,
          csat: 88,
          qaScore: 95,
          phoneVolume: 360,
          emailVolume: 180,
          chatVolume: 60,
          otherVolume: 0,
          flows: [],
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  // Request queue to prevent too many concurrent API calls
  private async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          // Rate limit: wait at least 100ms between requests
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < 100) {
            await new Promise(resolve => setTimeout(resolve, 100 - timeSinceLastRequest));
          }
          this.lastRequestTime = Date.now();
          
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Request failed:', error);
        }
      }
    }
    
    this.isProcessingQueue = false;
  }

  // Clear cache method for forcing fresh data load
  clearCache(): void {
    this.cachedData.clear();
  }

  private async saveToRepo(data: AppData, clientName: string): Promise<void> {
    const files = [
      { path: `${clientName}/workstreams.json`, content: JSON.stringify(data.workstreams, null, 2) },
      { path: `${clientName}/kb-assets.json`, content: JSON.stringify(data.knowledgeBaseAssets, null, 2) },
      { path: `${clientName}/contact-drivers.json`, content: JSON.stringify(data.contactDrivers, null, 2) }
    ];

    // Save each file separately
    for (const file of files) {
      await this.saveFileToRepo(file.path, file.content);
    }
    
    this.lastSaveTime = Date.now();
  }

  private async saveFileToRepo(filePath: string, content: string): Promise<void> {
    // First, try to get the current file to get its SHA (required for updates)
    let sha: string | undefined;
    try {
      const existingFile = await this.getFileFromRepo(filePath);
      sha = existingFile.sha;
    } catch {
      // File doesn't exist, that's OK for new files
    }

    const body: {
      message: string;
      content: string;
      sha?: string;
    } = {
      message: `Update ${filePath}`,
      content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
    };

    if (sha) {
      body.sha = sha; // Required for updates
    }

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 403 && errorText.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please wait before making more changes.');
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
  }

  private async loadFromRepo(clientName: string): Promise<AppData | null> {
    try {
      console.log(`🔍 Loading data for client: ${clientName}`);
      const [workstreams, kbAssets, contactDrivers] = await Promise.all([
        this.loadFileFromRepo(`${clientName}/workstreams.json`),
        this.loadFileFromRepo(`${clientName}/kb-assets.json`),
        this.loadFileFromRepo(`${clientName}/contact-drivers.json`)
      ]);

      console.log(`📊 Data loaded for ${clientName}:`, {
        workstreamsExists: !!workstreams,
        kbAssetsExists: !!kbAssets,
        contactDriversExists: !!contactDrivers,
        workstreamsLength: workstreams ? JSON.parse(workstreams).length : 0
      });

      // Check if any files are missing
      const hasAnyData = workstreams || kbAssets || contactDrivers;
      
      if (!hasAnyData) {
        // No files exist at all
        console.log(`⚠️ No files found for client ${clientName}`);
        return null;
      }

      const parseJSON = <T>(content: string | null): T[] => {
        if (!content || content.trim() === '' || content.trim() === 'undefined') {
          return [];
        }
        try {
          return JSON.parse(content);
        } catch (parseError) {
          console.error('Failed to parse JSON:', content, parseError);
          return [];
        }
      };

      return {
        workstreams: parseJSON<Workstream>(workstreams),
        knowledgeBaseAssets: parseJSON<KnowledgeBaseAsset>(kbAssets),
        contactDrivers: parseJSON<ContactDriver>(contactDrivers)
      };
    } catch (error) {
      console.warn('Error loading client files:', error);
      throw error;
    }
  }

  private async loadFileFromRepo(filePath: string): Promise<string | null> {
    try {
      const fileData = await this.getFileFromRepo(filePath);
      return atob(fileData.content); // Base64 decode
    } catch {
      return null; // File doesn't exist
    }
  }

  private async getFileFromRepo(filePath: string): Promise<GitHubFileResponse> {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Helper method to check if GitHub integration is available
  isGitHubAvailable(): boolean {
    return !!(GITHUB_TOKEN && GITHUB_REPO && this.isOnline);
  }

  // Helper method to get storage status for UI
  getStorageStatus(): { type: 'github' | 'none', online: boolean, configured: boolean, rateLimited?: boolean } {
    // Re-check configuration in case environment variables loaded after initial construction
    const currentlyConfigured = !!(GITHUB_TOKEN && GITHUB_REPO);
    const currentlyRateLimited = this.isRateLimited && Date.now() < this.rateLimitResetTime;
    
    if (currentlyConfigured && this.isOnline && !currentlyRateLimited) {
      return { type: 'github', online: true, configured: true, rateLimited: false };
    }
    
    if (currentlyConfigured && currentlyRateLimited) {
      return { type: 'none', online: this.isOnline, configured: true, rateLimited: true };
    }
    
    return { 
      type: 'none', 
      online: this.isOnline, 
      configured: currentlyConfigured,
      rateLimited: false
    };
  }

  // Method to retry failed operations
  async retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error('Max retries exceeded');
  }
}

// Export singleton instance
export const storageService = new StorageService(); 