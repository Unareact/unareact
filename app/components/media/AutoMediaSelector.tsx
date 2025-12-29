'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { suggestMediaForScript, type MediaSuggestion } from '@/app/lib/ai-media-selector';
import { MediaAsset } from '@/app/lib/ai-media-selector';
import { Sparkles, Loader2, CheckCircle2, Image, Video, AlertCircle } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function AutoMediaSelector() {
  const { script, clips, addClip } = useEditorStore();
  const [suggestions, setSuggestions] = useState<MediaSuggestion[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Map<string, MediaAsset>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Gerar sugestões automaticamente quando o script mudar
    if (script.length > 0 && suggestions.length === 0) {
      handleGenerate();
    }
  }, [script]);

  const handleGenerate = async () => {
    if (script.length === 0) {
      setError('Adicione um roteiro primeiro');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuggestions([]);
    setSelectedMedia(new Map());

    try {
      const mediaSuggestions = await suggestMediaForScript(script);
      setSuggestions(mediaSuggestions);
      
      // Selecionar automaticamente a primeira sugestão de cada segmento
      const autoSelected = new Map<string, MediaAsset>();
      mediaSuggestions.forEach((suggestion) => {
        if (suggestion.suggestions.length > 0) {
          autoSelected.set(suggestion.segmentId, suggestion.suggestions[0]);
        }
      });
      setSelectedMedia(autoSelected);
    } catch (err: any) {
      console.error('Erro ao gerar sugestões:', err);
      setError(err.message || 'Erro ao gerar sugestões de mídia');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectMedia = (segmentId: string, media: MediaAsset) => {
    const newSelected = new Map(selectedMedia);
    newSelected.set(segmentId, media);
    setSelectedMedia(newSelected);
  };

  const handleApply = async () => {
    if (selectedMedia.size === 0) {
      setError('Selecione pelo menos uma mídia');
      return;
    }

    setIsApplying(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let currentTime = 0;
      
      // Calcular tempo total dos clips existentes
      if (clips.length > 0) {
        currentTime = Math.max(...clips.map(c => c.endTime));
      }

      // Adicionar clips na ordem do roteiro
      const sortedSegments = [...script].sort((a, b) => a.timestamp - b.timestamp);
      
      for (const segment of sortedSegments) {
        const media = selectedMedia.get(segment.id);
        if (media) {
          const duration = media.duration || segment.duration || 5;
          addClip({
            id: `auto-${segment.id}-${Date.now()}`,
            source: media.src,
            type: media.type,
            startTime: currentTime,
            endTime: currentTime + duration,
          });
          currentTime += duration;
        }
      }

      setSuccessMessage(`✅ ${selectedMedia.size} mídia(s) aplicada(s) com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Erro ao aplicar mídia:', err);
      setError(err.message || 'Erro ao aplicar mídia');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Seleção Automática de Mídia
          </h3>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || script.length === 0}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            'bg-purple-600 text-white hover:bg-purple-700',
            'disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed',
            'flex items-center gap-2'
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Gerar Sugestões</span>
            </>
          )}
        </button>
      </div>

      {script.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">Adicione um roteiro primeiro para gerar sugestões de mídia.</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
            <CheckCircle2 className="w-4 h-4" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedMedia.size} de {suggestions.length} segmentos com mídia selecionada
            </p>
            <button
              onClick={handleApply}
              disabled={isApplying || selectedMedia.size === 0}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                'bg-green-600 text-white hover:bg-green-700',
                'disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Aplicando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aplicar à Timeline</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestions.map((suggestion) => {
              const selected = selectedMedia.get(suggestion.segmentId);
              return (
                <div
                  key={suggestion.segmentId}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                >
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {suggestion.segmentText}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {suggestion.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {suggestion.suggestions.map((media, idx) => {
                      const isSelected = selected?.id === media.id;
                      return (
                        <button
                          key={media.id}
                          onClick={() => handleSelectMedia(suggestion.segmentId, media)}
                          className={cn(
                            'relative aspect-video rounded-lg overflow-hidden border-2 transition-all',
                            isSelected
                              ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                          )}
                        >
                          {media.type === 'video' ? (
                            <video
                              src={media.thumbnail}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={media.thumbnail}
                              alt={media.alt}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                          <div className="absolute bottom-1 right-1">
                            {media.type === 'video' ? (
                              <Video className="w-3 h-3 text-white bg-black/50 rounded p-0.5" />
                            ) : (
                              <Image className="w-3 h-3 text-white bg-black/50 rounded p-0.5" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

