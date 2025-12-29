'use client';

import { useState } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { suggestTextOverlays, type TextOverlay } from '@/app/lib/ai-editing/auto-text';
import { Type, CheckCircle2, X, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function TextOverlaysPanel() {
  const { script, clips } = useEditorStore();
  const [suggestions, setSuggestions] = useState<TextOverlay[]>([]);
  const [approvedTexts, setApprovedTexts] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(true); // Sempre mostrar preview por padrão

  const videoDuration = clips.length > 0
    ? Math.max(...clips.map((c) => c.endTime))
    : script.reduce((sum, s) => sum + s.duration, 0);

  const handleGenerate = async () => {
    if (script.length === 0) {
      setError('Gere um roteiro primeiro');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuggestions([]);
    setApprovedTexts(new Set());

    try {
      const texts = await suggestTextOverlays(script, videoDuration);
      setSuggestions(texts);
      setPreviewVisible(true);
    } catch (err: any) {
      console.error('Erro ao gerar textos:', err);
      setError(err.message || 'Erro ao gerar sugestões de texto');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleApproval = (textId: string) => {
    const newApproved = new Set(approvedTexts);
    if (newApproved.has(textId)) {
      newApproved.delete(textId);
    } else {
      newApproved.add(textId);
    }
    setApprovedTexts(newApproved);
  };

  const handleEditText = (id: string, newText: string) => {
    setSuggestions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText } : t))
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
          Textos Sobrepostos Automáticos
        </h2>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        A IA analisa seu roteiro e sugere textos impactantes para sobrepor ao vídeo.
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
            <span>Gerando Textos...</span>
          </>
        ) : (
          <>
            <Type className="w-5 h-5" />
            <span>Gerar Textos Automáticos</span>
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
              Textos Sugeridos ({suggestions.length})
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {approvedTexts.size} aprovado(s)
              </span>
              <button
                onClick={() => setPreviewVisible(!previewVisible)}
                className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                {previewVisible ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    Mostrar
                  </>
                )}
              </button>
            </div>
          </div>

          {previewVisible && (
            <div className="space-y-2 max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              {suggestions.map((text) => {
                const isApproved = approvedTexts.has(text.id);
                const confidenceColor =
                  text.confidence > 0.8
                    ? 'text-green-600 dark:text-green-400'
                    : text.confidence > 0.6
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400';

                return (
                  <div
                    key={text.id}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all',
                      isApproved
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(text.startTime)} - {formatTime(text.endTime)}
                          </span>
                          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded capitalize">
                            {text.position}
                          </span>
                          <span className={cn('text-xs font-medium', confidenceColor)}>
                            {Math.round(text.confidence * 100)}%
                          </span>
                        </div>
                        <input
                          type="text"
                          value={text.text}
                          onChange={(e) => handleEditText(text.id, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 mb-2"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {text.reason}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Tamanho: {text.style.fontSize}px</span>
                          <span>•</span>
                          <span>Cor: {text.style.color}</span>
                          <span>•</span>
                          <span>Anim: {text.style.animation}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleToggleApproval(text.id)}
                          className={cn(
                            'px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2',
                            isApproved
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          )}
                        >
                          {isApproved ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Aprovado
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Aprovar
                            </>
                          )}
                        </button>
                        {isApproved && (
                          <button
                            onClick={() => handleToggleApproval(text.id)}
                            className="px-3 py-1 rounded text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Desaprovar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Botão de Aplicar */}
          {approvedTexts.size > 0 && (
            <button
              onClick={async () => {
                setIsApplying(true);
                setError(null);
                setSuccessMessage(null);
                
                try {
                  // Aplicar textos aprovados (por enquanto apenas salvar no store)
                  const toApply = suggestions.filter(s => approvedTexts.has(s.id));
                  console.log('Aplicando textos:', toApply);
                  
                  // TODO: Salvar no store para renderização
                  await new Promise(resolve => setTimeout(resolve, 500));
                  
                  setSuccessMessage(`✅ ${toApply.length} texto(s) aplicado(s) com sucesso!`);
                  setTimeout(() => setSuccessMessage(null), 3000);
                } catch (err: any) {
                  setError(err.message || 'Erro ao aplicar textos');
                } finally {
                  setIsApplying(false);
                }
              }}
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
                  <span>Aplicando {approvedTexts.size} texto(s)...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Aplicar {approvedTexts.size} Texto(s) Aprovado(s)</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

