# Guia de Ajustes do Diagnóstico Viral

## O que pode ser ajustado:

### 1. **Prompt da IA** (`app/api/diagnosis/route.ts`)
- Tornar mais específico sobre o que analisar
- Adicionar contexto sobre tendências virais
- Melhorar a estrutura do JSON retornado

### 2. **Métricas Adicionais**
- Taxa de retenção (se disponível)
- Picos de engajamento
- Comparação com vídeos similares
- Crescimento ao longo do tempo

### 3. **Interface Visual** (`app/components/diagnosis/ViralDiagnosis.tsx`)
- Melhorar layout e organização
- Adicionar gráficos de métricas
- Tornar mais interativo
- Adicionar exportação (PDF/JSON)

### 4. **Recomendações Mais Práticas**
- Exemplos concretos de edição
- Referências a ferramentas específicas
- Passo a passo de implementação
- Comparação antes/depois

### 5. **Template de Roteiro**
- Mais exemplos práticos
- Estruturas diferentes por nicho
- Durações mais precisas
- Gatilhos emocionais por segmento

### 6. **Performance**
- Cache de diagnósticos
- Análise incremental
- Processamento em background

## Como ajustar:

### Exemplo 1: Melhorar o Prompt da IA

```typescript
// Em app/api/diagnosis/route.ts, linha ~73
const analysisPrompt = `Analise este vídeo viral do YouTube...

// ADICIONAR:
- Contexto sobre o nicho do vídeo
- Comparação com benchmarks do setor
- Análise de tendências atuais
- Fatores específicos de viralização para este tipo de conteúdo
`;
```

### Exemplo 2: Adicionar Métricas

```typescript
// Em app/types/index.ts
metrics: {
  engagementRate: number;
  likeToViewRatio: number;
  commentToViewRatio: number;
  // ADICIONAR:
  shares?: number;
  averageWatchTime?: number;
  retentionRate?: number;
  peakEngagementTime?: number; // Momento de maior engajamento
}
```

### Exemplo 3: Melhorar Interface

```typescript
// Em app/components/diagnosis/ViralDiagnosis.tsx
// ADICIONAR:
- Gráficos de métricas (usando recharts ou similar)
- Tabs para organizar seções
- Botão de exportar diagnóstico
- Comparação com outros vídeos virais
```

## Próximos Passos:

1. **Diga o que quer ajustar especificamente**
2. **Ou escolha uma das opções acima**
3. **Posso implementar melhorias automáticas**

