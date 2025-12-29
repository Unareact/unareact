'use client';

import { useState, useRef } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { generateNarrationComplete, type NarrationSegment } from '@/app/lib/ai-editing/text-to-speech';
import { Volume2, Play, Pause, Loader2, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function NarrationPanel() {
  const { script } = useEditorStore();
  const [narration, setNarration] = useState<{ audioUrl: string; duration: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voice, setVoice] = useState<'male' | 'female' | 'energetic' | 'calm'>('male');
  const [audioMode, setAudioMode] = useState<'replace' | 'add' | 'keep'>('replace');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (script.length === 0) {
      setError('Gere um roteiro primeiro');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setIsPlaying(false);

    try {
      const result = await generateNarrationComplete(script, voice);
      setNarration(result);
    } catch (err: any) {
      console.error('Erro ao gerar narração:', err);
      setError(err.message || 'Erro ao gerar narração');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!narration) return;

    if (!audioRef.current) {
      const audio = new Audio(narration.audioUrl);
      audio.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current = audio;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Narração Automática (TTS)
        </h2>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Gere narração automática do seu roteiro usando IA. Preview antes de aplicar ao vídeo.
      </p>

      {/* Aviso sobre vídeo com áudio existente */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">
              Vídeo com áudio existente?
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              Se seu vídeo já tem narração/áudio, você pode: <strong>manter o original</strong>, <strong>substituir</strong> ou <strong>adicionar como camada adicional</strong> (mixagem).
            </p>
          </div>
        </div>
      </div>

      {/* Seleção de Voz */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Voz
        </label>
        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value as any)}
          disabled={isGenerating}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
        >
          <option value="male">Masculina</option>
          <option value="female">Feminina</option>
          <option value="energetic">Energética</option>
          <option value="calm">Calma</option>
        </select>
      </div>

      {/* Modo de Áudio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Modo de Áudio
        </label>
        <select
          value={audioMode}
          onChange={(e) => setAudioMode(e.target.value as any)}
          disabled={isGenerating}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
        >
          <option value="replace">Substituir áudio original</option>
          <option value="add">Adicionar como camada (mixagem)</option>
          <option value="keep">Manter áudio original (não gerar)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {audioMode === 'replace' && 'O áudio original será removido e substituído pela narração gerada.'}
          {audioMode === 'add' && 'A narração será adicionada junto com o áudio original (você pode ajustar volumes depois).'}
          {audioMode === 'keep' && 'O áudio original será mantido. A narração não será gerada.'}
        </p>
      </div>

      {/* Botão de Gerar */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || script.length === 0 || audioMode === 'keep'}
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
            <span>Gerando Narração...</span>
          </>
        ) : audioMode === 'keep' ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Áudio Original Será Mantido</span>
          </>
        ) : (
          <>
            <Volume2 className="w-5 h-5" />
            <span>Gerar Narração</span>
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

      {/* Preview da Narração */}
      {narration && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Narração Gerada
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Duração: {formatTime(narration.duration)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayPause}
                className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
              <a
                href={narration.audioUrl}
                download="narration.mp3"
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="flex-1 py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Aprovar e Aplicar
            </button>
            <button
              onClick={() => {
                setNarration(null);
                setIsPlaying(false);
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

