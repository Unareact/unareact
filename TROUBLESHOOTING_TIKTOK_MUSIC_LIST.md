# 🔧 Troubleshooting: API Retornando Músicas ao Invés de Vídeos

## ❌ Problema Identificado

A API está retornando `music_list` (músicas trending) ao invés de vídeos trending.

**Resposta recebida:**
```json
{
  "data": {
    "music_list": [...],  // ❌ Músicas, não vídeos!
    "has_more": true
  }
}
```

**O que você precisa:**
```json
{
  "data": {
    "item_list": [...],  // ✅ Vídeos!
    "videos": [...],
    "items": [...]
  }
}
```

---

## 🎯 Solução: Encontrar o Endpoint Correto

### Passo 1: Verificar na Sidebar do RapidAPI

1. **Acesse a página da API no RapidAPI**
2. **Na sidebar esquerda**, procure por:
   - ✅ **"Get Trending Videos"**
   - ✅ **"Get Trending Posts"** (mas verifique se retorna vídeos, não músicas)
   - ✅ **"Get Video Feed"**
   - ✅ **"Get Popular Videos"**
   - ✅ **"Search Videos"** (pode usar keyword vazio ou "trending")

### Passo 2: Usar a Busca de Endpoints

1. **Na sidebar, clique no campo "Search Endpoints"**
2. **Digite uma dessas palavras:**
   - `video`
   - `trending`
   - `feed`
   - `viral`
   - `popular`

3. **Veja os resultados** e clique em cada um para ver:
   - **URL do endpoint** (ex: `/api/video/trending`)
   - **Parâmetros aceitos**
   - **Exemplo de resposta** (verifique se tem vídeos, não músicas)

### Passo 3: Verificar a Resposta de Exemplo

**Antes de usar um endpoint, verifique:**

1. **Clique no endpoint na sidebar**
2. **Vá na aba "Example Responses"** ou "Response"
3. **Procure na resposta:**
   - ✅ `item_list` - Lista de vídeos
   - ✅ `videos` - Array de vídeos
   - ✅ `items` - Array de itens (vídeos)
   - ❌ `music_list` - Músicas (não serve!)

**Exemplo de resposta CORRETA:**
```json
{
  "data": {
    "item_list": [
      {
        "id": "1234567890",
        "desc": "Título do vídeo",
        "play_count": 1000000,
        "digg_count": 50000,
        "comment_count": 1000,
        "share_count": 500,
        "create_time": 1234567890,
        "author": {
          "unique_id": "@username",
          "nickname": "Nome do Criador"
        },
        "video": {
          "cover": "https://...",
          "duration": 30
        }
      }
    ]
  }
}
```

---

## 🔄 Endpoints Alternativos Comuns

### Opção 1: `/api/video/trending`
```
GET https://tiktok-api23.p.rapidapi.com/api/video/trending?region=BR&count=20
```

### Opção 2: `/api/feed/trending`
```
GET https://tiktok-api23.p.rapidapi.com/api/feed/trending?count=20
```

### Opção 3: `/api/video/popular`
```
GET https://tiktok-api23.p.rapidapi.com/api/video/popular?count=20
```

### Opção 4: `/api/post/feed` (Feed geral)
```
GET https://tiktok-api23.p.rapidapi.com/api/post/feed?count=20
```

**⚠️ IMPORTANTE:** Teste cada endpoint no RapidAPI Playground antes de usar!

---

## 📝 Como Atualizar o Código

### Passo 1: Identificar o Endpoint Correto

Após encontrar o endpoint correto, anote:
- **URL completa** (ex: `/api/video/trending`)
- **Parâmetros necessários** (ex: `region`, `count`)

### Passo 2: Atualizar o `tiktok-service.ts`

No arquivo `app/lib/services/tiktok-service.ts`, linha 21, atualize a URL:

```typescript
// ANTES (retorna músicas):
const url = `https://${this.apiHost}/api/post/trending?count=${count}`;

// DEPOIS (use o endpoint correto que você encontrou):
const url = `https://${this.apiHost}/api/video/trending?region=BR&count=${count}`;
// ou
const url = `https://${this.apiHost}/api/feed/trending?count=${count}`;
// ou outro endpoint que você encontrar
```

### Passo 3: Testar

1. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Teste a API:**
   - Acesse: `http://localhost:3000/api/viral?platform=tiktok`
   - Verifique se retorna vídeos, não músicas

---

## 🚨 Se Não Encontrar Endpoint de Trending

### Alternativa 1: Usar "Get User Popular Posts"

Se a API não tiver trending, mas tiver "Get User Popular Posts":

1. **Buscar posts de vários usuários populares**
2. **Combinar os resultados**
3. **Ordenar por views/likes**

**Limitação:** Não será exatamente "trending global", mas posts populares.

### Alternativa 2: Usar "Search Videos"

1. **Buscar com keywords vazias ou genéricas**
2. **Ordenar por popularidade**
3. **Filtrar os mais recentes**

**Limitação:** Pode não retornar exatamente os trending.

---

## ✅ Checklist

Antes de usar um endpoint, verifique:

- [ ] **Endpoint retorna vídeos?** (não músicas)
- [ ] **Tem `item_list`, `videos` ou `items` na resposta?**
- [ ] **Tem views, likes, comentários?**
- [ ] **Tem título, descrição, thumbnail?**
- [ ] **Tem informações do criador?**
- [ ] **Testei no RapidAPI Playground?**
- [ ] **Atualizei a URL no código?**
- [ ] **Testei no app?**

---

## 📞 Próximos Passos

1. **Acesse o RapidAPI**
2. **Procure por endpoints de vídeos trending**
3. **Teste no playground**
4. **Anote o endpoint correto**
5. **Me envie o endpoint que você encontrou** e eu atualizo o código!

---

## 💡 Dica

**Se você encontrar o endpoint correto, me envie:**
- A URL completa (ex: `/api/video/trending`)
- Os parâmetros necessários
- Um exemplo de resposta (ou me diga que testou e funcionou)

E eu atualizo o código automaticamente! 🚀

