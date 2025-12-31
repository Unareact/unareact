import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { ViralVideo } from '@/app/types';

const youtube = google.youtube('v3');

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID não fornecido' },
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

    // Buscar informações do vídeo atual
    const videoResponse = await youtube.videos.list({
      key: apiKey,
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [videoId],
    });

    const currentVideo = videoResponse.data.items?.[0];
    if (!currentVideo) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      );
    }

    const snippet = currentVideo.snippet;
    const channelId = snippet?.channelId;
    const publishedAt = snippet?.publishedAt ? new Date(snippet.publishedAt) : new Date();
    const title = snippet?.title || '';
    const description = snippet?.description || '';

    console.log('🔍 Buscando vídeo original para:', { videoId, channelId, title });

    const candidates: ViralVideo[] = [];

    // 1. Buscar vídeos relacionados (YouTube API relatedToVideoId)
    try {
      const relatedResponse = await youtube.search.list({
        key: apiKey,
        part: ['snippet'],
        relatedToVideoId: videoId,
        type: 'video',
        maxResults: 20,
        order: 'date', // Mais antigos primeiro
      } as any);

      if (relatedResponse.data.items) {
        const relatedVideoIds = relatedResponse.data.items
          .map(item => item.id?.videoId)
          .filter(Boolean) as string[];

        if (relatedVideoIds.length > 0) {
          const relatedVideosResponse = await youtube.videos.list({
            key: apiKey,
            part: ['snippet', 'statistics', 'contentDetails'],
            id: relatedVideoIds,
          });

          relatedVideosResponse.data.items?.forEach((item) => {
            const itemSnippet = item.snippet;
            const itemPublishedAt = itemSnippet?.publishedAt ? new Date(itemSnippet.publishedAt) : new Date();
            
            // Filtrar apenas vídeos mais antigos que o atual
            if (itemPublishedAt < publishedAt) {
              const statistics = item.statistics;
              const views = parseInt(statistics?.viewCount || '0');
              const likes = parseInt(statistics?.likeCount || '0');
              const comments = parseInt(statistics?.commentCount || '0');
              const daysSincePublished = (Date.now() - itemPublishedAt.getTime()) / (1000 * 60 * 60 * 24);
              const likesPerDay = daysSincePublished > 0 ? likes / daysSincePublished : likes;
              const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
              const viralScore = ((views * 0.4) + (likes * 0.3) + (comments * 0.2) + (engagement * 0.1));

              candidates.push({
                id: item.id || '',
                title: itemSnippet?.title || 'Sem título',
                description: itemSnippet?.description || '',
                thumbnail: itemSnippet?.thumbnails?.high?.url || itemSnippet?.thumbnails?.default?.url || '',
                channelTitle: itemSnippet?.channelTitle || 'Canal desconhecido',
                channelId: itemSnippet?.channelId || '',
                publishedAt: itemSnippet?.publishedAt || new Date().toISOString(),
                viewCount: views,
                likeCount: likes,
                commentCount: comments,
                duration: item.contentDetails?.duration || 'PT0S',
                url: `https://www.youtube.com/watch?v=${item.id}`,
                platform: 'youtube' as const,
                viralScore: Math.round(viralScore),
                trendingRank: 0,
                daysSincePublished: Math.round(daysSincePublished * 10) / 10,
                likesPerDay: Math.round(likesPerDay),
              });
            }
          });
        }
      }
    } catch (error: any) {
      console.warn('⚠️ Erro ao buscar vídeos relacionados:', error.message);
    }

    // 2. Buscar vídeos do mesmo canal, mais antigos
    if (channelId) {
      try {
        const channelVideosResponse = await youtube.search.list({
          key: apiKey,
          part: ['snippet'],
          channelId: channelId,
          type: 'video',
          maxResults: 50,
          order: 'date', // Mais antigos primeiro
        } as any);

        if (channelVideosResponse.data.items) {
          const channelVideoIds = channelVideosResponse.data.items
            .map(item => item.id?.videoId)
            .filter((id): id is string => {
              if (!id) return false;
              // Filtrar o vídeo atual
              if (id === videoId) return false;
              // Filtrar apenas vídeos mais antigos
              const itemPublishedAt = channelVideosResponse.data.items?.find(
                item => item.id?.videoId === id
              )?.snippet?.publishedAt;
              if (!itemPublishedAt) return false;
              return new Date(itemPublishedAt) < publishedAt;
            });

          if (channelVideoIds.length > 0) {
            const channelVideosDetailsResponse = await youtube.videos.list({
              key: apiKey,
              part: ['snippet', 'statistics', 'contentDetails'],
              id: channelVideoIds.slice(0, 20), // Limitar para não exceder quota
            });

            channelVideosDetailsResponse.data.items?.forEach((item) => {
              const itemSnippet = item.snippet;
              const itemPublishedAt = itemSnippet?.publishedAt ? new Date(itemSnippet.publishedAt) : new Date();
              
              // Verificar similaridade no título/descrição
              const titleSimilarity = calculateSimilarity(title.toLowerCase(), (itemSnippet?.title || '').toLowerCase());
              const descSimilarity = calculateSimilarity(description.toLowerCase().substring(0, 200), (itemSnippet?.description || '').toLowerCase().substring(0, 200));
              
              // Priorizar vídeos com título/descrição similar
              if (titleSimilarity > 0.3 || descSimilarity > 0.3 || itemPublishedAt < publishedAt) {
                const statistics = item.statistics;
                const views = parseInt(statistics?.viewCount || '0');
                const likes = parseInt(statistics?.likeCount || '0');
                const comments = parseInt(statistics?.commentCount || '0');
                const daysSincePublished = (Date.now() - itemPublishedAt.getTime()) / (1000 * 60 * 60 * 24);
                const likesPerDay = daysSincePublished > 0 ? likes / daysSincePublished : likes;
                const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
                const viralScore = ((views * 0.4) + (likes * 0.3) + (comments * 0.2) + (engagement * 0.1)) * (1 + titleSimilarity + descSimilarity);

                // Verificar se já não está na lista
                if (!candidates.find(v => v.id === item.id)) {
                  candidates.push({
                    id: item.id || '',
                    title: itemSnippet?.title || 'Sem título',
                    description: itemSnippet?.description || '',
                    thumbnail: itemSnippet?.thumbnails?.high?.url || itemSnippet?.thumbnails?.default?.url || '',
                    channelTitle: itemSnippet?.channelTitle || 'Canal desconhecido',
                    channelId: itemSnippet?.channelId || '',
                    publishedAt: itemSnippet?.publishedAt || new Date().toISOString(),
                    viewCount: views,
                    likeCount: likes,
                    commentCount: comments,
                    duration: item.contentDetails?.duration || 'PT0S',
                    url: `https://www.youtube.com/watch?v=${item.id}`,
                    platform: 'youtube' as const,
                    viralScore: Math.round(viralScore),
                    trendingRank: 0,
                    daysSincePublished: Math.round(daysSincePublished * 10) / 10,
                    likesPerDay: Math.round(likesPerDay),
                  });
                }
              }
            });
          }
        }
      } catch (error: any) {
        console.warn('⚠️ Erro ao buscar vídeos do canal:', error.message);
      }
    }

    // 3. Buscar por palavras-chave do título (vídeos mais antigos)
    try {
      // Extrair palavras-chave do título (remover palavras comuns)
      const stopWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'que', 'qual', 'quais', 'como', 'quando', 'onde', 'porque', 'porquê', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
      const titleWords = title.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.includes(word))
        .slice(0, 3);

      if (titleWords.length > 0) {
        const searchQuery = titleWords.join(' ');
        const searchResponse = await youtube.search.list({
          key: apiKey,
          part: ['snippet'],
          q: searchQuery,
          type: 'video',
          maxResults: 20,
          order: 'date', // Mais antigos primeiro
        } as any);

        if (searchResponse.data.items) {
          const searchVideoIds = searchResponse.data.items
            .map(item => item.id?.videoId)
            .filter((id): id is string => {
              if (!id || id === videoId) return false;
              const itemPublishedAt = searchResponse.data.items?.find(
                item => item.id?.videoId === id
              )?.snippet?.publishedAt;
              if (!itemPublishedAt) return false;
              return new Date(itemPublishedAt) < publishedAt;
            });

          if (searchVideoIds.length > 0) {
            const searchVideosDetailsResponse = await youtube.videos.list({
              key: apiKey,
              part: ['snippet', 'statistics', 'contentDetails'],
              id: searchVideoIds.slice(0, 10),
            });

            searchVideosDetailsResponse.data.items?.forEach((item) => {
              // Verificar se já não está na lista
              if (!candidates.find(v => v.id === item.id)) {
                const itemSnippet = item.snippet;
                const itemPublishedAt = itemSnippet?.publishedAt ? new Date(itemSnippet.publishedAt) : new Date();
                const statistics = item.statistics;
                const views = parseInt(statistics?.viewCount || '0');
                const likes = parseInt(statistics?.likeCount || '0');
                const comments = parseInt(statistics?.commentCount || '0');
                const daysSincePublished = (Date.now() - itemPublishedAt.getTime()) / (1000 * 60 * 60 * 24);
                const likesPerDay = daysSincePublished > 0 ? likes / daysSincePublished : likes;
                const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
                const viralScore = ((views * 0.4) + (likes * 0.3) + (comments * 0.2) + (engagement * 0.1));

                candidates.push({
                  id: item.id || '',
                  title: itemSnippet?.title || 'Sem título',
                  description: itemSnippet?.description || '',
                  thumbnail: itemSnippet?.thumbnails?.high?.url || itemSnippet?.thumbnails?.default?.url || '',
                  channelTitle: itemSnippet?.channelTitle || 'Canal desconhecido',
                  channelId: itemSnippet?.channelId || '',
                  publishedAt: itemSnippet?.publishedAt || new Date().toISOString(),
                  viewCount: views,
                  likeCount: likes,
                  commentCount: comments,
                  duration: item.contentDetails?.duration || 'PT0S',
                  url: `https://www.youtube.com/watch?v=${item.id}`,
                  platform: 'youtube' as const,
                  viralScore: Math.round(viralScore),
                  trendingRank: 0,
                  daysSincePublished: Math.round(daysSincePublished * 10) / 10,
                  likesPerDay: Math.round(likesPerDay),
                });
              }
            });
          }
        }
      }
    } catch (error: any) {
      console.warn('⚠️ Erro ao buscar por palavras-chave:', error.message);
    }

    // Ordenar candidatos: mais antigos primeiro, depois por similaridade
    candidates.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      
      // Priorizar vídeos mais antigos
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      
      // Se mesma data, priorizar maior viral score
      return b.viralScore - a.viralScore;
    });

    // Remover duplicatas
    const uniqueCandidates = candidates.filter((video, index, self) =>
      index === self.findIndex(v => v.id === video.id)
    );

    return NextResponse.json({
      videos: uniqueCandidates.slice(0, 20), // Limitar a 20 resultados
      total: uniqueCandidates.length,
      currentVideo: {
        id: videoId,
        title: title,
        channelId: channelId,
        publishedAt: publishedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar vídeo original:', error);
    return NextResponse.json(
      { error: `Erro ao buscar vídeo original: ${error.message}` },
      { status: 500 }
    );
  }
}

// Função auxiliar para calcular similaridade entre strings (Jaccard similarity)
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

