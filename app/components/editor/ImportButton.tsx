'use client';

import { useState } from 'react';
import { Upload, Link as LinkIcon, File, X, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/app/stores/editor-store';
import { VideoClip } from '@/app/types';

export function ImportButton() {
  const [showMenu, setShowMenu] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addClip, clips } = useEditorStore();

  const handleFileUpload = () => {
    setShowMenu(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*,image/*,audio/*';
    input.multiple = true;
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        const clip: VideoClip = {
          id: `upload-${Date.now()}-${Math.random()}`,
          startTime: clips.length > 0 ? Math.max(...clips.map(c => c.endTime)) : 0,
          endTime: clips.length > 0 ? Math.max(...clips.map(c => c.endTime)) + (isVideo ? 10 : 5) : (isVideo ? 10 : 5),
          source: url,
          type: isVideo ? 'video' : isImage ? 'image' : 'video',
        };
        addClip(clip);
      }
    };
    input.click();
  };

  const handleUrlImport = async () => {
    if (!url.trim()) {
      setError('Digite uma URL válida');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Detectar tipo de URL
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      const isTikTok = url.includes('tiktok.com') || url.includes('vm.tiktok.com');
      const isDirectVideo = url.match(/\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v)(\?|$)/i);
      
      // Se for URL direta de vídeo, adicionar diretamente
      if (isDirectVideo || (!isYouTube && !isTikTok && url.startsWith('http'))) {
        const videoClip: VideoClip = {
          id: `url-${Date.now()}`,
          startTime: clips.length > 0 ? Math.max(...clips.map(c => c.endTime)) : 0,
          endTime: clips.length > 0 ? Math.max(...clips.map(c => c.endTime)) + 10 : 10,
          source: url,
          type: 'video',
        };
        addClip(videoClip);
        setShowUrlModal(false);
        setUrl('');
        setLoading(false);
        return;
      }

      // Se for YouTube ou TikTok, usar endpoint de download
      if (!isYouTube && !isTikTok) {
        throw new Error('URL inválida. Use YouTube, TikTok ou URL direta de vídeo (MP4, WEBM, etc).');
      }

      // Usar endpoint unificado de download
      const response = await fetch('/api/viral/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: url,
          platform: isTikTok ? 'tiktok' : 'youtube',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer download');
      }

      // Adicionar à timeline
      const clip: VideoClip = {
        id: `download-${Date.now()}`,
        startTime: clips.length > 0 ? Math.max(...clips.map(c => c.endTime)) : 0,
        endTime: clips.length > 0 ? Math.max(...clips.map(c => c.endTime)) + 10 : 10,
        source: data.path || data.url || url,
        type: 'video',
      };

      addClip(clip);
      setShowUrlModal(false);
      setUrl('');
    } catch (err: any) {
      setError(err.message || 'Erro ao importar URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Upload className="w-4 h-4" />
          Importar
        </button>

        {showMenu && (
          <>
            {/* Overlay para fechar ao clicar fora */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu dropdown */}
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-20">
              <button
                onClick={handleFileUpload}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-t-lg"
              >
                <File className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-900 dark:text-gray-100">Arquivo do computador</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowUrlModal(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-b-lg"
              >
                <LinkIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-900 dark:text-gray-100">URL de vídeo</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal de URL */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Importar por URL
              </h3>
              <button
                onClick={() => {
                  setShowUrlModal(false);
                  setUrl('');
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL do Vídeo
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="YouTube, TikTok ou URL direta (MP4, WEBM, etc)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlImport()}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Suporta: YouTube, TikTok ou URLs diretas de vídeo
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowUrlModal(false);
                    setUrl('');
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUrlImport}
                  disabled={!url.trim() || loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4" />
                      Importar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

