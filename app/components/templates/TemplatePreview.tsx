'use client';

import { VisualTemplate } from '@/app/lib/visual-templates';
import { X } from 'lucide-react';

interface TemplatePreviewProps {
  template: VisualTemplate;
  onClose: () => void;
}

export function TemplatePreview({ template, onClose }: TemplatePreviewProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Preview: {template.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview Visual */}
        <div
          className="aspect-video rounded-lg p-8 mb-6 flex items-center justify-center"
          style={{
            backgroundColor: template.colors.background,
            color: template.colors.text,
          }}
        >
          <div
            className="text-center"
            style={{
              fontFamily: template.typography.fontFamily,
              fontSize: `${template.typography.fontSize}px`,
              fontWeight: template.typography.fontWeight,
            }}
          >
            <div
              className="mb-4"
              style={{ color: template.colors.primary }}
            >
              Texto Principal
            </div>
            <div
              className="text-sm"
              style={{ color: template.colors.secondary }}
            >
              Texto Secundário
            </div>
          </div>
        </div>

        {/* Informações do Template */}
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Cores</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: template.colors.primary }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Primária</span>
                </div>
                <code className="text-xs text-gray-500">{template.colors.primary}</code>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: template.colors.secondary }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Secundária</span>
                </div>
                <code className="text-xs text-gray-500">{template.colors.secondary}</code>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: template.colors.accent }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Destaque</span>
                </div>
                <code className="text-xs text-gray-500">{template.colors.accent}</code>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: template.colors.background }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fundo</span>
                </div>
                <code className="text-xs text-gray-500">{template.colors.background}</code>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tipografia</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Fonte: {template.typography.fontFamily}</p>
              <p>Tamanho: {template.typography.fontSize}px</p>
              <p>Peso: {template.typography.fontWeight}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Animações</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Entrada de Texto: {template.animations.textEntrance}</p>
              <p>Transição: {template.animations.transition}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Efeitos</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Brilho: {template.effects.brightness}x</p>
              <p>Contraste: {template.effects.contrast}x</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

