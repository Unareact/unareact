import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { ViralVideo } from '@/app/types';
import { TikTokService } from '@/app/lib/services/tiktok-service';

// YouTube Data API v3
const youtube = google.youtube('v3');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform') || 'youtube'; // 'youtube', 'tiktok', ou 'all'
    const regionParam = searchParams.get('region') || 'US';
    const maxResults = parseInt(searchParams.get('maxResults') || '50');
    const category = searchParams.get('category') || '0';
    const minLikes = parseInt(searchParams.get('minLikes') || '0');
    const maxDaysAgo = parseInt(searchParams.get('maxDaysAgo') || '0');
    const minLikesPerDay = parseFloat(searchParams.get('minLikesPerDay') || '0');
    const shortsOnly = searchParams.get('shortsOnly') === 'true'; // Filtrar apenas YouTube Shorts
    const sortBy = searchParams.get('sortBy') || 'views'; // Padrão: mais views primeiro

    console.log('🔍 API /viral recebeu:', { platform, regionParam, maxResults, minLikes, category });

    // Se for apenas TikTok, buscar só do TikTok
    if (platform === 'tiktok') {
      console.log('🎵 Buscando apenas TikTok...');
      return await getTikTokVideos(maxResults, minLikes, maxDaysAgo, minLikesPerDay, sortBy);
    }

    // Se for 'all', buscar de ambas as plataformas
    if (platform === 'all') {
      console.log('📱 Buscando de todas as plataformas...');
      const [youtubeResult, tiktokResult] = await Promise.allSettled([
        getYouTubeVideosData(regions, maxResults, category, minLikes, maxDaysAgo, minLikesPerDay, sortBy, shortsOnly),
        getTikTokVideosData(maxResults, minLikes, maxDaysAgo, minLikesPerDay, sortBy),
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
    return await getYouTubeVideos(regionParamForYouTube, maxResults, category, minLikes, maxDaysAgo, minLikesPerDay, sortBy, shortsOnly);
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
  sortBy: string
): Promise<ViralVideo[]> {
  try {
    console.log(`🎵 Buscando TikTok: maxResults=${maxResults}, minLikes=${minLikes}`);
    const tiktokService = new TikTokService();
    let videos = await tiktokService.getTrending(maxResults * 2); // Buscar mais para ter opções após filtros
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
  sortBy: string
) {
  try {
    const finalVideos = await getTikTokVideosData(maxResults, minLikes, maxDaysAgo, minLikesPerDay, sortBy);

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

// Função auxiliar para buscar dados do YouTube (retorna array)
async function getYouTubeVideosData(
  regionParam: string,
  maxResults: number,
  category: string,
  minLikes: number,
  maxDaysAgo: number,
  minLikesPerDay: number,
  sortBy: string,
  shortsOnly: boolean = false
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
    
    // Se for "ALL_AMERICAS", buscar em todas as regiões
    const regionsToSearch = regionParam === 'ALL_AMERICAS' ? americasRegions : [regionParam];
    
    // Se houver filtro de curtidas, buscar mais vídeos para ter mais opções
    const searchLimit = minLikes > 0 ? Math.max(maxResults * 3, 100) : maxResults;
    
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
  shortsOnly: boolean = false
) {
  try {
    const finalVideos = await getYouTubeVideosData(regionParam, maxResults, category, minLikes, maxDaysAgo, minLikesPerDay, sortBy, shortsOnly);
    const allVideos = await getYouTubeVideosData(regionParam, maxResults * 3, category, 0, 0, 0, sortBy, shortsOnly);

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

