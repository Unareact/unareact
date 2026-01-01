'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NutriTopicInput } from './NutriTopicInput';
import { NutriTemplateSelector } from './NutriTemplateSelector';
import { NutriScriptEditor } from './NutriScriptEditor';
import { FileText, Video, Sparkles, CheckCircle2, Edit2 } from 'lucide-react';
import { useEditorStore } from '@/app/stores/editor-store';
import { NutriVideoTemplate } from '@/app/lib/nutri-templates';
import { ScriptSegment } from '@/app/types';

type WorkflowStep = 'topic' | 'select' | 'edit' | 'complete';

export function NutriVideoCreator() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('topic');
  const [generatedTemplates, setGeneratedTemplates] = useState<NutriVideoTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<NutriVideoTemplate | null>(null);
  const [editedSegments, setEditedSegments] = useState<ScriptSegment[]>([]);
  const { setScript, setActivePanel } = useEditorStore();

  const handleTemplatesGenerated = (templates: NutriVideoTemplate[]) => {
    setGeneratedTemplates(templates);
    setCurrentStep('select');
  };

  const handleTemplateSelect = (template: NutriVideoTemplate) => {
    setSelectedTemplate(template);
    setEditedSegments(template.segments);
    setCurrentStep('edit');
  };

  const handleScriptUpdate = (segments: ScriptSegment[]) => {
    setEditedSegments(segments);
  };

  const handleApprove = () => {
    // Aplicar o roteiro editado ao editor ANTES de mudar de etapa
    setScript(editedSegments);
    // Salvar no localStorage também para garantir persistência
    if (typeof window !== 'undefined') {
      localStorage.setItem('una-nutri-script', JSON.stringify(editedSegments));
      localStorage.setItem('una-active-panel', 'editor');
    }
    // Ir direto para a edição (pula etapa de mídia)
    setCurrentStep('complete');
  };


  const handleGoToEditor = (e?: React.MouseEvent) => {
    // Garantir que o roteiro está aplicado e salvo
    // Usar editedSegments se disponível, senão usar o template selecionado
    const segmentsToSave = editedSegments.length > 0 
      ? editedSegments 
      : (selectedTemplate?.segments || []);
    
    // Salvar no store e localStorage ANTES de navegar
    setScript(segmentsToSave);
    setActivePanel('editor');
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('una-nutri-script', JSON.stringify(segmentsToSave));
      localStorage.setItem('una-active-panel', 'editor');
    }
    
    // Se for um evento de Link, não prevenir o comportamento padrão
    // Se não, usar router.push como fallback
    if (!e) {
      router.push('/nutri/editor');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          Criador de Vídeos YLADA Nutri
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Crie Vídeos de Marketing para Nutricionistas
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Digite o tópico, escolha o template, edite o roteiro e vá direto para a edição (com upload de mídia)
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {[
            { id: 'topic', label: 'Tópico', icon: FileText },
            { id: 'select', label: 'Template', icon: Sparkles },
            { id: 'edit', label: 'Editar', icon: Edit2 },
            { id: 'complete', label: 'Edição', icon: Video }
          ].map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const stepOrder = ['topic', 'select', 'edit', 'complete'];
            const isCompleted = stepOrder.indexOf(currentStep) > stepOrder.indexOf(step.id);
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span
                    className={`mt-2 text-xs sm:text-sm font-medium hidden sm:block ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`h-1 w-8 sm:w-16 mx-2 transition-all ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {currentStep === 'topic' && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Como você quer começar?
              </h3>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => {
                    // Mostrar input de tópico
                    setCurrentStep('topic');
                  }}
                  className="p-6 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                >
                  <Sparkles className="w-8 h-8 text-blue-600 mb-3" />
                  <h4 className="font-bold text-gray-900 mb-2">Gerar do Tópico</h4>
                  <p className="text-sm text-gray-600">
                    Digite um tópico e nós criamos templates automaticamente com IA
                  </p>
                </button>
                <button
                  onClick={() => {
                    // Carregar templates pré-definidos
                    import('@/app/lib/nutri-templates').then(({ getAllNutriTemplates }) => {
                      const templates = getAllNutriTemplates();
                      setGeneratedTemplates(templates);
                      setCurrentStep('select');
                    });
                  }}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
                >
                  <FileText className="w-8 h-8 text-gray-600 mb-3" />
                  <h4 className="font-bold text-gray-900 mb-2">Templates Prontos</h4>
                  <p className="text-sm text-gray-600">
                    Escolha entre 5 templates pré-configurados e otimizados
                  </p>
                </button>
                <Link
                  href="/nutri/upload"
                  className="p-6 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                >
                  <Video className="w-8 h-8 text-purple-600 mb-3" />
                  <h4 className="font-bold text-gray-900 mb-2">Editar Vídeo</h4>
                  <p className="text-sm text-gray-600">
                    Já tem um vídeo? Faça upload e edite direto
                  </p>
                </Link>
              </div>
            </div>
            <NutriTopicInput onTemplatesGenerated={handleTemplatesGenerated} />
          </div>
        )}

        {currentStep === 'select' && generatedTemplates.length > 0 && (
          <div>
            <button
              onClick={() => setCurrentStep('topic')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm"
            >
              ← Voltar
            </button>
            <NutriTemplateSelector 
              templates={generatedTemplates}
              onSelect={handleTemplateSelect} 
            />
          </div>
        )}

        {currentStep === 'edit' && selectedTemplate && (
          <NutriScriptEditor
            segments={editedSegments}
            onUpdate={handleScriptUpdate}
            onApprove={handleApprove}
            onBack={() => setCurrentStep('select')}
          />
        )}

        {currentStep === 'complete' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Roteiro Aprovado!
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Seu roteiro está pronto. Agora você pode adicionar vídeos, imagens e editar no editor principal.
            </p>
            <Link
              href="/nutri/editor"
              onClick={handleGoToEditor}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mx-auto"
            >
              <Video className="w-5 h-5" />
              Ir para o Editor
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
