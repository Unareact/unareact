# 🎯 Resumo: Como Fazer a Pesquisa de Vídeos Virais

## 📐 Estrutura Sugerida (Arquitetura Limpa)

```
┌─────────────────────────────────────────────┐
│         INTERFACE (Frontend)                │
│  - Filtros (plataforma, região, etc)       │
│  - Cards de vídeos                          │
│  - Diagnóstico                              │
└─────────────────┬───────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│      API ROUTE UNIFICADA                     │
│  GET /api/viral?platform=all&region=BR      │
└─────────────────┬───────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│      VIRAL VIDEO SERVICE                    │
│  (Orquestrador - decide qual usar)          │
└───────┬───────────────────┬──────────────────┘
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ YouTube      │    │ TikTok       │
│ Service      │    │ Service      │
└──────┬───────┘    └──────┬───────┘
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ YouTube API  │    │ API Terceiros│
│ (Google)     │    │ (SocialKit)  │
└──────────────┘    └──────────────┘
```

---

## 🔧 Implementação Prática

### 1. Criar Service Layer (Camada de Serviço)

**Por quê?**
- Separa lógica de negócio das rotas
- Facilita testes
- Permite reutilização
- Facilita adicionar novas plataformas

**Estrutura:**
```
app/lib/services/
├── viral-video-service.ts    (Orquestrador)
├── youtube-service.ts        (Já existe, refatorar)
├── tiktok-service.ts        (Criar)
└── platform-base.ts          (Interface comum)
```

### 2. Padronizar Dados (Normalização)

**Por quê?**
- Cada plataforma retorna dados diferentes
- Interface precisa de formato único
- Facilita comparação entre plataformas

**Formato Unificado:**
```typescript
interface ViralVideo {
  id: string;
  platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram';
  title: string;
  thumbnail: string;
  url: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    engagementRate: number;
  };
  viralScore: number;
  trendingRank: number;
}
```

### 3. API Route Unificada

**Atual:** `/api/viral` (só YouTube)

**Sugerido:** 
```
GET /api/viral?platform=all&region=BR
GET /api/viral?platform=youtube&region=US
GET /api/viral?platform=tiktok&region=BR
```

**Vantagens:**
- Uma única rota para todas as plataformas
- Fácil de usar no frontend
- Fácil de estender

---

## 📋 Passo a Passo de Implementação

### FASE 1: Refatorar YouTube (1 dia)

**O que fazer:**
1. Extrair lógica do `/api/viral/route.ts` para `YouTubeService`
2. Manter API route apenas como endpoint
3. Service fica responsável pela lógica

**Código:**
```typescript
// app/lib/services/youtube-service.ts
export class YouTubeService {
  async getTrending(params: { region: string; maxResults: number }) {
    // Lógica atual do route.ts
  }
}

// app/api/viral/route.ts (simplificado)
export async function GET(request: NextRequest) {
  const service = new YouTubeService();
  const videos = await service.getTrending({ region, maxResults });
  return NextResponse.json({ videos });
}
```

### FASE 2: Adicionar TikTok (2-3 dias)

**O que fazer:**
1. Escolher API de terceiros (SocialKit recomendado)
2. Criar `TikTokService`
3. Normalizar dados para formato unificado
4. Adicionar ao orquestrador

**Código:**
```typescript
// app/lib/services/tiktok-service.ts
export class TikTokService {
  async getTrending(params: { region: string; maxResults: number }) {
    const response = await fetch('https://api.socialkit.dev/tiktok/trending', {
      headers: { 'Authorization': `Bearer ${process.env.SOCIALKIT_API_KEY}` }
    });
    const data = await response.json();
    return this.normalize(data.videos); // Converter para formato unificado
  }
  
  private normalize(tiktokVideos: any[]): ViralVideo[] {
    return tiktokVideos.map(video => ({
      id: video.id,
      platform: 'tiktok',
      title: video.description,
      // ... converter todos os campos
    }));
  }
}
```

### FASE 3: Criar Orquestrador (1 dia)

**O que fazer:**
1. Criar `ViralVideoService` que coordena todos
2. Permitir buscar de uma ou todas as plataformas
3. Combinar e ordenar resultados

**Código:**
```typescript
// app/lib/services/viral-video-service.ts
export class ViralVideoService {
  private youtube = new YouTubeService();
  private tiktok = new TikTokService();
  
  async searchTrending(params: {
    platforms?: string[];
    region?: string;
    maxResults?: number;
  }) {
    const { platforms = ['youtube'], region, maxResults = 20 } = params;
    
    // Buscar de todas as plataformas em paralelo
    const results = await Promise.allSettled(
      platforms.map(platform => {
        switch (platform) {
          case 'youtube':
            return this.youtube.getTrending({ region, maxResults });
          case 'tiktok':
            return this.tiktok.getTrending({ region, maxResults });
          default:
            return Promise.resolve([]);
        }
      })
    );
    
    // Combinar resultados bem-sucedidos
    const allVideos = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r as PromiseFulfilledResult<ViralVideo[]>).value);
    
    // Ordenar por viral score
    return allVideos.sort((a, b) => b.viralScore - a.viralScore);
  }
}
```

### FASE 4: Atualizar API Route (1 dia)

**Código:**
```typescript
// app/api/viral/route.ts
import { ViralVideoService } from '@/app/lib/services/viral-video-service';

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

### FASE 5: Atualizar Interface (1 dia)

**O que fazer:**
1. Adicionar filtro de plataforma
2. Adicionar badge de plataforma nos cards
3. Melhorar loading states

**Código:**
```typescript
// app/components/viral/ViralVideoList.tsx
const [platform, setPlatform] = useState('all');

// No fetch:
const response = await fetch(
  `/api/viral?platform=${platform}&region=${region}&maxResults=20`
);

// No card:
<span className="badge">{video.platform}</span>
```

---

## 🎨 Interface do Usuário

### Filtros Sugeridos:
```
┌─────────────────────────────────────────┐
│ 🌍 Região: [Brasil ▼]                  │
│ 📱 Plataforma: [Todas ▼]               │
│         - Todas                         │
│         - YouTube                       │
│         - TikTok                        │
│ 📊 Ordenar: [Viral Score ▼]            │
│ 🔍 Buscar: [___________]                │
└─────────────────────────────────────────┘
```

### Cards Atualizados:
```
┌─────────────────────────────────────────┐
│ [Thumbnail]     [Badge: YouTube]        │
│                                          │
│ Título do Vídeo                         │
│ Canal • 2 dias atrás                    │
│                                          │
│ 👁️ 1.2M  ❤️ 45K  💬 2.3K                │
│ 🔥 Viral Score: 8.5                     │
│                                          │
│ [📥 Baixar] [🧠 Diagnosticar]          │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementação

### Refatoração YouTube
- [ ] Criar `YouTubeService`
- [ ] Mover lógica do route para service
- [ ] Manter route apenas como endpoint
- [ ] Testar que ainda funciona

### Implementação TikTok
- [ ] Escolher API de terceiros
- [ ] Obter API Key
- [ ] Criar `TikTokService`
- [ ] Implementar normalização
- [ ] Testar busca de trending

### Orquestrador
- [ ] Criar `ViralVideoService`
- [ ] Implementar busca multi-plataforma
- [ ] Combinar e ordenar resultados
- [ ] Tratar erros por plataforma

### API Route
- [ ] Atualizar para usar service
- [ ] Adicionar parâmetro `platform`
- [ ] Manter compatibilidade com código atual
- [ ] Testar todos os cenários

### Interface
- [ ] Adicionar filtro de plataforma
- [ ] Adicionar badge nos cards
- [ ] Melhorar loading states
- [ ] Adicionar indicadores de erro

---

## 🚀 Ordem de Execução Recomendada

### Dia 1: Refatorar YouTube
1. Criar `YouTubeService`
2. Mover lógica
3. Testar

### Dia 2-3: Implementar TikTok
1. Escolher e configurar API
2. Criar `TikTokService`
3. Testar normalização

### Dia 4: Orquestrador
1. Criar `ViralVideoService`
2. Integrar YouTube + TikTok
3. Testar busca combinada

### Dia 5: Interface
1. Adicionar filtros
2. Atualizar cards
3. Testar end-to-end

---

## 💡 Vantagens desta Abordagem

✅ **Escalável**: Fácil adicionar novas plataformas
✅ **Manutenível**: Código organizado e separado
✅ **Testável**: Services podem ser testados isoladamente
✅ **Flexível**: Pode buscar de uma ou todas as plataformas
✅ **Performático**: Busca em paralelo quando possível

---

## 📊 Exemplo de Uso Final

```typescript
// Frontend
const videos = await fetch('/api/viral?platform=all&region=BR');

// Retorna vídeos de YouTube e TikTok combinados e ordenados
// [
//   { platform: 'tiktok', viralScore: 9.2, ... },
//   { platform: 'youtube', viralScore: 8.5, ... },
//   { platform: 'tiktok', viralScore: 7.8, ... },
//   ...
// ]
```

---

**Estratégia definida!** 🎯

Quer que eu comece implementando agora? Sugiro começar pela refatoração do YouTube para criar a base dos services.

