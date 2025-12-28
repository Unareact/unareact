'use client';

import { useState } from 'react';
import type { ViralDiagnosis } from '@/app/types';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  Scissors, 
  FileText, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Heart,
  MessageCircle,
  Wand2
} from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useEditorStore } from '@/app/stores/editor-store';
import { generateScriptFromViralDiagnosis } from '@/app/lib/openai';

interface ViralDiagnosisProps {
  videoId: string;
  videoTitle: string;
  platform?: 'youtube' | 'tiktok';
  onClose?: () => void;
}

export function ViralDiagnosis({ videoId, videoTitle, platform = 'youtube', onClose }: ViralDiagnosisProps) {
  const [diagnosis, setDiagnosis] = useState<ViralDiagnosis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const { setScript, setActivePanel, setCurrentViralDiagnosis } = useEditorStore();

  const generateDiagnosis = async () => {
    // Verificar se é TikTok (ainda não suportado)
    if (platform === 'tiktok') {
      setError('Diagnóstico de vídeos do TikTok ainda não está disponível. Esta funcionalidade está disponível apenas para vídeos do YouTube.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, platform }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao gerar diagnóstico');
      }

      const data = await response.json();
      setDiagnosis(data.diagnosis);
      // Armazenar diagnóstico no store para uso no gerador de roteiros
      setCurrentViralDiagnosis(data.diagnosis);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar diagnóstico');
    } finally {
      setLoading(false);
    }
  };

  const applyToEditor = () => {
    if (!diagnosis) return;

    // Criar roteiro baseado no template sugerido
    const segments = diagnosis.scriptTemplate.segments.map((seg, index) => ({
      id: `diagnosis-${Date.now()}-${index}`,
      text: seg.example || seg.description,
      duration: seg.duration,
      timestamp: diagnosis.scriptTemplate.segments.slice(0, index).reduce((acc, s) => acc + s.duration, 0),
      type: seg.type === 'hook' ? 'intro' as const : 
            seg.type === 'cta' ? 'outro' as const : 
            'content' as const,
    }));

    setScript(segments);
    setActivePanel('script');
    if (onClose) onClose();
  };

  const generateOptimizedScript = async () => {
    if (!diagnosis) return;

    setGeneratingScript(true);
    try {
      // Pedir tópico e duração ao usuário
      const topic = prompt('Qual o tópico do seu vídeo?', '');
      if (!topic) {
        setGeneratingScript(false);
        return;
      }

      const durationInput = prompt('Qual a duração desejada em segundos?', '60');
      let duration = parseInt(durationInput || '60', 10);

      if (isNaN(duration) || duration < 10) {
        alert('Duração inválida. Usando 60 segundos como padrão.');
        duration = 60;
      }

      // Gerar roteiro otimizado usando os insights virais
      const segments = await generateScriptFromViralDiagnosis(topic, duration, diagnosis);
      
      setScript(segments);
      setActivePanel('script');
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Erro ao gerar roteiro otimizado:', err);
      alert('Erro ao gerar roteiro otimizado: ' + err.message);
    } finally {
      setGeneratingScript(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Analisando vídeo viral... Isso pode levar alguns segundos.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-red-800 dark:text-red-300">Erro</h3>
        </div>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={generateDiagnosis}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Diagnóstico de Viralização
          </h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Analise por que este vídeo viralizou e receba recomendações inteligentes para criar conteúdo similar.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          <strong>Vídeo:</strong> {videoTitle}
        </p>
        <button
          onClick={generateDiagnosis}
          className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Gerar Diagnóstico com IA
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Diagnóstico Completo
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={generateOptimizedScript}
            disabled={generatingScript}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {generatingScript ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Gerar Roteiro Otimizado
              </>
            )}
          </button>
          <button
            onClick={applyToEditor}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Usar Template
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Engajamento</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {diagnosis.metrics.engagementRate.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-red-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Like/View</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {diagnosis.metrics.likeToViewRatio.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Comment/View</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {diagnosis.metrics.commentToViewRatio.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Por que viralizou */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            💡 Por que este vídeo viralizou?
          </h3>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {diagnosis.insights.whyItWentViral}
          </p>
        </div>
        
        {/* Momentos-chave */}
        {diagnosis.insights.keyMoments && diagnosis.insights.keyMoments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-yellow-200 dark:border-yellow-800">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Momentos-Chave do Vídeo
            </h4>
            <div className="space-y-3">
              {diagnosis.insights.keyMoments.map((moment, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs font-mono font-medium">
                      {moment.timestamp}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Momento {i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                    {moment.description}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                    Impacto: {moment.impact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fatores de Viralização */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Fatores de Viralização
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Hook (Gancho)</p>
            <p className="text-gray-900 dark:text-gray-100">{diagnosis.viralFactors.hook}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ritmo</p>
            <p className="text-gray-900 dark:text-gray-100 capitalize">{diagnosis.viralFactors.pacing}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Estrutura</p>
            <p className="text-gray-900 dark:text-gray-100">{diagnosis.viralFactors.structure}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Call to Action</p>
            <p className="text-gray-900 dark:text-gray-100">{diagnosis.viralFactors.callToAction}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Gatilhos Emocionais</p>
            <div className="flex flex-wrap gap-2">
              {diagnosis.viralFactors.emotionalTriggers.map((trigger, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm"
                >
                  {trigger}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recomendações de Edição */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-4">
          <Scissors className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ✂️ Recomendações Práticas para Edição
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Duração do Intro
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {diagnosis.editingRecommendations.introDuration}s
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Hook deve prender atenção neste tempo
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Ritmo Sugerido</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
              {diagnosis.editingRecommendations.pacing}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">🎵 Estilo de Música</p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {diagnosis.editingRecommendations.musicStyle}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">🎨 Estilo Visual</p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {diagnosis.editingRecommendations.visualStyle}
            </p>
          </div>
        </div>
        
        {diagnosis.editingRecommendations.transitions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🔄 Transições Recomendadas</p>
            <div className="flex flex-wrap gap-2">
              {diagnosis.editingRecommendations.transitions.map((trans, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800"
                >
                  {trans}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {diagnosis.editingRecommendations.effects.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">✨ Efeitos Recomendados</p>
            <div className="flex flex-wrap gap-2">
              {diagnosis.editingRecommendations.effects.map((effect, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Template de Roteiro */}
      {diagnosis.scriptTemplate.segments.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                📝 Template de Roteiro Sugerido
              </h3>
            </div>
            <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded">
              Estrutura: {diagnosis.scriptTemplate.structure}
            </span>
          </div>
          <div className="space-y-3">
            {diagnosis.scriptTemplate.segments.map((segment, index) => {
              const totalTime = diagnosis.scriptTemplate.segments.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
              const segmentTypeLabels: Record<string, string> = {
                hook: '🎣 Hook (Gancho)',
                setup: '📋 Setup (Contexto)',
                conflict: '⚡ Conflito (Tensão)',
                resolution: '✅ Resolução',
                cta: '📢 Call to Action'
              };
              
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg text-xs font-semibold">
                        {segmentTypeLabels[segment.type] || segment.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')} - {Math.floor((totalTime + segment.duration) / 60)}:{((totalTime + segment.duration) % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                      {segment.duration}s
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                    <strong>Objetivo:</strong> {segment.description}
                  </p>
                  {segment.example && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">💬 Exemplo de Texto:</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 italic leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-3 rounded border-l-4 border-purple-500">
                        "{segment.example}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              💡 <strong>Dica:</strong> Use o botão "Aplicar ao Editor" acima para importar este roteiro diretamente para o editor de scripts.
            </p>
          </div>
        </div>
      )}

      {/* Recomendações Gerais */}
      {diagnosis.insights.recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recomendações Gerais
            </h3>
          </div>
          <ul className="space-y-2">
            {diagnosis.insights.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-blue-600 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

