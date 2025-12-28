'use client';

import { useState } from 'react';
import { Globe, X, Check } from 'lucide-react';
import { cn } from '@/app/lib/utils';

const AMERICAS_REGIONS = {
  'América do Norte': [
    { code: 'US', name: 'Estados Unidos' },
    { code: 'CA', name: 'Canadá' },
    { code: 'MX', name: 'México' },
  ],
  'América Central': [
    { code: 'GT', name: 'Guatemala' },
    { code: 'CU', name: 'Cuba' },
    { code: 'HT', name: 'Haiti' },
    { code: 'DO', name: 'República Dominicana' },
    { code: 'HN', name: 'Honduras' },
    { code: 'NI', name: 'Nicarágua' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'PA', name: 'Panamá' },
  ],
  'América do Sul': [
    { code: 'BR', name: 'Brasil' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CO', name: 'Colômbia' },
    { code: 'CL', name: 'Chile' },
    { code: 'PE', name: 'Peru' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'EC', name: 'Equador' },
    { code: 'BO', name: 'Bolívia' },
    { code: 'PY', name: 'Paraguai' },
    { code: 'UY', name: 'Uruguai' },
  ],
  'Caribe': [
    { code: 'JM', name: 'Jamaica' },
    { code: 'TT', name: 'Trinidad e Tobago' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BB', name: 'Barbados' },
  ],
  'Outros': [
    { code: 'SR', name: 'Suriname' },
    { code: 'GY', name: 'Guiana' },
  ],
};

const ALL_CODES = Object.values(AMERICAS_REGIONS).flat().map(r => r.code);

interface RegionSelectorProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

export function RegionSelector({ value, onChange }: RegionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isAllAmericas = value === 'ALL_AMERICAS' || (Array.isArray(value) && value.length === ALL_CODES.length);
  const selectedCodes = Array.isArray(value) ? value : (value === 'ALL_AMERICAS' ? ALL_CODES : [value]);
  const selectedCount = selectedCodes.length;

  const handleToggleAll = () => {
    if (isAllAmericas) {
      onChange([]);
    } else {
      onChange('ALL_AMERICAS');
    }
  };

  const handleToggleCountry = (code: string) => {
    if (isAllAmericas) {
      // Se estava "Toda América", desmarcar tudo e marcar apenas este
      onChange([code]);
    } else {
      const current = Array.isArray(value) ? value : (value === 'ALL_AMERICAS' ? [] : [value]);
      if (current.includes(code)) {
        // Desmarcar país
        const newValue = current.filter(c => c !== code);
        onChange(newValue.length === 0 ? [] : newValue);
      } else {
        // Marcar país
        const newValue = [...current, code];
        // Se selecionou todos, usar 'ALL_AMERICAS' para melhor performance
        onChange(newValue.length === ALL_CODES.length ? 'ALL_AMERICAS' : newValue);
      }
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className="relative">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
        <Globe className="w-4 h-4" />
        Região
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm text-left flex items-center justify-between hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
      >
        <span>
          {isAllAmericas 
            ? '🌎 Toda América' 
            : selectedCount === 0 
              ? 'Selecione países...' 
              : `${selectedCount} país${selectedCount !== 1 ? 'es' : ''} selecionado${selectedCount !== 1 ? 's' : ''}`}
        </span>
        <span className="text-gray-400">▼</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                    isAllAmericas
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  <Check className={cn("w-4 h-4", isAllAmericas ? "opacity-100" : "opacity-0")} />
                  Toda América
                </button>
                {selectedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
            <div className="p-2">
              {Object.entries(AMERICAS_REGIONS).map(([groupName, countries]) => (
                <div key={groupName} className="mb-4">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    {groupName}
                  </div>
                  <div className="space-y-1">
                    {countries.map((country) => {
                      const isSelected = selectedCodes.includes(country.code);
                      return (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleToggleCountry(country.code)}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors",
                            isSelected
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          )}
                        >
                          <Check className={cn("w-4 h-4", isSelected ? "opacity-100" : "opacity-0")} />
                          {country.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

