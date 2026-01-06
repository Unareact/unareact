'use client';

import { Globe } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface PortalRegionSelectorProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

const REGION_OPTIONS = [
  { value: 'ALL_AMERICAS', label: '🌎 Toda América', description: 'Todos os países das Américas' },
  { value: 'US', label: '🇺🇸 Só Estados Unidos', description: 'Apenas vídeos dos EUA' },
  { value: 'BR', label: '🇧🇷 Só Brasil', description: 'Apenas vídeos do Brasil' },
];

export function PortalRegionSelector({ value, onChange }: PortalRegionSelectorProps) {
  // Normalizar o valor atual para comparação
  const normalizeValue = (val: string | string[]): string => {
    if (Array.isArray(val)) {
      if (val.length === 0) return 'US';
      if (val.length > 1) return 'ALL_AMERICAS';
      return val[0];
    }
    return val || 'US';
  };

  const currentValue = normalizeValue(value);

  const handleRegionChange = (newValue: string) => {
    // Garantir que o valor seja passado corretamente
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
        <Globe className="w-4 h-4" />
        Região
      </label>
      <div className="grid grid-cols-3 gap-2">
        {REGION_OPTIONS.map((option) => {
          const isSelected = currentValue === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleRegionChange(option.value)}
              className={cn(
                "px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                isSelected
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-md"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-700"
              )}
              title={option.description}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

