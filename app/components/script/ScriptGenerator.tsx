'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { generateScript } from '@/app/lib/openai';
import { ScriptGenerationParams } from '@/app/types';
import { Sparkles, Loader2, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function ScriptGenerator() {
  const { setIsGeneratingScript, setScript, isGeneratingScript, currentViralDiagnosis } = useEditorStore();
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [style, setStyle] = useState<ScriptGenerationParams['style']>('educational');
  const [tone, setTone] = useState<ScriptGenerationParams['tone']>('casual');
  const [useViralInsights, setUseViralInsights] = useState(false);

  // Ativar uso de insights virais se houver diagnóstico disponível
  useEffect(() => {
    if (currentViralDiagnosis && !useViralInsights) {
      setUseViralInsights(true);
    }
  }, [currentViralDiagnosis]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGeneratingScript(true);
    try {
      const params: ScriptGenerationParams = {
        topic,
        duration,
        style,
        tone,
      };

      // Se houver diagnóstico viral e o usuário quiser usar, adicionar insights
      if (useViralInsights && currentViralDiagnosis) {
        params.viralInsights = {
          viralFactors: currentViralDiagnosis.viralFactors,
          insights: currentViralDiagnosis.insights,
          editingRecommendations: currentViralDiagnosis.editingRecommendations,
        };
      }

      const segments = await generateScript(params);
      setScript(segments);
    } catch (error) {
      console.error('Erro ao gerar roteiro:', error);
      alert('Erro ao gerar roteiro. Verifique sua API key da OpenAI.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg p-4 sm:p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          Gerador de Roteiro IA
        </h2>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Aviso sobre insights virais disponíveis */}
        {currentViralDiagnosis && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  🎯 Insights Virais Disponíveis
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Você tem um diagnóstico viral de "{currentViralDiagnosis.videoTitle}". 
                  Use esses insights para gerar um roteiro otimizado!
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useViralInsights}
                    onChange={(e) => setUseViralInsights(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 flex-shrink-0"
                    disabled={isGeneratingScript}
                  />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    Usar insights virais para otimizar o roteiro
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tópico do Vídeo
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Como criar conteúdo para redes sociais"
            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGeneratingScript}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duração (segundos)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={10}
              max={600}
              className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGeneratingScript}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estilo
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as ScriptGenerationParams['style'])}
              className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tom
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as ScriptGenerationParams['tone'])}
            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            "w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium text-white transition-all text-sm sm:text-base",
            useViralInsights && currentViralDiagnosis
              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center gap-2"
          )}
        >
          {isGeneratingScript ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              <span className="hidden sm:inline">Gerando roteiro...</span>
              <span className="sm:hidden">Gerando...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">
                {useViralInsights && currentViralDiagnosis 
                  ? 'Gerar Roteiro Otimizado com IA' 
                  : 'Gerar Roteiro com IA'}
              </span>
              <span className="sm:hidden">Gerar Roteiro</span>
            </>
          )}
        </button>
        
        {useViralInsights && currentViralDiagnosis && (
          <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs">
              O roteiro será otimizado usando os padrões identificados no vídeo viral: 
              <strong className="text-purple-700 dark:text-purple-300"> {currentViralDiagnosis.videoTitle}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

