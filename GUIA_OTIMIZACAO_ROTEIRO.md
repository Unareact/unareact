# 🚀 Guia Completo de Otimização da Geração de Roteiros

## 📋 Índice

1. [Otimizações de Prompt](#1-otimizações-de-prompt)
2. [Otimizações de Parâmetros](#2-otimizações-de-parâmetros)
3. [Otimizações de Nicho](#3-otimizações-de-nicho)
4. [Otimizações com Feedback](#4-otimizações-com-feedback)
5. [Otimizações de Performance](#5-otimizações-de-performance)
6. [Otimizações Avançadas](#6-otimizações-avançadas)

---

## 1. Otimizações de Prompt

### 1.1 Adicionar Exemplos Concretos

**Localização:** `app/lib/openai.ts` (linha ~303)

**Antes:**
```typescript
EXEMPLO DE QUALIDADE:
❌ RUIM: "Fale sobre o tópico de forma interessante"
✅ BOM: "Você já se perguntou por que algumas pessoas conseguem resultados incríveis..."
```

**Depois (Otimizado):**
```typescript
EXEMPLOS CONCRETOS DE QUALIDADE POR NICHO:

NICHO: Marketing
❌ RUIM: "Vou falar sobre marketing digital"
✅ BOM: "Empresas que usam esta estratégia aumentam conversão em 340%. Vou te mostrar exatamente como replicar isso em 3 passos simples."

NICHO: Educação
❌ RUIM: "Vou explicar como funciona"
✅ BOM: "95% das pessoas não sabem que este método pode reduzir tempo de aprendizado em 60%. Descubra o segredo que professores top usam."

NICHO: Entretenimento
❌ RUIM: "Isso é interessante"
✅ BOM: "Você não vai acreditar no que aconteceu quando testei isso. O resultado mudou TUDO que eu pensava sobre [tópico]."
```

### 1.2 Adicionar Few-Shot Learning

**Localização:** `app/lib/openai.ts` (adicionar antes do prompt final)

```typescript
// Adicionar exemplos de roteiros bem-sucedidos
const fewShotExamples = `
═══════════════════════════════════════════════════════════════
📚 EXEMPLOS DE ROTEIROS VIRAIS (REPLICAR ESTRUTURA):
═══════════════════════════════════════════════════════════════

EXEMPLO 1 - Hook Forte (Marketing):
{
  "id": "seg-1",
  "text": "Esta estratégia de marketing gerou R$ 2,3 milhões em 90 dias. E o melhor: você pode replicar hoje mesmo. Vou te mostrar os 3 passos exatos que funcionaram.",
  "duration": 8,
  "timestamp": 0,
  "type": "intro"
}

EXEMPLO 2 - Desenvolvimento com Especificidade (Educação):
{
  "id": "seg-2",
  "text": "O primeiro passo é entender seu público-alvo. Não estou falando de 'pessoas interessadas em X'. Estou falando de identificar exatamente: idade, dor principal, momento da jornada, e o que essa pessoa busca AGORA.",
  "duration": 12,
  "timestamp": 8,
  "type": "content"
}

EXEMPLO 3 - CTA Eficaz:
{
  "id": "seg-5",
  "text": "Teste esta estratégia nos próximos 7 dias e me conte nos comentários qual foi o resultado. Se funcionou, compartilhe este vídeo com alguém que precisa ver isso.",
  "duration": 7,
  "timestamp": 53,
  "type": "outro"
}
`;

prompt += fewShotExamples;
```

### 1.3 Melhorar Instruções de Estrutura

**Localização:** `app/lib/openai.ts` (linha ~230-280)

**Adicionar:**
```typescript
═══════════════════════════════════════════════════════════════
📐 REGRAS DE ESTRUTURA OBRIGATÓRIAS:
═══════════════════════════════════════════════════════════════

1. PRIMEIRO SEGMENTO (Hook - 3-8s):
   - DEVE criar "curiosidade gap" imediata
   - DEVE mencionar benefício/resultado específico
   - DEVE usar números quando possível
   - NÃO use: "Neste vídeo vou falar sobre..."
   - USE: "Você já se perguntou por que [resultado específico]?"

2. SEGMENTOS INTERMEDIÁRIOS (60-70% do vídeo):
   - Cada segmento DEVE ter um ponto específico
   - Use transições: "Agora que você entendeu X, vamos para Y"
   - Mude ritmo a cada 3-7 segundos
   - Adicione "dopamina hits": surpresas, revelações, insights

3. ÚLTIMO SEGMENTO (CTA - 5-10s):
   - DEVE ter call-to-action claro e específico
   - DEVE criar urgência ou desejo de ação
   - NÃO use: "Se gostou, curta e se inscreva"
   - USE: "Teste [ação específica] e me conte o resultado nos comentários"
```

---

## 2. Otimizações de Parâmetros

### 2.1 Ajustar Temperature Dinamicamente

**Localização:** `app/lib/openai.ts` (linha 347)

**Antes:**
```typescript
temperature: params.viralInsights ? 0.8 : 0.7
```

**Depois (Otimizado):**
```typescript
// Temperature adaptativa baseada em contexto
const getOptimalTemperature = (params: ScriptGenerationParams): number => {
  // Mais criativo para entretenimento
  if (params.style === 'entertaining') return 0.85;
  
  // Mais consistente para educacional
  if (params.style === 'educational') return 0.65;
  
  // Mais criativo quando há insights virais
  if (params.viralInsights) return 0.8;
  
  // Mais criativo para promocional (precisa ser persuasivo)
  if (params.style === 'promotional') return 0.75;
  
  // Default
  return 0.7;
};

temperature: getOptimalTemperature(params),
```

### 2.2 Adicionar max_tokens

**Localização:** `app/lib/openai.ts` (linha 334-348)

**Adicionar:**
```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  response_format: { type: 'json_object' },
  temperature: getOptimalTemperature(params),
  max_tokens: Math.max(2000, params.duration * 30), // ~30 tokens por segundo
  // Garante tokens suficientes para roteiros longos
});
```

### 2.3 Adicionar top_p para Diversidade

**Adicionar:**
```typescript
top_p: 0.95, // Permite mais diversidade nas escolhas
presence_penalty: 0.1, // Incentiva usar palavras novas
frequency_penalty: 0.1, // Evita repetição excessiva
```

---

## 3. Otimizações de Nicho

### 3.1 Melhorar Detecção de Nicho

**Localização:** `app/lib/niche-detector.ts`

**Adicionar detecção por ML simples:**
```typescript
export function detectNiche(topic: string): Niche {
  const topicLower = topic.toLowerCase();
  
  // Pesos por palavra-chave (mais específicas = maior peso)
  const keywordWeights: Record<Niche, Record<string, number>> = {
    marketing: {
      'marketing': 3,
      'vendas': 2,
      'conversão': 2,
      'tráfego': 2,
      'instagram': 1,
      'tiktok': 1,
    },
    education: {
      'aprender': 3,
      'ensinar': 3,
      'tutorial': 2,
      'como fazer': 2,
      'curso': 1,
    },
    // ... outros nichos
  };
  
  // Calcular scores com pesos
  const scores: Record<Niche, number> = { /* ... */ };
  
  for (const [niche, weights] of Object.entries(keywordWeights)) {
    for (const [keyword, weight] of Object.entries(weights)) {
      if (topicLower.includes(keyword)) {
        scores[niche as Niche] += weight;
      }
    }
  }
  
  // ... resto do código
}
```

### 3.2 Adicionar Nichos Específicos

**Adicionar novos nichos em `niche-detector.ts`:**
```typescript
export type Niche = 
  | 'education' 
  | 'entertainment'
  | 'business'
  // ... existentes
  | 'gaming'        // NOVO
  | 'beauty'        // NOVO
  | 'parenting';    // NOVO

const NICHE_KEYWORDS: Record<Niche, string[]> = {
  // ... existentes
  gaming: ['jogo', 'gaming', 'stream', 'twitch', 'gameplay', 'review jogo'],
  beauty: ['maquiagem', 'skincare', 'beleza', 'cosméticos', 'rotina skincare'],
  parenting: ['filhos', 'criança', 'educação infantil', 'maternidade', 'paternidade'],
};
```

### 3.3 Configurações Específicas por Nicho

**Adicionar configurações detalhadas:**
```typescript
gaming: {
  niche: 'gaming',
  name: 'Gaming',
  preferredStructures: ['Review Detalhado', 'Gameplay com Reação', 'Top 10', 'Comparação'],
  keyTechniques: [
    'Use linguagem gamer autêntica',
    'Inclua momentos de reação genuína',
    'Compare com outros jogos',
    'Mencione specs técnicos quando relevante',
    'Crie hype e antecipação'
  ],
  languageStyle: 'Energética, autêntica, técnica. Use gírias gamer quando apropriado.',
  hookExamples: [
    'Este jogo mudou TUDO que eu pensava sobre [gênero]...',
    'Você precisa jogar [jogo] porque [razão específica]...',
    'Prepare-se para [emoção] com este gameplay...'
  ],
  pacingGuidance: 'Ritmo rápido. Mantenha energia alta. Muitas mudanças visuais.',
  ctaStyle: 'Engajamento gamer: "Jogue e me conte", "Qual sua opinião?", "Deixa o like se concorda"'
},
```

---

## 4. Otimizações com Feedback

### 4.1 Sistema de Avaliação de Roteiros

**Criar novo arquivo:** `app/lib/script-evaluator.ts`

```typescript
export interface ScriptEvaluation {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export async function evaluateScript(
  segments: ScriptSegment[],
  topic: string
): Promise<ScriptEvaluation> {
  const prompt = `
Avalie este roteiro de vídeo e forneça feedback construtivo:

TÓPICO: ${topic}
SEGMENTOS: ${JSON.stringify(segments, null, 2)}

Avalie:
1. Qualidade do hook (primeiro segmento)
2. Estrutura narrativa
3. Especificidade do conteúdo
4. Qualidade do CTA
5. Ritmo e transições

Forneça:
- Score de 0-100
- 3 pontos fortes
- 3 pontos fracos
- 3 sugestões de melhoria

Retorne JSON:
{
  "score": 85,
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "suggestions": ["...", "...", "..."]
}
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3, // Mais consistente para avaliação
  });

  return JSON.parse(completion.choices[0]?.message?.content || '{}');
}
```

### 4.2 Regeneração com Feedback

**Adicionar em `app/lib/openai.ts`:**
```typescript
export async function regenerateScriptWithFeedback(
  originalParams: ScriptGenerationParams,
  feedback: ScriptEvaluation
): Promise<ScriptSegment[]> {
  const improvedPrompt = `
${/* prompt original */}

═══════════════════════════════════════════════════════════════
🔍 FEEDBACK DA VERSÃO ANTERIOR:
═══════════════════════════════════════════════════════════════

Score: ${feedback.score}/100

PONTOS FORTES (manter):
${feedback.strengths.map(s => `- ${s}`).join('\n')}

PONTOS FRACOS (melhorar):
${feedback.weaknesses.map(w => `- ${w}`).join('\n')}

SUGESTÕES (aplicar):
${feedback.suggestions.map(s => `- ${s}`).join('\n')}

IMPORTANTE: Aplique as sugestões acima para melhorar o roteiro.
`;

  // ... resto da lógica
}
```

---

## 5. Otimizações de Performance

### 5.1 Cache de Configurações de Nicho

**Adicionar em `app/lib/niche-detector.ts`:**
```typescript
// Cache simples em memória
const nicheCache = new Map<string, Niche>();

export function detectNiche(topic: string): Niche {
  // Verificar cache
  const cached = nicheCache.get(topic.toLowerCase());
  if (cached) return cached;
  
  // ... lógica de detecção
  
  // Salvar no cache
  nicheCache.set(topic.toLowerCase(), detectedNiche);
  return detectedNiche;
}
```

### 5.2 Streaming de Resposta (Futuro)

**Para roteiros longos, considerar streaming:**
```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  stream: true,
});

// Processar chunks conforme chegam
for await (const chunk of stream) {
  // Atualizar UI progressivamente
}
```

### 5.3 Validação Pré-Geração

**Adicionar validações antes de chamar API:**
```typescript
export async function generateScript(params: ScriptGenerationParams): Promise<ScriptSegment[]> {
  // Validações
  if (!params.topic || params.topic.length < 5) {
    throw new Error('Tópico deve ter pelo menos 5 caracteres');
  }
  
  if (params.duration < 10 || params.duration > 600) {
    throw new Error('Duração deve estar entre 10 e 600 segundos');
  }
  
  // ... resto do código
}
```

---

## 6. Otimizações Avançadas

### 6.1 Multi-Pass Generation

**Gerar, avaliar, melhorar:**
```typescript
export async function generateOptimizedScript(
  params: ScriptGenerationParams,
  passes: number = 2
): Promise<ScriptSegment[]> {
  let currentScript = await generateScript(params);
  
  for (let i = 0; i < passes; i++) {
    const evaluation = await evaluateScript(currentScript, params.topic);
    
    if (evaluation.score >= 85) {
      // Bom o suficiente
      break;
    }
    
    // Regenerar com feedback
    currentScript = await regenerateScriptWithFeedback(params, evaluation);
  }
  
  return currentScript;
}
```

### 6.2 A/B Testing de Prompts

**Testar diferentes versões de prompt:**
```typescript
const promptVariants = [
  { name: 'detailed', prompt: detailedPrompt },
  { name: 'concise', prompt: concisePrompt },
  { name: 'examples', prompt: examplesPrompt },
];

// Gerar com cada variante e escolher melhor
const results = await Promise.all(
  promptVariants.map(v => generateWithPrompt(v.prompt))
);

// Escolher melhor baseado em critérios
const best = selectBestScript(results);
```

### 6.3 Integração com Análise de Vídeos Virais

**Usar dados reais de vídeos virais:**
```typescript
// Buscar vídeos virais do mesmo nicho
const viralVideos = await searchViralVideos(niche, platform);

// Extrair padrões comuns
const commonPatterns = extractCommonPatterns(viralVideos);

// Aplicar no prompt
prompt += `
═══════════════════════════════════════════════════════════════
📊 PADRÕES DE ${viralVideos.length} VÍDEOS VIRAIS DO NICHO:
═══════════════════════════════════════════════════════════════
${commonPatterns.map(p => `- ${p}`).join('\n')}
`;
```

### 6.4 Fine-tuning com Dados Próprios (Futuro)

**Se tiver muitos roteiros próprios bem-sucedidos:**
```typescript
// Preparar dados para fine-tuning
const trainingData = yourSuccessfulScripts.map(script => ({
  messages: [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: `Tópico: ${script.topic}, Duração: ${script.duration}`
    },
    {
      role: 'assistant',
      content: JSON.stringify(script.segments)
    }
  ]
}));

// Upload para OpenAI para fine-tuning
// (requer processo específico da OpenAI)
```

---

## 📊 Métricas para Acompanhar

### Métricas de Qualidade:
- **Score médio de avaliação** (meta: >85)
- **Taxa de aceitação** (usuários que usam o roteiro gerado)
- **Tempo médio de edição** (quanto usuário precisa editar)

### Métricas de Performance:
- **Tempo de geração** (meta: <10s)
- **Taxa de erro** (meta: <1%)
- **Custo por roteiro** (meta: <$0.10)

### Métricas de Engajamento:
- **Views de vídeos gerados** (se tiver acesso)
- **Retenção média** (se tiver acesso)
- **Taxa de compartilhamento** (se tiver acesso)

---

## 🎯 Plano de Implementação Sugerido

### Fase 1 (Imediato - 1 semana):
1. ✅ Adicionar exemplos concretos nos prompts
2. ✅ Ajustar temperature dinamicamente
3. ✅ Melhorar detecção de nicho

### Fase 2 (Curto prazo - 2-3 semanas):
4. ✅ Implementar sistema de avaliação
5. ✅ Adicionar few-shot examples
6. ✅ Melhorar instruções de estrutura

### Fase 3 (Médio prazo - 1 mês):
7. ✅ Implementar regeneração com feedback
8. ✅ Adicionar novos nichos
9. ✅ Otimizar performance (cache, validações)

### Fase 4 (Longo prazo - 2-3 meses):
10. ✅ Multi-pass generation
11. ✅ A/B testing de prompts
12. ✅ Integração com análise de vídeos virais

---

## 💡 Dicas Finais

1. **Teste incrementalmente**: Implemente uma otimização por vez e meça o impacto
2. **Colete feedback real**: Pergunte aos usuários o que funciona e o que não funciona
3. **Monitore custos**: Otimizações podem aumentar custos (mais tokens, mais chamadas)
4. **Documente mudanças**: Mantenha log das otimizações e seus resultados
5. **Itere baseado em dados**: Use métricas, não apenas intuição

---

## 🔗 Próximos Passos

1. Escolha 2-3 otimizações da Fase 1
2. Implemente e teste
3. Meça resultados
4. Itere baseado nos dados
5. Avance para próxima fase

**Lembre-se**: Otimização é um processo contínuo, não um destino! 🚀

