'use client';

import { useState, useEffect, useCallback } from 'react';
import { ViralVideo } from '@/app/types';
import { TrendingUp, Eye, Heart, MessageCircle, Download, ExternalLink, Globe, Brain, Calendar, TrendingDown, Filter, ArrowUpDown, Smartphone, X, FileText, ArrowRight, Sparkles, History, Search, Link, RotateCcw, CheckCircle } from 'lucide-react';
import { UNIFIED_CATEGORIES, getCategoriesForPlatform, parseCategoryId } from '@/app/lib/unified-categories';
import { YOUTUBE_CATEGORIES } from '@/app/lib/youtube-categories';
import { cn } from '@/app/lib/utils';
import { useEditorStore } from '@/app/stores/editor-store';
import { ViralDiagnosis as ViralDiagnosisComponent } from '../diagnosis/ViralDiagnosis';
import type { ViralDiagnosis } from '@/app/types';
import { RegionSelector } from './RegionSelector';
import { PortalRegionSelector } from '../portal/PortalRegionSelector';
import { parseVideoUrl } from '@/app/lib/video-url-parser';
import { ViralVideoWorkflow } from './ViralVideoWorkflow';
import { usePathname } from 'next/navigation';
import { filterAIGenerated } from '@/app/lib/ai-video-detector';
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
  shortsOnly?: boolean; // Apenas YouTube Shorts
  sortBy: string;
  videos: ViralVideo[];
  stats: { total: number; filtered: boolean; regions: string };
}

export function ViralVideoList() {
  const pathname = usePathname();
  const isPortalPage = pathname === '/portal' || pathname?.includes('/portal/viral');
  
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

  // Estado para armazenar vídeos originais (antes do filtro de IA)
  // Inicializar com vídeos do localStorage, mas aplicar filtro se excludeAI estava marcado
  const initialVideos = lastSearch?.videos || [];
  const [originalVideosList, setOriginalVideosList] = useState<ViralVideo[]>(initialVideos);
  // Aplicar filtro inicial se excludeAI estava marcado
  const initialExcludeAI = lastSearch?.excludeAI ?? false;
  const [videos, setVideos] = useState<ViralVideo[]>(
    initialVideos.length > 0 ? filterAIGenerated(initialVideos, initialExcludeAI) : []
  );
  const [loading, setLoading] = useState(false); // Nunca carregar automaticamente - só quando usuário clicar em "Buscar"
  // Para Portal: fixar plataforma como YouTube e shortsOnly como true
  const initialPlatform = isPortalPage ? 'youtube' : (lastSearch?.platform || 'all');
  const initialShortsOnly = isPortalPage ? true : false;
  const initialUnifiedCategory = isPortalPage ? 'prod:portal-magra' : (() => {
    if (lastSearch?.unifiedCategory) {
      return lastSearch.unifiedCategory;
    }
    if (lastSearch?.productCategory && lastSearch.productCategory !== 'all') {
      return `prod:${lastSearch.productCategory}`;
    }
    if (lastSearch?.category && lastSearch.category !== '0') {
      return `yt:${lastSearch.category}`;
    }
    return 'all';
  })();

  const [platform, setPlatform] = useState<'youtube' | 'tiktok' | 'all'>(initialPlatform);
  const [region, setRegion] = useState<string | string[]>(lastSearch?.region || (isPortalPage ? 'US' : 'ALL_AMERICAS'));
  const [minLikes, setMinLikes] = useState(lastSearch?.minLikes || 0);
  const [maxDaysAgo, setMaxDaysAgo] = useState(lastSearch?.maxDaysAgo || 0);
  const [minLikesPerDay, setMinLikesPerDay] = useState(lastSearch?.minLikesPerDay || 0);
  
  const [unifiedCategory, setUnifiedCategory] = useState(initialUnifiedCategory);
  // Mantidos para compatibilidade com API (serão removidos depois)
  const [category, setCategory] = useState(lastSearch?.category || '0');
  const [productCategory, setProductCategory] = useState(lastSearch?.productCategory || (isPortalPage ? 'portal-magra' : 'all'));
  const [shortsOnly, setShortsOnly] = useState(initialShortsOnly);
  const [excludeAI, setExcludeAI] = useState(lastSearch?.excludeAI ?? false);
  const [sortBy, setSortBy] = useState(lastSearch?.sortBy || 'views');
  const [error, setError] = useState<string | null>(null);
  const [diagnosingVideo, setDiagnosingVideo] = useState<{ id: string; title: string; platform?: string } | null>(null);
  const [stats, setStats] = useState<{ total: number; filtered: boolean; regions: string } | null>(lastSearch?.stats || null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [urlDiagnosis, setUrlDiagnosis] = useState<ViralDiagnosis | null>(null);
  const [workflowVideo, setWorkflowVideo] = useState<ViralVideo | null>(null);
  const [searchingOriginal, setSearchingOriginal] = useState<string | null>(null);
  const [originalVideos, setOriginalVideos] = useState<ViralVideo[]>([]);
  const [showOnlyOriginals, setShowOnlyOriginals] = useState(false);
  const [originalVideoId, setOriginalVideoId] = useState<string | null>(null);
  // Estado para controlar se já fez busca (para Portal buscar automaticamente quando mudar filtros)
  const [hasSearched, setHasSearched] = useState(isPortalPage && initialVideos.length > 0);
  const { addClip, setActivePanel, setPendingDownloadUrl, setScript, setCurrentViralDiagnosis } = useEditorStore();

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
      // Para Portal, garantir pelo menos 20 resultados
      const requestedMaxResults = isPortalPage ? '20' : '100';
      
      const params = new URLSearchParams({
        platform: platform,
        maxResults: requestedMaxResults,
        minLikes: '0', // Sempre 0 (filtro removido)
        maxDaysAgo: Math.max(0, maxDaysAgo).toString(), // Garantir que não seja negativo
        minLikesPerDay: Math.max(0, minLikesPerDay).toString(), // Garantir que não seja negativo
        sortBy: sortBy || 'viralScore', // Garantir valor padrão
        unifiedCategory: unifiedCategory || 'all', // Garantir valor padrão
        excludeAI: excludeAI.toString(), // Excluir vídeos gerados por IA
      });
      
      // Região e shorts apenas para YouTube
      if (platform === 'youtube' || platform === 'all') {
        // Normalizar região: se for string, usar diretamente; se for array, juntar
        let regionParam: string;
        if (Array.isArray(region)) {
          regionParam = region.length === 0 ? 'US' : region.join(',');
        } else {
          regionParam = region || 'US';
        }
        // Garantir que o valor seja válido
        if (regionParam && regionParam !== '') {
          params.append('region', regionParam);
        }
        if (shortsOnly) {
          params.append('shortsOnly', 'true');
        }
      }
      
      // Manter compatibilidade: também enviar category e productCategory separados
      const parsed = parseCategoryId(unifiedCategory || 'all');
      if (parsed.type === 'youtube' && parsed.id !== 'all') {
        params.append('category', parsed.id);
      }
      if (parsed.type === 'product' && parsed.id !== 'all') {
        params.append('productCategory', parsed.id);
      }
      
      const url = `/api/viral?${params.toString()}`;
      console.log('🔍 Buscando vídeos:', { 
        platform, 
        region: params.get('region'),
        unifiedCategory,
        shortsOnly,
        sortBy,
        minLikes,
        maxDaysAgo,
        minLikesPerDay,
        url 
      });
      const response = await fetch(url);
      
      // Melhor tratamento de erros HTTP
      if (!response.ok) {
        let errorMessage = `Erro ao buscar vídeos (${response.status} ${response.statusText})`;
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Se não conseguir parsear JSON, usar mensagem padrão
        }
        
        // Mensagens específicas por status
        if (response.status === 429) {
          errorMessage = 'Muitas requisições. Aguarde alguns segundos antes de tentar novamente.';
        } else if (response.status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns instantes.';
        } else if (response.status === 503) {
          errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
        }
        
        throw new Error(errorMessage);
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
      // Salvar vídeos originais (antes do filtro de IA local)
      // Nota: A API já pode ter aplicado o filtro se excludeAI estava marcado, mas vamos armazenar o que recebemos
      setOriginalVideosList(videosData);
      // Aplicar filtro local se necessário
      const filteredVideos = filterAIGenerated(videosData, excludeAI);
      setVideos(filteredVideos);
      const statsData = {
        total: data.total || filteredVideos.length || 0,
        filtered: data.filtered || false,
        regions: data.regions || (Array.isArray(region) ? region.join(', ') : region)
      };
      setStats(statsData);
      
      // Marcar que já fez busca (para Portal buscar automaticamente quando mudar filtros)
      if (isPortalPage) {
        setHasSearched(true);
      }
      
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
        shortsOnly: shortsOnly,
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
      // Melhorar mensagem de erro com mais contexto
      let errorMessage = err.message || 'Erro ao carregar vídeos virais';
      
      // Adicionar contexto baseado no tipo de erro
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (err.message?.includes('timeout') || err.message?.includes('Timeout')) {
        errorMessage = 'A requisição demorou muito. Tente novamente com filtros menos restritivos.';
      } else if (!err.message || err.message === 'Erro ao buscar vídeos virais') {
        errorMessage = 'Não foi possível buscar vídeos. Verifique os filtros e tente novamente.';
      }
      
      setError(errorMessage);
      console.error('❌ Erro ao buscar vídeos:', {
        message: err.message,
        error: err,
        platform,
        filters: { region, unifiedCategory, minLikes, maxDaysAgo, minLikesPerDay }
      });
    } finally {
      setLoading(false);
    }
  }, [platform, region, minLikes, maxDaysAgo, minLikesPerDay, unifiedCategory, excludeAI, sortBy]);

  // Aplicar filtros automáticos para Portal
  useEffect(() => {
    if (isPortalPage) {
      // Forçar plataforma YouTube, shortsOnly true, e categoria portal-magra
      setPlatform('youtube');
      setShortsOnly(true);
      setUnifiedCategory('prod:portal-magra');
      setProductCategory('portal-magra');
      
      // Aplicar filtros salvos do localStorage se existirem
      const saved = loadLastSearch();
      if (saved?.region) {
        setRegion(saved.region);
      }
      if (saved?.sortBy) {
        setSortBy(saved.sortBy);
      }
    }
  }, [isPortalPage]);

  // No Portal: buscar automaticamente quando carregar a página OU quando qualquer filtro mudar
  useEffect(() => {
    if (isPortalPage) {
      // Se ainda não fez busca OU se mudou algum filtro, buscar
      // Debounce para evitar múltiplas buscas rápidas
      const timeoutId = setTimeout(() => {
        if (!hasSearched) {
          console.log('🔄 Portal: Primeira busca automática...', {
            region,
            sortBy,
            minLikes,
            maxDaysAgo,
            minLikesPerDay,
            unifiedCategory,
            shortsOnly
          });
        } else {
          console.log('🔄 Portal: Filtros mudaram, buscando novamente...', {
            region,
            sortBy,
            minLikes,
            maxDaysAgo,
            minLikesPerDay,
            unifiedCategory,
            shortsOnly
          });
        }
        fetchViralVideos();
      }, 500); // Aguardar 500ms após a última mudança
      
      return () => clearTimeout(timeoutId);
    }
  }, [isPortalPage, region, sortBy, minLikes, maxDaysAgo, minLikesPerDay, unifiedCategory, shortsOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // Marcar que já fez busca quando fetchViralVideos completar (mesmo se não retornar vídeos)
  useEffect(() => {
    if (isPortalPage && !hasSearched && !loading) {
      // Se não está mais carregando e ainda não marcou como buscado, marcar agora
      // Isso garante que buscas subsequentes sejam automáticas
      setHasSearched(true);
    }
  }, [isPortalPage, hasSearched, loading]);

  // Ajustar categoria quando plataforma mudar (garantir que categoria seja válida para a plataforma)
  useEffect(() => {
    if (isPortalPage) return; // Não ajustar no Portal
    
    const availableCategories = getCategoriesForPlatform(platform);
    const currentCategoryExists = availableCategories.some(cat => cat.id === unifiedCategory);
    
    if (!currentCategoryExists && unifiedCategory !== 'all') {
      // Se a categoria atual não está disponível para a plataforma, resetar para 'all'
      setUnifiedCategory('all');
    }
  }, [platform, unifiedCategory, isPortalPage]);

  // Aplicar filtro de IA localmente quando excludeAI mudar (sem fazer nova busca)
  useEffect(() => {
    if (originalVideosList.length > 0) {
      const filtered = filterAIGenerated(originalVideosList, excludeAI);
      setVideos(filtered);
      
      // Atualizar stats se necessário
      setStats(prevStats => {
        if (!prevStats) return prevStats;
        const removed = originalVideosList.length - filtered.length;
        return {
          ...prevStats,
          total: filtered.length,
          filtered: removed > 0 || prevStats.filtered,
        };
      });
    }
  }, [excludeAI, originalVideosList]);

  // NÃO buscar automaticamente - só quando o usuário clicar em "Buscar"
  // Isso evita consumo desnecessário de créditos da API
  // useEffect removido - busca apenas manual pelo botão

  const handleDownload = (video: ViralVideo) => {
    // Preencher URL e mudar para aba Download
    setPendingDownloadUrl(video.url);
    setActivePanel('download');
  };

  // Função para buscar vídeo original
  const handleFindOriginal = async (video: ViralVideo) => {
    setSearchingOriginal(video.id);
    setOriginalVideos([]);
    
    try {
      const response = await fetch('/api/viral/original', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar vídeo original');
      }

      const data = await response.json();
      const foundVideos = data.videos || [];
      setOriginalVideos(foundVideos);
      setOriginalVideoId(video.id);
      
      if (foundVideos.length > 0) {
        // Mostrar apenas os vídeos originais encontrados
        setVideos(foundVideos);
        setShowOnlyOriginals(true);
        setStats({
          total: foundVideos.length,
          filtered: true,
          regions: `Originais encontrados para: ${video.title.substring(0, 50)}...`,
        });
      } else {
        setError('Nenhum vídeo original encontrado. Este pode ser o vídeo original ou não há vídeos mais antigos relacionados.');
      }
    } catch (err: any) {
      console.error('Erro ao buscar vídeo original:', err);
      setError(err.message || 'Erro ao buscar vídeo original');
    } finally {
      setSearchingOriginal(null);
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
    const isApiKeyError = error.includes('API Key') || error.includes('não configurada') || error.includes('inválida');
    const isTikTokQuotaError = error.includes('429') || error.includes('quota') || error.includes('excedeu') || error.includes('Quota');
    const isTikTokError = error.includes('TikTok') || error.includes('Too many requests') || error.includes('RapidAPI');
    const isYouTubeQuotaError = error.includes('YouTube') && error.includes('quota');
    const isConnectionError = error.includes('conexão') || error.includes('internet') || error.includes('Failed to fetch');
    const isTimeoutError = error.includes('timeout') || error.includes('Timeout') || error.includes('demorou muito');
    const isServerError = error.includes('500') || error.includes('servidor') || error.includes('503');
    const isRateLimitError = error.includes('429') || error.includes('Muitas requisições');
    
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-red-900 dark:text-red-200 font-bold text-lg mb-2">Erro ao Buscar Vídeos</h3>
            <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
          </div>
        </div>

        {/* Mensagens específicas por tipo de erro */}
        {isConnectionError && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-blue-800 dark:text-blue-300 font-semibold mb-2">🔌 Problema de Conexão</p>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>Verifique se sua conexão com a internet está funcionando</li>
              <li>Tente recarregar a página</li>
              <li>Se o problema persistir, pode ser um problema temporário do servidor</li>
            </ul>
          </div>
        )}

        {isTimeoutError && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-300 font-semibold mb-2">⏱️ Requisição Demorou Muito</p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
              <li>Tente novamente com filtros menos restritivos</li>
              <li>Reduza o número mínimo de curtidas</li>
              <li>Remova filtros de crescimento (curtidas/dia)</li>
              <li>Selecione "Todas" na categoria</li>
            </ul>
          </div>
        )}

        {isServerError && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
            <p className="text-orange-800 dark:text-orange-300 font-semibold mb-2">🔧 Erro do Servidor</p>
            <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1 list-disc list-inside">
              <li>O servidor está temporariamente indisponível</li>
              <li>Aguarde alguns minutos e tente novamente</li>
              <li>Se o problema persistir, pode ser necessário verificar as configurações da API</li>
            </ul>
          </div>
        )}

        {isRateLimitError && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-300 font-semibold mb-2">🚦 Muitas Requisições</p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
              <li>Aguarde 10-30 segundos antes de tentar novamente</li>
              <li>Evite fazer muitas buscas em sequência</li>
            </ul>
          </div>
        )}

        {isApiKeyError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-800 dark:text-red-300 font-semibold mb-2">🔑 API Key Não Configurada</p>
            <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
              <li>Configure a variável YOUTUBE_API_KEY no arquivo .env.local</li>
              <li>Para TikTok: Configure TIKTOK_RAPIDAPI_KEY e TIKTOK_RAPIDAPI_HOST</li>
              <li>Reinicie o servidor após adicionar as variáveis</li>
            </ul>
          </div>
        )}

        {isYouTubeQuotaError && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-300 font-semibold mb-2">📊 Quota do YouTube Excedida</p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
              <li>A quota diária de 10.000 unidades foi excedida</li>
              <li>Aguarde 24 horas para o reset automático</li>
              <li>Ou configure outra API Key do YouTube</li>
            </ul>
          </div>
        )}

        {isTikTokQuotaError && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-300 font-semibold mb-2">📊 Quota Mensal do TikTok Excedida</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">Você excedeu a quota mensal do seu plano na RapidAPI.</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 font-semibold mb-1">Opções:</p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
              <li>Aguarde o reset mensal da quota (geralmente no início do mês)</li>
              <li>Faça upgrade do plano em: <a href="https://rapidapi.com/Lundehund/api/tiktok-api23" target="_blank" rel="noopener noreferrer" className="underline font-semibold">RapidAPI - TikTok API</a></li>
            </ul>
          </div>
        )}

        {isTikTokError && !isTikTokQuotaError && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-300 font-semibold mb-2">⚠️ TikTok API com Rate Limit</p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
              <li>Aguarde alguns minutos antes de tentar novamente</li>
              <li>Verifique seu plano na RapidAPI</li>
            </ul>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={fetchViralVideos}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            <span>Tentar Novamente</span>
          </button>
          <button
            onClick={() => {
              setError(null);
              // Resetar filtros para valores padrão
              setMinLikes(0);
              setMaxDaysAgo(0);
              setMinLikesPerDay(0);
              setUnifiedCategory('all');
            }}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    );
  }

  // Função para analisar URL e buscar vídeos similares
  const handleAnalyzeUrl = async () => {
    if (!videoUrl.trim()) {
      setError('Por favor, insira uma URL válida');
      return;
    }

    console.log('🔍 Iniciando análise de URL:', videoUrl);
    setIsAnalyzingUrl(true);
    setError(null);
    setUrlDiagnosis(null); // Limpar diagnóstico anterior

    try {
      // Parse da URL
      const parsed = parseVideoUrl(videoUrl);
      console.log('📋 URL parseada:', parsed);
      
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
      console.log('🔬 Iniciando diagnóstico do vídeo:', parsed.videoId);
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
        console.error('❌ Erro no diagnóstico:', errorData);
        throw new Error(errorData.error || 'Erro ao diagnosticar vídeo');
      }

      const diagnosis = await diagnosisResponse.json();
      console.log('✅ Diagnóstico concluído:', diagnosis);
      setUrlDiagnosis(diagnosis.diagnosis);

      // Buscar vídeos similares baseado no diagnóstico
      console.log('🔍 Buscando vídeos similares...');
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
        console.error('❌ Erro ao buscar vídeos similares:', errorData);
        throw new Error(errorData.error || 'Erro ao buscar vídeos similares');
      }

      const similarData = await similarResponse.json();
      console.log('✅ Vídeos similares encontrados:', similarData.videos?.length || 0);
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
      const errorMessage = err.message || 'Erro ao analisar URL';
      console.error('❌ Erro ao analisar URL:', err);
      console.error('❌ Mensagem de erro:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsAnalyzingUrl(false);
      console.log('🏁 Análise de URL finalizada');
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
        {error && videoUrl.trim() && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">
              ⚠️ {error}
            </p>
          </div>
        )}
        {urlDiagnosis && (
          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              📊 Vídeo analisado: <strong>{urlDiagnosis.videoTitle}</strong>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
              Buscando vídeos com padrões similares: {urlDiagnosis.viralFactors?.structure || 'N/A'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Salvar diagnóstico no store para o componente usar
                  setCurrentViralDiagnosis(urlDiagnosis);
                  setDiagnosingVideo({
                    id: urlDiagnosis.videoId,
                    title: urlDiagnosis.videoTitle,
                    platform: 'youtube'
                  });
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium flex items-center justify-center gap-2 transition-all text-sm"
              >
                <Brain className="w-4 h-4" />
                Ver Diagnóstico Completo
              </button>
              <button
                onClick={() => {
                  // Aplicar template diretamente ao editor
                  const { setScript, setActivePanel, setCurrentViralDiagnosis } = useEditorStore.getState();
                  setCurrentViralDiagnosis(urlDiagnosis);
                  
                  // Criar roteiro baseado no template
                  const segments = urlDiagnosis.scriptTemplate.segments.map((seg, index) => ({
                    id: `diagnosis-${Date.now()}-${index}`,
                    text: seg.example || seg.description,
                    duration: seg.duration,
                    timestamp: urlDiagnosis.scriptTemplate.segments.slice(0, index).reduce((acc, s) => acc + s.duration, 0),
                    type: seg.type === 'hook' ? 'intro' as const : 
                          seg.type === 'cta' ? 'outro' as const : 
                          'content' as const,
                  }));
                  
                  setScript(segments);
                  setActivePanel('script');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center gap-2 transition-all text-sm"
                title="Aplicar template ao editor"
              >
                <FileText className="w-4 h-4" />
                Usar Template
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Diagnóstico Completo - Exibir quando disponível */}
      {urlDiagnosis && diagnosingVideo && diagnosingVideo.id === urlDiagnosis.videoId && (
        <div className="mt-4">
          <ViralDiagnosisComponent
            videoId={urlDiagnosis.videoId}
            videoTitle={urlDiagnosis.videoTitle}
            platform="youtube"
            onClose={() => setDiagnosingVideo(null)}
          />
        </div>
      )}
      
      {/* Filtros */}
      <div className="space-y-4 p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filtros e Ordenação
          </h3>
        </div>
        
        <div className={cn("grid gap-3 sm:gap-4", isPortalPage ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}>
          {/* Portal: Interface Simplificada */}
          {isPortalPage ? (
            <>
              {/* Região - 3 botões para Portal */}
              <PortalRegionSelector
                value={region}
                onChange={setRegion}
              />
              
              {/* Ordenação */}
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
            </>
          ) : (
            <>
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
            </>
          )}
          
          {/* Excluir Vídeos de IA - Apenas para não-Portal */}
          {!isPortalPage && (
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
          )}
          
          {/* Ordenação - Apenas para não-Portal (Portal já tem no bloco acima) */}
          {!isPortalPage && (
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
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
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
            {stats.total === 0 && !loading && videos.length === 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <span className="text-yellow-600 dark:text-yellow-400 text-xl">🔍</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-yellow-900 dark:text-yellow-200 font-bold mb-2">
                      Nenhum Vídeo Encontrado
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                      Não encontramos vídeos com os filtros aplicados. Isso pode acontecer se os filtros estão muito restritivos ou a categoria não tem vídeos trending no momento.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setMinLikes(0);
                          setMaxDaysAgo(0);
                          setMinLikesPerDay(0);
                          setUnifiedCategory('all');
                          fetchViralVideos();
                        }}
                        className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 rounded-lg text-xs font-medium text-yellow-900 dark:text-yellow-200 transition-colors"
                      >
                        ✨ Limpar Filtros
                      </button>
                      <button
                        onClick={() => {
                          setMinLikes(Math.max(0, minLikes - 100000));
                          fetchViralVideos();
                        }}
                        className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 rounded-lg text-xs font-medium text-yellow-900 dark:text-yellow-200 transition-colors"
                      >
                        📉 Reduzir Curtidas
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Banner de Vídeos Originais */}
      {showOnlyOriginals && originalVideos.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200">
                  🎯 Vídeos Originais Encontrados
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {originalVideos.length} vídeo{originalVideos.length !== 1 ? 's' : ''} mais antigo{originalVideos.length !== 1 ? 's' : ''} encontrado{originalVideos.length !== 1 ? 's' : ''} (publicado{originalVideos.length !== 1 ? 's' : ''} antes do vídeo selecionado)
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowOnlyOriginals(false);
                setOriginalVideos([]);
                setOriginalVideoId(null);
                // Restaurar lista original se houver
                if (lastSearch?.videos && lastSearch.videos.length > 0) {
                  setVideos(lastSearch.videos);
                  setStats(lastSearch.stats || null);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 border border-orange-300 dark:border-orange-700 font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Voltar à Lista Normal
            </button>
          </div>
        </div>
      )}

      {/* Lista de Vídeos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {videos.map((video) => {
          const isOriginal = showOnlyOriginals && originalVideos.some(ov => ov.id === video.id);
          return (
            <div
              key={video.id}
              className={cn(
                "bg-white dark:bg-gray-900 rounded-lg border overflow-hidden hover:shadow-lg transition-shadow relative",
                isOriginal ? "border-2 border-orange-400 dark:border-orange-600" : "border border-gray-200 dark:border-gray-800"
              )}
            >
              {/* Badge de Vídeo Original */}
              {isOriginal && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                    <History className="w-3 h-3" />
                    Original
                  </span>
                </div>
              )}
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
                <div className={`grid gap-2 ${isPortalPage ? 'grid-cols-4' : 'grid-cols-3'}`}>
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
                  <button
                    onClick={() => handleFindOriginal(video)}
                    disabled={searchingOriginal === video.id}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition-colors"
                    title="Buscar vídeo original (mais antigo)"
                  >
                    {searchingOriginal === video.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                        <span className="hidden sm:inline">Buscando...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Original</span>
                        <span className="sm:hidden">Orig</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        })}
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

