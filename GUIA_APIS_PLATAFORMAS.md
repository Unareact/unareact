# 📡 Guia Completo: APIs para Vídeos Virais

## Resumo Executivo

| Plataforma | API | Gratuita? | Limitações | Status no App |
|------------|-----|-----------|------------|---------------|
| **YouTube** | Data API v3 | ✅ Sim | 10.000 unidades/dia | ✅ Implementado |
| **TikTok** | Research API / Content API | ⚠️ Limitada | Aprovação necessária | 🔄 Em desenvolvimento |
| **Facebook** | Graph API | ✅ Sim | Apenas páginas próprias | 🔄 Em desenvolvimento |
| **Instagram** | Graph API | ✅ Sim | Apenas contas próprias | 🔄 Em desenvolvimento |

---

## 🎥 YouTube Data API v3

### ✅ Status: **IMPLEMENTADO NO APP**

### O que é:
API oficial do Google para acessar dados do YouTube.

### É gratuita?
**SIM!** Com limites generosos.

### Limites Gratuitos:
- **10.000 unidades por dia** (por projeto)
- Cada busca de vídeos trending = ~100 unidades
- Cada busca de detalhes = ~1 unidade
- **Aproximadamente 100 buscas de trending por dia**

### Como obter:
1. Acesse: https://console.cloud.google.com/
2. Crie um projeto (ou use existente)
3. Ative "YouTube Data API v3"
4. Crie credenciais → **API Key**
5. Adicione no `.env.local`:
```env
YOUTUBE_API_KEY=sua-chave-aqui
```

### O que podemos fazer:
- ✅ Buscar vídeos trending globais
- ✅ Obter métricas (views, likes, comentários)
- ✅ Buscar por região
- ✅ Obter detalhes completos de vídeos
- ❌ Download direto (viola ToS)

### Custo adicional:
- Gratuito até 10.000 unidades/dia
- Pode solicitar aumento de quota (gratuito)
- Planos pagos disponíveis para uso comercial intenso

---

## 🎵 TikTok API

### ⚠️ Status: **LIMITADO - REQUER APROVAÇÃO**

### O que é:
TikTok oferece duas APIs principais:
1. **Research API** - Para pesquisadores (acadêmicos)
2. **Content API** - Para desenvolvedores (limitada)

### É gratuita?
**PARCIALMENTE** - Depende do tipo de acesso.

### Limitações:
- **Research API**: Apenas para pesquisadores qualificados de organizações sem fins lucrativos
- **Content API**: Acesso muito limitado, requer aprovação do TikTok
- **Não há API pública** para buscar vídeos trending/virais
- Acesso a dados públicos é muito restrito

### Como obter:
1. Acesse: https://developers.tiktok.com/
2. Crie uma aplicação
3. Solicite acesso (pode levar semanas/meses)
4. Aprovação não é garantida

### Alternativas:
1. **TikTok Web Scraping** (não oficial, pode violar ToS)
   - Usar bibliotecas como `tiktok-scraper`
   - ⚠️ Risco de bloqueio
   - ⚠️ Pode violar termos de serviço

2. **APIs de Terceiros** (pagos)
   - SocialKit, RapidAPI, etc.
   - Custos: $10-100+/mês
   - Mais confiável que scraping

### O que podemos fazer (com API oficial):
- ✅ Acessar dados de contas públicas (limitado)
- ✅ Obter informações de vídeos específicos (se aprovado)
- ❌ Buscar trending/virais (não disponível)
- ❌ Download de vídeos (não permitido)

### Recomendação:
- **Para desenvolvimento**: Use APIs de terceiros ou scraping (com cuidado)
- **Para produção**: Considere parceria com TikTok ou APIs pagas
- **Alternativa**: Focar em YouTube e Instagram primeiro

---

## 📘 Facebook Graph API

### ✅ Status: **GRATUITA MAS LIMITADA**

### O que é:
API oficial do Facebook/Meta para acessar dados.

### É gratuita?
**SIM!** Mas com restrições importantes.

### Limitações:
- ✅ Acesso gratuito ilimitado (com rate limits)
- ⚠️ **Apenas páginas que você gerencia**
- ⚠️ Apenas últimos 50 posts
- ⚠️ Não há endpoint para "vídeos virais" globais
- ⚠️ Requer autenticação OAuth

### Como obter:
1. Acesse: https://developers.facebook.com/
2. Crie um app
3. Obtenha App ID e App Secret
4. Configure OAuth
5. Adicione no `.env.local`:
```env
FACEBOOK_APP_ID=seu-app-id
FACEBOOK_APP_SECRET=seu-app-secret
```

### O que podemos fazer:
- ✅ Acessar vídeos de páginas próprias
- ✅ Obter métricas de engajamento
- ✅ Buscar posts populares (da sua página)
- ❌ Buscar vídeos virais globais (não disponível)
- ❌ Download de vídeos (não permitido)

### Rate Limits:
- ~200 requisições/hora por usuário
- ~4.800 requisições/dia por app

---

## 📷 Instagram Graph API

### ✅ Status: **GRATUITA MAS MUITO LIMITADA**

### O que é:
API do Instagram (parte do Facebook Graph API).

### É gratuita?
**SIM!** Mas ainda mais restritiva que Facebook.

### Limitações:
- ✅ Gratuita
- ⚠️ **Apenas contas de negócios/criadores que você gerencia**
- ⚠️ Não há acesso a Reels virais globais
- ⚠️ Requer Instagram Business Account
- ⚠️ OAuth complexo

### Como obter:
1. Mesmo processo do Facebook
2. Conecte conta Instagram Business
3. Obtenha token de acesso
4. Adicione no `.env.local`:
```env
INSTAGRAM_ACCESS_TOKEN=seu-token
```

### O que podemos fazer:
- ✅ Acessar seus próprios Reels
- ✅ Obter métricas dos seus posts
- ❌ Buscar Reels virais globais (não disponível)
- ❌ Download de vídeos (não permitido)

---

## 💡 Estratégia Recomendada

### Fase 1: YouTube (✅ Já implementado)
- **Custo**: Gratuito
- **Facilidade**: Fácil
- **Dados**: Vídeos trending globais
- **Status**: Funcionando

### Fase 2: TikTok (🔄 Em desenvolvimento)
**Opção A - API de Terceiros (Recomendado para MVP):**
- Use serviços como SocialKit, RapidAPI
- Custo: $20-50/mês
- Mais rápido de implementar
- Mais confiável

**Opção B - Scraping (Não recomendado para produção):**
- Use bibliotecas como `tiktok-scraper`
- Custo: Gratuito
- Risco: Bloqueio, violação de ToS
- Use apenas para testes

**Opção C - API Oficial (Longo prazo):**
- Solicite acesso ao TikTok
- Pode levar meses
- Não garantido

### Fase 3: Facebook/Instagram (🔄 Em desenvolvimento)
- Implementar para páginas próprias
- Não há acesso a vídeos virais globais
- Útil para gerenciar próprio conteúdo

---

## 📊 Comparação de Custos

| Solução | Custo Mensal | Limitações | Recomendação |
|---------|--------------|------------|--------------|
| **YouTube API** | Gratuito | 10K unidades/dia | ✅ Use |
| **TikTok Scraping** | Gratuito | Risco de bloqueio | ⚠️ Apenas testes |
| **TikTok API Terceiros** | $20-100 | Rate limits | ✅ Para produção |
| **Facebook Graph API** | Gratuito | Apenas próprias páginas | ✅ Use |
| **Instagram Graph API** | Gratuito | Apenas próprias contas | ✅ Use |

---

## 🚀 Implementação no App

### O que já temos:
- ✅ YouTube Data API v3 integrada
- ✅ Busca de vídeos trending
- ✅ Métricas detalhadas
- ✅ Diagnóstico de viralização

### O que vamos adicionar:

#### TikTok:
```typescript
// Opção 1: API de Terceiros
const tiktokVideos = await fetch('https://api.socialkit.dev/tiktok/trending', {
  headers: { 'Authorization': `Bearer ${SOCIALKIT_API_KEY}` }
});

// Opção 2: Scraping (não recomendado)
import { TikTokScraper } from 'tiktok-scraper';
const scraper = new TikTokScraper();
const videos = await scraper.getTrending();
```

#### Facebook:
```typescript
// Graph API
const response = await fetch(
  `https://graph.facebook.com/v18.0/${pageId}/videos?access_token=${token}`
);
```

#### Instagram:
```typescript
// Graph API
const response = await fetch(
  `https://graph.facebook.com/v18.0/${igUserId}/media?access_token=${token}`
);
```

---

## ⚠️ Avisos Importantes

### Termos de Serviço:
- **YouTube**: Download de vídeos viola ToS
- **TikTok**: Scraping viola ToS (use APIs oficiais)
- **Facebook**: Respeite políticas de privacidade

### Melhores Práticas:
1. ✅ Use APIs oficiais quando possível
2. ✅ Respeite rate limits
3. ✅ Armazene dados com cuidado
4. ✅ Não faça download sem permissão
5. ✅ Leia os ToS de cada plataforma

### Alternativas Legais:
- Para download: Use ferramentas oficiais ou obtenha permissões
- Para análise: Use apenas dados públicos via APIs
- Para edição: Use vídeos próprios ou com licença

---

## 📝 Checklist de Implementação

### YouTube (✅ Feito)
- [x] API Key configurada
- [x] Busca de trending implementada
- [x] Métricas coletadas
- [x] Diagnóstico funcionando

### TikTok (🔄 Próximo)
- [ ] Escolher estratégia (API terceiros vs scraping)
- [ ] Implementar busca de trending
- [ ] Integrar com interface
- [ ] Adicionar ao painel Virais

### Facebook (🔄 Futuro)
- [ ] Configurar OAuth
- [ ] Implementar busca de vídeos de páginas
- [ ] Integrar métricas

### Instagram (🔄 Futuro)
- [ ] Configurar Instagram Business API
- [ ] Implementar busca de Reels
- [ ] Integrar com interface

---

## 💰 Estimativa de Custos

### Cenário Básico (Gratuito):
- YouTube: ✅ Gratuito
- TikTok: ⚠️ Scraping (risco) ou $0 (sem acesso)
- Facebook: ✅ Gratuito
- **Total: $0/mês** (limitado)

### Cenário Intermediário:
- YouTube: ✅ Gratuito
- TikTok: $30/mês (API terceiros)
- Facebook: ✅ Gratuito
- **Total: $30/mês**

### Cenário Completo:
- YouTube: ✅ Gratuito
- TikTok: $50/mês (API premium)
- Facebook: ✅ Gratuito
- Instagram: ✅ Gratuito
- **Total: $50/mês**

---

## 🎯 Recomendação Final

**Para começar:**
1. ✅ Use YouTube (já implementado, gratuito)
2. 🔄 Adicione TikTok via API de terceiros ($30/mês)
3. 🔄 Facebook/Instagram para páginas próprias (gratuito)

**Para produção:**
- Considere parcerias com as plataformas
- Use APIs oficiais sempre que possível
- Implemente cache para reduzir chamadas
- Monitore rate limits

---

**Pronto para implementar!** 🚀

Quer que eu implemente suporte para TikTok agora usando API de terceiros ou scraping?

