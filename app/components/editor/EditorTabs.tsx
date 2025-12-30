'use client';

import { useState } from 'react';
import { Upload, Image, Sparkles, Palette, Scissors, FileText } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface EditorTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'library', label: 'Biblioteca', icon: Image },
  { id: 'auto', label: 'IA Automática', icon: Sparkles },
  { id: 'templates', label: 'Templates', icon: Palette },
  { id: 'editing', label: 'Edição IA', icon: Scissors },
];

export function EditorTabs({ activeTab, onTabChange, children }: EditorTabsProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                'border-b-2 -mb-px',
                isActive
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}

