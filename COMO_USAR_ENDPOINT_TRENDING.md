# 🎯 Como Usar o Endpoint "Get Trending Posts"

## ✅ Endpoint Encontrado!

Você encontrou: **"GET Get Trending Posts"** na seção "Post (Video)"

Este é exatamente o que você precisa! 🎉

---

## 📋 Próximos Passos

### 1. Clique no Endpoint

1. **Clique em "GET Get Trending Posts"** na sidebar
2. **Veja os parâmetros disponíveis** (na aba "Params")
3. **Veja a resposta de exemplo** (na aba "Example Responses")

---

## 🔍 O que Verificar

### Parâmetros Esperados:

O endpoint provavelmente aceita parâmetros como:
- `region` ou `country` - Região (ex: "BR", "US")
- `count` ou `limit` - Quantidade de vídeos
- `cursor` - Para paginação (opcional)

### Resposta Esperada:

A resposta deve incluir:
- ✅ Lista de vídeos trending
- ✅ Views, likes, comentários
- ✅ Título, descrição
- ✅ URL do vídeo
- ✅ Thumbnail
- ✅ Informações do criador

---

## 🧪 Testar o Endpoint

### No RapidAPI Playground:

1. **Clique em "GET Get Trending Posts"**
2. **Vá na aba "Params"** e configure:
   - `region`: "BR" (ou sua região)
   - `count`: 20 (quantidade de vídeos)
3. **Clique em "Test Endpoint"** ou "Run"
4. **Veja a resposta** na aba "Results" ou "Example Responses"

### Verificar se Funciona:

- ✅ A resposta tem vídeos?
- ✅ Tem views, likes, comentários?
- ✅ Tem URL e thumbnail?
- ✅ Os dados estão completos?

---

## 📝 Configuração no App

### 1. Adicionar no `.env.local`

Você já tem a chave, agora adicione:

```env
# TikTok via RapidAPI
TIKTOK_RAPIDAPI_KEY=c05a032bc6msh89025088bbd9568p1c6063jsn3102e7b3e496
TIKTOK_RAPIDAPI_HOST=tiktok-api23.p.rapidapi.com
```

### 2. Verificar o Endpoint Exato

Após clicar no endpoint, veja a URL completa. Provavelmente será algo como:

```
GET https://tiktok-api23.p.rapidapi.com/api/post/trending
```

Ou:

```
GET https://tiktok-api23.p.rapidapi.com/api/video/trending
```

**Anote a URL exata** que aparece no playground!

---

## 💻 Implementação no App

### Exemplo de Código:

```typescript
// app/lib/services/tiktok-service.ts
export class TikTokService {
  private apiKey = process.env.TIKTOK_RAPIDAPI_KEY;
  private apiHost = process.env.TIKTOK_RAPIDAPI_HOST;

  async getTrending(region: string = 'BR', count: number = 20) {
    // URL exata que você viu no playground
    const url = `https://${this.apiHost}/api/post/trending?region=${region}&count=${count}`;
    
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-host': this.apiHost!,
        'x-rapidapi-key': this.apiKey!,
      },
    });

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.normalize(data);
  }

  private normalize(tiktokData: any): ViralVideo[] {
    // Ajuste baseado na estrutura real da resposta
    const videos = tiktokData.data || tiktokData.videos || tiktokData.items || [];
    
    return videos.map((video: any, index: number) => ({
      id: video.id || video.video_id || video.aweme_id,
      title: video.title || video.desc || video.description || '',
      description: video.description || video.desc || '',
      thumbnail: video.thumbnail || video.cover || video.cover_url,
      channelTitle: video.author?.username || video.creator?.username || '@unknown',
      channelId: video.author?.id || video.creator?.id || '',
      publishedAt: video.create_time || video.created_at || new Date().toISOString(),
      viewCount: video.play_count || video.view_count || video.views || 0,
      likeCount: video.digg_count || video.like_count || video.likes || 0,
      commentCount: video.comment_count || video.comments || 0,
      duration: video.duration || 'PT0S',
      url: video.share_url || video.url || `https://www.tiktok.com/@${video.author?.username}/video/${video.id}`,
      platform: 'tiktok' as const,
      viralScore: this.calculateViralScore(video),
      trendingRank: index + 1,
    }));
  }

  private calculateViralScore(video: any): number {
    const views = video.play_count || video.view_count || video.views || 0;
    const likes = video.digg_count || video.like_count || video.likes || 0;
    const comments = video.comment_count || video.comments || 0;
    const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
    
    return Math.round((views * 0.4) + (likes * 0.3) + (comments * 0.2) + (engagement * 0.1));
  }
}
```

---

## 🔧 Integrar com a API Existente

### Atualizar `/api/viral/route.ts`:

```typescript
// Adicionar suporte para TikTok
import { TikTokService } from '@/app/lib/services/tiktok-service';

export async function GET(request: NextRequest) {
  const { platform, region, maxResults } = request.nextUrl.searchParams;
  
  // ... código existente do YouTube ...
  
  if (platform === 'tiktok' || platform === 'all') {
    const tiktokService = new TikTokService();
    const tiktokVideos = await tiktokService.getTrending(
      region || 'BR',
      parseInt(maxResults || '20')
    );
    
    // Combinar com vídeos do YouTube se platform === 'all'
    // ...
  }
}
```

---

## 📋 Checklist de Implementação

### Antes de Implementar:

- [ ] **Testou o endpoint no playground?**
  - Viu a resposta?
  - Confirmou que tem os dados necessários?

- [ ] **Anotou a URL exata?**
  - URL completa do endpoint
  - Parâmetros aceitos
  - Estrutura da resposta

- [ ] **Configurou as variáveis de ambiente?**
  - `TIKTOK_RAPIDAPI_KEY` no `.env.local`
  - `TIKTOK_RAPIDAPI_HOST` no `.env.local`
  - Servidor reiniciado?

### Durante a Implementação:

- [ ] **Criou o `TikTokService`?**
- [ ] **Normalizou os dados** para o formato `ViralVideo`?
- [ ] **Integrou com `/api/viral`?**
- [ ] **Testou a integração?**

---

## 🧪 Teste Rápido

### No Terminal (após implementar):

```bash
# Testar endpoint direto
curl -X GET \
  'https://tiktok-api23.p.rapidapi.com/api/post/trending?region=BR&count=10' \
  -H 'x-rapidapi-host: tiktok-api23.p.rapidapi.com' \
  -H 'x-rapidapi-key: c05a032bc6msh89025088bbd9568p1c6063jsn3102e7b3e496'
```

**⚠️ Nota:** Substitua `/api/post/trending` pela URL exata que você viu no playground!

---

## 🎯 Próximos Passos

1. **Agora:** Clique em "GET Get Trending Posts"
2. **Veja os parâmetros** na aba "Params"
3. **Teste o endpoint** no playground
4. **Anote a URL exata** e estrutura da resposta
5. **Implemente o `TikTokService`** no app
6. **Integre com `/api/viral`**

---

## ✅ Resumo

**Você encontrou:** ✅ "GET Get Trending Posts"

**Próximo passo:** 
1. Clique no endpoint
2. Veja os parâmetros e teste
3. Anote a URL exata
4. Implemente no app

---

**Agora:** Clique em "GET Get Trending Posts" e veja os detalhes! 🚀

