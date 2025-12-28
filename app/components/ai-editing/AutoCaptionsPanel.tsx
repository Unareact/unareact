'use client';

import { useState } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { generateCaptionsFromScript, syncCaptionsWithAudio, type Caption } from '@/app/lib/ai-editing/auto-captions';
import { Type, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function AutoCaptionsPanel() {
  const { script } = useEditorStore();
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handleGenerate = () => {
    if (script.length === 0) {
      setError('Gere um roteiro primeiro');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Gerar legendas a partir do roteiro
      const generated = generateCaptionsFromScript(script);
      setCaptions(generated);
      setPreviewVisible(true);
    } catch (err: any) {
      console.error('Erro ao gerar legendas:', err);
      setError(err.message || 'Erro ao gerar legendas');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditCaption = (id: string, newText: string) => {
    setCaptions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, text: newText } : c))
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Type className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Legendas Automáticas
        </h2>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Gere legendas automaticamente a partir do seu roteiro. Edite e ajuste antes de aplicar.
      </p>

      {/* Botão de Gerar */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || script.length === 0}
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
            <span>Gerando Legendas...</span>
          </>
        ) : (
          <>
            <Type className="w-5 h-5" />
            <span>Gerar Legendas do Roteiro</span>
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

      {/* Preview das Legendas */}
      {captions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Legendas Geradas ({captions.length})
            </h3>
            <button
              onClick={() => setPreviewVisible(!previewVisible)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {previewVisible ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Ocultar Preview
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Mostrar Preview
                </>
              )}
            </button>
          </div>

          {previewVisible && (
            <div className="space-y-2 max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              {captions.map((caption) => (
                <div
                  key={caption.id}
                  className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(caption.startTime)} - {formatTime(caption.endTime)}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={caption.text}
                    onChange={(e) => handleEditCaption(caption.id, e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <button
              className="flex-1 py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aprovar e Aplicar
            </button>
            <button
              onClick={() => {
                setCaptions([]);
                setPreviewVisible(false);
              }}
              className="flex-1 py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Rejeitar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

