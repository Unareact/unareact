import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { ViralVideo } from '@/app/types';
import { TikTokService } from '@/app/lib/services/tiktok-service';
import { matchesCategory, getCategoryById } from '@/app/lib/product-categories';

// YouTube Data API v3
const youtube = google.youtube('v3');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform') || 'youtube'; // 'youtube', 'tiktok', ou 'all'
    const regionParam = searchParams.get('region') || 'US';
    const maxResults = parseInt(searchParams.get('maxResults') || '50');
    const category = searchParams.get('category') || '0';
    const productCategory = searchParams.get('productCategory') || 'all';
    const minLikes = parseInt(searchParams.get('minLikes') || '0');
    const maxDaysAgo = parseInt(searchParams.get('maxDaysAgo') || '0');
    const minLikesPerDay = parseFloat(searchParams.get('minLikesPerDay') || '0');
    const shortsOnly = searchParams.get('shortsOnly') === 'true'; // Filtrar apenas YouTube Shorts
    const sortBy = searchParams.get('sortBy') || 'views'; // Padrão: mais views primeiro
    
    // Parâmetros para busca por canal
    const channelHandle = searchParams.get('channelHandle');
    const channelId = searchParams.get('channelId');
    const channelType = searchParams.get('channelType') as 'handle' | 'custom' | 'user' | 'channel' | 'tiktok-profile' | null;

    console.log('🔍 API /viral recebeu:', { platform, regionParam, maxResults, minLikes, category, productCategory, channelHandle, channelId, channelType });

    // Se houver parâmetros de canal, buscar vídeos do canal
    if (channelHandle || channelId) {
      const identifier = channelId || channelHandle || '';
      const type = channelType || (channelId ? 'channel' : 'handle');
      
      // Se for perfil do TikTok
      if (type === 'tiktok-profile') {
        console.log('🎵 Buscando vídeos do perfil TikTok:', { username: identifier });
        
        const tiktokVideos = await getTikTokProfileVideos(
          identifier,
          maxResults,
          minLikes,
          maxDaysAgo,
          minLikesPerDay,
          sortBy,
          productCategory
        );

        return NextResponse.json({
          videos: tiktokVideos,
          total: tiktokVideos.length,
          platform: 'tiktok',
          source: 'profile',
          filtersApplied: {
            minLikes: minLikes > 0,
            maxDaysAgo: maxDaysAgo > 0,
            minLikesPerDay: minLikesPerDay > 0,
            productCategory: productCategory && productCategory !== 'all',
            sortBy,
          },
        });
      }
      
      // Se for canal do YouTube
      console.log('📺 Buscando vídeos do canal YouTube:', { identifier, type });
      
      const channelVideos = await getYouTubeChannelVideos(
        identifier,
        type,
        maxResults,
        minLikes,
        maxDaysAgo,
        minLikesPerDay,
        sortBy,
        shortsOnly,
        productCategory
      );

      return NextResponse.json({
        videos: channelVideos,
        total: channelVideos.length,
        platform: 'youtube',
        source: 'channel',
        filtersApplied: {
          minLikes: minLikes > 0,
          maxDaysAgo: maxDaysAgo > 0,
          minLikesPerDay: minLikesPerDay > 0,
          shortsOnly: shortsOnly,
          productCategory: productCategory && productCategory !== 'all',
          sortBy,
        },
      });
    }

    // Se for apenas TikTok, buscar só do TikTok
    if (platform === 'tiktok') {
      console.log('🎵 Buscando apenas TikTok...');
      return await getTikTokVideos(maxResults, minLikes, maxDaysAgo, minLikesPerDay, sortBy, productCategory);
    }

    // Se regionParam contém vírgulas, é uma lista de países
    // Também pode ser uma string vazia ou array vazio (nenhum país selecionado)
    let regions: string | string[];
    if (!regionParam || regionParam === '' || regionParam === '[]') {
      // Se nenhum país selecionado, usar 'ALL_AMERICAS' como padrão
      regions = 'ALL_AMERICAS';
    } else if (regionParam.includes(',')) {
      regions = regionParam.split(',').map(r => r.trim()).filter(r => r.length > 0);
    } else {
      regions = regionParam;
    }

    // Se for 'all', buscar de ambas as plataformas
    if (platform === 'all') {
      console.log('📱 Buscando de todas as plataformas...');
      const [youtubeResult, tiktokResult] = await Promise.allSettled([
        getYouTubeVideosData(regions, maxResults, category, minLikes, maxDaysAgo, minLikesPerDay, sortBy, shortsOnly, productCategory),
        getTikTokVideosData(maxResults, minLikes, maxDaysAgo, minLikesPerDay, sortBy, productCategory),
      ]);

      const allVideos: ViralVideo[] = [];
      
      // Extrair vídeos do YouTube
      if (youtubeResult.status === 'fulfilled') {
        console.log(`📺 YouTube retornou: ${youtubeResult.value.length} vídeos`);
        allVideos.push(...youtubeResult.value);
      } else {
        console.warn('⚠️ YouTube falhou:', youtubeResult.reason);
      }
      
      // Extrair vídeos do TikTok
      if (tiktokResult.status === 'fulfilled') {
        console.log(`🎵 TikTok retornou: ${tiktokResult.value.length} vídeos`);
        allVideos.push(...tiktokResult.value);
      } else {
        console.warn('⚠️ TikTok falhou:', tiktokResult.reason);
      }
      
      console.log(`📊 Total combinado: ${allVideos.length} vídeos`);

      // Ordenar todos os vídeos juntos
      const sortedVideos = sortVideos(allVideos, sortBy);
      const finalVideos = sortedVideos.slice(0, maxResults);

      return NextResponse.json({
        videos: finalVideos,
        total: finalVideos.length,
        platform: 'all',
        filtersApplied: {
          minLikes: minLikes > 0,
          maxDaysAgo: maxDaysAgo > 0,
          minLikesPerDay: minLikesPerDay > 0,
          shortsOnly: shortsOnly,
          sortBy,
        },
      });
    }

    // Padrão: YouTube (código existente)
    console.log('▶️ Buscando apenas YouTube...');
    const regionParamForYouTube = Array.isArray(regions) ? regions.join(',') : regions;
    return await getYouTubeVideos(regionParamForYouTube, maxResults, category, minLikes, maxDaysAgo, minLikesPerDay, sortBy, shortsOnly, productCategory);
  } catch (error: any) {
    console.error('Erro ao buscar vídeos virais:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar vídeos virais' },
      { status: 500 }
    );
  }
}

// Função auxiliar para buscar dados do TikTok (retorna array)
async function getTikTokVideosData(
  maxResults: number,
  minLikes: number,
  maxDaysAgo: number,
  minLikesPerDay: number,
  sortBy: string,
  productCategory: string = 'all'
): Promise<ViralVideo[]> {
  try {
    console.log(`🎵 Buscando TikTok: maxResults=${maxResults}, minLikes=${minLikes}, productCategory=${productCategory}`);
    const tiktokService = new TikTokService();
    // Buscar mais vídeos quando há filtro de categoria de produto
    const searchMultiplier = (productCategory && productCategory !== 'all') ? 5 : 2;
    let videos = await tiktokService.getTrending(maxResults * searchMultiplier);
    console.log(`📊 TikTok: ${videos.length} vídeos recebidos da API`);

  // Aplicar filtros
  if (minLikes > 0) {
    videos = videos.filter(video => video.likeCount >= minLikes);
  }

  if (maxDaysAgo > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxDaysAgo);
    cutoffDate.setHours(0, 0, 0, 0);
    
    videos = videos.filter(video => {
      const publishedDate = new Date(video.publishedAt);
      publishedDate.setHours(0, 0, 0, 0);
      return publishedDate >= cutoffDate;
    });
  }

  if (minLikesPerDay > 0) {
    videos = videos.filter(video => {
      const likesPerDay = video.likesPerDay || 0;
      return likesPerDay >= minLikesPerDay;
    });
  }

  // Filtrar por categoria de produto
  if (productCategory && productCategory !== 'all') {
    const before = videos.length;
    videos = videos.filter(video => matchesCategory(video, productCategory));
    console.log(`Filtro de categoria de produto: ${before} → ${videos.length} vídeos`);
  }

  // Ordenar
  const sortedVideos = sortVideos(videos, sortBy);
  const finalVideos = sortedVideos.slice(0, maxResults);
  console.log(`✅ TikTok: ${finalVideos.length} vídeos finais após filtros`);
  return finalVideos;
  } catch (error: any) {
    const errorMessage = error.message || error.toString();
    console.error('❌ Erro ao buscar vídeos do TikTok:', {
      message: errorMessage,
      details: error
    });
    // Retornar array vazio em vez de throw para não quebrar quando platform=all
    return [];
  }
}

// Função para buscar vídeos do TikTok (retorna NextResponse)
async function getTikTokVideos(
  maxResults: number,
  minLikes: number,
  maxDaysAgo: number,
  minLikesPerDay: number,
  sortBy: string,
  productCategory: string = 'all'
) {
  try {
    const finalVideos = await getTikTokVideosData(maxResults, minLikes, maxDaysAgo, minLikesPerDay, sortBy, productCategory);

    return NextResponse.json({
      videos: finalVideos,
      total: finalVideos.length,
      platform: 'tiktok',
      filtersApplied: {
        minLikes: minLikes > 0,
        maxDaysAgo: maxDaysAgo > 0,
        minLikesPerDay: minLikesPerDay > 0,
        sortBy,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar vídeos do TikTok:', error);
    return NextResponse.json(
      { error: `Erro ao buscar vídeos do TikTok: ${error.message}` },
      { status: 500 }
    );
  }
}

// Função auxiliar para converter duração ISO 8601 para segundos
function parseDurationToSeconds(duration: string): number {
  // Formato ISO 8601: PT1H2M3S ou PT60S
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Função para buscar vídeos por palavras-chave (quando há filtro de categoria de produto)
async function searchYouTubeByKeywords(
  productCategory: string,
  regionParam: string | string[],
  maxResults: number,
  minLikes: number,
  maxDaysAgo: number,
  minLikesPerDay: number,
  sortBy: string,
  shortsOnly: boolean,
  apiKey: string
): Promise<ViralVideo[]> {
  try {
    const category = getCategoryById(productCategory);
    if (!category || category.keywords.length === 0) {
      console.warn('⚠️ Categoria não encontrada ou sem palavras-chave');
      return [];
    }

    // Usar as palavras-chave mais relevantes para buscar
    // Priorizar palavras-chave em português e inglês
    const mainKeywords = category.keywords
      .filter(kw => kw.length > 4) // Filtrar palavras muito curtas
      .slice(0, 3); // Usar as 3 primeiras palavras-chave principais

    const searchQuery = mainKeywords.join(' '); // Combinar palavras-chave
    console.log(`🔍 Buscando por palavras-chave: "${searchQuery}" (categoria: ${category.name})`);

    // Buscar vídeos usando search.list
    const searchResponse = await youtube.search.list({
      key: apiKey,
      part: ['snippet'],
      q: searchQuery,
      type: 'video',
      maxResults: Math.min(maxResults * 3, 50), // Buscar mais para ter opções após filtros
      order: 'viewCount', // Ordenar por visualizações
      relevanceLanguage: 'pt', // Priorizar português
    } as any);

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      console.warn('⚠️ Nenhum vídeo encontrado na busca por palavras-chave');
      return [];
    }

    // Buscar estatísticas dos vídeos encontrados
    const videoIds = searchResponse.data.items
      .map(item => item.id?.videoId)
      .filter(Boolean) as string[];

    if (videoIds.length === 0) {
      return [];
    }

    const videosResponse = await youtube.videos.list({
      key: apiKey,
      part: ['snippet', 'statistics', 'contentDetails'],
      id: videoIds,
    });

    // Converter para formato ViralVideo
    const videos: ViralVideo[] = (videosResponse.data.items || []).map((item, index) => {
      const snippet = item.snippet;
      const statistics = item.statistics;
      const contentDetails = item.contentDetails;

      const views = parseInt(statistics?.viewCount || '0');
      const likes = parseInt(statistics?.likeCount || '0');
      const comments = parseInt(statistics?.commentCount || '0');
      const publishedAt = snippet?.publishedAt ? new Date(snippet.publishedAt) : new Date();
      const hoursSincePublished = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
      const daysSincePublished = hoursSincePublished / 24;
      const likesPerDay = daysSincePublished > 0 ? likes / daysSincePublished : likes;
      const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
      const timeBoost = hoursSincePublished < 24 ? 1.5 : hoursSincePublished < 168 ? 1.2 : 1;
      const viralScore = ((views * 0.4) + (likes * 0.3) + (comments * 0.2) + (engagement * 0.1)) * timeBoost;

      return {
        id: item.id || '',
        title: snippet?.title || 'Sem título',
        description: snippet?.description || '',
        thumbnail: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.default?.url || '',
        channelTitle: snippet?.channelTitle || 'Canal desconhecido',
        channelId: snippet?.channelId || '',
        publishedAt: snippet?.publishedAt || new Date().toISOString(),
        viewCount: views,
        likeCount: likes,
        commentCount: comments,
        duration: contentDetails?.duration || 'PT0S',
        url: `https://www.youtube.com/watch?v=${item.id}`,
        platform: 'youtube' as const,
        viralScore: Math.round(viralScore),
        trendingRank: index + 1,
        daysSincePublished: Math.round(daysSincePublished * 10) / 10,
        likesPerDay: Math.round(likesPerDay),
      };
    });

    // Aplicar filtros
    let filteredVideos = [...videos];

    // Filtrar Shorts
    if (shortsOnly) {
      const before = filteredVideos.length;
      filteredVideos = filteredVideos.filter(video => {
        const durationSeconds = parseDurationToSeconds(video.duration);
        return durationSeconds > 0 && durationSeconds <= 60;
      });
      console.log(`Filtro de Shorts: ${before} → ${filteredVideos.length} vídeos`);
    }

    // Filtrar por curtidas
    if (minLikes > 0) {
      const before = filteredVideos.length;
      filteredVideos = filteredVideos.filter(video => video.likeCount >= minLikes);
      console.log(`Filtro de curtidas: ${before} → ${filteredVideos.length} vídeos`);
    }

    // Filtrar por data
    if (maxDaysAgo > 0) {
      const before = filteredVideos.length;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxDaysAgo);
      cutoffDate.setHours(0, 0, 0, 0);
      filteredVideos = filteredVideos.filter(video => {
        const publishedDate = new Date(video.publishedAt);
        publishedDate.setHours(0, 0, 0, 0);
        return publishedDate >= cutoffDate;
      });
      console.log(`Filtro de data: ${before} → ${filteredVideos.length} vídeos`);
    }

    // Filtrar por crescimento
    if (minLikesPerDay > 0) {
      const before = filteredVideos.length;
      filteredVideos = filteredVideos.filter(video => {
        const likesPerDay = (video as any).likesPerDay || 0;
        return likesPerDay >= minLikesPerDay;
      });
      console.log(`Filtro de crescimento: ${before} → ${filteredVideos.length} vídeos`);
    }

    // Ordenar
    switch (sortBy) {
      case 'likes':
        filteredVideos.sort((a, b) => b.likeCount - a.likeCount);
        break;
      case 'views':
        filteredVideos.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'comments':
        filteredVideos.sort((a, b) => b.commentCount - a.commentCount);
        break;
      case 'recent':
        filteredVideos.sort((a, b) => {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });
        break;
      case 'growth':
        filteredVideos.sort((a, b) => {
          const growthA = (a as any).likesPerDay || 0;
          const growthB = (b as any).likesPerDay || 0;
          return growthB - growthA;
        });
        break;
      case 'viralScore':
      default:
        filteredVideos.sort((a, b) => b.viralScore - a.viralScore);
        break;
    }

    const finalVideos = filteredVideos.slice(0, maxResults);
    console.log(`✅ Busca por palavras-chave: ${finalVideos.length} vídeos finais (de ${videos.length} encontrados)`);
    return finalVideos;
  } catch (error: any) {
    console.error('❌ Erro ao buscar vídeos por palavras-chave:', error);
    return [];
  }
}

// Função auxiliar para buscar dados do YouTube (retorna array)
async function getYouTubeVideosData(
  regionParam: string | string[],
  maxResults: number,
  category: string,
  minLikes: number,
  maxDaysAgo: number,
  minLikesPerDay: number,
  sortBy: string,
  shortsOnly: boolean = false,
  productCategory: string = 'all'
): Promise<ViralVideo[]> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ YouTube API Key não configurada no .env.local - retornando array vazio');
      return []; // Retornar vazio em vez de throw para não quebrar quando platform=all
    }
    
    // Verificar se é um placeholder ou muito curta
    if (apiKey.includes('AIzaSy...') || apiKey.length < 30 || apiKey === 'AIzaSy......') {
      console.error('❌ YouTube API Key parece ser um placeholder ou está incompleta');
      console.error(`   Tamanho atual: ${apiKey.length} caracteres (deveria ser ~39)`);
      console.error('   Configure uma API Key válida no .env.local');
      console.error('   Veja: https://console.cloud.google.com/ → APIs & Services → Credentials');
      return [];
    }

    // Regiões da América
    const americasRegions = ['US', 'BR', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'HT', 'DO', 'HN', 'PY', 'NI', 'SV', 'CR', 'PA', 'UY', 'JM', 'TT', 'BZ', 'BS', 'BB', 'SR', 'GY', 'CA'];
    
    // Determinar regiões para buscar
    let regionsToSearch: string[];
    if (Array.isArray(regionParam)) {
      // Se array vazio, usar todas as regiões
      regionsToSearch = regionParam.length === 0 ? americasRegions : regionParam;
    } else if (regionParam === 'ALL_AMERICAS' || !regionParam || regionParam === '') {
      regionsToSearch = americasRegions;
    } else if (regionParam.includes(',')) {
      // Se for string com vírgulas, dividir
      const parsed = regionParam.split(',').map(r => r.trim()).filter(r => r.length > 0);
      regionsToSearch = parsed.length === 0 ? americasRegions : parsed;
    } else {
      regionsToSearch = [regionParam];
    }
    
    // Se houver filtro de categoria de produto, fazer busca por palavras-chave ao invés de trending
    if (productCategory && productCategory !== 'all') {
      return await searchYouTubeByKeywords(
        productCategory,
        regionParam,
        maxResults,
        minLikes,
        maxDaysAgo,
        minLikesPerDay,
        sortBy,
        shortsOnly,
        apiKey
      );
    }
    
    // Se houver filtro de curtidas, buscar mais vídeos para ter mais opções
    let searchLimit = maxResults;
    if (minLikes > 0) {
      searchLimit = Math.max(maxResults * 3, 100);
    }
    
    // Buscar vídeos de todas as regiões selecionadas
    const allVideos: any[] = [];
    
    console.log(`🔍 Buscando YouTube: ${regionsToSearch.length} região(ões), maxResults: ${maxResults}`);
    
    for (const regionCode of regionsToSearch) {
      try {
        // Construir parâmetros da requisição
        const requestParams: any = {
          key: apiKey,
          part: ['snippet', 'statistics', 'contentDetails'],
          chart: 'mostPopular',
          regionCode,
          maxResults: regionsToSearch.length > 1 ? Math.min(50, searchLimit) : searchLimit,
        };
        
        // Só adicionar categoria se não for "0" (todas)
        if (category && category !== '0') {
          requestParams.videoCategoryId = category;
        }
        
        console.log(`📡 Chamando YouTube API para região ${regionCode}...`);
        const trendingResponse = await youtube.videos.list(requestParams);
        
        console.log(`📊 YouTube API Response para ${regionCode}:`, {
          status: 'ok',
          itemsCount: trendingResponse.data.items?.length || 0,
          hasItems: !!trendingResponse.data.items,
          pageInfo: trendingResponse.data.pageInfo,
        });
        
        if (trendingResponse.data.items && trendingResponse.data.items.length > 0) {
          console.log(`✅ Região ${regionCode}: ${trendingResponse.data.items.length} vídeos encontrados`);
          allVideos.push(...trendingResponse.data.items);
        } else {
          console.warn(`⚠️ Região ${regionCode}: Nenhum vídeo retornado (items: ${trendingResponse.data.items?.length || 0})`);
          // Verificar se há erro na resposta (pode estar em diferentes propriedades)
          const responseData = trendingResponse.data as any;
          if (responseData.error) {
            console.error('❌ Erro na resposta:', responseData.error);
          }
        }
      } catch (error: any) {
        const errorMessage = error.message || error.toString();
        const errorCode = error.code || error.response?.status;
        console.error(`❌ Erro ao buscar vídeos da região ${regionCode}:`, {
          message: errorMessage,
          code: errorCode,
          details: error.response?.data || error
        });
        // Continuar com outras regiões mesmo se uma falhar
      }
    }
    
    console.log(`📊 Total de vídeos coletados: ${allVideos.length}`);

    // Remover duplicatas (mesmo video ID)
    const uniqueVideos = Array.from(
      new Map(allVideos.map(item => [item.id, item])).values()
    );

    const videos: ViralVideo[] = uniqueVideos.map((item, index) => {
      const snippet = item.snippet;
      const statistics = item.statistics;
      const contentDetails = item.contentDetails;

      // Calcular viral score (baseado em views, likes, comments e tempo)
      const views = parseInt(statistics?.viewCount || '0');
      const likes = parseInt(statistics?.likeCount || '0');
      const comments = parseInt(statistics?.commentCount || '0');
      const publishedAt = snippet?.publishedAt ? new Date(snippet.publishedAt) : new Date();
      const hoursSincePublished = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
      const daysSincePublished = hoursSincePublished / 24;
      
      // Calcular taxa de crescimento (curtidas por dia)
      const likesPerDay = daysSincePublished > 0 ? likes / daysSincePublished : likes;
      
      // Score: (views * 0.4) + (likes * 0.3) + (comments * 0.2) + (engagement * 0.1)
      // Ajustado por tempo (vídeos mais recentes têm boost)
      const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
      const timeBoost = hoursSincePublished < 24 ? 1.5 : hoursSincePublished < 168 ? 1.2 : 1;
      const viralScore = ((views * 0.4) + (likes * 0.3) + (comments * 0.2) + (engagement * 0.1)) * timeBoost;

      return {
        id: item.id || '',
        title: snippet?.title || 'Sem título',
        description: snippet?.description || '',
        thumbnail: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.default?.url || '',
        channelTitle: snippet?.channelTitle || 'Canal desconhecido',
        channelId: snippet?.channelId || '',
        publishedAt: snippet?.publishedAt || new Date().toISOString(),
        viewCount: views,
        likeCount: likes,
        commentCount: comments,
        duration: contentDetails?.duration || 'PT0S',
        url: `https://www.youtube.com/watch?v=${item.id}`,
        platform: 'youtube' as const,
        viralScore: Math.round(viralScore),
        trendingRank: index + 1,
        // Dados adicionais para filtros
        daysSincePublished: Math.round(daysSincePublished * 10) / 10,
        likesPerDay: Math.round(likesPerDay),
      };
    });

    // Aplicar filtros na ordem correta
    let filteredVideos = [...videos]; // Criar cópia para não modificar o original
    
    // 0. Filtrar apenas Shorts (duração <= 60 segundos)
    if (shortsOnly) {
      const before = filteredVideos.length;
      filteredVideos = filteredVideos.filter(video => {
        const durationSeconds = parseDurationToSeconds(video.duration);
        return durationSeconds > 0 && durationSeconds <= 60;
      });
      console.log(`Filtro de Shorts: ${before} → ${filteredVideos.length} vídeos (≤60 segundos)`);
    }
    
    // 1. Filtrar por curtidas mínimas (primeiro, pois é o mais restritivo)
    if (minLikes > 0) {
      const before = filteredVideos.length;
      filteredVideos = filteredVideos.filter(video => video.likeCount >= minLikes);
      console.log(`Filtro de curtidas: ${before} → ${filteredVideos.length} vídeos (${minLikes}+ curtidas)`);
    }
    
    // 2. Filtrar por data de publicação (últimos X dias)
    if (maxDaysAgo > 0) {
      const before = filteredVideos.length;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxDaysAgo);
      cutoffDate.setHours(0, 0, 0, 0); // Resetar horas para comparação precisa
      
      filteredVideos = filteredVideos.filter(video => {
        const publishedDate = new Date(video.publishedAt);
        publishedDate.setHours(0, 0, 0, 0);
        return publishedDate >= cutoffDate;
      });
      console.log(`Filtro de data: ${before} → ${filteredVideos.length} vídeos (últimos ${maxDaysAgo} dias)`);
    }
    
    // 3. Filtrar por taxa de crescimento (curtidas por dia)
    if (minLikesPerDay > 0) {
      const before = filteredVideos.length;
      filteredVideos = filteredVideos.filter(video => {
        const videoWithStats = video as any;
        const likesPerDay = videoWithStats.likesPerDay || 0;
        return likesPerDay >= minLikesPerDay;
      });
      console.log(`Filtro de crescimento: ${before} → ${filteredVideos.length} vídeos (${minLikesPerDay}+ curtidas/dia)`);
    }
    
    // 4. Filtrar por categoria de produto
    if (productCategory && productCategory !== 'all') {
      const before = filteredVideos.length;
      const category = getCategoryById(productCategory);
      console.log(`🔍 Aplicando filtro de categoria: ${category?.name || productCategory}`);
      console.log(`📝 Palavras-chave: ${category?.keywords.slice(0, 5).join(', ')}...`);
      
      filteredVideos = filteredVideos.filter(video => matchesCategory(video, productCategory));
      
      console.log(`✅ Filtro de categoria de produto: ${before} → ${filteredVideos.length} vídeos`);
      
      // Log de exemplo de vídeos que não passaram no filtro (para debug)
      if (filteredVideos.length === 0 && before > 0) {
        // Encontrar um vídeo que não passou no filtro
        const rejectedVideo = videos.find(video => !matchesCategory(video, productCategory));
        if (rejectedVideo) {
          console.log(`⚠️ Exemplo de vídeo que não passou no filtro:`, {
            title: rejectedVideo.title?.substring(0, 50),
            description: rejectedVideo.description?.substring(0, 100)
          });
        }
      }
    }

    // Ordenar conforme solicitado
    switch (sortBy) {
      case 'likes':
        filteredVideos.sort((a, b) => b.likeCount - a.likeCount);
        break;
      case 'views':
        filteredVideos.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'comments':
        filteredVideos.sort((a, b) => b.commentCount - a.commentCount);
        break;
      case 'recent':
        filteredVideos.sort((a, b) => {
          const dateA = new Date(a.publishedAt).getTime();
          const dateB = new Date(b.publishedAt).getTime();
          return dateB - dateA; // Mais recente primeiro
        });
        break;
      case 'growth':
        filteredVideos.sort((a, b) => {
          const growthA = (a as any).likesPerDay || 0;
          const growthB = (b as any).likesPerDay || 0;
          return growthB - growthA;
        });
        break;
      case 'viralScore':
      default:
        filteredVideos.sort((a, b) => b.viralScore - a.viralScore);
        break;
    }

    // Limitar resultados finais
    const finalVideos = filteredVideos.slice(0, maxResults);
    console.log(`✅ YouTube: ${finalVideos.length} vídeos finais após filtros (de ${uniqueVideos.length} coletados)`);
    return finalVideos;
  } catch (error: any) {
    const errorMessage = error.message || error.toString();
    const errorCode = error.code || error.response?.status;
    console.error('❌ Erro ao buscar vídeos do YouTube:', {
      message: errorMessage,
      code: errorCode,
      details: error.response?.data || error
    });
    // Retornar array vazio em vez de throw para não quebrar quando platform=all
    return [];
  }
}

// Função para buscar vídeos do YouTube (retorna NextResponse)
async function getYouTubeVideos(
  regionParam: string,
  maxResults: number,
  category: string,
  minLikes: number,
  maxDaysAgo: number,
  minLikesPerDay: number,
  sortBy: string,
  shortsOnly: boolean = false,
  productCategory: string = 'all'
) {
  try {
    const finalVideos = await getYouTubeVideosData(regionParam, maxResults, category, minLikes, maxDaysAgo, minLikesPerDay, sortBy, shortsOnly, productCategory);
    const allVideos = await getYouTubeVideosData(regionParam, maxResults * 3, category, 0, 0, 0, sortBy, shortsOnly, productCategory);

    return NextResponse.json({ 
      videos: finalVideos,
      total: finalVideos.length,
      totalBeforeFilters: allVideos.length,
      filtered: minLikes > 0 || maxDaysAgo > 0 || minLikesPerDay > 0 || (category && category !== '0'),
      regions: regionParam === 'ALL_AMERICAS' ? 'Toda América' : regionParam,
      platform: 'youtube',
      filtersApplied: {
        minLikes: minLikes > 0,
        maxDaysAgo: maxDaysAgo > 0,
        minLikesPerDay: minLikesPerDay > 0,
        category: category && category !== '0',
        sortBy,
      },
    });
  } catch (error: any) {
    const errorMessage = error.message || error.toString();
    console.error('❌ Erro ao buscar vídeos do YouTube (getYouTubeVideos):', {
      message: errorMessage,
      details: error
    });
    return NextResponse.json(
      { 
        videos: [],
        total: 0,
        totalBeforeFilters: 0,
        filtered: false,
        regions: regionParam === 'ALL_AMERICAS' ? 'Toda América' : regionParam,
        platform: 'youtube',
        error: `Erro ao buscar vídeos do YouTube: ${errorMessage}`,
        filtersApplied: {
          minLikes: minLikes > 0,
          maxDaysAgo: maxDaysAgo > 0,
          minLikesPerDay: minLikesPerDay > 0,
          category: category && category !== '0',
          shortsOnly: shortsOnly,
          sortBy,
        },
      },
      { status: 200 } // Retornar 200 com array vazio para não quebrar o frontend
    );
  }
}

// Função para buscar vídeos de um perfil do TikTok
async function getTikTokProfileVideos(
  username: string,
  maxResults: number,
  minLikes: number,
  maxDaysAgo: number,
  minLikesPerDay: number,
  sortBy: string,
  productCategory: string = 'all'
): Promise<ViralVideo[]> {
  try {
    console.log(`🎵 Buscando vídeos do perfil TikTok: @${username}`);
    const tiktokService = new TikTokService();
    
    // Buscar mais vídeos para ter opções após filtros
    let videos = await tiktokService.getUserVideos(username, maxResults * 3);
    console.log(`📊 TikTok: ${videos.length} vídeos recebidos do perfil`);

    // Aplicar filtros
    if (minLikes > 0) {
      videos = videos.filter(video => video.likeCount >= minLikes);
    }

    if (maxDaysAgo > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxDaysAgo);
      cutoffDate.setHours(0, 0, 0, 0);
      
      videos = videos.filter(video => {
        const publishedDate = new Date(video.publishedAt);
        publishedDate.setHours(0, 0, 0, 0);
        return publishedDate >= cutoffDate;
      });
    }

    if (minLikesPerDay > 0) {
      videos = videos.filter(video => {
        const likesPerDay = video.likesPerDay || 0;
        return likesPerDay >= minLikesPerDay;
      });
    }

    // Filtrar por categoria de produto
    if (productCategory && productCategory !== 'all') {
      const before = videos.length;
      videos = videos.filter(video => matchesCategory(video, productCategory));
      console.log(`Filtro de categoria de produto: ${before} → ${videos.length} vídeos`);
    }

    // Ordenar
    const sortedVideos = sortVideos(videos, sortBy);
    const finalVideos = sortedVideos.slice(0, maxResults);
    
    console.log(`✅ TikTok Perfil: ${finalVideos.length} vídeos finais (de ${videos.length} encontrados)`);
    return finalVideos;
  } catch (error: any) {
    console.error('❌ Erro ao buscar vídeos do perfil TikTok:', error);
    return [];
  }
}

// Função para buscar vídeos de um canal do YouTube
async function getYouTubeChannelVideos(
  channelIdentifier: string,
  channelType: 'handle' | 'custom' | 'user' | 'channel',
  maxResults: number,
  minLikes: number,
  maxDaysAgo: number,
  minLikesPerDay: number,
  sortBy: string,
  shortsOnly: boolean = false,
  productCategory: string = 'all'
): Promise<ViralVideo[]> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ YouTube API Key não configurada');
      return [];
    }

    let channelId: string | null = null;

    // Se já temos o channelId, usar diretamente
    if (channelType === 'channel') {
      channelId = channelIdentifier;
    } else {
      // Precisamos buscar o channelId usando o handle/custom/user
      console.log(`🔍 Buscando channelId para: ${channelIdentifier} (tipo: ${channelType})`);
      
      // Tentar buscar diretamente pelo handle usando channels.list (método mais direto)
      if (channelType === 'handle') {
        try {
          const channelsResponse = await youtube.channels.list({
            key: apiKey,
            part: ['id'],
            forHandle: channelIdentifier,
          } as any);
          
          if (channelsResponse.data.items && channelsResponse.data.items.length > 0) {
            channelId = channelsResponse.data.items[0].id || null;
            console.log(`✅ ChannelId encontrado via forHandle: ${channelId}`);
          }
        } catch (error: any) {
          console.warn('⚠️ Erro ao buscar por forHandle:', error.message);
        }
      }

      // Se não encontrou pelo forHandle, tentar busca por texto
      if (!channelId) {
        let searchQuery = '';
        if (channelType === 'handle') {
          // Para @handle, usar o handle diretamente
          searchQuery = `@${channelIdentifier}`;
        } else {
          // Para /c/ ou /user/, usar o identificador
          searchQuery = channelIdentifier;
        }

        // Buscar o canal usando search.list
        const searchResponse = await youtube.search.list({
          key: apiKey,
          part: ['snippet'],
          q: searchQuery,
          type: 'channel',
          maxResults: 1,
        } as any);

        if (searchResponse.data.items && searchResponse.data.items.length > 0) {
          channelId = searchResponse.data.items[0].id?.channelId || null;
          console.log(`✅ ChannelId encontrado via search: ${channelId}`);
        }
      }

      if (!channelId) {
        console.error('❌ Não foi possível encontrar o channelId');
        return [];
      }
    }

    // Agora buscar os vídeos do canal usando search.list com channelId
    console.log(`📹 Buscando vídeos do canal: ${channelId}`);
    
    const videosSearchResponse = await youtube.search.list({
      key: apiKey,
      part: ['snippet'],
      channelId: channelId,
      type: 'video',
      maxResults: Math.min(maxResults * 3, 50), // Buscar mais para ter opções após filtros
      order: 'date', // Ordenar por data (mais recentes primeiro)
    } as any);

    if (!videosSearchResponse.data.items || videosSearchResponse.data.items.length === 0) {
      console.warn('⚠️ Nenhum vídeo encontrado no canal');
      return [];
    }

    // Buscar estatísticas dos vídeos encontrados
    const videoIds = videosSearchResponse.data.items
      .map(item => item.id?.videoId)
      .filter(Boolean) as string[];

    if (videoIds.length === 0) {
      return [];
    }

    const videosResponse = await youtube.videos.list({
      key: apiKey,
      part: ['snippet', 'statistics', 'contentDetails'],
      id: videoIds,
    });

    // Converter para formato ViralVideo
    const videos: ViralVideo[] = (videosResponse.data.items || []).map((item, index) => {
      const snippet = item.snippet;
      const statistics = item.statistics;
      const contentDetails = item.contentDetails;

      const views = parseInt(statistics?.viewCount || '0');
      const likes = parseInt(statistics?.likeCount || '0');
      const comments = parseInt(statistics?.commentCount || '0');
      const publishedAt = snippet?.publishedAt ? new Date(snippet.publishedAt) : new Date();
      const hoursSincePublished = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
      const daysSincePublished = hoursSincePublished / 24;
      const likesPerDay = daysSincePublished > 0 ? likes / daysSincePublished : likes;
      const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
      const timeBoost = hoursSincePublished < 24 ? 1.5 : hoursSincePublished < 168 ? 1.2 : 1;
      const viralScore = ((views * 0.4) + (likes * 0.3) + (comments * 0.2) + (engagement * 0.1)) * timeBoost;

      return {
        id: item.id || '',
        title: snippet?.title || 'Sem título',
        description: snippet?.description || '',
        thumbnail: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.default?.url || '',
        channelTitle: snippet?.channelTitle || 'Canal desconhecido',
        channelId: snippet?.channelId || '',
        publishedAt: snippet?.publishedAt || new Date().toISOString(),
        viewCount: views,
        likeCount: likes,
        commentCount: comments,
        duration: contentDetails?.duration || 'PT0S',
        url: `https://www.youtube.com/watch?v=${item.id}`,
        platform: 'youtube' as const,
        viralScore: Math.round(viralScore),
        trendingRank: index + 1,
        daysSincePublished: Math.round(daysSincePublished * 10) / 10,
        likesPerDay: Math.round(likesPerDay),
      };
    });

    // Aplicar filtros
    let filteredVideos = [...videos];

    // Filtrar Shorts
    if (shortsOnly) {
      const before = filteredVideos.length;
      filteredVideos = filteredVideos.filter(video => {
        const durationSeconds = parseDurationToSeconds(video.duration);
        return durationSeconds > 0 && durationSeconds <= 60;
      });
      console.log(`Filtro de Shorts: ${before} → ${filteredVideos.length} vídeos`);
    }

    // Filtrar por curtidas
    if (minLikes > 0) {
      const before = filteredVideos.length;
      filteredVideos = filteredVideos.filter(video => video.likeCount >= minLikes);
      console.log(`Filtro de curtidas: ${before} → ${filteredVideos.length} vídeos`);
    }

    // Filtrar por data
    if (maxDaysAgo > 0) {
      const before = filteredVideos.length;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxDaysAgo);
      cutoffDate.setHours(0, 0, 0, 0);
      filteredVideos = filteredVideos.filter(video => {
        const publishedDate = new Date(video.publishedAt);
        publishedDate.setHours(0, 0, 0, 0);
        return publishedDate >= cutoffDate;
      });
      console.log(`Filtro de data: ${before} → ${filteredVideos.length} vídeos`);
    }

    // Filtrar por crescimento
    if (minLikesPerDay > 0) {
      const before = filteredVideos.length;
      filteredVideos = filteredVideos.filter(video => {
        const likesPerDay = video.likesPerDay || 0;
        return likesPerDay >= minLikesPerDay;
      });
      console.log(`Filtro de crescimento: ${before} → ${filteredVideos.length} vídeos`);
    }

    // Filtrar por categoria de produto
    if (productCategory && productCategory !== 'all') {
      const before = filteredVideos.length;
      filteredVideos = filteredVideos.filter(video => matchesCategory(video, productCategory));
      console.log(`Filtro de categoria de produto: ${before} → ${filteredVideos.length} vídeos`);
    }

    // Ordenar
    const sortedVideos = sortVideos(filteredVideos, sortBy);
    const finalVideos = sortedVideos.slice(0, maxResults);
    
    console.log(`✅ Canal: ${finalVideos.length} vídeos finais (de ${videos.length} encontrados)`);
    return finalVideos;
  } catch (error: any) {
    console.error('❌ Erro ao buscar vídeos do canal:', error);
    return [];
  }
}

// Função auxiliar para ordenar vídeos
function sortVideos(videos: ViralVideo[], sortBy: string): ViralVideo[] {
  const sorted = [...videos];
  
  switch (sortBy) {
    case 'likes':
      sorted.sort((a, b) => b.likeCount - a.likeCount);
      break;
    case 'views':
      sorted.sort((a, b) => b.viewCount - a.viewCount);
      break;
    case 'comments':
      sorted.sort((a, b) => b.commentCount - a.commentCount);
      break;
    case 'recent':
      sorted.sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return dateB - dateA;
      });
      break;
    case 'growth':
      sorted.sort((a, b) => {
        const growthA = a.likesPerDay || 0;
        const growthB = b.likesPerDay || 0;
        return growthB - growthA;
      });
      break;
    case 'viralScore':
    default:
      sorted.sort((a, b) => b.viralScore - a.viralScore);
      break;
  }
  
  return sorted;
}

