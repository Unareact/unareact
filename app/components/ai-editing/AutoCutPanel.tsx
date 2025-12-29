'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { suggestAutoCuts, applyCuts, type CutSuggestion } from '@/app/lib/ai-editing/auto-cut';
import { Scissors, CheckCircle2, X, Loader2, AlertCircle, Play } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function AutoCutPanel() {
  const { clips, script, setClips } = useEditorStore();
  const [suggestions, setSuggestions] = useState<CutSuggestion[]>([]);
  const [approvedCuts, setApprovedCuts] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewClipId, setPreviewClipId] = useState<string | null>(null);

  const handleGenerateSuggestions = async () => {
    if (clips.length === 0 || script.length === 0) {
      setError('Adicione clips e um roteiro para gerar sugestões de corte');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuggestions([]);
    setApprovedCuts(new Set());

    try {
      const cuts = await suggestAutoCuts(clips, script);
      setSuggestions(cuts);
    } catch (err: any) {
      console.error('Erro ao gerar sugestões:', err);
      setError(err.message || 'Erro ao gerar sugestões de corte');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleApproval = (cutId: string) => {
    const newApproved = new Set(approvedCuts);
    if (newApproved.has(cutId)) {
      newApproved.delete(cutId);
    } else {
      newApproved.add(cutId);
    }
    setApprovedCuts(newApproved);
  };

  const handleApplyCuts = async () => {
    const toApply = suggestions.filter((s) => approvedCuts.has(s.id));
    if (toApply.length === 0) {
      setError('Selecione pelo menos um corte para aplicar');
      return;
    }

    setIsApplying(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newClips = applyCuts(clips, toApply);
      setClips(newClips);
      setSuggestions([]);
      setApprovedCuts(new Set());
      
      setSuccessMessage(`✅ ${toApply.length} corte(s) aplicado(s) com sucesso!`);
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Erro ao aplicar cortes:', err);
      setError(err.message || 'Erro ao aplicar cortes');
    } finally {
      setIsApplying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getClipName = (clipId: string) => {
    const clip = clips.find((c) => c.id === clipId);
    return clip ? `Clip ${clips.indexOf(clip) + 1}` : clipId;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Scissors className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Auto-Cut por IA
        </h2>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        A IA analisa seu roteiro e clips para sugerir cortes ideais que melhoram o ritmo e sincronização.
      </p>

      {/* Botão de Gerar */}
      <button
        onClick={handleGenerateSuggestions}
        disabled={isGenerating || clips.length === 0 || script.length === 0}
        className={cn(
          'w-full py-3 px-6 rounded-lg font-medium text-white transition-all',
          'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analisando...</span>
          </>
        ) : (
          <>
            <Scissors className="w-5 h-5" />
            <span>Gerar Sugestões de Corte</span>
          </>
        )}
      </button>

      {/* Mensagem de Sucesso */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Sugestões */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Sugestões ({suggestions.length})
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {approvedCuts.size} aprovado(s)
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {suggestions.map((suggestion) => {
              const isApproved = approvedCuts.has(suggestion.id);
              const confidenceColor =
                suggestion.confidence > 0.8
                  ? 'text-green-600 dark:text-green-400'
                  : suggestion.confidence > 0.6
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400';

              return (
                <div
                  key={suggestion.id}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all',
                    isApproved
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {getClipName(suggestion.clipId)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          • {formatTime(suggestion.timestamp)}
                        </span>
                        <span className={cn('text-xs font-medium', confidenceColor)}>
                          {Math.round(suggestion.confidence * 100)}% confiança
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {suggestion.reason}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
                        {suggestion.action}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleApproval(suggestion.id)}
                      className={cn(
                        'p-2 rounded-lg transition-all flex-shrink-0',
                        isApproved
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      )}
                      title={isApproved ? 'Desaprovar' : 'Aprovar'}
                    >
                      {isApproved ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botão de Aplicar */}
          {approvedCuts.size > 0 && (
            <button
              onClick={handleApplyCuts}
              disabled={isApplying}
              className={cn(
                'w-full py-3 px-6 rounded-lg font-medium text-white transition-all',
                'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Aplicando {approvedCuts.size} corte(s)...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Aplicar {approvedCuts.size} Corte(s) Aprovado(s)</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

