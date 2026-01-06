'use client';

import { TrendingUp, FileText, Scissors, CheckCircle2, ArrowRight, Sparkles, Lightbulb, Play } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface WorkflowStep {
  id: string;
  label: string;
  icon: any;
  description: string;
  href: string;
  instructions: string[];
  tip?: string;
}

const portalSteps: WorkflowStep[] = [
  {
    id: 'viral',
    label: '1. Buscar Vídeos',
    icon: TrendingUp,
    description: 'Escolha um vídeo viral',
    href: '/portal/viral',
    instructions: [
      'Clique em "Buscar Vídeos Virais"',
      'Escolha um vídeo e clique em "Roteiro"',
      'O roteiro será gerado automaticamente'
    ],
  },
  {
    id: 'editor',
    label: '2. Editar e Exportar',
    icon: Scissors,
    description: 'Adicione mídia e finalize',
    href: '/portal/editor',
    instructions: [
      'Adicione vídeos/imagens à timeline',
      'Use o chat de IA para editar',
      'Exporte quando estiver pronto'
    ],
  },
];

export function PortalWorkflowGuide() {
  const pathname = usePathname();
  
  // Determinar etapa atual
  const getCurrentStep = (): number => {
    if (pathname?.includes('/portal/viral')) return 0;
    if (pathname?.includes('/portal/editor')) {
      // Verificar se tem roteiro no localStorage ou no store
      if (typeof window !== 'undefined') {
        const script = localStorage.getItem('una-nutri-script');
        // Verificar também se tem script no editor store (via sessionStorage ou outro método)
        try {
          const editorState = sessionStorage.getItem('una-editor-state');
          if (editorState) {
            const parsed = JSON.parse(editorState);
            if (parsed.script && parsed.script.length > 0) return 2;
          }
        } catch (e) {
          // Ignorar erro
        }
        if (script) return 2; // Já tem roteiro, está no editor
        // Verificar se está na aba de script
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('panel') === 'script') return 1; // Está na aba de roteiro
        return 2; // Está no editor (pode ter roteiro ou não)
      }
      return 1;
    }
    return -1; // Na página principal
  };

  const currentStepIndex = getCurrentStep();
  // Se estiver na página principal, mostrar o primeiro passo como ativo
  const displayStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const currentStep = currentStepIndex >= 0 ? portalSteps[currentStepIndex] : portalSteps[0];

  return (
    <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 border-b border-purple-200">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Portal Magra - Criar Anúncio
            </h2>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Busque vídeos virais → Roteiro automático → Edite e exporte
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {portalSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === displayStepIndex;
            const isCompleted = index < currentStepIndex && currentStepIndex >= 0;
            const isUpcoming = index > displayStepIndex;

            return (
              <div
                key={step.id}
                className={cn(
                  "relative bg-white rounded-xl shadow-lg p-6 border-2 transition-all",
                  isActive && "border-purple-500 shadow-xl scale-105",
                  isCompleted && "border-green-500",
                  isUpcoming && "border-gray-200 opacity-75"
                )}
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                      isActive && "bg-gradient-to-r from-pink-500 to-purple-600 text-white",
                      isCompleted && "bg-green-500 text-white",
                      isUpcoming && "bg-gray-200 text-gray-500"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                      Atual
                    </div>
                  )}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center mb-4",
                    isActive && "bg-gradient-to-r from-pink-500 to-purple-600",
                    isCompleted && "bg-green-100",
                    isUpcoming && "bg-gray-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-8 h-8",
                      isActive && "text-white",
                      isCompleted && "text-green-600",
                      isUpcoming && "text-gray-400"
                    )}
                  />
                </div>

                {/* Content */}
                <h3
                  className={cn(
                    "text-lg font-bold mb-2",
                    isActive && "text-gray-900",
                    isCompleted && "text-green-700",
                    isUpcoming && "text-gray-500"
                  )}
                >
                  {step.label}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{step.description}</p>

                {/* Instructions - apenas para o passo ativo */}
                {isActive && (
                  <div className="space-y-1.5 mb-4">
                    {step.instructions.map((instruction, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                        <span>{instruction}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <Link
                  href={step.href}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg",
                    isActive && "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700",
                    isCompleted && "bg-green-100 text-green-700 hover:bg-green-200",
                    isUpcoming && "bg-gray-100 text-gray-500 cursor-not-allowed"
                  )}
                  onClick={(e) => {
                    if (isUpcoming) {
                      e.preventDefault();
                    }
                  }}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Concluído
                    </>
                  ) : isActive ? (
                    <>
                      <Play className="w-5 h-5" />
                      Começar Agora
                    </>
                  ) : (
                    <>
                      <span>Próximo Passo</span>
                    </>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

