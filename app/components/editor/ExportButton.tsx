'use client';

import { useState } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function ExportButton() {
  const { clips, script } = useEditorStore();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [quality, setQuality] = useState<'720p' | '1080p' | '4K'>('1080p');

  const handleExport = async () => {
    if (clips.length === 0) {
      setError('Adicione pelo menos um clip à timeline antes de exportar');
      return;
    }

    setIsExporting(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clips,
          script,
          quality,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao renderizar vídeo');
      }

      const data = await response.json();
      setSuccess('Vídeo renderizado com sucesso!');
      
      // Fazer download automaticamente
      if (data.videoUrl) {
        const downloadLink = document.createElement('a');
        downloadLink.href = data.videoUrl;
        downloadLink.download = data.filename || 'video.mp4';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    } catch (err: any) {
      console.error('Erro ao exportar:', err);
      setError(err.message || 'Erro ao exportar vídeo');
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  if (clips.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">
            Adicione clips à timeline antes de exportar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Exportar Vídeo
        </h2>
      </div>

      {/* Seleção de Qualidade */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Qualidade
        </label>
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value as '720p' | '1080p' | '4K')}
          disabled={isExporting}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
        >
          <option value="720p">720p (HD)</option>
          <option value="1080p">1080p (Full HD)</option>
          <option value="4K">4K (Ultra HD)</option>
        </select>
      </div>

      {/* Progresso */}
      {isExporting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Renderizando...</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Mensagens de Erro/Sucesso */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Botão de Exportar */}
      <button
        onClick={handleExport}
        disabled={isExporting || clips.length === 0}
        className={cn(
          'w-full py-3 px-6 rounded-lg font-medium text-white transition-all',
          'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Renderizando...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Exportar Vídeo</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        O vídeo será renderizado e baixado automaticamente
      </p>
    </div>
  );
}

