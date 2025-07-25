import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Settings, 
  Mail, 
  MessageCircle, 
  Phone, 
  FileText, 
  Zap, 
  BookOpen, 
  Users, 
  Building2,
  Globe,
  Database,
  Headphones,
  Lightbulb,
  ShoppingBag,
  Command
} from 'lucide-react';

// Simple Icons for company logos
import {
  siZendesk,
  siIntercom,
  siSalesforce,
  siNotion,
  siGoogledrive
} from 'simple-icons';

interface HomeProps {
  onNavigate?: (section: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  // Mock data for now - will be replaced with real data later
  const clientInfo = {
    name: "TechCorp Solutions",
    logo: "/placeholder-logo.png", // We'll add a placeholder
    status: "Live", // Prospect/Onboarding/Live/Expansion
    lastUpdated: "2 hours ago",
    completeness: 85 // percentage
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live': return 'bg-green-100 text-green-800';
      case 'Onboarding': return 'bg-blue-100 text-blue-800';
      case 'Prospect': return 'bg-gray-100 text-gray-800';
      case 'Expansion': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 flex-1 overflow-auto">
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left side - Client info */}
            <div className="flex items-center space-x-4">
              {/* Client Logo placeholder */}
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 font-semibold text-lg">
                  {clientInfo.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                </span>
              </div>
              
              {/* Client name and status */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{clientInfo.name}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <Badge className={getStatusColor(clientInfo.status)}>
                    {clientInfo.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Updated {clientInfo.lastUpdated}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Data completeness and actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Data Completeness</div>
                <div className={`text-2xl font-bold ${getCompletenessColor(clientInfo.completeness)}`}>
                  {clientInfo.completeness}%
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Snapshot
              </Button>
            </div>
          </div>
        </div>

        {/* Card Grid - Responsive layout */}
        <div className="space-y-6">
          {/* First 6 cards in grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Channels Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Channels</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900">8.2k</div>
                <p className="text-sm text-muted-foreground">Contacts/month</p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Email</span>
                      <span className="text-xs text-gray-500">45%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: `#${siZendesk.hex}` }}>
                          <path d={siZendesk.path} />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Zendesk</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">Chat</span>
                      <span className="text-xs text-gray-500">30%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: `#${siIntercom.hex}` }}>
                          <path d={siIntercom.path} />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Intercom</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Phone</span>
                      <span className="text-xs text-gray-500">25%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-orange-500 rounded text-white flex items-center justify-center text-xs font-bold">5</div>
                      <span className="text-xs text-gray-600">Five9</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-6"
                onClick={() => onNavigate?.('channels')}
              >
                Manage
              </Button>
            </CardContent>
          </Card>

          {/* Contact Drivers Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Contact Drivers</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900">12</div>
                <p className="text-sm text-muted-foreground">Total drivers</p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Login Issues</span>
                    </div>
                    <span className="text-sm text-gray-600">2.5k/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Payment Help</span>
                    </div>
                    <span className="text-sm text-gray-600">1.8k/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Account Setup</span>
                    </div>
                    <span className="text-sm text-gray-600">1.2k/mo</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-6"
                onClick={() => onNavigate?.('contact-drivers')}
              >
                Manage
              </Button>
            </CardContent>
          </Card>

          {/* Knowledge Base Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Knowledge Base</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900">156</div>
                <p className="text-sm text-muted-foreground">Total assets</p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">KB Articles</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">45</span>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-3 h-3" style={{ fill: `#${siZendesk.hex}` }}>
                          <path d={siZendesk.path} />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Command className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Macros</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">32</span>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-3 h-3" style={{ fill: `#${siZendesk.hex}` }}>
                          <path d={siZendesk.path} />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Talking Points</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">28</span>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-3 h-3" style={{ fill: `#${siNotion.hex}` }}>
                          <path d={siNotion.path} />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">SOPs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">18</span>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-3 h-3" style={{ fill: `#${siNotion.hex}` }}>
                          <path d={siNotion.path} />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-medium">Product Sheets</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">33</span>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-3 h-3" style={{ fill: `#${siGoogledrive.hex}` }}>
                          <path d={siGoogledrive.path} />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-6"
                onClick={() => onNavigate?.('knowledge-bases')}
              >
                Manage
              </Button>
            </CardContent>
          </Card>

          {/* Team & Providers Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Team & Providers</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900">24</div>
                <p className="text-sm text-muted-foreground">Total agents</p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Internal</span>
                    </div>
                    <span className="text-sm text-gray-600">12 agents</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <span className="text-sm font-medium">BPO Partner A</span>
                    </div>
                    <span className="text-sm text-gray-600">8 agents</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-teal-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">B</span>
                      </div>
                      <span className="text-sm font-medium">BPO Partner B</span>
                    </div>
                    <span className="text-sm text-gray-600">4 agents</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-6">
                Edit staffing & costs
              </Button>
            </CardContent>
          </Card>

          {/* Cost Snapshot Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Cost Snapshot</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900">$89k</div>
                <p className="text-sm text-muted-foreground">Monthly cost</p>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg cost/contact</span>
                    <span className="text-sm text-gray-600">$10.85</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Calculation</span>
                    <span className="text-xs text-muted-foreground">Auto-calculated</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-6">
                Edit cost assumptions
              </Button>
            </CardContent>
          </Card>

          {/* Manual vs Automated Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Manual vs Automated</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900">65%</div>
                <p className="text-sm text-muted-foreground">Currently manual</p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium">Manual</span>
                    </div>
                    <span className="text-sm text-gray-600">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Automated</span>
                    </div>
                    <span className="text-sm text-gray-600">35%</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-muted-foreground">Before automation: 100% Manual</div>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-6">
                View automation metrics
              </Button>
            </CardContent>
          </Card>
          </div>

          {/* Stack Overview Card - Full Width */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Stack Overview</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">7</div>
                  <p className="text-sm text-muted-foreground">Active tools</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage stack
                </Button>
              </div>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="flex flex-col items-center space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `#${siZendesk.hex}` }}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: 'white' }}>
                      <path d={siZendesk.path} />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">Zendesk</div>
                    <div className="text-xs text-gray-500">CX Platform</div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `#${siSalesforce.hex}` }}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: 'white' }}>
                      <path d={siSalesforce.path} />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">Salesforce</div>
                    <div className="text-xs text-gray-500">CRM</div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">5</span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">Five9</div>
                    <div className="text-xs text-gray-500">Telephony</div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `#${siIntercom.hex}` }}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: 'white' }}>
                      <path d={siIntercom.path} />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">Intercom</div>
                    <div className="text-xs text-gray-500">Live Chat</div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `#${siNotion.hex}` }}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: 'white' }}>
                      <path d={siNotion.path} />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">Notion</div>
                    <div className="text-xs text-gray-500">Knowledge Base</div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `#${siGoogledrive.hex}` }}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: 'white' }}>
                      <path d={siGoogledrive.path} />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">Google Drive</div>
                    <div className="text-xs text-gray-500">File Storage</div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">Custom API</div>
                    <div className="text-xs text-gray-500">Data Integration</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 