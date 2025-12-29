'use client';

import { useState, useEffect } from 'react';
import { NutriVideoTemplate } from '@/app/lib/nutri-templates';
import { useEditorStore } from '@/app/stores/editor-store';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface NutriScriptGeneratorProps {
  template: NutriVideoTemplate;
  onComplete: () => void;
}

export function NutriScriptGenerator({ template, onComplete }: NutriScriptGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const { setScript } = useEditorStore();

  useEffect(() => {
    // Simular geração (na prática, poderia fazer ajustes finais com IA)
    const timer = setTimeout(() => {
      // Aplicar o roteiro do template ao editor
      setScript(template.segments);
      setIsGenerating(false);
      
      // Auto-completar após 2 segundos
      setTimeout(() => {
        onComplete();
      }, 2000);
    }, 1500);

    return () => clearTimeout(timer);
  }, [template, setScript, onComplete]);

  return (
    <div className="text-center py-12">
      {isGenerating ? (
        <>
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Gerando seu roteiro...
          </h3>
          <p className="text-gray-600">
            Aplicando o template "{template.name}" ao editor
          </p>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Roteiro aplicado com sucesso!
          </h3>
          <p className="text-gray-600">
            Redirecionando para o editor...
          </p>
        </>
      )}
    </div>
  );
}

