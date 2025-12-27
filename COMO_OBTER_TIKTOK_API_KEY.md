# 🎵 Como Obter a Chave da API do TikTok

## ⚠️ Importante

O TikTok **não oferece uma API pública gratuita** como o YouTube. Você tem 3 opções:

---

## 🎯 Opção 1: RapidAPI (Recomendado para Começar) ⭐

### ✅ Vantagens:
- **Plano gratuito** para testar (100-500 requisições/mês)
- Fácil de configurar
- Múltiplos provedores disponíveis
- Preços a partir de $5/mês

### 📝 Como Obter:

1. **Acesse:** https://rapidapi.com/
2. **Crie uma conta** (gratuito)
3. **Procure por "TikTok API"** na busca
4. **Escolha um provedor** (exemplos):
   - TikTok API by RapidAPI
   - TikTok Scraper API
   - TikTok Data API
5. **Selecione um plano:**
   - **Free**: 100-500 requisições/mês (para testes)
   - **Basic**: $5-20/mês (para MVP)
   - **Pro**: $30-100/mês (para produção)
6. **Copie sua API Key** (X-RapidAPI-Key)
7. **Adicione no `.env.local`:**
   ```env
   TIKTOK_RAPIDAPI_KEY=sua-chave-aqui
   TIKTOK_RAPIDAPI_HOST=tiktok-api.p.rapidapi.com
   ```

### 🔗 Links Diretos:
- **RapidAPI**: https://rapidapi.com/hub
- **Buscar TikTok APIs**: https://rapidapi.com/search/tiktok

---

## 🎯 Opção 2: SocialKit (Recomendado para Produção) ⭐⭐

### ✅ Vantagens:
- Especializado em redes sociais
- API bem estruturada
- Boa documentação
- Suporta múltiplas plataformas

### 📝 Como Obter:

1. **Acesse:** https://socialkit.dev/ (ou procure por "SocialKit API")
2. **Crie uma conta**
3. **Escolha um plano:**
   - **Starter**: $30/mês → 5.000 requisições
   - **Pro**: $50-80/mês → 20.000 requisições
4. **Obtenha sua API Key** (Bearer Token)
5. **Adicione no `.env.local`:**
   ```env
   SOCIALKIT_API_KEY=sua-chave-aqui
   ```

### 🔗 Link:
- **SocialKit**: https://socialkit.dev/ (verifique se o site está ativo)

---

## 🎯 Opção 3: API Oficial do TikTok (Difícil)

### ⚠️ Limitações:
- Requer aprovação (pode levar semanas/meses)
- Apenas para pesquisadores ou desenvolvedores qualificados
- Acesso muito limitado
- Não há endpoint para vídeos trending/virais

### 📝 Como Tentar Obter:

1. **Acesse:** https://developers.tiktok.com/
2. **Crie uma aplicação**
3. **Solicite acesso** (Research API ou Content API)
4. **Aguarde aprovação** (não garantida)
5. **Se aprovado**, adicione no `.env.local`:
   ```env
   TIKTOK_CLIENT_KEY=sua-client-key
   TIKTOK_CLIENT_SECRET=sua-client-secret
   ```

### ⚠️ Nota:
Esta opção **não é recomendada** para começar, pois:
- Aprovação não é garantida
- Pode levar muito tempo
- Funcionalidades limitadas
- Não permite buscar vídeos trending

---

## 💰 Comparação de Custos

| Provedor | Plano Inicial | Custo Mensal | Requisições | Melhor Para |
|----------|---------------|--------------|-------------|-------------|
| **RapidAPI** | Free | **$0** | 100-500 | Testes |
| **RapidAPI** | Basic | **$5-20** | 1K-5K | MVP |
| **SocialKit** | Starter | **$30** | 5K | Produção |
| **SocialKit** | Pro | **$50-80** | 20K | Produção |

---

## 🚀 Recomendação

### Para Começar (Testes):
1. **Use RapidAPI (Free)**
   - Custo: $0
   - Requisições: 100-500/mês
   - Objetivo: Testar a integração

### Para MVP/Produção:
1. **Use RapidAPI (Basic) ou SocialKit (Starter)**
   - Custo: $20-30/mês
   - Requisições: 5.000-10.000/mês
   - Objetivo: Lançar funcionalidade

---

## 📝 Configuração no App

Após obter a chave, adicione no arquivo `.env.local`:

### Se usar RapidAPI:
```env
# TikTok via RapidAPI
TIKTOK_RAPIDAPI_KEY=sua-chave-rapidapi-aqui
TIKTOK_RAPIDAPI_HOST=tiktok-api.p.rapidapi.com
```

### Se usar SocialKit:
```env
# TikTok via SocialKit
SOCIALKIT_API_KEY=sua-chave-socialkit-aqui
```

### Se usar API Oficial (se aprovado):
```env
# TikTok API Oficial
TIKTOK_CLIENT_KEY=sua-client-key
TIKTOK_CLIENT_SECRET=sua-client-secret
```

---

## ⚠️ Importante: O que o RapidAPI Retorna

### 📊 Metadados (Informações sobre os Vídeos)

**O RapidAPI retorna METADADOS COMPLETOS, não os vídeos em si:**

✅ **O que você recebe:**
- Título, descrição, URL do vídeo
- Thumbnail (imagem de capa)
- Métricas: views, likes, comentários, shares
- Informações do criador: username, seguidores
- Hashtags, música usada, efeitos
- Data de publicação, duração

❌ **O que você NÃO recebe:**
- Arquivo de vídeo (.mp4, .mov, etc.)
- Download direto do vídeo
- Stream de vídeo

**Para mais detalhes:** Veja `O_QUE_RAPIDAPI_RETORNA_TIKTOK.md`

---

## ✅ Próximos Passos

1. **Escolha um provedor** (recomendo RapidAPI para começar)
2. **Obtenha a API Key**
3. **Adicione no `.env.local`**
4. **Reinicie o servidor** (`npm run dev`)
5. **Teste a integração**

---

## 🆘 Precisa de Ajuda?

- **O que o RapidAPI retorna**: Veja `O_QUE_RAPIDAPI_RETORNA_TIKTOK.md`
- **Documentação completa**: Veja `GUIA_APIS_TIKTOK_TERCEIROS.md`
- **Comparação de custos**: Veja `COMPARACAO_CUSTOS_TIKTOK.md`
- **Estratégia geral**: Veja `GUIA_APIS_PLATAFORMAS.md`

---

**Resumo:** Para começar, use **RapidAPI (gratuito)** para testar. Para produção, use **RapidAPI Basic ($10-20/mês)** ou **SocialKit ($30/mês)**.

**Nota:** O RapidAPI retorna **metadados completos** (informações sobre os vídeos), não os arquivos de vídeo em si. Para análise e pesquisa, os metadados são suficientes!

