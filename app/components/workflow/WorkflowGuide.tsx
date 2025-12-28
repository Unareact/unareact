'use client';

import { useEditorStore } from '@/app/stores/editor-store';
import { TrendingUp, FileText, Scissors, Video, Download, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/app/lib/utils';

const steps = [
  { id: 'viral', label: 'Buscar Vídeos', icon: TrendingUp, description: 'Encontre vídeos virais' },
  { id: 'script', label: 'Criar Roteiro', icon: FileText, description: 'Gere seu roteiro' },
  { id: 'editor', label: 'Editar Vídeo', icon: Scissors, description: 'Edite seu vídeo' },
  { id: 'preview', label: 'Preview', icon: Video, description: 'Visualize o resultado' },
  { id: 'download', label: 'Download', icon: Download, description: 'Baixe o vídeo final' },
];

export function WorkflowGuide() {
  const { activePanel } = useEditorStore();
  const currentStepIndex = steps.findIndex(step => step.id === activePanel);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 overflow-x-auto">
          {steps.map((step, index) => {
            const isActive = step.id === activePanel;
            const isCompleted = index < currentStepIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 min-w-0 flex-1",
                  index < steps.length - 1 && "flex-shrink-0"
                )}
              >
                {/* Step Circle */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      isActive && "bg-purple-600 text-white scale-110",
                      isCompleted && "bg-green-500 text-white",
                      !isActive && !isCompleted && "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium text-center whitespace-nowrap",
                      isActive && "text-purple-600 dark:text-purple-400",
                      isCompleted && "text-green-600 dark:text-green-400",
                      !isActive && !isCompleted && "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-colors",
                      isCompleted && "bg-green-500",
                      !isCompleted && "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

