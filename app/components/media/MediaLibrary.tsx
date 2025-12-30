'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { searchMedia } from '@/app/lib/media-search';
import { Image, Video, Search, Loader2, Upload, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  width: number;
  height: number;
  duration?: number;
  author?: string;
  source: 'pexels' | 'unsplash' | 'pixabay' | 'upload';
}

export function MediaLibrary() {
  const { addClip, clips } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'all'>('all');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [uploadedFiles, setUploadedFiles] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Buscar mídia
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMediaItems([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchMedia(searchQuery, mediaType);
      // Converter MediaItem para o formato esperado
      const converted: MediaItem[] = results.map((item) => ({
        id: item.id || `media-${Date.now()}-${Math.random()}`,
        type: item.type,
        url: item.url,
        thumbnail: item.thumbnail || item.url,
        width: item.width || 0,
        height: item.height || 0,
        duration: item.duration,
        author: item.author,
        source: (item.source === 'pixabay' ? 'pexels' : item.source) || 'pexels',
      }));
      setMediaItems(converted);
      console.log('Mídia encontrada:', converted.length, 'itens');
    } catch (error) {
      console.error('Erro ao buscar mídia:', error);
      setMediaItems([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Upload de arquivos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newFiles: MediaItem[] = [];

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newFiles.push({
          id: `upload-${Date.now()}-${Math.random()}`,
          type: 'image',
          url,
          thumbnail: url,
          width: 0,
          height: 0,
          source: 'upload',
        });
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        // Obter duração do vídeo
        const video = document.createElement('video');
        video.src = url;
        video.onloadedmetadata = () => {
          // Atualizar item com duração
        };
        newFiles.push({
          id: `upload-${Date.now()}-${Math.random()}`,
          type: 'video',
          url,
          thumbnail: url,
          width: 0,
          height: 0,
          duration: 0,
          source: 'upload',
        });
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(false);
  };

  // Selecionar/deselecionar item
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Adicionar selecionados à timeline
  const handleAddToTimeline = () => {
    const allMedia = [...mediaItems, ...uploadedFiles];
    const selected = allMedia.filter(item => selectedItems.has(item.id));
    
    if (selected.length === 0) return;

    // Calcular posição na timeline
    let currentTime = 0;
    if (clips.length > 0) {
      currentTime = Math.max(...clips.map(c => c.endTime));
    }

    selected.forEach((item, index) => {
      const duration = item.duration || (item.type === 'image' ? 5 : 10);
      addClip({
        id: `library-${item.id}-${Date.now()}-${index}`,
        source: item.url,
        type: item.type,
        startTime: currentTime,
        endTime: currentTime + duration,
      });
      currentTime += duration;
    });

    setSelectedItems(new Set());
  };

  // Buscar automaticamente ao digitar (debounce)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMediaItems([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, mediaType]);

  const allMedia = [...uploadedFiles, ...mediaItems];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Biblioteca de Mídia
          </h3>
        </div>
        {selectedItems.size > 0 && (
          <button
            onClick={handleAddToTimeline}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Adicionar {selectedItems.size} à Timeline</span>
          </button>
        )}
      </div>

      {/* Upload de Arquivos */}
      <div className="mb-4">
        <label className="block mb-2">
          <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isUploading ? 'Enviando...' : 'Clique para fazer upload de imagens/vídeos'}
            </span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </label>
      </div>

      {/* Busca */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar imagens e vídeos (Pexels/Unsplash)..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as 'image' | 'video' | 'all')}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Tudo</option>
            <option value="image">Imagens</option>
            <option value="video">Vídeos</option>
          </select>
        </div>
        {isSearching && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Buscando...</span>
          </div>
        )}
      </div>

      {/* Grid de Mídia */}
      {allMedia.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
          {allMedia.map((item) => {
            const isSelected = selectedItems.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelection(item.id)}
                className={cn(
                  'relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all group',
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                )}
              >
                {item.type === 'video' ? (
                  <video
                    src={item.thumbnail || item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={item.thumbnail || item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Overlay de seleção */}
                {isSelected && (
                  <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                )}

                {/* Badge de tipo */}
                <div className="absolute bottom-1 right-1">
                  {item.type === 'video' ? (
                    <Video className="w-4 h-4 text-white bg-black/50 rounded p-0.5" />
                  ) : (
                    <Image className="w-4 h-4 text-white bg-black/50 rounded p-0.5" />
                  )}
                </div>

                {/* Badge de fonte */}
                {item.source !== 'upload' && (
                  <div className="absolute top-1 left-1">
                    <span className="text-xs px-1.5 py-0.5 bg-black/50 text-white rounded capitalize">
                      {item.source}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {allMedia.length === 0 && !isSearching && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            {searchQuery.trim() 
              ? 'Nenhum resultado encontrado. Tente outra busca.'
              : 'Faça upload de arquivos ou busque na biblioteca pública'}
          </p>
        </div>
      )}
    </div>
  );
}

