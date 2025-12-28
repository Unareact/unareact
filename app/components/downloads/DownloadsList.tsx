'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, Play, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { VideoDownload } from '@/app/lib/supabase';
import { useEditorStore } from '@/app/stores/editor-store';
import { formatFileSize } from '@/app/lib/utils';

export function DownloadsList() {
  const [downloads, setDownloads] = useState<VideoDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setActivePanel, addClip } = useEditorStore();

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/downloads');
      const data = await response.json();
      
      // Se houver mensagem de configuração, mostrar como aviso, não erro
      if (data.message && (data.message.includes('não configurado') || data.message.includes('não existe'))) {
        setError(data.message);
        setDownloads(data.downloads || []);
        return;
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar downloads');
      }
      
      setDownloads(data.downloads || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar downloads';
      setError(errorMessage);
      setDownloads([]); // Garantir que a lista está vazia em caso de erro
      console.error('Erro ao carregar downloads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (downloadId: string) => {
    if (!confirm('Tem certeza que deseja excluir este download?')) {
      return;
    }

    try {
      const response = await fetch(`/api/downloads/${downloadId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir download');
      }

      // Remover da lista local
      setDownloads(downloads.filter(d => d.id !== downloadId));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
      console.error('Erro ao excluir download:', err);
    }
  };

  const handleAddToTimeline = (download: VideoDownload) => {
    addClip({
      id: `download-${download.id}`,
      startTime: 0,
      endTime: download.duration || 60,
      source: download.storage_url || download.video_url,
      type: 'video',
    });
    
    setActivePanel('editor');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando downloads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Se for erro de configuração, mostrar mensagem mais amigável
    const isConfigError = error.includes('Supabase não') || error.includes('tabela não existe');
    
    return (
      <div className={`${isConfigError ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} rounded-lg p-6`}>
        <div className="flex items-start gap-2">
          <AlertCircle className={`w-5 h-5 ${isConfigError ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'} mt-0.5`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${isConfigError ? 'text-yellow-800 dark:text-yellow-300' : 'text-red-800 dark:text-red-300'} mb-1`}>
              {isConfigError ? 'Configuração Necessária' : 'Erro'}
            </p>
            <p className={`text-sm ${isConfigError ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'}`}>
              {error}
            </p>
            {isConfigError && (
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-800 dark:text-yellow-300">
                <p className="font-semibold mb-2">Para usar downloads no Supabase:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Configure as variáveis de ambiente no .env.local</li>
                  <li>Execute o SQL em <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">SUPABASE_DOWNLOADS_TABLE.sql</code> no Supabase SQL Editor</li>
                </ol>
              </div>
            )}
            <button
              onClick={loadDownloads}
              className={`mt-4 px-4 py-2 ${isConfigError ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg text-sm`}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          Meus Downloads
        </h2>
        <button
          onClick={loadDownloads}
          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          Atualizar
        </button>
      </div>

      {downloads.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            Nenhum download ainda
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Os vídeos que você baixar aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {downloads.map((download) => (
            <div
              key={download.id}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2">
                    {download.title || download.video_id}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                      {download.platform}
                    </span>
                    <span>{formatDate(download.downloaded_at)}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>Arquivo:</strong> {download.filename}</p>
                  <p><strong>Tamanho:</strong> {formatFileSize(download.file_size)}</p>
                  {download.duration && (
                    <p><strong>Duração:</strong> {Math.floor(download.duration)}s</p>
                  )}
                  <p><strong>Formato:</strong> {download.format} • {download.quality}</p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => handleAddToTimeline(download)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Usar no Editor
                  </button>
                  <a
                    href={download.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(download.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

