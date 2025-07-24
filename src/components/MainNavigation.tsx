"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Home, 
  Settings, 
  BarChart3, 
  Users, 
  MessageSquare, 
  FileText,
  HelpCircle,
  Plus
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

  // Placeholder navigation items - we'll customize these in the next step
  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      isActive: activeItem === "dashboard"
    },
    {
      id: "flows",
      label: "Flow Designer",
      icon: <MessageSquare className="h-5 w-5" />,
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
      id: "documents",
      label: "Documents",
      icon: <FileText className="h-5 w-5" />,
      isActive: activeItem === "documents"
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
  };

  return (
    <div className="w-16 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Navigation Items */}
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