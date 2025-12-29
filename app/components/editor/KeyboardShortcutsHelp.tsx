'use client';

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Space', description: 'Play/Pause' },
    { key: 'K', description: 'Play/Pause (alternativa)' },
    { key: '←', description: 'Voltar 1 segundo' },
    { key: 'Shift + ←', description: 'Voltar 10 segundos' },
    { key: '→', description: 'Avançar 1 segundo' },
    { key: 'Shift + →', description: 'Avançar 10 segundos' },
    { key: 'J', description: 'Voltar 10 segundos' },
    { key: 'L', description: 'Avançar 10 segundos' },
    { key: 'Home', description: 'Ir para início' },
    { key: 'End', description: 'Ir para fim' },
    { key: 'Ctrl+Z', description: 'Desfazer (Undo)' },
    { key: 'Ctrl+Shift+Z', description: 'Refazer (Redo)' },
    { key: 'Ctrl+Y', description: 'Refazer (Redo alternativo)' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Atalhos de teclado"
      >
        <Keyboard className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Atalhos de Teclado
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
              <kbd className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

