'use client';

import { useEditorStore } from '@/app/stores/editor-store';
import { usePathname } from 'next/navigation';
import { TrendingUp, FileText, Scissors, Video, Download, CheckCircle2, ArrowRight, Sparkles, Lightbulb } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useRouter } from 'next/navigation';

interface WorkflowStep {
  id: string;
  label: string;
  icon: any;
  description: string;
  nextAction?: string;
  tip?: string;
}

const getStepsForFlow = (flow: string | null): WorkflowStep[] => {
  const baseSteps: WorkflowStep[] = [
    { 
      id: 'viral', 
      label: 'Buscar Vídeos', 
      icon: TrendingUp, 
      description: 'Encontre vídeos virais',
      nextAction: 'Escolha um vídeo e clique em "Criar Vídeo"',
      tip: 'Use filtros para encontrar vídeos com alto engajamento'
    },
    { 
      id: 'script', 
      label: 'Criar Roteiro', 
      icon: FileText, 
      description: 'Gere seu roteiro',
      nextAction: 'Preencha o tópico e gere o roteiro com IA',
      tip: 'Use insights virais para roteiros mais eficazes'
    },
    { 
      id: 'editor', 
      label: 'Editar Vídeo', 
      icon: Scissors, 
      description: 'Adicione mídia e edite',
      nextAction: 'Adicione vídeos/imagens à timeline',
      tip: 'Arraste e solte para reorganizar os clips'
    },
    { 
      id: 'preview', 
      label: 'Preview', 
      icon: Video, 
      description: 'Visualize o resultado',
      nextAction: 'Teste o vídeo antes de exportar',
      tip: 'Verifique se tudo está sincronizado'
    },
    { 
      id: 'download', 
      label: 'Exportar', 
      icon: Download, 
      description: 'Baixe o vídeo final',
      nextAction: 'Exporte seu vídeo pronto',
      tip: 'O vídeo será renderizado e disponibilizado para download'
    },
  ];

  // Personalizar steps baseado no fluxo
  if (flow === 'nutri') {
    return [
      { 
        id: 'script', 
        label: 'Escolher Template', 
        icon: Sparkles, 
        description: 'Selecione um template',
        nextAction: 'Escolha um dos 5 templates disponíveis',
        tip: 'Cada template é otimizado para conversão'
      },
      ...baseSteps.slice(1)
    ];
  }

  if (flow === 'portal') {
    return [
      { 
        id: 'viral', 
        label: 'Buscar Vídeos', 
        icon: TrendingUp, 
        description: 'Vídeos Portal Magra',
        nextAction: 'Encontre vídeos sobre fitness e bem-estar',
        tip: 'Filtros já aplicados para Portal Magra'
      },
      ...baseSteps.slice(1)
    ];
  }

  return baseSteps;
};

export function EnhancedWorkflowGuide() {
  const { activePanel, setActivePanel, script, clips } = useEditorStore();
  const pathname = usePathname();
  const router = useRouter();
  
  const activeFlow = pathname === '/portal' ? 'portal' : pathname === '/nutri' ? 'nutri' : pathname === '/react' ? 'react' : pathname === '/viral' ? 'viral' : null;
  const steps = getStepsForFlow(activeFlow);
  
  const currentStepIndex = steps.findIndex(step => step.id === activePanel);
  const currentStep = steps[currentStepIndex];
  const nextStep = currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;

  // Determinar se pode avançar
  const canAdvance = () => {
    if (activePanel === 'viral') return true; // Sempre pode buscar vídeos
    if (activePanel === 'script') return script.length > 0; // Precisa ter roteiro
    if (activePanel === 'editor') return clips.length > 0; // Precisa ter clips
    if (activePanel === 'preview') return clips.length > 0; // Precisa ter clips para preview
    return true;
  };

  const handleNext = () => {
    if (nextStep && ['script', 'editor', 'preview', 'viral', 'download', 'my-downloads'].includes(nextStep.id)) {
      setActivePanel(nextStep.id as 'script' | 'editor' | 'preview' | 'viral' | 'download' | 'my-downloads');
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-purple-900/20 border-b border-purple-200 dark:border-purple-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
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
                  <button
                    onClick={() => {
                      if (['script', 'editor', 'preview', 'viral', 'download', 'my-downloads'].includes(step.id)) {
                        setActivePanel(step.id as 'script' | 'editor' | 'preview' | 'viral' | 'download' | 'my-downloads');
                      }
                    }}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer",
                      isActive && "bg-gradient-to-r from-purple-600 to-blue-600 text-white scale-110 shadow-lg",
                      isCompleted && "bg-green-500 text-white hover:bg-green-600",
                      !isActive && !isCompleted && "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </button>
                  <div className="text-center">
                    <span
                      className={cn(
                        "text-xs font-semibold block",
                        isActive && "text-purple-600 dark:text-purple-400",
                        isCompleted && "text-green-600 dark:text-green-400",
                        !isActive && !isCompleted && "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {step.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                      {step.description}
                    </span>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-1 flex-1 mx-2 rounded-full transition-colors",
                      isCompleted && "bg-green-500",
                      !isCompleted && "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Info & Next Action */}
        {currentStep && (
          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Etapa Atual: {currentStep.label}
                  </h3>
                </div>
                {currentStep.nextAction && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentStep.nextAction}
                  </p>
                )}
                {currentStep.tip && (
                  <div className="mt-2 flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-300">
                      💡 {currentStep.tip}
                    </p>
                  </div>
                )}
              </div>

              {/* Next Button */}
              {nextStep && canAdvance() && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg text-sm font-semibold whitespace-nowrap"
                >
                  Próximo: {nextStep.label}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

