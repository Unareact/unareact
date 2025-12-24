# 📊 Entendendo as Curtidas: Total vs Período

## ⏰ Como Funciona Atualmente

### ✅ O que a API Retorna:
- **Curtidas TOTAIS** desde a publicação do vídeo
- **Não** é por período (últimas 24h, última semana, etc.)
- É o **acumulado** desde que o vídeo foi publicado

### Exemplo:
```
Vídeo publicado há 1 mês:
- Total de curtidas: 500.000
- Isso significa: 500.000 curtidas desde a publicação
- NÃO significa: 500.000 nas últimas 24h
```

---

## 🔍 Limitação da YouTube API

A **YouTube Data API v3** retorna apenas:
- ✅ Total de curtidas (acumulado)
- ✅ Total de visualizações (acumulado)
- ✅ Total de comentários (acumulado)
- ❌ **NÃO** retorna curtidas por período
- ❌ **NÃO** retorna crescimento nas últimas 24h

---

## 💡 Soluções Possíveis

### Opção 1: Filtrar por Data de Publicação (Atual)
**Como funciona:**
- Busca vídeos trending (mais populares agora)
- Filtra por curtidas totais
- Vídeos mais recentes têm boost no viral score

**Vantagens:**
- ✅ Já implementado
- ✅ Vídeos trending são os mais virais agora
- ✅ Funciona bem

**Limitações:**
- ❌ Não mostra crescimento recente
- ❌ Vídeo antigo com muitas curtidas pode aparecer

### Opção 2: Filtrar por Vídeos Recentes
**Como funciona:**
- Adicionar filtro de "Publicado nos últimos X dias"
- Combinar com filtro de curtidas
- Foca em vídeos novos e virais

**Implementação:**
```typescript
// Filtrar vídeos publicados nos últimos 7 dias
const daysAgo = 7;
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

const recentVideos = videos.filter(video => {
  const publishedDate = new Date(video.publishedAt);
  return publishedDate >= cutoffDate;
});
```

### Opção 3: Calcular Taxa de Crescimento (Estimativa)
**Como funciona:**
- Usar data de publicação + curtidas totais
- Estimar taxa de crescimento
- Vídeos com alta taxa = mais virais agora

**Fórmula:**
```typescript
const daysSincePublished = (Date.now() - publishedDate) / (1000 * 60 * 60 * 24);
const likesPerDay = totalLikes / daysSincePublished;
const growthRate = likesPerDay; // Curtidas por dia
```

---

## 🎯 Recomendação

### Para Encontrar Vídeos Virais AGORA:

**Estratégia 1: Vídeos Trending + Curtidas**
- ✅ Já funciona
- Vídeos trending = mais populares agora
- Filtro de curtidas = qualidade

**Estratégia 2: Adicionar Filtro de Data**
- Filtrar vídeos dos últimos 7-30 dias
- Combinar com curtidas mínimas
- Foca em vídeos novos e virais

**Estratégia 3: Taxa de Crescimento**
- Calcular curtidas por dia
- Filtrar por alta taxa de crescimento
- Identifica vídeos que estão viralizando agora

---

## 📊 Exemplo Prático

### Vídeo A (Antigo):
- Publicado: 1 ano atrás
- Curtidas totais: 2.000.000
- Taxa: ~5.500 curtidas/dia
- **Status:** Popular, mas não está viralizando agora

### Vídeo B (Novo):
- Publicado: 2 dias atrás
- Curtidas totais: 100.000
- Taxa: ~50.000 curtidas/dia
- **Status:** ESTÁ VIRALIZANDO AGORA! 🔥

---

## 🔧 O que Posso Implementar

### Opção A: Filtro de Data de Publicação
- Adicionar: "Publicado nos últimos X dias"
- Combina com filtro de curtidas
- Foca em vídeos novos

### Opção B: Taxa de Crescimento
- Calcular curtidas por dia
- Filtrar por alta taxa
- Mostrar "🔥 Viralizando agora"

### Opção C: Ambos
- Filtro de data + taxa de crescimento
- Melhor identificação de vídeos virais

---

## 💬 Resposta Direta

**Atualmente estou vendo:**
- ✅ Curtidas **TOTAIS** (acumulado desde publicação)
- ✅ Em vídeos **TRENDING** (mais populares agora)
- ❌ **NÃO** por período específico (últimas 24h, etc.)

**Para vídeos que estão viralizando AGORA:**
- Vídeos trending já são os mais virais
- Mas posso adicionar filtro de data (últimos 7 dias)
- E calcular taxa de crescimento (curtidas/dia)

---

**Quer que eu adicione filtro de data ou taxa de crescimento?** 🚀

