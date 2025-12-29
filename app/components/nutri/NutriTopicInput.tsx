'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { generateNutriTemplatesFromTopic } from '@/app/lib/nutri-template-generator';
import { NutriVideoTemplate } from '@/app/lib/nutri-templates';

interface NutriTopicInputProps {
  onTemplatesGenerated: (templates: NutriVideoTemplate[]) => void;
}

export function NutriTopicInput({ onTemplatesGenerated }: NutriTopicInputProps) {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Por favor, digite um tópico');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const templates = await generateNutriTemplatesFromTopic(topic, duration);
      if (templates.length === 0) {
        setError('Não foi possível gerar templates. Tente novamente.');
        return;
      }
      onTemplatesGenerated(templates);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar templates. Verifique sua API key da OpenAI.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Digite o Tópico do Seu Vídeo
        </h3>
        <p className="text-gray-600 text-sm">
          Descreva o tema do vídeo e nós criaremos templates otimizados automaticamente
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tópico do Vídeo
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Como encher agenda automaticamente, Como organizar clientes, Quizzes que geram leads..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isGenerating}
          />
          <p className="text-xs text-gray-500 mt-2">
            Seja específico sobre o que você quer no vídeo
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Duração (segundos)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="30"
              max="120"
              step="15"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1"
              disabled={isGenerating}
            />
            <span className="text-lg font-semibold text-gray-900 w-16 text-right">
              {duration}s
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gerando Templates...
            </>
          ) : (
            <>
              Gerar Templates Automaticamente
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

