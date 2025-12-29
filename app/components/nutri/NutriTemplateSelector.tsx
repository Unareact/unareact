'use client';

import { useState } from 'react';
import { NutriVideoTemplate } from '@/app/lib/nutri-templates';
import { Play, Clock, Users, Target } from 'lucide-react';

interface NutriTemplateSelectorProps {
  templates: NutriVideoTemplate[];
  onSelect: (template: NutriVideoTemplate) => void;
}

export function NutriTemplateSelector({ templates, onSelect }: NutriTemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Escolha um Template de Vídeo
        </h3>
        <p className="text-gray-600">
          Selecione o tipo de vídeo que você quer criar. Cada template vem com roteiro otimizado e pronto para usar.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => {
              setSelectedId(template.id);
              onSelect(template);
            }}
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
              selectedId === template.id
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>
              </div>
              {selectedId === template.id && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{template.duration}s</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="capitalize">{template.style}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Target className="w-4 h-4" />
                <span className="capitalize">{template.tone}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Público:</strong> {template.targetAudience}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Template selecionado:</strong> {templates.find(t => t.id === selectedId)?.name}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Clique em "Continuar" para personalizar o roteiro
          </p>
        </div>
      )}
    </div>
  );
}

