'use client';

import { useState } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { VISUAL_TEMPLATES, VisualTemplate, applyVisualTemplate } from '@/app/lib/visual-templates';
import { Palette, CheckCircle2, Loader2, Eye } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { TemplatePreview } from './TemplatePreview';

export function VisualTemplateSelector() {
  const { clips, setClips } = useEditorStore();
  const [selectedTemplate, setSelectedTemplate] = useState<VisualTemplate | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<VisualTemplate | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleApply = async () => {
    if (!selectedTemplate || clips.length === 0) return;

    setIsApplying(true);
    setSuccessMessage(null);

    try {
      // Aplicar template aos clips
      const updatedClips = applyVisualTemplate(selectedTemplate, clips);
      setClips(updatedClips);

      setSuccessMessage(`✅ Template "${selectedTemplate.name}" aplicado com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const getUseCase = (templateId: string): string => {
    const useCases: Record<string, string> = {
      'modern-clean': 'Ideal para: conteúdo educacional, tutoriais, tecnologia, startups',
      'classic-professional': 'Ideal para: apresentações corporativas, treinamentos, negócios B2B',
      'minimal-elegant': 'Ideal para: marcas premium, produtos de luxo, conteúdo sofisticado',
      'bold-vibrant': 'Ideal para: redes sociais, entretenimento, chamadas de ação impactantes',
      'elegant-luxury': 'Ideal para: marcas de alto padrão, produtos exclusivos, conteúdo premium',
      'playful-fun': 'Ideal para: conteúdo casual, vlogs, entretenimento, público jovem',
    };
    return useCases[templateId] || 'Template versátil para diversos tipos de conteúdo';
  };

  return (
    <div className="space-y-4">
      {/* Header Explicativo */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Templates Visuais
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Aplique estilos visuais pré-configurados ao seu vídeo. Os templates definem cores, tipografia, animações e efeitos automaticamente.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mt-2">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                💡 Quando usar:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Quando quer um estilo visual consistente em todo o vídeo</li>
                <li>Para aplicar rapidamente cores e efeitos profissionais</li>
                <li>Antes de adicionar textos sobrepostos (os templates definem o estilo dos textos)</li>
                <li>Para manter identidade visual da marca</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          {selectedTemplate && (
            <button
              onClick={handleApply}
              disabled={isApplying || clips.length === 0}
              className={cn(
                'px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg',
                'bg-purple-600 text-white hover:bg-purple-700',
                'disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed disabled:shadow-none',
                'flex items-center gap-2'
              )}
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Aplicando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aplicar Template "{selectedTemplate.name}"</span>
                </>
              )}
            </button>
          )}
        </div>
        {selectedTemplate && (
          <button
            onClick={handleApply}
            disabled={isApplying || clips.length === 0}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              'bg-purple-600 text-white hover:bg-purple-700',
              'disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Aplicando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Aplicar Template</span>
              </>
            )}
          </button>
        )}
      </div>

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
            <CheckCircle2 className="w-4 h-4" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {clips.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Adicione clips à timeline primeiro para aplicar um template.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {VISUAL_TEMPLATES.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <div
              key={template.id}
              className={cn(
                'border-2 rounded-lg p-4 cursor-pointer transition-all',
                isSelected
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
              )}
              onClick={() => setSelectedTemplate(template)}
            >
              {/* Preview de Cores */}
              <div className="flex gap-1 mb-3">
                <div
                  className="flex-1 h-12 rounded"
                  style={{ backgroundColor: template.colors.primary }}
                />
                <div
                  className="flex-1 h-12 rounded"
                  style={{ backgroundColor: template.colors.secondary }}
                />
                <div
                  className="flex-1 h-12 rounded"
                  style={{ backgroundColor: template.colors.accent }}
                />
              </div>

              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">
                      {template.name}
                    </h4>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {template.description}
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 mt-2">
                    <p className="text-[10px] font-medium text-blue-800 dark:text-blue-300">
                      {getUseCase(template.id)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewingTemplate(template);
                  }}
                  className="flex-1 px-3 py-1.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded capitalize">
                  {template.style}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewingTemplate && (
        <TemplatePreview
          template={previewingTemplate}
          onClose={() => setPreviewingTemplate(null)}
        />
      )}
    </div>
  );
}

