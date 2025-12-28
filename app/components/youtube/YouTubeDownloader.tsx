'use client';

import { useState, useEffect } from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle, Info, ExternalLink, Scissors, ArrowRight } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useEditorStore } from '@/app/stores/editor-store';

export function YouTubeDownloader() {
  const { pendingDownloadUrl, setPendingDownloadUrl, setActivePanel, addClip } = useEditorStore();
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('best');

  // Preencher URL quando vier da lista de virais
  useEffect(() => {
    if (pendingDownloadUrl) {
      setVideoUrl(pendingDownloadUrl);
      setPendingDownloadUrl(null); // Limpar após usar
    }
  }, [pendingDownloadUrl, setPendingDownloadUrl]);

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
      
      // Salvar download no Supabase
      try {
        await fetch('/api/downloads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            video_url: videoUrl,
            video_id: data.videoId || videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1] || 'unknown',
            platform: 'youtube',
            title: videoInfo?.title || null,
            filename: data.filename,
            file_size: data.size,
            file_path: data.path,
            storage_url: null, // Em produção, você faria upload para Supabase Storage
            format: format,
            quality: quality,
            duration: videoInfo?.duration || null,
          }),
        });
      } catch (err) {
        console.error('Erro ao salvar download no Supabase:', err);
        // Não bloquear o fluxo se falhar ao salvar
      }
      
      // Redirecionar automaticamente para o editor após 2 segundos
      setTimeout(() => {
        setActivePanel('editor');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer download');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToEditor = () => {
    setActivePanel('editor');
  };

  const handleAddToTimeline = () => {
    if (success) {
      // Adicionar vídeo à timeline usando o caminho do arquivo
      // Nota: Em produção, você precisaria servir o arquivo via API ou usar cloud storage
      // Por enquanto, usamos a URL original para referência
      const duration = videoInfo?.duration || 60; // Usar duração do vídeo se disponível, senão 60s padrão
      
      addClip({
        id: `download-${Date.now()}`,
        startTime: 0,
        endTime: duration,
        source: videoUrl || success.path, // Usar URL original ou caminho do arquivo
        type: 'video',
      });
      
      // Ir para o editor
      setActivePanel('editor');
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
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800 space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Teste de Download do YouTube
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Teste o download de vídeos do YouTube usando yt-dlp
        </p>
      </div>

      {/* Aviso sobre ToS */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
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
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          URL do Vídeo do YouTube
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={getVideoInfo}
            disabled={loading || !videoUrl.trim()}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm touch-manipulation"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Formato
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            disabled={loading}
          >
            <option value="mp4">MP4</option>
            <option value="webm">WebM</option>
            <option value="mkv">MKV</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Qualidade
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
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
          "w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation",
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
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                ✅ Download Concluído!
              </p>
              <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
                <p><strong>Arquivo:</strong> {success.filename}</p>
                <p><strong>Tamanho:</strong> {formatFileSize(success.size)}</p>
                <p className="text-xs mt-2 text-green-600 dark:text-green-500">
                  📁 Local: {success.path}
                </p>
              </div>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-green-200 dark:border-green-800">
            <button
              onClick={handleGoToEditor}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors"
            >
              <Scissors className="w-4 h-4" />
              Ir para Editor
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddToTimeline}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Adicionar à Timeline
            </button>
          </div>
          
          <p className="text-xs text-green-600 dark:text-green-500 text-center">
            💡 Você será redirecionado para o Editor em alguns segundos...
          </p>
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

