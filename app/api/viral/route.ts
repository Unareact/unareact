import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { ViralVideo } from '@/app/types';

// YouTube Data API v3
const youtube = google.youtube('v3');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const regionParam = searchParams.get('region') || 'US';
    const maxResults = parseInt(searchParams.get('maxResults') || '50');
    const category = searchParams.get('category') || '0';
    const minLikes = parseInt(searchParams.get('minLikes') || '0');
    const maxDaysAgo = parseInt(searchParams.get('maxDaysAgo') || '0');
    const minLikesPerDay = parseFloat(searchParams.get('minLikesPerDay') || '0');
    const sortBy = searchParams.get('sortBy') || 'views'; // Padrão: mais views primeiro

    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API Key não configurada. Adicione YOUTUBE_API_KEY no .env.local' },
        { status: 500 }
      );
    }

    // Regiões da América
    const americasRegions = ['US', 'BR', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'HT', 'DO', 'HN', 'PY', 'NI', 'SV', 'CR', 'PA', 'UY', 'JM', 'TT', 'BZ', 'BS', 'BB', 'SR', 'GY', 'CA'];
    
    // Se for "ALL_AMERICAS", buscar em todas as regiões
    const regionsToSearch = regionParam === 'ALL_AMERICAS' ? americasRegions : [regionParam];
    
    // Se houver filtro de curtidas, buscar mais vídeos para ter mais opções
    const searchLimit = minLikes > 0 ? Math.max(maxResults * 3, 100) : maxResults;
    
    // Buscar vídeos de todas as regiões selecionadas
    const allVideos: any[] = [];
    
    for (const regionCode of regionsToSearch) {
      try {
        // Construir parâmetros da requisição
        const requestParams: any = {
          key: apiKey,
          part: ['snippet', 'statistics', 'contentDetails'],
          chart: 'mostPopular',
          regionCode,
          maxResults: regionParam === 'ALL_AMERICAS' ? Math.min(50, searchLimit) : searchLimit,
        };
        
        // Só adicionar categoria se não for "0" (todas)
        if (category && category !== '0') {
          requestParams.videoCategoryId = category;
        }
        
        const trendingResponse = await youtube.videos.list(requestParams);
        
        if (trendingResponse.data.items) {
          allVideos.push(...trendingResponse.data.items);
        }
      } catch (error: any) {
        console.error(`Erro ao buscar vídeos da região ${regionCode}:`, error.message);
        // Continuar com outras regiões mesmo se uma falhar
      }
    }

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

    // Log para debug
    console.log('Resumo dos filtros:', {
      region: regionParam,
      category: category !== '0' ? category : 'Todas',
      minLikes,
      maxDaysAgo,
      minLikesPerDay,
      sortBy,
      totalAntes: videos.length,
      totalDepois: filteredVideos.length,
      totalRetornado: finalVideos.length,
    });

    return NextResponse.json({ 
      videos: finalVideos,
      total: filteredVideos.length,
      totalBeforeFilters: videos.length,
      filtered: minLikes > 0 || maxDaysAgo > 0 || minLikesPerDay > 0 || (category && category !== '0'),
      regions: regionParam === 'ALL_AMERICAS' ? 'Toda América' : regionParam,
      filtersApplied: {
        minLikes: minLikes > 0,
        maxDaysAgo: maxDaysAgo > 0,
        minLikesPerDay: minLikesPerDay > 0,
        category: category && category !== '0',
        sortBy,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar vídeos virais:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar vídeos virais' },
      { status: 500 }
    );
  }
}

