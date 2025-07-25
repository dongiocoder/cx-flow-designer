"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Home, 
  Settings, 
  BarChart3, 
  Users, 
  FileText,
  HelpCircle,
  Plus,
  Table,
  Bot,
  Layers,
  Plug,
  Zap
} from "lucide-react";

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

  // Updated navigation items with your requested changes
  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      isActive: activeItem === "dashboard"
    },
    {
      id: "contact-drivers",
      label: "Contact Drivers",
      icon: <Table className="h-5 w-5" />,
      isActive: activeItem === "contact-drivers"
    },
    {
      id: "flows",
      label: "AI Agents",
      icon: <Bot className="h-5 w-5" />,
      isActive: activeItem === "flows"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      isActive: activeItem === "analytics"
    },
    {
      id: "users",
      label: "Users",
      icon: <Users className="h-5 w-5" />,
      isActive: activeItem === "users"
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

  return (
    <div className="w-16 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Empty logo area - properly aligned with header */}
      <div className="border-b bg-white flex-shrink-0">
        <div className="h-16">
          {/* Empty space reserved for future logo */}
        </div>
      </div>

      {/* Navigation Items - Moved down */}
      <nav className="flex-1 px-2 py-4 space-y-2">
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

      {/* Bottom section - Help and Add */}
      <div className="px-2 py-4 space-y-2 border-t border-gray-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => handleItemClick("add")}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add New</p>
          </TooltipContent>
        </Tooltip>

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
      </div>
    </div>
  );
} 