"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, Building2, CreditCard, Plug } from "lucide-react";
import { ProfileSettings } from "./settings/ProfileSettings";
import { AccountSettings } from "./settings/AccountSettings";
import { BillingSettings } from "./settings/BillingSettings";
import { IntegrationsSettings } from "./settings/IntegrationsSettings";

type SettingsSection = 'profile' | 'account' | 'billing' | 'integrations';

interface SettingsProps {
  className?: string;
}

export function Settings({ className }: SettingsProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  // Persist settings section to localStorage
  useEffect(() => {
    const stored = localStorage.getItem('settingsActiveSection');
    if (stored && ['profile', 'account', 'billing', 'integrations'].includes(stored)) {
      setActiveSection(stored as SettingsSection);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('settingsActiveSection', activeSection);
  }, [activeSection]);

  const settingsNavItems = [
    {
      id: 'profile' as SettingsSection,
      label: 'Profile',
      icon: User,
      description: 'Manage your personal information'
    },
    {
      id: 'account' as SettingsSection,
      label: 'Account',
      icon: Building2,
      description: 'Account settings and preferences'
    },
    {
      id: 'billing' as SettingsSection,
      label: 'Billing',
      icon: CreditCard,
      description: 'Billing information and subscription'
    },
    {
      id: 'integrations' as SettingsSection,
      label: 'Integrations',
      icon: Plug,
      description: 'Connected services and integrations'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />;
      case 'account':
        return <AccountSettings />;
      case 'billing':
        return <BillingSettings />;
      case 'integrations':
        return <IntegrationsSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className={`h-full flex ${className || ''}`}>
      {/* Settings Navigation Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h2>
          <nav className="space-y-2">
            {settingsNavItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className="w-full justify-start h-auto p-4"
                  onClick={() => setActiveSection(item.id)}
                >
                  <div className="flex items-start space-x-3">
                    <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs mt-1 ${
                        activeSection === item.id 
                          ? 'text-white/80' 
                          : 'text-muted-foreground'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}