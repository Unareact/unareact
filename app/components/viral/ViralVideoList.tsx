'use client';

import { useState, useEffect, useCallback } from 'react';
import { ViralVideo } from '@/app/types';
import { TrendingUp, Eye, Heart, MessageCircle, Download, ExternalLink, Globe, Brain, Calendar, TrendingDown, Filter, ArrowUpDown, Smartphone, X, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { UNIFIED_CATEGORIES, getCategoriesForPlatform, parseCategoryId } from '@/app/lib/unified-categories';
import { YOUTUBE_CATEGORIES } from '@/app/lib/youtube-categories';
import { cn } from '@/app/lib/utils';
import { useEditorStore } from '@/app/stores/editor-store';
import { ViralDiagnosis as ViralDiagnosisComponent } from '../diagnosis/ViralDiagnosis';
import { RegionSelector } from './RegionSelector';
import { parseVideoUrl } from '@/app/lib/video-url-parser';
import { Link, Search } from 'lucide-react';
import { ViralVideoWorkflow } from './ViralVideoWorkflow';
import { usePathname } from 'next/navigation';
// import { PlatformStatus } from './PlatformStatus';

// Chave para localStorage
const LAST_SEARCH_KEY = 'una-last-viral-search';

interface LastSearch {
  platform: 'youtube' | 'tiktok' | 'all';
  region: string | string[];
  minLikes: number;
  maxDaysAgo: number;
  minLikesPerDay: number;
  category: string; // Mantido para compatibilidade
  productCategory: string; // Mantido para compatibilidade
  unifiedCategory?: string; // Novo campo unificado
  excludeAI?: boolean; // Excluir vídeos gerados por IA
  sortBy: string;
  videos: ViralVideo[];
  stats: { total: number; filtered: boolean; regions: string };
}

export function ViralVideoList() {
  const pathname = usePathname();
  const isPortalPage = pathname === '/portal';
  
  // Carregar última pesquisa do localStorage
  const loadLastSearch = (): Partial<LastSearch> | null => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(LAST_SEARCH_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao carregar última pesquisa:', e);
    }
    return null;
  };

  const lastSearch = loadLastSearch();

  const [videos, setVideos] = useState<ViralVideo[]>(lastSearch?.videos || []);
  const [loading, setLoading] = useState(!lastSearch?.videos); // Não carregar se tiver última pesquisa
  const [platform, setPlatform] = useState<'youtube' | 'tiktok' | 'all'>(lastSearch?.platform || 'all');
  const [region, setRegion] = useState<string | string[]>(lastSearch?.region || 'ALL_AMERICAS');
  const [minLikes, setMinLikes] = useState(lastSearch?.minLikes || 0);
  const [maxDaysAgo, setMaxDaysAgo] = useState(lastSearch?.maxDaysAgo || 0);
  const [minLikesPerDay, setMinLikesPerDay] = useState(lastSearch?.minLikesPerDay || 0);
  // Migração: converter category e productCategory antigos para unifiedCategory
  const getInitialUnifiedCategory = (): string => {
    if (lastSearch?.unifiedCategory) {
      return lastSearch.unifiedCategory;
    }
    // Migração: se tinha productCategory diferente de 'all', usar ele
    if (lastSearch?.productCategory && lastSearch.productCategory !== 'all') {
      return `prod:${lastSearch.productCategory}`;
    }
    // Migração: se tinha category diferente de '0', usar ele
    if (lastSearch?.category && lastSearch.category !== '0') {
      return `yt:${lastSearch.category}`;
    }
    return 'all';
  };
  
  const [unifiedCategory, setUnifiedCategory] = useState(getInitialUnifiedCategory());
  // Mantidos para compatibilidade com API (serão removidos depois)
  const [category, setCategory] = useState(lastSearch?.category || '0');
  const [productCategory, setProductCategory] = useState(lastSearch?.productCategory || 'all');
  const [shortsOnly, setShortsOnly] = useState(false);
  const [excludeAI, setExcludeAI] = useState(lastSearch?.excludeAI ?? false);
  const [sortBy, setSortBy] = useState(lastSearch?.sortBy || 'views');
  const [error, setError] = useState<string | null>(null);
  const [diagnosingVideo, setDiagnosingVideo] = useState<{ id: string; title: string; platform?: string } | null>(null);
  const [stats, setStats] = useState<{ total: number; filtered: boolean; regions: string } | null>(lastSearch?.stats || null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [urlDiagnosis, setUrlDiagnosis] = useState<any>(null);
  const [workflowVideo, setWorkflowVideo] = useState<ViralVideo | null>(null);
  const { addClip, setActivePanel, setPendingDownloadUrl } = useEditorStore();

  // Salvar pesquisa no localStorage
  const saveLastSearch = (searchData: Partial<LastSearch>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(searchData));
    } catch (e) {
      console.error('Erro ao salvar última pesquisa:', e);
    }
  };

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
        unifiedCategory: unifiedCategory, // Novo parâmetro unificado
        excludeAI: excludeAI.toString(), // Excluir vídeos gerados por IA
      });
      
      // Região e shorts apenas para YouTube
      if (platform === 'youtube' || platform === 'all') {
        // Se region é array, enviar como string separada por vírgula
        const regionParam = Array.isArray(region) ? region.join(',') : region;
        params.append('region', regionParam);
        if (shortsOnly) {
          params.append('shortsOnly', 'true');
        }
      }
      
      // Manter compatibilidade: também enviar category e productCategory separados
      const parsed = parseCategoryId(unifiedCategory);
      if (parsed.type === 'youtube' && parsed.id !== 'all') {
        params.append('category', parsed.id);
      }
      if (parsed.type === 'product' && parsed.id !== 'all') {
        params.append('productCategory', parsed.id);
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
        // Verificar se é erro de quota do YouTube
        if (data.error.includes('quota') && data.error.includes('YouTube')) {
          throw new Error('Quota do YouTube excedida. A quota diária de 10.000 unidades foi excedida. Aguarde 24 horas ou use outra API Key.');
        }
        // Verificar se é erro de quota do TikTok
        if (data.error.includes('429') || (data.error.includes('quota') && data.error.includes('TikTok'))) {
          throw new Error(data.error);
        }
        throw new Error(data.error);
      }
      
      // Verificar se há warning (quando retorna vazio mas não é erro)
      if (data.warning && data.videos?.length === 0) {
        console.warn('⚠️ Aviso da API:', data.warning);
        // Não lançar erro, apenas mostrar o warning
      }
      
      if (!data.videos || data.videos.length === 0) {
        console.warn('⚠️ Nenhum vídeo retornado da API', { 
          platform: data.platform, 
          total: data.total,
          filtersApplied: data.filtersApplied,
          error: data.error,
          warning: data.warning
        });
        
        // Se houver warning, pode ser quota excedida ou outro problema
        if (data.warning && data.warning.includes('quota')) {
          throw new Error('Quota mensal do TikTok excedida. Aguarde o reset mensal ou faça upgrade do plano na RapidAPI.');
        }
        
        // Se houver erro, mostrar no console
        if (data.error) {
          console.error('❌ Erro da API:', data.error);
        }
      }
      
      const videosData = data.videos || [];
      setVideos(videosData);
      const statsData = {
        total: data.total || videosData.length || 0,
        filtered: data.filtered || false,
        regions: data.regions || (Array.isArray(region) ? region.join(', ') : region)
      };
      setStats(statsData);
      
      // Salvar última pesquisa (reutilizar parsed já declarado acima)
      saveLastSearch({
        platform,
        region,
        minLikes,
        maxDaysAgo,
        minLikesPerDay,
        category: parsed.type === 'youtube' ? parsed.id : '0',
        productCategory: parsed.type === 'product' ? parsed.id : 'all',
        unifiedCategory: unifiedCategory,
        excludeAI: excludeAI,
        sortBy,
        videos: videosData,
        stats: statsData,
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
  }, [platform, region, minLikes, maxDaysAgo, minLikesPerDay, unifiedCategory, excludeAI, sortBy]);

  // Ajustar categoria quando plataforma mudar (garantir que categoria seja válida para a plataforma)
  useEffect(() => {
    const availableCategories = getCategoriesForPlatform(platform);
    const currentCategoryExists = availableCategories.some(cat => cat.id === unifiedCategory);
    
    if (!currentCategoryExists && unifiedCategory !== 'all') {
      // Se a categoria atual não está disponível para a plataforma, resetar para 'all'
      setUnifiedCategory('all');
    }
  }, [platform, unifiedCategory]);

  // Buscar apenas quando filtros principais mudam (não a cada digitação nos inputs numéricos)
  useEffect(() => {
    fetchViralVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, region, unifiedCategory, excludeAI, sortBy]); // Removido minLikes, maxDaysAgo, minLikesPerDay - só busca quando clicar em "Buscar"

  // Escutar eventos de busca automática por área
  useEffect(() => {
    // Evento do Portal Magra
    const handlePortalMagraSearch = (event: CustomEvent) => {
      const filters = event.detail;
      // Atualizar todos os estados com os filtros do Portal Magra
      setPlatform(filters.platform || 'all');
      setRegion(filters.region || 'US');
      setMinLikes(filters.minLikes || 0);
      setMaxDaysAgo(filters.maxDaysAgo || 0);
      setMinLikesPerDay(filters.minLikesPerDay || 0);
      setUnifiedCategory(filters.unifiedCategory || 'prod:portal-magra');
      setCategory(filters.category || '0');
      setProductCategory(filters.productCategory || 'portal-magra');
      setExcludeAI(filters.excludeAI ?? false);
      setSortBy(filters.sortBy || 'viralScore');
      // Forçar busca imediatamente
      setTimeout(() => {
        fetchViralVideos();
      }, 100);
    };

    // Evento do React
    const handleReactSearch = (event: CustomEvent) => {
      const filters = event.detail;
      if (filters.platform) setPlatform(filters.platform);
      if (filters.region) setRegion(filters.region);
      if (filters.unifiedCategory) setUnifiedCategory(filters.unifiedCategory);
      if (filters.category) setCategory(filters.category);
      if (filters.productCategory) setProductCategory(filters.productCategory);
      if (filters.sortBy) setSortBy(filters.sortBy);
      if (filters.minLikes !== undefined) setMinLikes(filters.minLikes);
      if (filters.maxDaysAgo !== undefined) setMaxDaysAgo(filters.maxDaysAgo);
      if (filters.minLikesPerDay !== undefined) setMinLikesPerDay(filters.minLikesPerDay);
      // Forçar busca imediatamente
      fetchViralVideos();
    };

    window.addEventListener('portal-magra-search', handlePortalMagraSearch as EventListener);
    window.addEventListener('react-viral-search', handleReactSearch as EventListener);
    
    return () => {
      window.removeEventListener('portal-magra-search', handlePortalMagraSearch as EventListener);
      window.removeEventListener('react-viral-search', handleReactSearch as EventListener);
    };
  }, [fetchViralVideos]);

  const handleDownload = (video: ViralVideo) => {
    // Preencher URL e mudar para aba Download
    setPendingDownloadUrl(video.url);
    setActivePanel('download');
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
    const isTikTokQuotaError = error.includes('429') || error.includes('quota') || error.includes('excedeu');
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
        {isTikTokQuotaError && (
          <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-4 space-y-2">
            <p><strong>⚠️ Quota Mensal Excedida</strong></p>
            <p>Você excedeu a quota mensal do seu plano na RapidAPI.</p>
            <p><strong>Opções:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Aguarde o reset mensal da quota (geralmente no início do mês)</li>
              <li>Faça upgrade do plano em: <a href="https://rapidapi.com/Lundehund/api/tiktok-api23" target="_blank" rel="noopener noreferrer" className="underline">RapidAPI - TikTok API</a></li>
            </ul>
          </div>
        )}
        {isTikTokError && !isTikTokQuotaError && (
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

  // Função para analisar URL e buscar vídeos similares
  const handleAnalyzeUrl = async () => {
    if (!videoUrl.trim()) {
      setError('Por favor, insira uma URL válida');
      return;
    }

    setIsAnalyzingUrl(true);
    setError(null);

    try {
      // Parse da URL
      const parsed = parseVideoUrl(videoUrl);
      
      // Se for uma URL de canal/perfil, buscar vídeos do canal/perfil
      if (parsed.isChannel && parsed.isValid) {
        const isTikTok = parsed.platform === 'tiktok';
        console.log(`📺 URL de ${isTikTok ? 'perfil TikTok' : 'canal YouTube'} detectada, buscando vídeos...`);
        
        const params = new URLSearchParams({
          maxResults: '100', // Aumentar para ter mais opções após filtros
          minLikes: minLikes.toString(),
          maxDaysAgo: maxDaysAgo.toString(),
          minLikesPerDay: minLikesPerDay.toString(),
          sortBy: sortBy,
          unifiedCategory: unifiedCategory, // Categoria unificada
        });

        if (parsed.channelId) {
          params.append('channelId', parsed.channelId);
          params.append('channelType', parsed.channelType || 'channel');
        } else if (parsed.channelHandle) {
          params.append('channelHandle', parsed.channelHandle);
          params.append('channelType', parsed.channelType || (isTikTok ? 'tiktok-profile' : 'handle'));
        }

        // Filtros específicos do YouTube
        if (!isTikTok) {
          if (shortsOnly) {
            params.append('shortsOnly', 'true');
          }
        }

        const channelResponse = await fetch(`/api/viral?${params.toString()}`);
        
        if (!channelResponse.ok) {
          const errorData = await channelResponse.json();
          throw new Error(errorData.error || `Erro ao buscar vídeos do ${isTikTok ? 'perfil' : 'canal'}`);
        }

        const channelData = await channelResponse.json();
        
        if (channelData.videos && channelData.videos.length > 0) {
          setVideos(channelData.videos);
          setStats({
            total: channelData.total || channelData.videos.length,
            filtered: channelData.filtersApplied ? Object.values(channelData.filtersApplied).some(v => v === true) : false,
            regions: channelData.source === 'profile' ? `Perfil TikTok` : channelData.source === 'channel' ? `Canal YouTube` : 'Canal',
          });
          setUrlDiagnosis(null); // Não há diagnóstico para canal/perfil
          setIsAnalyzingUrl(false);
          return;
        } else {
          throw new Error(`Nenhum vídeo encontrado neste ${isTikTok ? 'perfil' : 'canal'}`);
        }
      }

      if (!parsed.isValid || !parsed.videoId) {
        // Usar mensagem de erro específica se disponível (ex: URL de canal)
        const errorMsg = parsed.errorMessage || 'URL inválida. Use uma URL de vídeo do YouTube ou TikTok.';
        throw new Error(errorMsg);
      }

      // Diagnosticar o vídeo
      const diagnosisResponse = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: parsed.videoId,
          platform: parsed.platform,
        }),
      });

      if (!diagnosisResponse.ok) {
        const errorData = await diagnosisResponse.json();
        throw new Error(errorData.error || 'Erro ao diagnosticar vídeo');
      }

      const diagnosis = await diagnosisResponse.json();
      setUrlDiagnosis(diagnosis.diagnosis);

      // Buscar vídeos similares baseado no diagnóstico
      const similarResponse = await fetch('/api/viral/similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis: diagnosis.diagnosis,
          maxResults: 50,
        }),
      });

      if (!similarResponse.ok) {
        const errorData = await similarResponse.json();
        throw new Error(errorData.error || 'Erro ao buscar vídeos similares');
      }

      const similarData = await similarResponse.json();
      setVideos(similarData.videos || []);
      setStats({
        total: similarData.total || 0,
        filtered: false,
        regions: 'Similares',
      });

      // Salvar pesquisa
      saveLastSearch({
        platform: 'youtube',
        region: 'ALL_AMERICAS',
        minLikes: 0,
        maxDaysAgo: 0,
        minLikesPerDay: 0,
        category: '0',
        productCategory: 'all',
        unifiedCategory: unifiedCategory,
        sortBy: 'viralScore',
        videos: similarData.videos || [],
        stats: {
          total: similarData.total || 0,
          filtered: false,
          regions: 'Similares',
        },
      });

    } catch (err: any) {
      setError(err.message || 'Erro ao analisar URL');
      console.error('Erro ao analisar URL:', err);
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status das Plataformas */}
      {/* <PlatformStatus /> */}
      
      {/* Busca por URL */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-3">
          <Link className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            Buscar por URL
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Cole a URL de um vídeo viral para analisar e encontrar vídeos similares
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isAnalyzingUrl) {
                handleAnalyzeUrl();
              }
            }}
          />
          <button
            onClick={handleAnalyzeUrl}
            disabled={isAnalyzingUrl || !videoUrl.trim()}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {isAnalyzingUrl ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analisando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analisar e Buscar
              </>
            )}
          </button>
        </div>
        {urlDiagnosis && (
          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              📊 Vídeo analisado: <strong>{urlDiagnosis.videoTitle}</strong>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Buscando vídeos com padrões similares: {urlDiagnosis.viralFactors?.structure || 'N/A'}
            </p>
          </div>
        )}
      </div>
      
      {/* Filtros */}
      <div className="space-y-4 p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filtros e Ordenação
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
            <RegionSelector
              value={region}
              onChange={setRegion}
            />
          )}
          
          {/* Categoria Unificada - Combina categorias do YouTube e produtos */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Filter className="w-4 h-4" />
              Categoria/Nicho
            </label>
            <select
              value={unifiedCategory}
              onChange={(e) => setUnifiedCategory(e.target.value)}
              title={UNIFIED_CATEGORIES.find(cat => cat.id === unifiedCategory)?.description || ''}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              {getCategoriesForPlatform(platform).map((cat) => (
                <option key={cat.id} value={cat.id} title={cat.description}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* YouTube Shorts - Apenas para YouTube */}
          {(platform === 'youtube' || platform === 'all') && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Smartphone className="w-4 h-4" />
                Tipo de Vídeo
              </label>
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={shortsOnly}
                  onChange={(e) => setShortsOnly(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  📱 Apenas Shorts (≤60s)
                </span>
              </label>
            </div>
          )}
          
          {/* Excluir Vídeos de IA - Para todas as plataformas */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Brain className="w-4 h-4" />
              Filtro de Conteúdo
            </label>
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={excludeAI}
                onChange={(e) => setExcludeAI(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                🤖 Excluir vídeos gerados por IA
              </span>
            </label>
          </div>
          
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
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
                  {unifiedCategory && unifiedCategory !== 'all' && (() => {
                    const parsed = parseCategoryId(unifiedCategory);
                    const categoryName = parsed.type === 'youtube' 
                      ? YOUTUBE_CATEGORIES.find(c => c.id === parsed.id)?.name
                      : UNIFIED_CATEGORIES.find(c => c.id === unifiedCategory)?.name;
                    return categoryName ? (
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs">
                        {categoryName}
                      </span>
                    ) : null;
                  })()}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                    onClick={() => {
                      setDiagnosingVideo({ id: video.id, title: video.title });
                      setActivePanel('viral'); // Garantir que está no painel viral
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm font-medium transition-colors"
                    title="Analisar por que este vídeo viralizou"
                  >
                    <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Analisar</span>
                    <span className="xs:hidden">Analisar</span>
                  </button>
                  <button
                    onClick={() => {
                      setDiagnosingVideo({ id: video.id, title: video.title });
                      setActivePanel('script'); // Ir direto para o painel de roteiros após diagnóstico
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 text-xs sm:text-sm font-medium transition-colors"
                    title="Criar roteiro baseado neste vídeo"
                  >
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Criar Roteiro</span>
                    <span className="sm:hidden">Roteiro</span>
                  </button>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium transition-colors"
                    title="Abrir vídeo no YouTube/TikTok"
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                </div>
                <div className={`grid gap-2 ${isPortalPage ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {isPortalPage && (
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('portal-video-select', { detail: video }));
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 text-xs sm:text-sm font-medium transition-colors"
                      title="Gerar roteiro de conversão para Portal Magra"
                    >
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Roteiro</span>
                      <span className="sm:hidden">📝</span>
                    </button>
                  )}
                  <button
                    onClick={() => setWorkflowVideo(video)}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 text-xs sm:text-sm font-medium transition-colors"
                    title="Criar vídeo com este (workflow guiado)"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Criar Vídeo</span>
                    <span className="sm:hidden">Criar</span>
                  </button>
                  <button
                    onClick={() => handleDownload(video)}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 text-xs sm:text-sm font-medium transition-colors"
                    title="Baixar este vídeo para editar"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Baixar</span>
                    <span className="sm:hidden">↓</span>
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

      {/* Modal de Workflow Guiado */}
      {workflowVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-5xl w-full my-8 relative">
            <button
              onClick={() => setWorkflowVideo(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <ViralVideoWorkflow
              initialVideo={workflowVideo}
              onClose={() => setWorkflowVideo(null)}
            />
          </div>
        </div>
      )}

      {/* Modal de Diagnóstico */}
      {diagnosingVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
            <button
              onClick={() => setDiagnosingVideo(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <ViralDiagnosisComponent
              videoId={diagnosingVideo.id}
              videoTitle={diagnosingVideo.title}
              platform={(() => {
                const video = videos.find(v => v.id === diagnosingVideo.id);
                if (video?.platform === 'tiktok') return 'tiktok' as const;
                if (video?.platform === 'youtube') return 'youtube' as const;
                return 'youtube' as const; // Default para outras plataformas
              })()}
              onClose={() => setDiagnosingVideo(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

