'use client';

import { useState } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { generateScript } from '@/app/lib/openai';
import { ScriptGenerationParams } from '@/app/types';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function ScriptGenerator() {
  const { setIsGeneratingScript, setScript, isGeneratingScript } = useEditorStore();
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [style, setStyle] = useState<ScriptGenerationParams['style']>('educational');
  const [tone, setTone] = useState<ScriptGenerationParams['tone']>('casual');

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGeneratingScript(true);
    try {
      const segments = await generateScript({
        topic,
        duration,
        style,
        tone,
      });
      setScript(segments);
    } catch (error) {
      console.error('Erro ao gerar roteiro:', error);
      alert('Erro ao gerar roteiro. Verifique sua API key da OpenAI.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Gerador de Roteiro IA
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tópico do Vídeo
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Como criar conteúdo para redes sociais"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGeneratingScript}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duração (segundos)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={10}
              max={600}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGeneratingScript}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estilo
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as ScriptGenerationParams['style'])}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGeneratingScript}
            >
              <option value="educational">Educacional</option>
              <option value="entertaining">Entretenimento</option>
              <option value="promotional">Promocional</option>
              <option value="documentary">Documentário</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tom
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as ScriptGenerationParams['tone'])}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGeneratingScript}
          >
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="energetic">Energético</option>
            <option value="calm">Calmo</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGeneratingScript || !topic.trim()}
          className={cn(
            "w-full py-3 px-6 rounded-lg font-medium text-white transition-all",
            "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center gap-2"
          )}
        >
          {isGeneratingScript ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gerando roteiro...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Gerar Roteiro com IA
            </>
          )}
        </button>
      </div>
    </div>
  );
}

