'use client';

import { useState, useEffect, useCallback } from 'react';
import { ViralVideo } from '@/app/types';
import { TrendingUp, Eye, Heart, MessageCircle, Download, ExternalLink, Globe, Brain, Calendar, TrendingDown, Filter, ArrowUpDown, Smartphone } from 'lucide-react';
import { YOUTUBE_CATEGORIES } from '@/app/lib/youtube-categories';
import { cn } from '@/app/lib/utils';
import { useEditorStore } from '@/app/stores/editor-store';
import { ViralDiagnosis as ViralDiagnosisComponent } from '../diagnosis/ViralDiagnosis';
// import { PlatformStatus } from './PlatformStatus';

export function ViralVideoList() {
  const [videos, setVideos] = useState<ViralVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<'youtube' | 'tiktok' | 'all'>('all'); // Plataforma: YouTube, TikTok ou Todas
  const [region, setRegion] = useState('ALL_AMERICAS');
  const [minLikes, setMinLikes] = useState(0); // Sem filtro por padrão
  const [maxDaysAgo, setMaxDaysAgo] = useState(0);
  const [minLikesPerDay, setMinLikesPerDay] = useState(0);
  const [category, setCategory] = useState('0'); // Categoria/nicho (apenas YouTube)
  const [sortBy, setSortBy] = useState('views'); // Ordenação - padrão: mais views primeiro
  const [error, setError] = useState<string | null>(null);
  const [diagnosingVideo, setDiagnosingVideo] = useState<{ id: string; title: string } | null>(null);
  const [stats, setStats] = useState<{ total: number; filtered: boolean; regions: string } | null>(null);
  const { addClip, setActivePanel } = useEditorStore();

  const fetchViralVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Construir URL com parâmetros baseados na plataforma
      const params = new URLSearchParams({
        platform: platform,
        maxResults: '100',
        minLikes: minLikes.toString(),
        maxDaysAgo: maxDaysAgo.toString(),
        minLikesPerDay: minLikesPerDay.toString(),
        sortBy: sortBy,
      });
      
      // Região e categoria apenas para YouTube
      if (platform === 'youtube' || platform === 'all') {
        params.append('region', region);
        params.append('category', category);
      }
      
      const url = `/api/viral?${params.toString()}`;
      console.log('🔍 Buscando vídeos:', { platform, url, params: Object.fromEntries(params) });
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao buscar vídeos virais');
      }
      const data = await response.json();
      
      console.log('📊 Resposta da API:', { 
        platform: data.platform, 
        total: data.total, 
        videosCount: data.videos?.length || 0,
        error: data.error 
      });
      
      if (data.error) {
        console.error('❌ Erro da API:', data.error);
        throw new Error(data.error);
      }
      
      if (!data.videos || data.videos.length === 0) {
        console.warn('⚠️ Nenhum vídeo retornado da API', { 
          platform: data.platform, 
          total: data.total,
          filtersApplied: data.filtersApplied,
          error: data.error
        });
        
        // Se houver erro, mostrar no console
        if (data.error) {
          console.error('❌ Erro da API:', data.error);
        }
      }
      
      setVideos(data.videos || []);
      setStats({
        total: data.total || data.videos?.length || 0,
        filtered: data.filtered || false,
        regions: data.regions || region
      });
      
      // Log para debug
      if (data.totalBeforeFilters !== undefined) {
        console.log('Filtros aplicados:', {
          antes: data.totalBeforeFilters,
          depois: data.total || 0,
          filtros: data.filtersApplied,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar vídeos virais');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }, [platform, region, minLikes, maxDaysAgo, minLikesPerDay, category, sortBy]);

  // Buscar apenas quando filtros principais mudam (não a cada digitação nos inputs numéricos)
  useEffect(() => {
    fetchViralVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, region, category, sortBy]); // Removido minLikes, maxDaysAgo, minLikesPerDay - só busca quando clicar em "Buscar"

  const handleDownload = async (video: ViralVideo) => {
    try {
      const response = await fetch('/api/viral/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: video.url }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Adicionar à timeline como clip
        addClip({
          id: `viral-${video.id}-${Date.now()}`,
          startTime: 0,
          endTime: parseDuration(video.duration),
          source: video.url,
          type: 'video',
        });
        
        alert(`Vídeo "${video.title}" adicionado à timeline!`);
      } else {
        alert('Erro ao fazer download: ' + data.error);
      }
    } catch (err: any) {
      alert('Erro ao fazer download: ' + err.message);
    }
  };

  const parseDuration = (duration: string): number => {
    // Parse ISO 8601 duration (PT1H2M10S) to seconds
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando vídeos virais...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isApiKeyError = error.includes('API Key') || error.includes('não configurada');
    const isTikTokError = error.includes('TikTok') || error.includes('Too many requests');
    
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <p className="text-red-800 dark:text-red-300 mb-4 font-semibold">{error}</p>
        {isApiKeyError && (
          <div className="text-sm text-red-600 dark:text-red-400 mb-4 space-y-2">
            <p><strong>Como resolver:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Configure a variável YOUTUBE_API_KEY no arquivo .env.local</li>
              <li>Para TikTok: Configure TIKTOK_RAPIDAPI_KEY e TIKTOK_RAPIDAPI_HOST</li>
              <li>Reinicie o servidor após adicionar as variáveis</li>
            </ul>
          </div>
        )}
        {isTikTokError && (
          <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
            <p>⚠️ TikTok API está com rate limit. Aguarde alguns minutos ou verifique seu plano na RapidAPI.</p>
          </div>
        )}
        <button
          onClick={fetchViralVideos}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status das Plataformas */}
      {/* <PlatformStatus /> */}
      
      {/* Filtros */}
      <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filtros e Ordenação
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Plataforma */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              Plataforma
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as 'youtube' | 'tiktok' | 'all')}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="all">📱 Todas</option>
              <option value="youtube">▶️ YouTube</option>
              <option value="tiktok">🎵 TikTok</option>
            </select>
          </div>
          
          {/* Região - Apenas para YouTube */}
          {(platform === 'youtube' || platform === 'all') && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Globe className="w-4 h-4" />
                Região
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="ALL_AMERICAS">🌎 Toda América</option>
                <optgroup label="América do Norte">
                  <option value="US">Estados Unidos</option>
                  <option value="CA">Canadá</option>
                  <option value="MX">México</option>
                </optgroup>
                <optgroup label="América Central">
                  <option value="GT">Guatemala</option>
                  <option value="CU">Cuba</option>
                  <option value="HT">Haiti</option>
                  <option value="DO">República Dominicana</option>
                  <option value="HN">Honduras</option>
                  <option value="NI">Nicarágua</option>
                  <option value="CR">Costa Rica</option>
                  <option value="PA">Panamá</option>
                </optgroup>
                <optgroup label="América do Sul">
                  <option value="BR">Brasil</option>
                  <option value="AR">Argentina</option>
                  <option value="CO">Colômbia</option>
                  <option value="CL">Chile</option>
                  <option value="PE">Peru</option>
                  <option value="VE">Venezuela</option>
                  <option value="EC">Equador</option>
                  <option value="BO">Bolívia</option>
                  <option value="PY">Paraguai</option>
                  <option value="UY">Uruguai</option>
                </optgroup>
              </select>
            </div>
          )}
          
          {/* Categoria/Nicho - Apenas para YouTube */}
          {(platform === 'youtube' || platform === 'all') && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Filter className="w-4 h-4" />
                Nicho/Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              >
                {YOUTUBE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Ordenação - Como os vídeos vão aparecer */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <ArrowUpDown className="w-4 h-4" />
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="views">👁️ Mais Visualizações</option>
              <option value="likes">❤️ Mais Curtidas</option>
              <option value="comments">💬 Mais Comentários</option>
              <option value="growth">📈 Maior Crescimento</option>
              <option value="viralScore">🔥 Viral Score</option>
              <option value="recent">🕐 Mais Recente</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          {/* Mín. Curtidas */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              Mín. Curtidas
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minLikes}
                onChange={(e) => {
                  e.preventDefault();
                  setMinLikes(parseInt(e.target.value) || 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fetchViralVideos();
                  }
                }}
                min={0}
                step={100000}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                placeholder="100.000"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {minLikes >= 1000000 ? `${(minLikes / 1000000).toFixed(1)}M+` : minLikes >= 1000 ? `${(minLikes / 1000).toFixed(0)}K+` : `${minLikes}+`}
              </span>
            </div>
          </div>
          
          {/* Data de Publicação */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-blue-500" />
              Publicado há
            </label>
            <select
              value={maxDaysAgo}
              onChange={(e) => setMaxDaysAgo(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="0">Qualquer data</option>
              <option value="1">Últimas 24h</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
          
          {/* Taxa de Crescimento */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-green-500" />
              Mín. Curtidas/Dia
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minLikesPerDay}
                onChange={(e) => {
                  e.preventDefault();
                  setMinLikesPerDay(parseInt(e.target.value) || 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fetchViralVideos();
                  }
                }}
                min={0}
                step={1000}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                placeholder="0"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {minLikesPerDay >= 1000 ? `${(minLikesPerDay / 1000).toFixed(0)}K/dia` : `${minLikesPerDay}/dia`}
              </span>
            </div>
          </div>
          
          {/* Botão Buscar */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 opacity-0">
              Buscar
            </label>
            <button
              onClick={fetchViralVideos}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Buscar
            </button>
          </div>
        </div>
        
        {/* Estatísticas */}
        {stats && (
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
              <span>
                <strong className="text-gray-900 dark:text-gray-100">{stats.total}</strong> vídeos encontrados
              </span>
              {stats.filtered && (
                <div className="flex items-center gap-2 flex-wrap">
                  {minLikes > 0 && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs">
                      {minLikes.toLocaleString()}+ curtidas
                    </span>
                  )}
                  {maxDaysAgo > 0 && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                      Últimos {maxDaysAgo} dias
                    </span>
                  )}
                  {minLikesPerDay > 0 && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">
                      {minLikesPerDay.toLocaleString()}+ curtidas/dia
                    </span>
                  )}
                  {category && category !== '0' && (
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs">
                      {YOUTUBE_CATEGORIES.find(c => c.id === category)?.name || category}
                    </span>
                  )}
                </div>
              )}
              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded text-xs">
                Plataforma: {
                  platform === 'all' ? '📱 Todas' :
                  platform === 'tiktok' ? '🎵 TikTok' :
                  '▶️ YouTube'
                }
              </span>
              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded text-xs">
                Ordenado por: {
                  sortBy === 'views' ? '👁️ Mais Views' :
                  sortBy === 'likes' ? '❤️ Mais Curtidas' :
                  sortBy === 'comments' ? '💬 Mais Comentários' :
                  sortBy === 'growth' ? '📈 Maior Crescimento' :
                  sortBy === 'recent' ? '🕐 Mais Recente' :
                  '🔥 Viral Score'
                }
              </span>
              {(platform === 'youtube' || platform === 'all') && (
                <span className="text-xs">
                  Região: {stats.regions}
                </span>
              )}
            </div>
            {stats.total === 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                  ⚠️ Nenhum vídeo encontrado com os filtros aplicados. Tente:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                  <li>Reduzir o número mínimo de curtidas</li>
                  <li>Aumentar o período de publicação</li>
                  <li>Remover filtros de crescimento (curtidas/dia)</li>
                  <li>Selecionar "Todas" na categoria</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lista de Vídeos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-200 dark:bg-gray-800">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex gap-2">
                <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">
                  #{video.trendingRank}
                </span>
                <span className={cn(
                  "px-2 py-1 text-white text-xs font-medium rounded",
                  video.platform === 'tiktok' ? 'bg-pink-600' : 'bg-red-600'
                )}>
                  {video.platform === 'tiktok' ? '🎵 TikTok' : '▶️ YouTube'}
                </span>
              </div>
              <div className="absolute top-2 right-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  <TrendingUp className="w-3 h-3" />
                  <span>{formatNumber(video.viralScore)}</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {video.channelTitle}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatDate(video.publishedAt)}
                </p>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(video.viewCount)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Heart className="w-4 h-4" />
                  <span>{formatNumber(video.likeCount)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <MessageCircle className="w-4 h-4" />
                  <span>{formatNumber(video.commentCount)}</span>
                </div>
              </div>
              
              {/* Taxa de Crescimento */}
              {video.likesPerDay && video.likesPerDay > 0 && (
                <div className="flex items-center gap-2 text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <strong className="text-green-600 dark:text-green-400">
                      {formatNumber(video.likesPerDay)}/dia
                    </strong>
                    {' '}• {video.daysSincePublished ? `${Math.round(video.daysSincePublished)} dias` : ''}
                  </span>
                </div>
              )}

              {/* Ações */}
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(video)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Baixar
                  </button>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDiagnosingVideo({ id: video.id, title: video.title });
                      setActivePanel('viral'); // Garantir que está no painel viral
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 text-sm font-medium transition-colors"
                  >
                    <Brain className="w-4 h-4" />
                    Diagnosticar
                  </button>
                  <button
                    onClick={() => {
                      setDiagnosingVideo({ id: video.id, title: video.title });
                      setActivePanel('script'); // Ir direto para o painel de roteiros após diagnóstico
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 text-sm font-medium transition-colors"
                    title="Diagnosticar e gerar roteiro otimizado"
                  >
                    <Brain className="w-4 h-4" />
                    <span className="hidden sm:inline">Roteiro</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && !loading && (
        <div className="text-center py-12 space-y-4">
          <div className="text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium mb-2">Nenhum vídeo encontrado</p>
            {minLikes > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-md mx-auto mt-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>Nenhum vídeo encontrado</strong> com {minLikes.toLocaleString()}+ curtidas.
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                  💡 <strong>Dica:</strong> Vídeos trending geralmente têm 10K-500K curtidas. 
                  {minLikes >= 1000000 && (
                    <> Tente reduzir para <strong>100.000</strong> ou <strong>500.000</strong> curtidas.</>
                  )}
                  {minLikes < 1000000 && minLikes >= 500000 && (
                    <> Tente reduzir para <strong>100.000</strong> curtidas.</>
                  )}
                </p>
                <button
                  onClick={() => {
                    setMinLikes(0);
                    fetchViralVideos();
                  }}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                >
                  Remover Filtro de Curtidas
                </button>
              </div>
            )}
            {region === 'ALL_AMERICAS' && (
              <p className="text-sm mt-2">
                Buscando em todas as regiões da América...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal de Diagnóstico */}
      {diagnosingVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setDiagnosingVideo(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
            <ViralDiagnosisComponent
              videoId={diagnosingVideo.id}
              videoTitle={diagnosingVideo.title}
              onClose={() => setDiagnosingVideo(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

