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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Templates Visuais
          </h3>
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
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {template.description}
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                )}
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

