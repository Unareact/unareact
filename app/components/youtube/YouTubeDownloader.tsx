'use client';

import { useState } from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function YouTubeDownloader() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('best');

  const getVideoInfo = async () => {
    if (!videoUrl.trim()) {
      setError('Digite uma URL do YouTube');
      return;
    }

    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const response = await fetch(`/api/youtube/download?url=${encodeURIComponent(videoUrl)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao obter informações');
      }

      setVideoInfo(data.videoInfo);
    } catch (err: any) {
      setError(err.message || 'Erro ao obter informações do vídeo');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoUrl.trim()) {
      setError('Digite uma URL do YouTube');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/youtube/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          format,
          quality,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.installInstructions) {
          throw new Error(
            `yt-dlp não está instalado.\n\nInstale com:\n${data.installInstructions.macOS || data.installInstructions.linux || 'pip install yt-dlp'}`
          );
        }
        throw new Error(data.error || 'Erro ao fazer download');
      }

      setSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer download');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Teste de Download do YouTube
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Teste o download de vídeos do YouTube usando yt-dlp
        </p>
      </div>

      {/* Aviso sobre ToS */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
              Aviso Importante
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              O download de vídeos do YouTube pode violar os Termos de Serviço. 
              Use apenas para fins educacionais, pessoais ou com permissão do criador. 
              Respeite direitos autorais.
            </p>
          </div>
        </div>
      </div>

      {/* Input de URL */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          URL do Vídeo do YouTube
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={getVideoInfo}
            disabled={loading || !videoUrl.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Info
          </button>
        </div>
      </div>

      {/* Informações do Vídeo */}
      {videoInfo && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Informações do Vídeo
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Título:</span>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{videoInfo.title}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Duração:</span>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {formatDuration(videoInfo.duration)}
              </p>
            </div>
          </div>
          {videoInfo.thumbnail && (
            <img
              src={videoInfo.thumbnail}
              alt="Thumbnail"
              className="w-full rounded-lg"
            />
          )}
        </div>
      )}

      {/* Opções de Download */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Formato
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={loading}
          >
            <option value="mp4">MP4</option>
            <option value="webm">WebM</option>
            <option value="mkv">MKV</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Qualidade
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={loading}
          >
            <option value="best">Melhor</option>
            <option value="worst">Pior</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
            <option value="360p">360p</option>
          </select>
        </div>
      </div>

      {/* Botão de Download */}
      <button
        onClick={handleDownload}
        disabled={loading || !videoUrl.trim()}
        className={cn(
          "w-full py-3 px-6 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2",
          "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Baixando...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Baixar Vídeo
          </>
        )}
      </button>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                Erro
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 whitespace-pre-line">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sucesso */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                Download Concluído!
              </p>
              <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
                <p>Arquivo: {success.filename}</p>
                <p>Tamanho: {formatFileSize(success.size)}</p>
                <p className="text-xs mt-2">
                  Local: {success.path}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instruções de Instalação */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          Instalação do yt-dlp
        </p>
        <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1 font-mono">
          <p><strong>macOS:</strong> brew install yt-dlp</p>
          <p><strong>Linux:</strong> pip install yt-dlp</p>
          <p><strong>Windows:</strong> pip install yt-dlp</p>
        </div>
      </div>
    </div>
  );
}

