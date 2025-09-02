"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Home, 
  Settings, 
  FileText,
  HelpCircle,
  Plus,
  Calculator,
  Bot,
  Layers,
  Plug,
  Zap,
  Workflow,
  Building2,
  User,
  LogOut,
  CreditCard,
  Wrench
} from "lucide-react";
import { useClient } from "@/contexts/ClientContext";
import { useWorkstreams } from "@/hooks/useWorkstreamsConvex";
import { Logo } from "./Logo";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

interface MainNavigationProps {
  onNavigate?: (itemId: string) => void;
}

export function MainNavigation({ onNavigate }: MainNavigationProps) {
  const [activeItem, setActiveItem] = useState<string>("dashboard");
  const { currentClient, availableClients, switchClient, createClient } = useClient();
  const { } = useWorkstreams(); // Keep hook for any future needs

  // Updated navigation items with reduced set
  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      isActive: activeItem === "dashboard"
    },
    {
      id: "workstreams",
      label: "Workstreams",
      icon: <Workflow className="h-5 w-5" />,
      isActive: activeItem === "workstreams"
    },
    {
      id: "flows",
      label: "AI Agents",
      icon: <Bot className="h-5 w-5" />,
      isActive: activeItem === "flows"
    },
    {
      id: "calculator",
      label: "Performance Calculator",
      icon: <Calculator className="h-5 w-5" />,
      isActive: activeItem === "calculator"
    },
    {
      id: "knowledge-bases",
      label: "Knowledge Bases",
      icon: <FileText className="h-5 w-5" />,
      isActive: activeItem === "knowledge-bases"
    },
    {
      id: "channels",
      label: "Channels",
      icon: <Layers className="h-5 w-5" />,
      isActive: activeItem === "channels"
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: <Plug className="h-5 w-5" />,
      isActive: activeItem === "integrations"
    },
    {
      id: "actions",
      label: "Actions",
      icon: <Zap className="h-5 w-5" />,
      isActive: activeItem === "actions"
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      isActive: activeItem === "settings"
    }
  ];

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    onNavigate?.(itemId);
    
    // Dispatch navigation change event for the main page to listen to
    window.dispatchEvent(new CustomEvent('navigation-change', { detail: itemId }));
  };

  const handleClientChange = async (value: string) => {
    if (value === '__add__') {
      const name = typeof window !== 'undefined' ? window.prompt('Add client name') : null;
      if (name && name.trim()) {
        const newName = name.trim();
        try {
          await createClient(newName);
        } catch (error) {
          console.error('Failed to create client:', error);
          alert('Failed to create client. Please try again.');
        }
      }
      return;
    }
    switchClient(value);
  };

  const handleMenuItemClick = (item: string) => {
    // TODO: Implement modal dialogs for each menu item
    console.log(`Opening ${item} modal`);
  };

  return (
    <div className="w-16 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Navigation Items including logo */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {/* Logo as first menu item */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Logo onClick={() => handleItemClick("dashboard")} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Home</p>
          </TooltipContent>
        </Tooltip>
        {navigationItems.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <Button
                variant={item.isActive ? "default" : "ghost"}
                size="icon"
                className={`w-12 h-12 ${
                  item.isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => handleItemClick(item.id)}
              >
                {item.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>

      {/* Bottom section - Help, Status, Account, User */}
      <div className="px-2 py-4 space-y-2 border-t border-gray-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => handleItemClick("help")}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Help & Support</p>
          </TooltipContent>
        </Tooltip>



        {/* User Profile */}
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" side="right">
                <DropdownMenuItem onClick={() => handleMenuItemClick('Profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuItemClick('Billing')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </DropdownMenuItem>
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Building2 className="mr-2 h-4 w-4" />
                      Switch Account
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Select Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground mb-4">
                        Current: {currentClient || 'No account selected'}
                      </div>
                      {availableClients.map((client) => (
                        <Button
                          key={client}
                          variant={client === currentClient ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => switchClient(client)}
                        >
                          {client}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleClientChange('__add__')}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Account
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <DropdownMenuItem onClick={() => handleMenuItemClick('Tools')}>
                  <Wrench className="mr-2 h-4 w-4" />
                  Tools
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuItemClick('Log out')}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>User Profile</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
} 