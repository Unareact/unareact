import { ViralVideo } from '@/app/types';

/**
 * Serviço para buscar vídeos trending do TikTok via RapidAPI
 */
export class TikTokService {
  private apiKey = process.env.TIKTOK_RAPIDAPI_KEY;
  private apiHost = process.env.TIKTOK_RAPIDAPI_HOST;

  /**
   * Busca vídeos de um usuário específico do TikTok
   * @param username - Nome de usuário (sem @)
   * @param count - Quantidade de vídeos (padrão: 20)
   * @returns Array de vídeos do usuário normalizados
   */
  async getUserVideos(username: string, count: number = 20): Promise<ViralVideo[]> {
    if (!this.apiKey || !this.apiHost) {
      console.warn('⚠️ TikTok API Key ou Host não configurados - retornando array vazio');
      return [];
    }

    // Remover @ se presente
    const cleanUsername = username.replace('@', '');

    try {
      // Tentar diferentes endpoints possíveis
      const endpoints = [
        `/api/user/posts?username=${cleanUsername}&count=${count}`,
        `/api/user/popular-posts?username=${cleanUsername}&count=${count}`,
        `/api/user/videos?username=${cleanUsername}&count=${count}`,
      ];

      for (const endpoint of endpoints) {
        try {
          const url = `https://${this.apiHost}${endpoint}`;
          
          console.log('TikTok API Request (User):', {
            url,
            username: cleanUsername,
            host: this.apiHost,
          });

          const response = await fetch(url, {
            headers: {
              'x-rapidapi-host': this.apiHost,
              'x-rapidapi-key': this.apiKey,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('TikTok API Response (User):', {
              status: response.status,
              hasData: !!data,
            });

            // Normalizar os dados para o formato ViralVideo
            return this.normalize(data);
          } else {
            console.warn(`Endpoint ${endpoint} retornou ${response.status}, tentando próximo...`);
          }
        } catch (error: any) {
          console.warn(`Erro ao tentar endpoint ${endpoint}:`, error.message);
          continue;
        }
      }

      throw new Error('Nenhum endpoint de usuário funcionou. Verifique se a API suporta busca por usuário.');
    } catch (error: any) {
      console.error('Erro ao buscar vídeos do usuário do TikTok:', error);
      throw new Error(`Erro ao buscar vídeos do usuário: ${error.message}`);
    }
  }

  /**
   * Busca vídeos trending do TikTok
   * @param count - Quantidade de vídeos (padrão: 20)
   * @returns Array de vídeos trending normalizados
   */
  async getTrending(count: number = 20): Promise<ViralVideo[]> {
    if (!this.apiKey || !this.apiHost) {
      console.warn('⚠️ TikTok API Key ou Host não configurados - retornando array vazio');
      return []; // Retornar vazio em vez de throw para não quebrar quando platform=all
    }
    
    // Verificar se é um placeholder
    if (this.apiKey.includes('sua-chave') || this.apiKey.includes('rapidapi-aqui') || this.apiKey.length < 30) {
      console.error('❌ TikTok API Key parece ser um placeholder do env.example');
      console.error(`   Chave atual: ${this.apiKey.substring(0, 20)}... (${this.apiKey.length} caracteres)`);
      console.error('   Configure uma API Key válida da RapidAPI no .env.local');
      console.error('   Veja: https://rapidapi.com/ → Procure "TikTok API" → Subscribe → Copie a chave');
      return [];
    }

    // Tentar diferentes endpoints possíveis
    const endpoints = [
      `/api/post/trending?count=${count}`,
      `/api/video/trending?count=${count}`,
      `/api/feed/trending?count=${count}`,
      `/api/post/feed?count=${count}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const url = `https://${this.apiHost}${endpoint}`;
        
        console.log('🎵 TikTok API Request:', {
          url,
          host: this.apiHost,
          keyPrefix: this.apiKey?.substring(0, 10) + '...',
        });
        
        const response = await fetch(url, {
          headers: {
            'x-rapidapi-host': this.apiHost,
            'x-rapidapi-key': this.apiKey,
          },
        });

        console.log('📡 TikTok API Response:', {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        });

        if (!response.ok) {
          // Tentar ler a mensagem de erro da resposta
          let errorMessage = `${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.warn(`⚠️ Endpoint ${endpoint} retornou erro:`, errorMessage);
          } catch {
            // Se não conseguir ler JSON, usar status text
          }

          // Se for 403, 401 ou 429, não tentar outros endpoints
          if (response.status === 403) {
            throw new Error(
              `403 Forbidden: Você precisa se inscrever no plano da API no RapidAPI. ` +
              `Acesse a página da API e clique em "Subscribe to Test" ou escolha um plano. ` +
              `Erro original: ${errorMessage}`
            );
          }
          
          if (response.status === 401) {
            throw new Error(
              `401 Unauthorized: API Key inválida ou expirada. Verifique sua chave no .env.local. ` +
              `Erro original: ${errorMessage}`
            );
          }

          if (response.status === 429) {
            throw new Error(
              `429 Too Many Requests: Você excedeu a quota mensal do seu plano na RapidAPI. ` +
              `Opções: 1) Aguarde o reset mensal da quota, 2) Faça upgrade do plano em https://rapidapi.com/Lundehund/api/tiktok-api23 ` +
              `Erro original: ${errorMessage}`
            );
          }

          // Se for 404 ou outro erro, tentar próximo endpoint
          if (response.status === 404) {
            console.warn(`⚠️ Endpoint ${endpoint} não encontrado (404), tentando próximo...`);
            continue;
          }

          // Para outros erros, também tentar próximo endpoint
          console.warn(`⚠️ Endpoint ${endpoint} retornou ${response.status}, tentando próximo...`);
          continue;
        }

        const data = await response.json();
        console.log('📊 TikTok API Data received:', {
          endpoint,
          hasData: !!data,
          dataKeys: Object.keys(data || {}),
          isArray: Array.isArray(data),
          hasDataObject: !!data.data,
          dataObjectKeys: data.data ? Object.keys(data.data) : [],
          hasMusicList: !!data.data?.music_list,
          hasItemList: !!data.itemList || !!data.data?.item_list,
          hasVideos: !!data.data?.videos,
          itemListCount: data.itemList?.length || data.data?.item_list?.length || 0,
        });
        
        // Verificar se retornou músicas ao invés de vídeos
        if (data.data?.music_list) {
          console.warn(`⚠️ Endpoint ${endpoint} retornou músicas ao invés de vídeos, tentando próximo...`);
          continue;
        }
        
        // Normalizar os dados para o formato ViralVideo
        const normalized = this.normalize(data);
        
        if (normalized.length > 0) {
          console.log(`✅ Endpoint ${endpoint} funcionou! Retornou ${normalized.length} vídeos`);
          return normalized;
        } else {
          console.warn(`⚠️ Endpoint ${endpoint} retornou dados mas normalização resultou em 0 vídeos, tentando próximo...`);
          continue;
        }
      } catch (error: any) {
        // Se for erro de autenticação/autorização, não tentar outros endpoints
        if (error.message?.includes('403') || error.message?.includes('401')) {
          console.error('❌ Erro de autenticação/autorização:', error.message);
          throw error;
        }
        
        console.warn(`⚠️ Erro ao tentar endpoint ${endpoint}:`, error.message);
        // Continuar para próximo endpoint
        continue;
      }
    }

    // Se nenhum endpoint funcionou
    throw new Error(
      'Nenhum endpoint do TikTok funcionou. Verifique:\n' +
      '1. Se você está inscrito no plano da API no RapidAPI\n' +
      '2. Se os endpoints estão disponíveis no seu plano\n' +
      '3. Se a API Key está correta\n' +
      '4. Veja a documentação da API no RapidAPI para encontrar o endpoint correto de vídeos trending'
    );
  }

  /**
   * Normaliza os dados do TikTok para o formato ViralVideo
   */
  private normalize(tiktokData: any): ViralVideo[] {
    // Verificar se a resposta é de músicas (não vídeos)
    if (tiktokData.data?.music_list) {
      console.error('❌ TikTok API retornou músicas ao invés de vídeos!');
      console.error('Resposta recebida:', {
        hasMusicList: !!tiktokData.data?.music_list,
        musicCount: tiktokData.data?.music_list?.length || 0,
        dataKeys: Object.keys(tiktokData.data || {}),
      });
      throw new Error(
        'O endpoint "/api/post/trending" está retornando MÚSICAS ao invés de VÍDEOS.\n\n' +
        '🔍 SOLUÇÃO: Você precisa encontrar o endpoint correto de vídeos trending no RapidAPI.\n\n' +
        '📋 Passos:\n' +
        '1. Acesse a página da API no RapidAPI\n' +
        '2. Na sidebar, procure por endpoints como:\n' +
        '   - "Get Trending Videos"\n' +
        '   - "Get Video Feed"\n' +
        '   - "Get Popular Videos"\n' +
        '3. Use a busca "Search Endpoints" e digite: "video" ou "trending"\n' +
        '4. Teste o endpoint no playground e verifique se retorna vídeos (não músicas)\n' +
        '5. Atualize a URL no arquivo tiktok-service.ts (linha 21)\n\n' +
        '📖 Veja o guia completo: TROUBLESHOOTING_TIKTOK_MUSIC_LIST.md'
      );
    }
    
    // A estrutura da resposta pode variar, então tentamos diferentes formatos
    // Prioridade: itemList (nível raiz) > item_list (dentro de data) > outros formatos
    const videos = tiktokData.itemList ||  // Nova estrutura (nível raiz)
                   tiktokData.data?.item_list || 
                   tiktokData.data?.videos || 
                   tiktokData.data?.items ||
                   tiktokData.videos || 
                   tiktokData.items || 
                   tiktokData.data ||
                   (Array.isArray(tiktokData) ? tiktokData : []);
    
    if (!Array.isArray(videos)) {
      console.error('❌ Resposta do TikTok não contém array de vídeos:', {
        keys: Object.keys(tiktokData || {}),
        dataKeys: tiktokData?.data ? Object.keys(tiktokData.data) : [],
        hasItemList: !!tiktokData.itemList,
        hasDataItemList: !!tiktokData.data?.item_list,
        hasVideos: !!tiktokData.data?.videos,
        hasItems: !!tiktokData.data?.items,
        isArray: Array.isArray(tiktokData),
        videosType: typeof videos,
        videosIsArray: Array.isArray(videos),
        sample: JSON.stringify(tiktokData).substring(0, 500),
      });
      return [];
    }

    console.log(`📹 Processando ${videos.length} vídeos do TikTok`);
    
    return videos.map((video: any, index: number) => {
      // Extrair dados do vídeo (estrutura pode variar)
      const videoId = video.id || video.video_id || video.aweme_id || video.item_id || String(index);
      
      // Log do primeiro vídeo para debug
      if (index === 0) {
        console.log('🔍 Estrutura do primeiro vídeo:', {
          hasId: !!video.id,
          hasDesc: !!video.desc,
          hasAuthor: !!video.author,
          hasStats: !!video.stats,
          hasVideo: !!video.video,
          hasMusic: !!video.music,
          authorKeys: video.author ? Object.keys(video.author) : [],
          statsKeys: video.stats ? Object.keys(video.stats) : [],
        });
      }
      
      // Título e descrição (nova estrutura usa 'desc')
      const title = video.desc || video.title || video.description || video.text || '';
      const description = video.desc || video.description || video.text || '';
      
      // Thumbnail - tentar múltiplas fontes (incluindo music.coverLarge para nova estrutura)
      const thumbnail = video.video?.cover || 
                       video.cover || 
                       video.music?.coverLarge || 
                       video.music?.coverMedium || 
                       video.music?.coverThumb ||
                       video.thumbnail || 
                       video.cover_url || 
                       video.cover_image ||
                       '';
      
      // Autor (nova estrutura tem author com uniqueId)
      const author = video.author || video.creator || video.user || {};
      const username = author.uniqueId || 
                       author.username || 
                       author.nickname || 
                       author.unique_id || 
                       '@unknown';
      const authorId = author.id || author.uid || author.user_id || author.secUid || '';
      
      // Métricas (nova estrutura usa stats.playCount, stats.diggCount, etc.)
      const stats = video.stats || video.statistics || {};
      const views = stats.playCount || 
                    stats.viewCount || 
                    video.play_count || 
                    video.view_count || 
                    video.views || 
                    video.play || 
                    0;
      const likes = stats.diggCount || 
                    stats.likeCount || 
                    video.digg_count || 
                    video.like_count || 
                    video.likes || 
                    video.digg || 
                    0;
      const comments = stats.commentCount || 
                       stats.comments || 
                       video.comment_count || 
                       video.comments || 
                       video.comment || 
                       0;
      const shares = stats.shareCount || 
                     stats.shares || 
                     video.share_count || 
                     video.shares || 
                     video.share || 
                     0;
      
      // Data de publicação (nova estrutura usa createTime em segundos)
      const publishedAt = video.createTime 
        ? new Date(video.createTime * 1000).toISOString()
        : video.create_time 
        ? new Date(video.create_time * 1000).toISOString()
        : video.created_at 
        ? new Date(video.created_at).toISOString()
        : video.published_at
        ? new Date(video.published_at).toISOString()
        : new Date().toISOString();
      
      // Duração - tentar múltiplas fontes (video.PlayAddrStruct não tem duration direto, usar music.duration)
      const videoDuration = video.video?.duration || 
                            video.video?.PlayAddrStruct?.duration ||
                            video.music?.duration || 
                            video.duration;
      const duration = videoDuration 
        ? `PT${Math.floor(videoDuration)}S` 
        : video.video_duration 
        ? `PT${Math.floor(video.video_duration)}S`
        : 'PT0S';
      
      // URL do vídeo - construir a partir de username e videoId se não houver shareUrl
      const url = video.shareUrl || 
                  video.share_url || 
                  video.url || 
                  video.web_video_url ||
                  (username && videoId ? `https://www.tiktok.com/@${username}/video/${videoId}` : '');

      // Calcular viral score
      const viralScore = this.calculateViralScore(views, likes, comments, shares, publishedAt);

      // Calcular dias desde publicação
      const daysSincePublished = Math.round(
        (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24) * 10
      ) / 10;

      // Calcular curtidas por dia
      const likesPerDay = daysSincePublished > 0 
        ? Math.round(likes / daysSincePublished) 
        : likes;

      return {
        id: videoId,
        title: title || description || 'Sem título',
        description: description || '',
        thumbnail: thumbnail || '',
        channelTitle: username,
        channelId: authorId,
        publishedAt,
        viewCount: views,
        likeCount: likes,
        commentCount: comments,
        duration,
        url,
        platform: 'tiktok' as const,
        viralScore,
        trendingRank: index + 1,
        daysSincePublished,
        likesPerDay,
      };
    });
  }

  /**
   * Calcula o viral score baseado nas métricas
   */
  private calculateViralScore(
    views: number,
    likes: number,
    comments: number,
    shares: number,
    publishedAt: string
  ): number {
    // Taxa de engajamento
    const engagement = views > 0 
      ? ((likes + comments + shares) / views) * 100 
      : 0;

    // Boost temporal (vídeos mais recentes têm boost)
    const hoursSincePublished = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60);
    const timeBoost = hoursSincePublished < 168 ? 1.2 : 1; // Boost se tiver menos de 7 dias

    // Cálculo do score
    const score = (
      views * 0.4 +
      likes * 0.3 +
      comments * 0.2 +
      engagement * 0.1
    ) * timeBoost;

    return Math.round(score);
  }
}

