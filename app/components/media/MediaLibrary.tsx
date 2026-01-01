'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { searchMedia } from '@/app/lib/media-search';
import { Image, Video, Search, Loader2, Upload, X, CheckCircle2, Maximize2, Download, ExternalLink, Grid3x3, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Buscar mídia
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMediaItems([]);
      return;
    }

    setIsSearching(true);
    setMediaItems([]); // Limpar resultados anteriores
    
    try {
      console.log(`🔍 Buscando: "${searchQuery}" (tipo: ${mediaType})`);
      const results = await searchMedia(searchQuery, mediaType, 20);
      console.log('📦 Resultados recebidos:', results.length, 'itens');
      
      if (results.length === 0) {
        console.warn('⚠️ Nenhum resultado encontrado. Verifique:');
        console.warn('  1. API keys configuradas em .env.local?');
        console.warn('  2. Termo de busca válido?');
        console.warn('  3. Console do servidor para erros?');
      }
      
      // Converter MediaItem para o formato esperado
      const converted: MediaItem[] = results.map((item: any) => ({
        id: item.id || `media-${Date.now()}-${Math.random()}`,
        type: item.type,
        url: item.url,
        thumbnail: item.thumbnail || item.url,
        width: item.width || 0,
        height: item.height || 0,
        duration: item.duration,
        author: item.author,
        source: item.source || 'pexels',
      }));
      
      console.log('✅ Mídia convertida:', converted.length, 'itens');
      setMediaItems(converted);
    } catch (error: any) {
      console.error('❌ Erro ao buscar mídia:', error);
      console.error('Detalhes:', error.message);
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

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setMediaItems([]);
      
      try {
        console.log(`🔍 Buscando: "${searchQuery}" (tipo: ${mediaType})`);
        const results = await searchMedia(searchQuery, mediaType, 20);
        console.log('📦 Resultados recebidos:', results.length, 'itens');
        
        if (results.length === 0) {
          console.warn('⚠️ Nenhum resultado encontrado. Verifique:');
          console.warn('  1. API keys configuradas em .env.local?');
          console.warn('  2. Termo de busca válido?');
          console.warn('  3. Console do servidor para erros?');
        }
        
        const converted: MediaItem[] = results.map((item: any) => ({
          id: item.id || `media-${Date.now()}-${Math.random()}`,
          type: item.type,
          url: item.url,
          thumbnail: item.thumbnail || item.url,
          width: item.width || 0,
          height: item.height || 0,
          duration: item.duration,
          author: item.author,
          source: item.source || 'pexels',
        }));
        
        console.log('✅ Mídia convertida:', converted.length, 'itens');
        setMediaItems(converted);
      } catch (error: any) {
        console.error('❌ Erro ao buscar mídia:', error);
        console.error('Detalhes:', error.message);
        setMediaItems([]);
      } finally {
        setIsSearching(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery, mediaType]);

  const allMedia = [...uploadedFiles, ...mediaItems];

  const popularSearches = [
    'natureza', 'pessoas', 'tecnologia', 'negócios', 'fitness', 
    'comida', 'viagem', 'animais', 'esportes', 'música'
  ];

  return (
    <div className="space-y-4">
      {/* Header - Biblioteca de Mídia (Seus Arquivos) */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Biblioteca de Mídia
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Seus arquivos enviados</strong> e mídia selecionada aparecem aqui. Para buscar imagens/vídeos gratuitos, use a seção "Buscar" abaixo.
            </p>
          </div>
          {selectedItems.size > 0 && (
            <button
              onClick={handleAddToTimeline}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Adicionar {selectedItems.size}</span>
            </button>
          )}
        </div>
        
        {/* Sugestões de Busca */}
        {!searchQuery && allMedia.length === 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">💡 Sugestões de busca:</p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.slice(0, 6).map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload de Arquivos */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
        <label className="block">
          <div className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group">
            <Upload className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                {isUploading ? 'Enviando arquivos...' : 'Fazer upload de imagens/vídeos'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                Seus arquivos aparecerão na biblioteca acima
              </span>
            </div>
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

      {/* Busca - Separada da Biblioteca */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Buscar Imagens e Vídeos Gratuitos
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Milhões de imagens e vídeos do Pexels e Unsplash
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Barra de Busca Grande e Destaque */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O que você procura? (ex: natureza, pessoas, tecnologia, comida...)"
              className="w-full pl-12 pr-4 py-4 text-base rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all shadow-sm focus:shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Filtro de Tipo */}
          <div className="flex gap-2">
            {(['all', 'image', 'video'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMediaType(type)}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-lg font-medium transition-all',
                  mediaType === type
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                )}
              >
                {type === 'all' && '📁 Tudo'}
                {type === 'image' && '🖼️ Imagens'}
                {type === 'video' && '🎬 Vídeos'}
              </button>
            ))}
          </div>
          
          {/* Status da Busca */}
          {isSearching && (
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Buscando em Pexels e Unsplash...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Aguarde um momento
                </p>
              </div>
            </div>
          )}
          
          {/* Resultados Encontrados */}
          {!isSearching && searchQuery && mediaItems.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                ✅ {mediaItems.length} {mediaItems.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} para "{searchQuery}"
              </p>
            </div>
          )}
          {searchQuery && !isSearching && mediaItems.length === 0 && (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                ⚠️ Nenhum resultado encontrado para "{searchQuery}"
              </p>
              <div className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                <p className="font-medium mb-2">Possíveis causas:</p>
                <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                  <li>API keys não configuradas (verifique .env.local)</li>
                  <li>Termo de busca muito específico</li>
                  <li>Problema de conexão com APIs</li>
                </ul>
                <p className="mt-3">💡 <strong>Como configurar:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                  <li>Crie arquivo <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">.env.local</code> na raiz do projeto</li>
                  <li>Adicione: <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">NEXT_PUBLIC_PEXELS_API_KEY=sua-chave-aqui</code></li>
                  <li>Obtenha chave em: <a href="https://www.pexels.com/api/" target="_blank" className="underline text-blue-600">pexels.com/api</a></li>
                  <li>Reinicie o servidor (npm run dev)</li>
                </ol>
                <p className="mt-3">🔍 Verifique o console do navegador (F12) para mais detalhes</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Mídia - Resultados */}
      {allMedia.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">
                📦 {allMedia.length} {allMedia.length === 1 ? 'item' : 'itens'} disponível{allMedia.length !== 1 ? 'eis' : ''}
              </p>
              {selectedItems.size > 0 && (
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1 font-medium">
                  ✓ {selectedItems.size} selecionado{selectedItems.size > 1 ? 's' : ''} • Clique em "Adicionar" no topo
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGalleryModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                title="Ver todos em galeria grande (como Pexels/Unsplash)"
              >
                <Grid3x3 className="w-5 h-5" />
                Ver Galeria Grande
              </button>
              {selectedItems.size > 0 && (
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {allMedia.map((item) => {
            const isSelected = selectedItems.has(item.id);
            return (
              <div
                key={item.id}
                className={cn(
                  'relative aspect-video rounded-lg overflow-hidden border-2 transition-all group',
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                )}
              >
                {/* Botão para abrir galeria grande - Sempre visível */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGalleryModal(true);
                  }}
                  className="absolute top-2 right-2 z-20 p-2 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg transition-all"
                  title="Ver todos em tamanho grande"
                >
                  <Grid3x3 className="w-4 h-4 text-white" />
                </button>
                
                <div
                  onClick={() => toggleSelection(item.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setPreviewItem(item);
                  }}
                  className="w-full h-full cursor-pointer"
                  title="Clique para selecionar • Duplo clique para ver grande"
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
                  <div className="absolute top-2 left-2">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 text-white rounded-full shadow-lg",
                      item.source === 'pexels' && 'bg-green-600',
                      item.source === 'unsplash' && 'bg-black',
                      item.source === 'pixabay' && 'bg-blue-600'
                    )}>
                      {item.source === 'pexels' && '📸 Pexels'}
                      {item.source === 'unsplash' && '📷 Unsplash'}
                      {item.source === 'pixabay' && '🖼️ Pixabay'}
                    </span>
                  </div>
                )}
                
                {/* Badge de upload */}
                {item.source === 'upload' && (
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-bold px-2 py-1 bg-purple-600 text-white rounded-full shadow-lg">
                      📤 Seu arquivo
                    </span>
                  </div>
                )}
                
                {/* Autor (se disponível) */}
                {item.author && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded truncate">
                      por {item.author}
                    </div>
                  </div>
                )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {allMedia.length === 0 && !isSearching && !searchQuery && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Biblioteca de Mídia
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
            Busque milhões de imagens e vídeos gratuitos do Pexels e Unsplash
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors font-medium"
              >
                {term}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            💡 Digite na busca acima ou clique em uma sugestão para começar
          </p>
        </div>
      )}

      {/* Modal de Galeria Grande - Todos os Resultados */}
      {showGalleryModal && allMedia.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
        >
          {/* Header do Modal */}
          <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowGalleryModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Galeria de Mídia
                </h2>
                <p className="text-sm text-gray-400">
                  {allMedia.length} {allMedia.length === 1 ? 'item' : 'itens'} • {selectedItems.size} selecionado{selectedItems.size !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedItems.size > 0 && (
                <button
                  onClick={handleAddToTimeline}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Adicionar {selectedItems.size} à Timeline
                </button>
              )}
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Limpar Seleção
              </button>
            </div>
          </div>

          {/* Grid Grande de Mídia */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-950">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
              {allMedia.map((item) => {
                const isSelected = selectedItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer',
                      isSelected
                        ? 'border-purple-500 ring-4 ring-purple-500/50'
                        : 'border-gray-700 hover:border-purple-400'
                    )}
                    onClick={() => toggleSelection(item.id)}
                  >
                    {item.type === 'video' ? (
                      <video
                        src={item.thumbnail || item.url}
                        className="w-full aspect-video object-cover"
                        muted
                        playsInline
                        onMouseEnter={(e) => {
                          const video = e.currentTarget;
                          video.play();
                        }}
                        onMouseLeave={(e) => {
                          const video = e.currentTarget;
                          video.pause();
                          video.currentTime = 0;
                        }}
                      />
                    ) : (
                      <img
                        src={item.thumbnail || item.url}
                        alt={item.author || 'Media'}
                        className="w-full aspect-video object-cover"
                      />
                    )}
                    
                    {/* Overlay de seleção */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Badge de fonte */}
                    <div className="absolute top-2 left-2">
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 text-white rounded-full shadow-lg",
                        item.source === 'pexels' && 'bg-green-600',
                        item.source === 'unsplash' && 'bg-black',
                        item.source === 'pixabay' && 'bg-blue-600',
                        item.source === 'upload' && 'bg-purple-600'
                      )}>
                        {item.source === 'pexels' && '📸 Pexels'}
                        {item.source === 'unsplash' && '📷 Unsplash'}
                        {item.source === 'pixabay' && '🖼️ Pixabay'}
                        {item.source === 'upload' && '📤 Seu arquivo'}
                      </span>
                    </div>

                    {/* Badge de tipo */}
                    <div className="absolute top-2 right-2">
                      {item.type === 'video' ? (
                        <Video className="w-5 h-5 text-white bg-black/60 rounded p-1" />
                      ) : (
                        <Image className="w-5 h-5 text-white bg-black/60 rounded p-1" />
                      )}
                    </div>

                    {/* Informações no hover */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.author && (
                        <p className="text-white text-sm font-medium truncate">
                          por {item.author}
                        </p>
                      )}
                      <p className="text-white/80 text-xs">
                        {item.width} × {item.height}px
                        {item.duration && ` • ${Math.floor(item.duration)}s`}
                      </p>
                    </div>

                    {/* Botão para ver em tela cheia */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem(item);
                      }}
                      className="absolute bottom-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Ver em tela cheia"
                    >
                      <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preview Individual - Tela Cheia */}
      {previewItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  previewItem.source === 'pexels' && 'bg-green-600',
                  previewItem.source === 'unsplash' && 'bg-black',
                  previewItem.source === 'pixabay' && 'bg-blue-600',
                  previewItem.source === 'upload' && 'bg-purple-600'
                )}>
                  {previewItem.type === 'video' ? (
                    <Video className="w-6 h-6 text-white" />
                  ) : (
                    <Image className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {previewItem.source === 'pexels' && '📸 Pexels'}
                    {previewItem.source === 'unsplash' && '📷 Unsplash'}
                    {previewItem.source === 'pixabay' && '🖼️ Pixabay'}
                    {previewItem.source === 'upload' && '📤 Seu arquivo'}
                  </h3>
                  {previewItem.author && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      por {previewItem.author}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleSelection(previewItem.id);
                    setPreviewItem(null);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2",
                    selectedItems.has(previewItem.id)
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {selectedItems.has(previewItem.id) ? 'Remover' : 'Selecionar'}
                </button>
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Preview - Imagem/Vídeo Grande */}
            <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              {previewItem.type === 'video' ? (
                <video
                  src={previewItem.url}
                  controls
                  className="max-w-full max-h-full rounded-lg shadow-2xl"
                  autoPlay
                />
              ) : (
                <img
                  src={previewItem.url}
                  alt={previewItem.author || 'Preview'}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              )}
            </div>

            {/* Footer com Informações */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Dimensões</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {previewItem.width} × {previewItem.height}px
                  </p>
                </div>
                {previewItem.duration && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Duração</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {Math.floor(previewItem.duration)}s
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Tipo</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {previewItem.type === 'video' ? 'Vídeo' : 'Imagem'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

