'use client';

import { useState } from 'react';
import { NutriVideoTemplate } from '@/app/lib/nutri-templates';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';

interface NutriWorkflowGuideProps {
  template: NutriVideoTemplate;
  onGenerate: () => void;
  onBack: () => void;
}

export function NutriWorkflowGuide({ template, onGenerate, onBack }: NutriWorkflowGuideProps) {
  const [customizations, setCustomizations] = useState({
    duration: template.duration,
    includeCta: true,
    includeStats: true,
  });

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Personalize seu Vídeo
        </h3>
        <p className="text-gray-600">
          Revise o template e faça ajustes se necessário. O roteiro será gerado automaticamente.
        </p>
      </div>

      {/* Template Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              {template.name}
            </h4>
            <p className="text-gray-700 mb-4">
              {template.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-600">Duração:</span>{' '}
                <span className="font-semibold text-gray-900">{template.duration}s</span>
              </div>
              <div>
                <span className="text-gray-600">Estilo:</span>{' '}
                <span className="font-semibold text-gray-900 capitalize">{template.style}</span>
              </div>
              <div>
                <span className="text-gray-600">Tom:</span>{' '}
                <span className="font-semibold text-gray-900 capitalize">{template.tone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview do Roteiro */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Preview do Roteiro
        </h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {template.segments.map((segment, index) => (
            <div
              key={segment.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase">
                      {segment.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {segment.duration}s
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {segment.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Call to Action:</strong> {template.cta}
        </p>
        <p className="text-xs text-yellow-700 mt-2">
          Link: {template.yladaUrl}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={onGenerate}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Gerar Roteiro e Ir para Editor
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

