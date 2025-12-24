# 🔍 Estratégia de Pesquisa de Vídeos Virais

## 📊 Arquitetura Sugerida

```
┌─────────────────────────────────────────────────────────┐
│                    INTERFACE DO USUÁRIO                  │
│  (Painel Virais - Filtros, Cards, Diagnóstico)          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              CAMADA DE SERVIÇO (Services)                │
│  - ViralVideoService (orquestrador)                      │
│  - YouTubeService ✅                                     │
│  - TikTokService 🔄                                      │
│  - FacebookService 🔄                                    │
│  - InstagramService 🔄                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              CAMADA DE API (Routes)                     │
│  - /api/viral (unificada)                               │
│  - /api/viral/youtube ✅                                │
│  - /api/viral/tiktok 🔄                                 │
│  - /api/viral/facebook 🔄                               │
│  - /api/viral/instagram 🔄                              │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        ▼            ▼            ▼            ▼
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│  YouTube  │ │   TikTok  │ │  Facebook │ │ Instagram │
│   API     │ │   API     │ │ Graph API │ │ Graph API │
│  (Google) │ │ (Terceiro)│ │  (Meta)   │ │  (Meta)   │
└───────────┘ └───────────┘ └───────────┘ └───────────┘
```

---

## 🎯 Estratégia de Implementação

### Fase 1: YouTube (✅ JÁ FEITO)
**Status:** Implementado e funcionando

**O que temos:**
- ✅ API route: `/api/viral`
- ✅ Busca de trending por região
- ✅ Métricas completas
- ✅ Diagnóstico de viralização

**Próximas melhorias:**
- [ ] Cache de resultados (reduzir chamadas API)
- [ ] Filtros por categoria
- [ ] Ordenação customizada

---

### Fase 2: TikTok (🔄 PRÓXIMO)
**Estratégia Recomendada:** API de Terceiros

#### Opção A: SocialKit API (Recomendado)
```typescript
// Vantagens:
- API confiável e estável
- Suporte a trending/viral
- Métricas completas
- Custo: $30-50/mês
- Fácil integração
```

#### Opção B: RapidAPI (Alternativa)
```typescript
// Vantagens:
- Múltiplos provedores
- Planos flexíveis
- Custo: $20-100/mês
- Teste gratuito disponível
```

#### Opção C: Scraping (Não recomendado)
```typescript
// Desvantagens:
- Violação de ToS
- Risco de bloqueio
- Instável
- Pode quebrar a qualquer momento
```

**Implementação Sugerida:**
1. Criar `/api/viral/tiktok`
2. Integrar com API de terceiros
3. Normalizar dados (mesmo formato do YouTube)
4. Adicionar ao painel unificado

---

### Fase 3: Facebook/Instagram (🔄 FUTURO)
**Estratégia:** Graph API (apenas páginas próprias)

**Limitações:**
- Não há endpoint para vídeos virais globais
- Apenas páginas que você gerencia
- Útil para análise de próprio conteúdo

**Implementação:**
- Foco em gerenciamento de conteúdo próprio
- Análise de performance dos seus vídeos
- Comparação com benchmarks

---

## 🏗️ Arquitetura Técnica Detalhada

### 1. Service Layer (Camada de Serviço)

```typescript
// app/lib/services/viral-video-service.ts
interface IViralVideoService {
  searchTrending(params: SearchParams): Promise<ViralVideo[]>;
  getVideoDetails(videoId: string, platform: string): Promise<ViralVideo>;
  getDiagnosis(videoId: string, platform: string): Promise<ViralDiagnosis>;
}

class ViralVideoService implements IViralVideoService {
  private youtubeService: YouTubeService;
  private tiktokService: TikTokService;
  private facebookService: FacebookService;
  
  async searchTrending(params: SearchParams) {
    const results = await Promise.allSettled([
      this.youtubeService.getTrending(params),
      this.tiktokService.getTrending(params),
      // ...
    ]);
    
    // Normalizar e combinar resultados
    return this.normalizeResults(results);
  }
}
```

### 2. Platform Services (Serviços por Plataforma)

```typescript
// app/lib/services/youtube-service.ts
class YouTubeService {
  async getTrending(region: string, maxResults: number) {
    // Lógica específica do YouTube
  }
  
  async getVideoDetails(videoId: string) {
    // Buscar detalhes completos
  }
}

// app/lib/services/tiktok-service.ts
class TikTokService {
  async getTrending(region: string, maxResults: number) {
    // Integração com API de terceiros
    const response = await fetch('https://api.socialkit.dev/tiktok/trending', {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    return this.normalize(response);
  }
}
```

### 3. API Routes Unificadas

```typescript
// app/api/viral/route.ts (JÁ EXISTE)
export async function GET(request: NextRequest) {
  const { platform, region, maxResults } = request.nextUrl.searchParams;
  
  const service = new ViralVideoService();
  
  if (platform) {
    // Buscar de plataforma específica
    return service.searchByPlatform(platform, { region, maxResults });
  }
  
  // Buscar de todas as plataformas
  return service.searchTrending({ region, maxResults });
}
```

---

## 🔄 Fluxo de Dados

### Busca Unificada:
```
Usuário seleciona filtros
    ↓
Interface chama /api/viral?platform=all
    ↓
ViralVideoService orquestra
    ↓
┌──────────┬──────────┬──────────┐
│ YouTube  │  TikTok  │ Facebook │
│ Service  │ Service  │ Service  │
└────┬─────┴────┬─────┴────┬─────┘
     │          │          │
     ▼          ▼          ▼
  Normalizar todos os resultados
     │
     ▼
  Retornar array unificado
     │
     ▼
  Exibir cards no painel
```

### Busca por Plataforma:
```
Usuário seleciona "TikTok"
    ↓
Interface chama /api/viral?platform=tiktok
    ↓
ViralVideoService → TikTokService
    ↓
API de Terceiros (SocialKit)
    ↓
Normalizar dados
    ↓
Retornar resultados
```

---

## 📋 Ordem de Implementação Sugerida

### Sprint 1: Melhorias YouTube (1-2 dias)
- [ ] Implementar cache (Redis ou in-memory)
- [ ] Adicionar filtros por categoria
- [ ] Melhorar performance
- [ ] Adicionar paginação

### Sprint 2: TikTok via API Terceiros (3-5 dias)
- [ ] Escolher provedor (SocialKit recomendado)
- [ ] Criar `TikTokService`
- [ ] Criar `/api/viral/tiktok`
- [ ] Normalizar dados (mesmo formato YouTube)
- [ ] Integrar no painel unificado
- [ ] Adicionar filtro de plataforma

### Sprint 3: Unificação e UX (2-3 dias)
- [ ] Criar `ViralVideoService` (orquestrador)
- [ ] Unificar API route
- [ ] Adicionar filtro "Todas as plataformas"
- [ ] Melhorar cards (badge de plataforma)
- [ ] Adicionar loading states

### Sprint 4: Facebook/Instagram (opcional, 2-3 dias)
- [ ] Configurar OAuth
- [ ] Criar `FacebookService` e `InstagramService`
- [ ] Implementar busca de páginas próprias
- [ ] Adicionar ao painel

---

## 🎨 Interface do Usuário

### Filtros Sugeridos:
```
┌─────────────────────────────────────┐
│ [🌍 Região: Brasil ▼]              │
│ [📱 Plataforma: Todas ▼]           │
│ [📊 Ordenar: Viral Score ▼]        │
│ [⏱️ Período: Últimas 24h ▼]        │
│ [🔍 Buscar: ___________]            │
└─────────────────────────────────────┘
```

### Cards de Vídeo:
```
┌─────────────────────────────────────┐
│ [Thumbnail]  [Badge: YouTube]        │
│                                      │
│ Título do Vídeo                     │
│ Canal • 2 dias atrás                │
│                                      │
│ 👁️ 1.2M  ❤️ 45K  💬 2.3K            │
│                                      │
│ [🔥 Viral Score: 8.5]                │
│                                      │
│ [📥 Baixar] [🧠 Diagnosticar]      │
└─────────────────────────────────────┘
```

---

## 💾 Estrutura de Dados Unificada

```typescript
interface ViralVideo {
  id: string;
  platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram';
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  
  // Métricas (normalizadas)
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares?: number;
    engagementRate: number;
  };
  
  // Dados específicos da plataforma
  platformData: {
    channelTitle?: string;  // YouTube
    username?: string;       // TikTok/Instagram
    hashtags?: string[];     // TikTok/Instagram
    // ...
  };
  
  // Cálculos unificados
  viralScore: number;
  trendingRank: number;
  publishedAt: string;
}
```

---

## 🔧 Implementação Prática

### Passo 1: Criar Service Layer
```typescript
// app/lib/services/viral-video-service.ts
export class ViralVideoService {
  async searchTrending(params: {
    platforms?: string[];
    region?: string;
    maxResults?: number;
  }) {
    const { platforms = ['youtube'], region, maxResults = 20 } = params;
    
    const results = await Promise.allSettled(
      platforms.map(platform => this.searchByPlatform(platform, { region, maxResults }))
    );
    
    return this.combineAndSort(results);
  }
  
  private async searchByPlatform(platform: string, params: any) {
    switch (platform) {
      case 'youtube':
        return new YouTubeService().getTrending(params);
      case 'tiktok':
        return new TikTokService().getTrending(params);
      default:
        return [];
    }
  }
}
```

### Passo 2: Criar TikTok Service
```typescript
// app/lib/services/tiktok-service.ts
export class TikTokService {
  private apiKey = process.env.SOCIALKIT_API_KEY;
  
  async getTrending(params: { region?: string; maxResults?: number }) {
    const response = await fetch('https://api.socialkit.dev/tiktok/trending', {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        region: params.region || 'US',
        limit: params.maxResults || 20
      })
    });
    
    const data = await response.json();
    return this.normalize(data.videos);
  }
  
  private normalize(tiktokVideos: any[]): ViralVideo[] {
    return tiktokVideos.map(video => ({
      id: video.id,
      platform: 'tiktok',
      title: video.description,
      // ... normalizar para formato unificado
    }));
  }
}
```

### Passo 3: Atualizar API Route
```typescript
// app/api/viral/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform') || 'all';
  const region = searchParams.get('region') || 'US';
  const maxResults = parseInt(searchParams.get('maxResults') || '20');
  
  const service = new ViralVideoService();
  
  const platforms = platform === 'all' 
    ? ['youtube', 'tiktok'] // Adicionar conforme implementa
    : [platform];
  
  const videos = await service.searchTrending({
    platforms,
    region,
    maxResults
  });
  
  return NextResponse.json({ videos });
}
```

---

## 📊 Métricas e Monitoramento

### O que monitorar:
- Taxa de sucesso das APIs
- Tempo de resposta
- Rate limits atingidos
- Erros por plataforma
- Custo de APIs pagas

### Implementar:
```typescript
// app/lib/monitoring/api-monitor.ts
export class APIMonitor {
  trackRequest(platform: string, success: boolean, duration: number) {
    // Log para análise
    // Alertas se necessário
  }
  
  checkRateLimits(platform: string) {
    // Verificar se está próximo do limite
  }
}
```

---

## 🚀 Próximos Passos Imediatos

### 1. Escolher Provedor TikTok
- [ ] Avaliar SocialKit vs RapidAPI
- [ ] Criar conta de teste
- [ ] Obter API Key

### 2. Implementar TikTok Service
- [ ] Criar `app/lib/services/tiktok-service.ts`
- [ ] Integrar com API escolhida
- [ ] Normalizar dados

### 3. Unificar Interface
- [ ] Adicionar filtro de plataforma
- [ ] Atualizar cards com badge de plataforma
- [ ] Melhorar UX

### 4. Cache e Performance
- [ ] Implementar cache (Redis ou in-memory)
- [ ] Reduzir chamadas desnecessárias
- [ ] Otimizar queries

---

## ✅ Checklist de Implementação

### YouTube (✅ Feito)
- [x] API route criada
- [x] Service implementado
- [x] Interface integrada
- [ ] Cache implementado
- [ ] Filtros avançados

### TikTok (🔄 Próximo)
- [ ] Escolher provedor
- [ ] Criar service
- [ ] Criar API route
- [ ] Normalizar dados
- [ ] Integrar interface
- [ ] Testar end-to-end

### Unificação (🔄 Próximo)
- [ ] Criar ViralVideoService
- [ ] Unificar API routes
- [ ] Adicionar filtros
- [ ] Melhorar UX
- [ ] Adicionar badges de plataforma

---

**Estratégia definida!** 🎯

Quer que eu comece implementando o TikTok Service agora?

