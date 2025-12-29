'use client';

import { useState, useEffect } from 'react';
import { MediaItem, searchMedia, generateSearchQueriesFromScript } from '@/app/lib/media-search';
import { ScriptSegment } from '@/app/types';
import { Search, Image, Video, Upload, Loader2, Download, X } from 'lucide-react';
import { useEditorStore } from '@/app/stores/editor-store';
import { VideoClip } from '@/app/types';

interface NutriMediaSelectorProps {
  segments: ScriptSegment[];
  onComplete: () => void;
  onBack: () => void;
}

export function NutriMediaSelector({ segments, onComplete, onBack }: NutriMediaSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'all'>('all');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Map<string, MediaItem>>(new Map());
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { addClip, clips } = useEditorStore();

  // Gerar queries automáticas baseadas no roteiro
  useEffect(() => {
    const scriptText = segments.map(s => s.text).join(' ');
    const autoQueries = generateSearchQueriesFromScript(scriptText);
    if (autoQueries.length > 0 && !searchQuery) {
      handleSearch(autoQueries[0]);
    }
  }, [segments]);

  const handleSearch = async (query?: string) => {
    const q = query || searchQuery;
    if (!q.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchMedia(q, mediaType, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar mídia:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMedia = (media: MediaItem) => {
    const newSelected = new Map(selectedMedia);
    if (newSelected.has(media.id)) {
      newSelected.delete(media.id);
    } else {
      newSelected.set(media.id, media);
    }
    setSelectedMedia(newSelected);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
    
    // Criar clips para os arquivos enviados
    files.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      
      const clip: VideoClip = {
        id: `upload-${Date.now()}-${index}`,
        startTime: clips.length > 0 
          ? Math.max(...clips.map(c => c.endTime))
          : 0,
        endTime: clips.length > 0 
          ? Math.max(...clips.map(c => c.endTime)) + 10
          : 10,
        source: url,
        type: isVideo ? 'video' : 'image',
      };
      
      addClip(clip);
    });
  };

  const handleAddSelectedToTimeline = () => {
    let currentTime = clips.length > 0 
      ? Math.max(...clips.map(c => c.endTime))
      : 0;

    selectedMedia.forEach((media) => {
      const clip: VideoClip = {
        id: `media-${media.id}-${Date.now()}`,
        startTime: currentTime,
        endTime: currentTime + (media.duration || 5),
        source: media.url,
        type: media.type,
      };
      
      addClip(clip);
      currentTime += media.duration || 5;
    });

    // Limpar seleção
    setSelectedMedia(new Map());
  };

  const handleFinish = () => {
    // Adicionar mídia selecionada se houver
    if (selectedMedia.size > 0) {
      handleAddSelectedToTimeline();
    }
    onComplete();
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm"
        >
          ← Voltar
        </button>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Adicione Mídia ao Seu Vídeo
        </h3>
        <p className="text-gray-600">
          Busque imagens e vídeos da web ou faça upload dos seus próprios arquivos
        </p>
      </div>

      {/* Busca */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar imagens e vídeos (ex: nutricionista, saúde, organização...)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as 'image' | 'video' | 'all')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tudo</option>
            <option value="image">Apenas Imagens</option>
            <option value="video">Apenas Vídeos</option>
          </select>
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Buscar
              </>
            )}
          </button>
        </div>

        {/* Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Ou faça upload dos seus próprios arquivos
          </p>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleUpload}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
          >
            Escolher Arquivos
          </label>
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                {uploadedFiles.length} arquivo(s) adicionado(s)
              </p>
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg text-sm"
                  >
                    <span className="text-gray-700">{file.name}</span>
                    <button
                      onClick={() => {
                        const newFiles = uploadedFiles.filter((_, i) => i !== index);
                        setUploadedFiles(newFiles);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultados da Busca */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Resultados da Busca ({searchResults.length})
            </h4>
            {selectedMedia.size > 0 && (
              <button
                onClick={handleAddSelectedToTimeline}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Adicionar {selectedMedia.size} à Timeline
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {searchResults.map((media) => {
              const isSelected = selectedMedia.has(media.id);
              return (
                <div
                  key={media.id}
                  onClick={() => handleSelectMedia(media)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-300'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {media.type === 'video' ? (
                    <div className="aspect-video bg-gray-900 relative">
                      <img
                        src={media.thumbnail || media.url}
                        alt={media.searchQuery}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="w-8 h-8 text-white opacity-75" />
                      </div>
                      {media.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {Math.floor(media.duration)}s
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={media.thumbnail || media.url}
                        alt={media.searchQuery}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                  {media.author && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs truncate">
                        {media.author}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
        >
          Voltar
        </button>
        <button
          onClick={handleFinish}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
        >
          Continuar para Edição
          <Video className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

