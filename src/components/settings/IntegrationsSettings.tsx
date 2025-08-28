"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plug, Settings, Trash2, Plus, ExternalLink } from "lucide-react";
import { SiSlack, SiZapier, SiGithub, SiJira, SiSalesforce } from "react-icons/si";
import { MessageSquare } from "lucide-react";

export function IntegrationsSettings() {
  const [connectedIntegrations, setConnectedIntegrations] = useState([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and notifications',
      icon: SiSlack,
      connected: true,
      status: 'active',
      connectedAt: '2024-01-15',
      settings: {
        channel: '#cx-notifications',
        notifications: true
      }
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Code repository and issue tracking',
      icon: SiGithub,
      connected: true,
      status: 'active',
      connectedAt: '2024-01-10',
      settings: {
        repository: 'myorg/cx-flows',
        syncEnabled: true
      }
    }
  ]);

  const [availableIntegrations] = useState([
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Team collaboration and meetings',
      icon: MessageSquare,
      category: 'Communication'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Workflow automation platform',
      icon: SiZapier,
      category: 'Automation'
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Project management and issue tracking',
      icon: SiJira,
      category: 'Project Management'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Customer relationship management',
      icon: SiSalesforce,
      category: 'CRM'
    }
  ]);

  const [apiKeys, setApiKeys] = useState([
    {
      id: 'api-1',
      name: 'Production API Key',
      key: 'cx_live_1234567890abcdef',
      created: '2024-01-15',
      lastUsed: '2024-01-28'
    }
  ]);

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<string | null>(null);
  const [showNewApiKey, setShowNewApiKey] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');

  const handleDisconnectIntegration = (integrationId: string) => {
    setConnectedIntegrations(prev => 
      prev.filter(integration => integration.id !== integrationId)
    );
    setShowDisconnectConfirm(null);
  };

  const handleConnectIntegration = (integrationId: string) => {
    // TODO: Implement OAuth flow or connection logic
    console.log('Connecting to:', integrationId);
  };

  const handleCreateApiKey = () => {
    if (newApiKeyName.trim()) {
      const newKey = {
        id: `api-${Date.now()}`,
        name: newApiKeyName.trim(),
        key: `cx_live_${Math.random().toString(36).substring(2, 15)}`,
        created: new Date().toISOString().split('T')[0],
        lastUsed: 'Never'
      };
      setApiKeys(prev => [...prev, newKey]);
      setNewApiKeyName('');
      setShowNewApiKey(false);
    }
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-muted-foreground mt-2">Connect external services and manage API access.</p>
      </div>

      <Tabs defaultValue="connected" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="connected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Integrations</CardTitle>
              <CardDescription>Manage your active integrations and their settings</CardDescription>
            </CardHeader>
            <CardContent>
              {connectedIntegrations.length === 0 ? (
                <div className="text-center py-8">
                  <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations connected</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your favorite tools to streamline your workflow
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectedIntegrations.map((integration) => {
                    const IconComponent = integration.icon;
                    return (
                      <div key={integration.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{integration.name}</h3>
                              <p className="text-sm text-muted-foreground">{integration.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                              {integration.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Dialog 
                              open={showDisconnectConfirm === integration.id} 
                              onOpenChange={(open) => setShowDisconnectConfirm(open ? integration.id : null)}
                            >
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Disconnect {integration.name}</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to disconnect {integration.name}? This will stop all data syncing and notifications.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setShowDisconnectConfirm(null)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => handleDisconnectIntegration(integration.id)}
                                  >
                                    Disconnect
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Connected on {formatDate(integration.connectedAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
              <CardDescription>Connect new services to enhance your workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableIntegrations.map((integration) => {
                  const IconComponent = integration.icon;
                  return (
                    <div key={integration.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{integration.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {integration.category}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleConnectIntegration(integration.id)}
                        >
                          Connect
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage API keys for programmatic access</CardDescription>
              </div>
              <Dialog open={showNewApiKey} onOpenChange={setShowNewApiKey}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>New API Key</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                      Generate a new API key for accessing the CX Flow Designer API.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKeyName">Key Name</Label>
                      <Input
                        id="apiKeyName"
                        value={newApiKeyName}
                        onChange={(e) => setNewApiKeyName(e.target.value)}
                        placeholder="e.g., Production API Key"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewApiKey(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateApiKey}>Create Key</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{apiKey.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-2 py-1 bg-muted rounded text-sm font-mono">
                          {apiKey.key}
                        </code>
                        <Button variant="outline" size="sm">
                          Copy
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {formatDate(apiKey.created)} • Last used: {apiKey.lastUsed}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>Configure webhook endpoints for real-time notifications</CardDescription>
              </div>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Webhook</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ExternalLink className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No webhooks configured</h3>
                <p className="text-muted-foreground mb-4">
                  Set up webhooks to receive real-time notifications about workflow changes
                </p>
                <Button>Add Your First Webhook</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}