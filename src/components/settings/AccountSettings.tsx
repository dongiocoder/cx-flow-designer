"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useClient } from "@/contexts/ClientContext";
import { Settings, Plus, Trash2, Shield, Key, AlertTriangle } from "lucide-react";

export function AccountSettings() {
  const { currentClient, availableClients, switchClient, createClient } = useClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '24',
    requirePasswordChange: false,
  });

  const handleAddClient = async () => {
    if (newClientName.trim()) {
      try {
        await createClient(newClientName.trim());
        setNewClientName('');
        setShowAddClient(false);
      } catch (error) {
        console.error('Failed to create client:', error);
      }
    }
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    console.log('Deleting account...');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-medium text-gray-900">Account</h2>
        <p className="text-muted-foreground mt-1">Manage your account preferences and security settings.</p>
      </div>

      {/* Client Management Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client Accounts</CardTitle>
            <CardDescription>Manage your client accounts and switch between them</CardDescription>
          </div>
          <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Client</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Create a new client account to manage separately.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Enter client name..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddClient(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddClient}>Add Client</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableClients.map((client) => (
              <div
                key={client}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Settings className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{client}</div>
                    {client === currentClient && (
                      <Badge variant="default" className="mt-1">Current</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {client !== currentClient && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => switchClient(client)}
                    >
                      Switch
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security</span>
          </CardTitle>
          <CardDescription>Configure your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="twoFactor"
              checked={securitySettings.twoFactorEnabled}
              onCheckedChange={(value) => 
                setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout</Label>
            <Select
              value={securitySettings.sessionTimeout}
              onValueChange={(value) => 
                setSecuritySettings(prev => ({ ...prev, sessionTimeout: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="168">1 week</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Automatically log out after this period of inactivity
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="passwordChange">Require Password Change</Label>
              <p className="text-sm text-muted-foreground">
                Require password change every 90 days
              </p>
            </div>
            <Switch
              id="passwordChange"
              checked={securitySettings.requirePasswordChange}
              onCheckedChange={(value) => 
                setSecuritySettings(prev => ({ ...prev, requirePasswordChange: value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Password</span>
          </CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button className="w-full md:w-auto">Update Password</Button>
        </CardContent>
      </Card>

      {/* Danger Zone Section */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all of your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Yes, delete my account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}