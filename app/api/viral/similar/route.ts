import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { ViralDiagnosis } from '@/app/types';

const youtube = google.youtube('v3');

export async function POST(request: NextRequest) {
  try {
    const { diagnosis, maxResults = 20 } = await request.json();

    if (!diagnosis || !diagnosis.viralFactors) {
      return NextResponse.json(
        { error: 'Diagnóstico não fornecido' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API Key não configurada' },
        { status: 500 }
      );
    }

    const viralFactors = diagnosis.viralFactors;
    const insights = diagnosis.insights;

    // Extrair palavras-chave do diagnóstico
    const keywords: string[] = [];
    
    // Do título (se houver padrões identificados)
    if (viralFactors.titleStrategy) {
      // Extrair palavras-chave do título strategy
      const titleWords = viralFactors.titleStrategy
        .toLowerCase()
        .match(/\b[a-z]{4,}\b/g) || [];
      keywords.push(...titleWords.slice(0, 5));
    }

    // Dos padrões de conteúdo
    if (insights?.contentPatterns && Array.isArray(insights.contentPatterns)) {
      insights.contentPatterns.forEach((pattern: string) => {
        const words = pattern.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
        keywords.push(...words.slice(0, 3));
      });
    }

    // Remover duplicatas e limitar
    const uniqueKeywords = [...new Set(keywords)].slice(0, 5);

    // Buscar vídeos similares usando search
    // Usar a primeira palavra-chave mais relevante
    const searchQuery = uniqueKeywords[0] || 'viral';
    
    console.log('🔍 Buscando vídeos similares:', { searchQuery, keywords: uniqueKeywords });

    // Buscar vídeos por palavra-chave
    const searchResponse = await youtube.search.list({
      key: apiKey,
      part: ['snippet'],
      q: searchQuery,
      type: 'video',
      maxResults: Math.min(maxResults * 2, 50), // Buscar mais para ter opções
      order: 'viewCount', // Ordenar por visualizações
      videoDefinition: 'any',
      videoDuration: 'any',
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return NextResponse.json({
        videos: [],
        total: 0,
        searchQuery,
      });
    }

    // Buscar estatísticas dos vídeos encontrados
    const videoIds = searchResponse.data.items.map(item => item.id?.videoId).filter(Boolean) as string[];
    
    if (videoIds.length === 0) {
      return NextResponse.json({
        videos: [],
        total: 0,
        searchQuery,
      });
    }

    const videosResponse = await youtube.videos.list({
      key: apiKey,
      part: ['snippet', 'statistics', 'contentDetails'],
      id: videoIds,
    });

    const videos = (videosResponse.data.items || []).map((item, index) => {
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

    // Ordenar por viral score
    videos.sort((a, b) => b.viralScore - a.viralScore);

    return NextResponse.json({
      videos: videos.slice(0, maxResults),
      total: videos.length,
      searchQuery,
      keywords: uniqueKeywords,
    });
  } catch (error: any) {
    console.error('Erro ao buscar vídeos similares:', error);
    return NextResponse.json(
      { error: `Erro ao buscar vídeos similares: ${error.message}` },
      { status: 500 }
    );
  }
}

