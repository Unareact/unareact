'use client';

import { useEditorStore } from '@/app/stores/editor-store';
import { ArrowRight, Sparkles, Video, Download, FileText, Scissors } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface QuickAction {
  label: string;
  action: () => void;
  icon: any;
  description: string;
  primary?: boolean;
}

export function QuickActions() {
  const { activePanel, setActivePanel, script, clips } = useEditorStore();

  const getQuickActions = (): QuickAction[] => {
    switch (activePanel) {
      case 'viral':
        return [
          {
            label: 'Criar Roteiro',
            action: () => setActivePanel('script' as any),
            icon: FileText,
            description: 'Gere um roteiro baseado em vídeos virais',
            primary: script.length === 0
          },
        ];
      
      case 'script':
        return [
          {
            label: 'Adicionar Mídia',
            action: () => setActivePanel('editor' as any),
            icon: Video,
            description: 'Adicione vídeos e imagens à timeline',
            primary: script.length > 0 && clips.length === 0
          },
        ];
      
      case 'editor':
        return [
          {
            label: 'Visualizar Preview',
            action: () => setActivePanel('preview' as any),
            icon: Video,
            description: 'Veja como ficou seu vídeo',
            primary: clips.length > 0
          },
        ];
      
      case 'preview':
        return [
          {
            label: 'Exportar Vídeo',
            action: () => setActivePanel('download' as any),
            icon: Download,
            description: 'Baixe seu vídeo final',
            primary: clips.length > 0
          },
        ];
      
      default:
        return [];
    }
  };

  const actions = getQuickActions();

  if (actions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Próxima Ação Sugerida
            </h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {actions[0].description}
          </p>
        </div>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm whitespace-nowrap",
                action.primary
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              )}
            >
              <Icon className="w-4 h-4" />
              {action.label}
              <ArrowRight className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

