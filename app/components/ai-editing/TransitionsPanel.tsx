'use client';

import { useState } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { suggestTransitions, applyTransitions, type Transition } from '@/app/lib/ai-editing/transitions';
import { Film, CheckCircle2, X, Loader2, AlertCircle, Play } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function TransitionsPanel() {
  const { clips, script, setClips } = useEditorStore();
  const [suggestions, setSuggestions] = useState<Transition[]>([]);
  const [approvedTransitions, setApprovedTransitions] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (clips.length < 2) {
      setError('Adicione pelo menos 2 clips para gerar transições');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuggestions([]);
    setApprovedTransitions(new Set());

    try {
      const transitions = await suggestTransitions(clips, script);
      setSuggestions(transitions);
    } catch (err: any) {
      console.error('Erro ao gerar transições:', err);
      setError(err.message || 'Erro ao gerar sugestões de transição');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleApproval = (transitionId: string) => {
    const newApproved = new Set(approvedTransitions);
    if (newApproved.has(transitionId)) {
      newApproved.delete(transitionId);
    } else {
      newApproved.add(transitionId);
    }
    setApprovedTransitions(newApproved);
  };

  const handleApply = () => {
    const toApply = suggestions.filter((s) => approvedTransitions.has(s.id));
    if (toApply.length === 0) {
      setError('Selecione pelo menos uma transição para aplicar');
      return;
    }

    const newClips = applyTransitions(clips, toApply);
    setClips(newClips);
    setSuggestions([]);
    setApprovedTransitions(new Set());
  };

  const getClipName = (clipId: string) => {
    const clip = clips.find((c) => c.id === clipId);
    return clip ? `Clip ${clips.indexOf(clip) + 1}` : clipId;
  };

  const getTransitionIcon = (type: string) => {
    switch (type) {
      case 'fade':
        return '⬜';
      case 'wipe':
        return '➡️';
      case 'zoom':
        return '🔍';
      case 'slide':
        return '↔️';
      case 'dissolve':
        return '✨';
      default:
        return '🎬';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Film className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Transições Inteligentes
        </h2>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        A IA analisa seus clips e sugere transições ideais para melhorar o fluxo visual.
      </p>

      {/* Botão de Gerar */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || clips.length < 2}
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
            <Film className="w-5 h-5" />
            <span>Gerar Sugestões de Transição</span>
          </>
        )}
      </button>

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
              {approvedTransitions.size} aprovada(s)
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {suggestions.map((suggestion) => {
              const isApproved = approvedTransitions.has(suggestion.id);
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
                        <span className="text-lg">{getTransitionIcon(suggestion.type)}</span>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {getClipName(suggestion.fromClipId)} → {getClipName(suggestion.toClipId)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          • {suggestion.duration}s
                        </span>
                        <span className={cn('text-xs font-medium', confidenceColor)}>
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {suggestion.reason}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded capitalize">
                        {suggestion.type}
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
          {approvedTransitions.size > 0 && (
            <button
              onClick={handleApply}
              className={cn(
                'w-full py-3 px-6 rounded-lg font-medium text-white transition-all',
                'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
                'flex items-center justify-center gap-2'
              )}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Aplicar {approvedTransitions.size} Transição(ões) Aprovada(s)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

