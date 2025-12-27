# 🔍 Como Encontrar o Endpoint de Trending no TikTok API

## 🎯 Método 1: Buscar na Sidebar (Mais Rápido)

### Passo a Passo:

1. **Olhe na sidebar esquerda** (onde está "User")
2. **Use a busca "Search Endpoints"** (campo de busca acima de "User")
3. **Digite uma dessas palavras:**
   - `trending`
   - `viral`
   - `popular`
   - `video`
   - `feed`

4. **Veja os resultados** que aparecerem

---

## 🎯 Método 2: Ver Outras Categorias

### Na Sidebar, procure por:

**Além de "User", pode haver outras categorias:**
- **"Video"** ou **"Videos"**
- **"Feed"** ou **"Feeds"**
- **"Trending"**
- **"Search"**
- **"Explore"**

**Como ver:**
1. Role a sidebar para baixo
2. Procure por outras seções expandidas/colapsadas
3. Clique para expandir se estiver colapsada

---

## 🎯 Método 3: Ver Documentação Externa

### Passo a Passo:

1. **Clique na aba "External Docs"** (no topo, ao lado de "Headers")
2. **Leia a documentação completa**
3. **Procure por:**
   - "trending"
   - "popular videos"
   - "viral videos"
   - "feed"

4. **Veja a lista completa de endpoints**

---

## 🎯 Método 4: Usar "Get User Popular Posts" (Alternativa)

### Se não encontrar endpoint de trending:

**Você pode usar "Get User Popular Posts"** que já está na sidebar!

**Como funciona:**
1. Buscar posts populares de vários usuários conhecidos
2. Combinar os resultados
3. Ordenar por views/likes

**Limitação:** Não será exatamente "trending global", mas posts populares de usuários específicos.

---

## 🔍 O que Procurar Exatamente

### Nomes de Endpoints que Você Precisa:

**Ideais:**
- ✅ `Get Trending Videos`
- ✅ `Get Trending`
- ✅ `Get Popular Videos`
- ✅ `Get Viral Videos`
- ✅ `Get Video Feed`
- ✅ `Search Videos`

**Alternativas:**
- ⚠️ `Get User Popular Posts` (precisa de username)
- ⚠️ `Get User Posts` (precisa de username)
- ⚠️ `Search Videos` (precisa de keyword)

---

## 📋 Checklist Rápido

### ✅ Faça Isso Agora:

1. **Na sidebar, clique no campo "Search Endpoints"**
2. **Digite:** `trending`
3. **Veja se aparece algum resultado**
4. **Se não aparecer, digite:** `video`
5. **Se não aparecer, digite:** `popular`
6. **Role a sidebar para ver outras categorias**
7. **Clique em "External Docs" para ver documentação completa**

---

## 💡 Dica Pro

### Se Não Encontrar Endpoint de Trending:

**Use "Get User Popular Posts" como solução temporária:**

```typescript
// Estratégia: Buscar posts populares de vários usuários
const popularUsers = [
  '@charlidamelio',
  '@khaby00',
  '@addisonre',
  // ... outros usuários populares
];

const allVideos = [];
for (const username of popularUsers) {
  const videos = await api.getUserPopularPosts(username);
  allVideos.push(...videos);
}

// Ordenar por views/likes
const trending = allVideos.sort((a, b) => b.views - a.views);
```

**Limitação:** Não é trending global, mas pode funcionar para MVP.

---

## 🚨 Se Realmente Não Tiver Trending

### Opção 1: Tentar Outra API

1. **Volte para a lista de APIs** (clique em "API Marketplace")
2. **Tente "Tiktok Scraper (by TIKWM-Default)"**
3. **Verifique se tem endpoint de trending**

### Opção 2: Usar SocialKit

1. **Considere SocialKit** ($30/mês)
2. **Tem endpoint de trending garantido**
3. **Especializado em redes sociais**

---

## 📝 Exemplo de Endpoint Ideal

### O que você está procurando:

```
GET /api/video/trending?region=BR&count=20
```

**Ou:**

```
GET /api/feed/trending?region=BR&limit=20
```

**Ou:**

```
GET /api/videos/popular?region=BR&maxResults=20
```

---

## ✅ Próximos Passos

1. **Agora:** Use a busca "Search Endpoints" na sidebar
2. **Digite:** `trending` ou `video` ou `popular`
3. **Veja os resultados**
4. **Se encontrar, clique no endpoint**
5. **Teste o endpoint no playground**
6. **Veja a resposta para confirmar que tem os dados necessários**

---

## 🎯 Resumo

**Método mais rápido:**
1. Clique em **"Search Endpoints"** na sidebar
2. Digite: **`trending`**
3. Veja os resultados

**Se não encontrar:**
- Role a sidebar para ver outras categorias
- Clique em **"External Docs"** para ver documentação completa
- Use **"Get User Popular Posts"** como alternativa temporária

---

**Agora:** Vá na sidebar e use a busca "Search Endpoints"! 🔍

