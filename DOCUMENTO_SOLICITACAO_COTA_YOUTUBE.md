# Documentação Técnica - UNA Video Editor
## Solicitação de Aumento de Cota - YouTube Data API v3

---

## 1. VISÃO GERAL DA APLICAÇÃO

**Nome da Aplicação:** UNA Video Editor  
**URL:** https://una-app.vercel.app  
**Tipo:** Aplicação Web Pública (Next.js/React)  
**Propósito:** Ferramenta gratuita para criadores de conteúdo analisarem vídeos virais do YouTube e obterem insights para criação de conteúdo similar.

---

## 2. FUNCIONALIDADES PRINCIPAIS

### 2.1 Busca de Vídeos Virais
- Busca vídeos trending do YouTube por categoria e nicho
- Filtros por região (ex: EUA, Brasil)
- Filtros por categoria de produto/nicho (ex: "Portal Magra" para bem-estar)
- Ordenação por viral score, views, ou data de publicação

### 2.2 Análise de Métricas
- Calcula **Viral Score** (combinação de views, likes, comentários e engajamento)
- Taxa de engajamento (likes + comentários / views)
- Curtidas por dia (crescimento do vídeo)
- Score temporal (boost para vídeos recentes)

### 2.3 Categorias Especializadas
- Sistema de categorias com palavras-chave específicas
- Exemplo: "Portal Magra" - focado em mulheres no momento de decisão de se cuidar
- Busca múltiplas combinações de palavras-chave em paralelo para encontrar conteúdo relevante

---

## 3. USO DA YOUTUBE DATA API v3

### 3.1 Chamadas de API Realizadas

#### A) `search.list` - Busca de Vídeos
**Finalidade:** Encontrar vídeos virais por palavras-chave relacionadas a categorias específicas

**Implementação:**
- Para categorias específicas (ex: "Portal Magra"), realizamos **12 buscas paralelas** com diferentes combinações de palavras-chave:
  - "hábitos alimentares rotina saudável"
  - "transformação antes depois bem-estar"
  - "começar se cuidar mudança hábitos"
  - "acompanhamento nutricional programa"
  - "bem-estar autocuidado rotina"
  - "rotina alimentar saudável"
  - "mudança de hábitos alimentação"
  - "receitas saudáveis fáceis"
  - "receitas saudáveis para emagrecer"
  - "receitas fit saudáveis"
  - "cardápio saudável semanal"
  - "comida saudável receitas"

- Cada busca retorna até **50 vídeos** (`maxResults: 50`)
- Ordenação por `viewCount` para priorizar vídeos populares
- Filtro por idioma: `relevanceLanguage: 'pt'` (português)

**Consumo de Cota:**
- Cada chamada `search.list` consome **100 unidades**
- 12 buscas paralelas = **1.200 unidades por requisição completa**

#### B) `videos.list` - Detalhes dos Vídeos
**Finalidade:** Obter estatísticas detalhadas de cada vídeo encontrado

**Dados Obtidos:**
- Estatísticas: views, likes, comentários, shares
- Informações: título, descrição, tags, thumbnails
- Metadados: data de publicação, duração, canal

**Consumo de Cota:**
- Cada chamada `videos.list` consome **1 unidade por vídeo**
- Para 50 vídeos = **50 unidades**

**Total por Busca Completa:**
- 12 buscas × 100 unidades = 1.200 unidades
- 50 vídeos × 1 unidade = 50 unidades
- **Total: ~1.250 unidades por busca completa de categoria**

---

## 4. PADRÃO DE USO E CRESCIMENTO

### 4.1 Uso Atual
- **Usuários ativos:** 50-100 usuários
- **Buscas por dia:** 500-1.000 chamadas
- **Pico de QPS:** 5-10 queries por segundo durante horários de pico
- **Distribuição:** Uso constante ao longo do dia, com picos nas manhãs e noites

### 4.2 Crescimento Esperado
- **Próximos 3 meses:** 200-300 usuários
- **Próximos 6 meses:** 500-1.000 usuários

### 4.3 Cálculos de Cota Necessária

**Cenário Atual (100 usuários):**
- Usuário médio: 5 buscas por dia
- 100 usuários × 5 buscas = 500 buscas/dia
- 500 buscas × 1.250 unidades = **625.000 unidades/dia**

**Cenário 3 meses (300 usuários):**
- 300 usuários × 5 buscas = 1.500 buscas/dia
- 1.500 buscas × 1.250 unidades = **1.875.000 unidades/dia**

**Cenário 6 meses (1.000 usuários):**
- 1.000 usuários × 5 buscas = 5.000 buscas/dia
- 5.000 buscas × 1.250 unidades = **6.250.000 unidades/dia**

**Cota Recomendada:**
- Mínimo necessário: **1.000.000 unidades/dia**
- Ideal para crescimento: **2.000.000 unidades/dia**

---

## 5. JUSTIFICATIVA PARA AUMENTO DE COTA

### 5.1 Limitação Atual
- **Cota atual:** 10.000 unidades/dia
- **Com cota atual:** Apenas 8-10 buscas completas por dia são possíveis
- **Impacto:** Apenas 1-2 usuários podem usar a aplicação efetivamente

### 5.2 Necessidade de Cota Adicional
- **Cota adicional solicitada:** 1.000.000 unidades/dia
- **Cota total necessária:** 1.010.000 unidades/dia

### 5.3 Por que a Cota Adicional é Essencial

1. **Múltiplas Buscas Paralelas:**
   - Para encontrar conteúdo relevante em nichos específicos, precisamos fazer múltiplas buscas com diferentes combinações de palavras-chave
   - Reduzir o número de buscas comprometeria a qualidade dos resultados

2. **Qualidade dos Resultados:**
   - Buscar até 50 vídeos por query garante que encontramos os vídeos mais relevantes
   - Reduzir esse número faria com que vídeos virais importantes fossem perdidos

3. **Crescimento Natural:**
   - A aplicação é gratuita e pública, o que significa crescimento orgânico
   - Sem cota suficiente, não poderemos atender novos usuários

4. **Experiência do Usuário:**
   - Usuários esperam resultados rápidos e relevantes
   - Com cota insuficiente, a aplicação ficaria inutilizável

---

## 6. IMPACTO SEM A COTA ADICIONAL

### 6.1 Funcionalidades Comprometidas

**Busca de Vídeos Virais:**
- Não será possível fazer buscas completas para categorias específicas
- Apenas 1-2 usuários poderão usar a aplicação por dia
- Funcionalidade principal ficará inoperante

**Análise de Métricas:**
- Não conseguiremos obter estatísticas completas dos vídeos
- Usuários verão listas incompletas ou vazias
- Métricas derivadas (viral score) não poderão ser calculadas

**Filtros e Categorias:**
- Filtros por região e categoria não funcionarão adequadamente
- Sistema de categorias especializadas ficará limitado

### 6.2 Soluções Alternativas (Não Ideais)

Se a cota não for aprovada, teríamos que:
- Reduzir buscas paralelas de 12 para 3-4 (qualidade reduzida)
- Limitar resultados de 50 para 10-20 vídeos (menos opções)
- Implementar cache agressivo de 24-48h (dados desatualizados)
- Limitar número de usuários ou buscas (experiência degradada)
- Remover filtros específicos (perda de funcionalidade)

**Todas essas alternativas comprometem gravemente a qualidade e utilidade da aplicação.**

---

## 7. CONFORMIDADE E BOAS PRÁTICAS

### 7.1 Armazenamento de Dados
- Dados do YouTube são armazenados apenas temporariamente (menos de 24 horas)
- Usamos localStorage do navegador para cache local
- Não armazenamos dados do YouTube em servidor permanente

### 7.2 Atualização de Dados
- Dados são atualizados em tempo real a cada busca
- Não mantemos dados históricos do YouTube

### 7.3 Uso dos Dados
- Dados são exibidos apenas para análise e inspiração
- Não comercializamos dados do YouTube
- Não vendemos ou compartilhamos dados com terceiros
- Aplicação é gratuita e sem monetização

### 7.4 Segurança
- API Key é protegida server-side (API routes do Next.js)
- Não expomos a API Key no cliente
- Implementamos rate limiting para evitar abuso

---

## 8. INFORMAÇÕES TÉCNICAS

### 8.1 Stack Tecnológico
- **Framework:** Next.js 14 (React)
- **Hospedagem:** Vercel
- **API:** YouTube Data API v3
- **Linguagem:** TypeScript

### 8.2 Estrutura da Aplicação
```
/app
  /api
    /viral
      route.ts          # Endpoint principal para busca de vídeos
  /components
    /viral
      ViralVideoList.tsx # Componente de listagem de vídeos
  /portal
    page.tsx            # Página dedicada "Portal Magra"
```

### 8.3 Fluxo de Uso
1. Usuário acessa a aplicação
2. Seleciona categoria/nicho (ex: "Portal Magra")
3. Aplicação faz múltiplas buscas paralelas na YouTube API
4. Filtra e ordena resultados por relevância
5. Calcula métricas derivadas (viral score)
6. Exibe lista de vídeos com métricas para o usuário

---

## 9. CONCLUSÃO

A UNA Video Editor é uma ferramenta gratuita e pública que ajuda criadores de conteúdo a encontrarem inspiração em vídeos virais do YouTube. Para funcionar adequadamente e atender nosso público crescente, precisamos de uma cota adicional de **1.000.000 unidades/dia** da YouTube Data API v3.

Sem essa cota, a aplicação ficará praticamente inutilizável, comprometendo a experiência de todos os usuários e impedindo nosso crescimento natural.

Solicitamos a aprovação da cota adicional para continuarmos oferecendo um serviço de qualidade aos criadores de conteúdo.

---

## 10. CONTATO E INFORMAÇÕES ADICIONAIS

**Aplicação:** https://una-app.vercel.app  
**Código-fonte:** Disponível sob solicitação  
**Demonstração:** Aplicação é pública e pode ser testada a qualquer momento

---

**Data:** [DATA ATUAL]  
**Solicitante:** [SEU NOME]  
**Projeto Google Cloud:** [NOME DO PROJETO]  
**Project Number:** [NÚMERO DO PROJETO]

