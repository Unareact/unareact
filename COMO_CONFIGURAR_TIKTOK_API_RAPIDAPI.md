# 🔧 Como Configurar a TikTok API do RapidAPI

## 📋 O que Você Já Tem

Baseado na sua tela, você já tem:
- ✅ **API Key:** `c05a032bc6msh89025088bbd9568p1c6063jsn3102e7b3e496`
- ✅ **Host:** `tiktok-api23.p.rapidapi.com`
- ✅ **API selecionada:** TikTok API

---

## ⚠️ Importante: Verificar Endpoints

### O que Você Precisa

Você precisa de um endpoint para buscar **vídeos trending/virais**, não apenas música.

**Endpoints que você precisa:**
- ✅ `/trending` ou `/videos/trending` - Para vídeos trending
- ✅ `/video/details` - Para detalhes de um vídeo específico
- ✅ `/user/posts` - Para posts de um usuário (já vi na sidebar!)

**Endpoints que NÃO servem para seu caso:**
- ❌ `/music/unlimited-sounds` - Este é sobre música, não vídeos

---

## 🔍 Como Encontrar o Endpoint de Trending

### Passo 1: Verificar na Sidebar

Na sidebar esquerda, você viu:
- "Get User Posts"
- "Get User Popular Posts"
- "Get User Oldest Posts"

**Agora procure por:**
- "Get Trending Videos"
- "Get Trending"
- "Get Popular Videos"
- "Search Videos"

### Passo 2: Se Não Encontrar

1. **Clique em "Endpoints"** na sidebar
2. **Use a busca** "Search Endpoints"
3. **Digite:** "trending" ou "viral" ou "popular"
4. **Veja os resultados**

### Passo 3: Verificar Documentação

1. Clique em **"External Docs"** (aba no topo)
2. Veja a documentação completa
3. Procure por endpoints de trending

---

## 📝 Configuração no App

### Passo 1: Adicionar no `.env.local`

Abra o arquivo `.env.local` e adicione:

```env
# TikTok via RapidAPI
TIKTOK_RAPIDAPI_KEY=c05a032bc6msh89025088bbd9568p1c6063jsn3102e7b3e496
TIKTOK_RAPIDAPI_HOST=tiktok-api23.p.rapidapi.com
```

**⚠️ IMPORTANTE:** 
- NUNCA commite o `.env.local` no Git
- Esta chave é sua chave pessoal, não compartilhe

### Passo 2: Verificar se o Arquivo Existe

```bash
# No terminal, na pasta do projeto
cd /Users/air/una-app

# Verificar se .env.local existe
ls -la .env.local

# Se não existir, copie do exemplo
cp env.example .env.local
```

### Passo 3: Adicionar as Variáveis

Abra `.env.local` e adicione as linhas do TikTok:

```env
# ... outras variáveis existentes ...

# TikTok via RapidAPI
TIKTOK_RAPIDAPI_KEY=c05a032bc6msh89025088bbd9568p1c6063jsn3102e7b3e496
TIKTOK_RAPIDAPI_HOST=tiktok-api23.p.rapidapi.com
```

### Passo 4: Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

---

## 🧪 Testar a API

### Teste Rápido no Terminal

```bash
# Testar se a API funciona
curl --request GET \
  --url 'https://tiktok-api23.p.rapidapi.com/api/video/trending?region=BR&count=10' \
  --header 'x-rapidapi-host: tiktok-api23.p.rapidapi.com' \
  --header 'x-rapidapi-key: c05a032bc6msh89025088bbd9568p1c6063jsn3102e7b3e496'
```

**⚠️ Nota:** Substitua `/api/video/trending` pelo endpoint correto que você encontrar na API.

---

## 🔍 Endpoints Comuns que Você Pode Encontrar

### Opção 1: Trending Videos
```typescript
GET /api/video/trending?region=BR&count=20
```

### Opção 2: User Posts (Popular)
```typescript
GET /api/user/popular-posts?username=@user&count=20
```

### Opção 3: Search Videos
```typescript
GET /api/video/search?keyword=viral&count=20
```

---

## 📋 Checklist de Verificação

Antes de implementar, verifique:

- [ ] **Endpoint de trending existe?**
  - Procure na sidebar
  - Use a busca de endpoints
  - Veja a documentação

- [ ] **Retorna os dados necessários?**
  - Views, likes, comentários
  - Título, descrição
  - URL do vídeo
  - Thumbnail
  - Informações do criador

- [ ] **Plano permite uso?**
  - Verifique quantas requisições você tem
  - Veja se precisa fazer upgrade

- [ ] **Chave configurada?**
  - Adicionada no `.env.local`
  - Servidor reiniciado

---

## 🚨 Se Não Tiver Endpoint de Trending

### Opção 1: Usar "Get User Popular Posts"

Se a API não tiver trending, mas tiver "Get User Popular Posts", você pode:
1. Buscar posts populares de vários usuários conhecidos
2. Combinar os resultados
3. Ordenar por views/likes

**Limitação:** Não será exatamente "trending", mas pode funcionar.

### Opção 2: Tentar Outra API

Se esta API não tiver trending:
1. Volte para a lista de APIs
2. Tente "Tiktok Scraper (by TIKWM-Default)"
3. Verifique se tem endpoint de trending

### Opção 3: Usar SocialKit

Se nenhuma API do RapidAPI tiver trending:
1. Considere SocialKit ($30/mês)
2. Especializado em redes sociais
3. Tem endpoint de trending garantido

---

## 💡 Próximos Passos

### 1. Encontrar o Endpoint de Trending
- Procure na sidebar
- Use a busca
- Veja a documentação

### 2. Testar o Endpoint
- Use o botão "Test Endpoint" no RapidAPI
- Veja a resposta
- Verifique se tem os dados necessários

### 3. Configurar no App
- Adicione no `.env.local`
- Reinicie o servidor
- Teste a integração

### 4. Implementar o Service
- Criar `TikTokService`
- Integrar com a API
- Normalizar os dados

---

## 📝 Exemplo de Implementação

Quando encontrar o endpoint correto, você pode implementar assim:

```typescript
// app/lib/services/tiktok-service.ts
export class TikTokService {
  private apiKey = process.env.TIKTOK_RAPIDAPI_KEY;
  private apiHost = process.env.TIKTOK_RAPIDAPI_HOST;

  async getTrending(region: string = 'BR', count: number = 20) {
    const response = await fetch(
      `https://${this.apiHost}/api/video/trending?region=${region}&count=${count}`,
      {
        headers: {
          'x-rapidapi-host': this.apiHost!,
          'x-rapidapi-key': this.apiKey!,
        },
      }
    );

    const data = await response.json();
    return this.normalize(data);
  }

  private normalize(tiktokVideos: any[]): ViralVideo[] {
    return tiktokVideos.map((video) => ({
      id: video.id,
      title: video.title || video.description,
      description: video.description || '',
      thumbnail: video.thumbnail || video.cover,
      channelTitle: video.creator?.username || '@unknown',
      channelId: video.creator?.id || '',
      publishedAt: video.createdAt || video.publishedAt,
      viewCount: video.views || video.viewCount || 0,
      likeCount: video.likes || video.likeCount || 0,
      commentCount: video.comments || video.commentCount || 0,
      duration: video.duration || 'PT0S',
      url: video.url || `https://www.tiktok.com/@${video.creator?.username}/video/${video.id}`,
      platform: 'tiktok' as const,
      viralScore: this.calculateViralScore(video),
      trendingRank: 0, // Será preenchido depois
    }));
  }

  private calculateViralScore(video: any): number {
    const views = video.views || 0;
    const likes = video.likes || 0;
    const comments = video.comments || 0;
    const engagement = ((likes + comments) / views) * 100;
    
    return Math.round((views * 0.4) + (likes * 0.3) + (comments * 0.2) + (engagement * 0.1));
  }
}
```

---

## ✅ Resumo

1. **Você já tem a chave:** ✅
2. **Precisa encontrar o endpoint de trending:** 🔍
3. **Adicionar no `.env.local`:** 📝
4. **Testar a API:** 🧪
5. **Implementar no app:** 💻

---

**Agora:** Procure o endpoint de trending na sidebar ou documentação! 🚀

