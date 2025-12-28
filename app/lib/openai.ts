import OpenAI from 'openai';
import { ScriptSegment, ScriptGenerationParams, ViralDiagnosis } from '@/app/types';
import { detectNiche, getNicheConfig, type NicheConfig } from './niche-detector';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Apenas para desenvolvimento
});

export async function generateScript(params: ScriptGenerationParams): Promise<ScriptSegment[]> {
  // Validações pré-geração
  if (!params.topic || params.topic.trim().length < 5) {
    throw new Error('Tópico deve ter pelo menos 5 caracteres');
  }
  
  if (params.duration < 10 || params.duration > 600) {
    throw new Error('Duração deve estar entre 10 e 600 segundos');
  }

  // Detectar nicho automaticamente
  const detectedNiche = detectNiche(params.topic);
  const nicheConfig = getNicheConfig(detectedNiche);

  // System prompt base - sempre aplicado
  const systemPrompt = params.viralInsights
    ? `Você é um ESPECIALISTA MUNDIAL em criação de roteiros de vídeo virais com 15+ anos de experiência. Você analisou MILHÕES de vídeos virais e identificou os padrões científicos que fazem conteúdo viralizar. Seu trabalho é criar roteiros que REPLICAM esses padrões de sucesso, adaptando-os ao tópico e nicho fornecido.

NICHO IDENTIFICADO: ${nicheConfig.name}
ESTRUTURAS PREFERIDAS PARA ESTE NICHO: ${nicheConfig.preferredStructures.join(', ')}
TÉCNICAS-CHAVE: ${nicheConfig.keyTechniques.join(' | ')}
ESTILO DE LINGUAGEM: ${nicheConfig.languageStyle}

PRINCÍPIOS FUNDAMENTAIS DE VIRALIZAÇÃO:
1. HOOK nos primeiros 3-5 segundos é CRÍTICO (70% dos vídeos virais perdem espectadores após 5s se não houver hook forte)
2. Curiosidade Gap: Criar perguntas na mente do espectador que só são respondidas assistindo
3. Dopamina Hits: Múltiplos momentos de recompensa ao longo do vídeo (surpresas, revelações, insights)
4. Ritmo: Manter atenção com mudanças a cada 3-7 segundos
5. Emoção > Informação: Conteúdo emocional engaja 3x mais que apenas informativo
6. Especificidade: Detalhes concretos são mais memoráveis que generalizações

Use os insights virais fornecidos para replicar EXATAMENTE os padrões que funcionaram, adaptando-os ao nicho ${nicheConfig.name}.`
    : `Você é um ESPECIALISTA em criação de roteiros de vídeo altamente eficazes e envolventes. Você cria conteúdo que maximiza engajamento, retenção e compartilhamento.

NICHO IDENTIFICADO: ${nicheConfig.name}
ESTRUTURAS PREFERIDAS: ${nicheConfig.preferredStructures.join(', ')}
TÉCNICAS-CHAVE: ${nicheConfig.keyTechniques.join(' | ')}
ESTILO DE LINGUAGEM: ${nicheConfig.languageStyle}

PRINCÍPIOS DE ROTEIROS EFICAZES:
1. Hook forte nos primeiros 3-5 segundos
2. Estrutura clara e progressiva (preferencialmente: ${nicheConfig.preferredStructures[0]})
3. Múltiplos pontos de interesse
4. Call to action claro no final
5. Tom apropriado para o nicho ${nicheConfig.name}`;

  // Descrições detalhadas de cada estilo
  const styleInstructions: Record<ScriptGenerationParams['style'], string> = {
    educational: `ESTILO EDUCACIONAL - Instruções Específicas:
- Foco em ENSINAR e EXPLICAR conceitos claramente
- Use exemplos práticos e analogias
- Estruture: Problema → Solução → Aplicação
- Use linguagem didática mas acessível
- Inclua "como fazer" e "passo a passo"
- Termine com resumo ou principais pontos aprendidos
- Evite jargões complexos sem explicar`,
    
    entertaining: `ESTILO ENTERTENIMENTO - Instruções Específicas:
- Foco em DIVERTIR e ENGAJAR emocionalmente
- Use humor, surpresas e momentos "wow"
- Estruture: Hook impactante → Desenvolvimento divertido → Clímax emocional
- Use linguagem descontraída e expressiva
- Inclua elementos visuais descritivos (para edição)
- Termine com momento memorável ou piada
- Mantenha energia alta e ritmo rápido`,
    
    promotional: `ESTILO PROMOCIONAL - Instruções Específicas:
- Foco em VENDER e CRIAR DESEJO
- Use gatilhos mentais: escassez, autoridade, prova social
- Estruture: Problema/Dor → Solução/Benefício → Prova → CTA
- Use linguagem persuasiva e que desperte desejo
- Inclua benefícios específicos e transformações
- Termine com call-to-action claro e urgente
- Use números, resultados e depoimentos quando possível`,
    
    documentary: `ESTILO DOCUMENTÁRIO - Instruções Específicas:
- Foco em CONTAR HISTÓRIA REAL e INFORMAR
- Use narrativa cronológica ou temática
- Estruture: Contexto → Desenvolvimento → Revelação/Conclusão
- Use linguagem autêntica e respeitosa
- Inclua fatos, dados e contexto histórico
- Termine com reflexão ou mensagem final
- Mantenha tom sério mas envolvente`,
  };

  // Descrições detalhadas de cada tom
  const toneInstructions: Record<ScriptGenerationParams['tone'], string> = {
    casual: `TOM CASUAL:
- Linguagem: Conversacional, como falar com um amigo
- Pronomes: Use "você", "a gente", "nós"
- Contração: Pode usar "pra", "pro", "tá"
- Exemplos: "Você já parou pra pensar...", "A gente sempre...", "Olha só que interessante..."`,
    
    formal: `TOM FORMAL:
- Linguagem: Profissional e respeitosa
- Pronomes: Use "você" ou "o(a) senhor(a)"
- Evite: Gírias e contrações excessivas
- Exemplos: "É importante considerar...", "Recomendamos que...", "De acordo com estudos..."`,
    
    energetic: `TOM ENERGÉTICO:
- Linguagem: Animada, com exclamações e entusiasmo
- Ritmo: Frases curtas e dinâmicas
- Exemplos: "Incrível!", "Olha só isso!", "Você não vai acreditar!", "É isso aí!"`,
    
    calm: `TOM CALMO:
- Linguagem: Tranquila e serena
- Ritmo: Mais pausado e reflexivo
- Exemplos: "Vamos pensar juntos...", "Deixe-me compartilhar...", "É interessante observar..."`,
  };

  let prompt = `Crie um ROTEIRO DE VÍDEO VIRAL otimizado para máximo engajamento e compartilhamento.

═══════════════════════════════════════════════════════════════
📋 ESPECIFICAÇÕES DO VÍDEO:
═══════════════════════════════════════════════════════════════
🎬 Tópico: "${params.topic}"
🎯 Nicho Detectado: ${nicheConfig.name}
⏱️ Duração: ${params.duration} segundos (CRÍTICO: respeitar exatamente)

═══════════════════════════════════════════════════════════════
🎨 ${styleInstructions[params.style]}

═══════════════════════════════════════════════════════════════
🎭 ${toneInstructions[params.tone]}

═══════════════════════════════════════════════════════════════
🎯 CONFIGURAÇÕES ESPECÍFICAS DO NICHO "${nicheConfig.name}":
═══════════════════════════════════════════════════════════════
📐 Estruturas Narrativas Preferidas:
${nicheConfig.preferredStructures.map(s => `- ${s}`).join('\n')}

🔑 Técnicas-Chave para Este Nicho:
${nicheConfig.keyTechniques.map(t => `- ${t}`).join('\n')}

💬 Estilo de Linguagem:
${nicheConfig.languageStyle}

🎣 Exemplos de Hooks Eficazes para Este Nicho:
${nicheConfig.hookExamples.map(e => `- ${e}`).join('\n')}

⚡ Orientação de Ritmo:
${nicheConfig.pacingGuidance}

📢 Estilo de CTA Recomendado:
${nicheConfig.ctaStyle}`;

  // Se houver insights virais, use-os para otimizar o roteiro
  if (params.viralInsights) {
    const { viralFactors, insights, editingRecommendations } = params.viralInsights;
    
    prompt += `

═══════════════════════════════════════════════════════════════
🔥 INSIGHTS DE VÍDEO VIRAL ANALISADO (REPLICAR ESTES PADRÕES):
═══════════════════════════════════════════════════════════════

📊 ANÁLISE DE VIRALIZAÇÃO:
${insights.whyItWentViral}

🎣 HOOK EFICAZ (Primeiros ${editingRecommendations.introDuration}s):
${viralFactors.hook}

⚡ RITMO COMPROVADO:
${editingRecommendations.pacing}

📐 ESTRUTURA NARRATIVA QUE FUNCIONOU:
${viralFactors.structure}

💡 GATILHOS EMOCIONAIS IDENTIFICADOS:
${viralFactors.emotionalTriggers.join(', ')}

🎯 PADRÕES REPLICÁVEIS:
${insights.contentPatterns.join('\n- ')}

📢 CALL TO ACTION EFICAZ:
${viralFactors.callToAction}

🎨 RECOMENDAÇÕES DE EDIÇÃO:
- Duração do intro: ${editingRecommendations.introDuration}s
- Estilo de música: ${editingRecommendations.musicStyle}
- Estilo visual: ${editingRecommendations.visualStyle}
- Transições: ${editingRecommendations.transitions.join(', ')}

═══════════════════════════════════════════════════════════════
🎯 INSTRUÇÕES CRÍTICAS PARA O ROTEIRO:
═══════════════════════════════════════════════════════════════

1. HOOK (Primeiros ${editingRecommendations.introDuration}s):
   - REPLIQUE o padrão identificado: "${viralFactors.hook}"
   - Crie curiosidade gap imediata
   - Use palavras/estrutura similar ao vídeo viral
   - Exemplo de estrutura: ${viralFactors.hook.substring(0, 100)}...

2. ESTRUTURA NARRATIVA:
   - Siga EXATAMENTE a estrutura "${viralFactors.structure}"
   - Adapte para o tópico "${params.topic}" mas mantenha o padrão
   - Cada segmento deve ter propósito claro na estrutura

3. RITMO E TIMING:
   - ${editingRecommendations.pacing}
   - Mude algo a cada 3-7 segundos (visual, tom, informação)
   - Mantenha energia alta especialmente nos primeiros 30%

4. GATILHOS EMOCIONAIS:
   - Incorpore: ${viralFactors.emotionalTriggers.join(', ')}
   - Cada segmento deve tocar em pelo menos uma emoção
   - Use linguagem que desperte essas emoções

5. PADRÕES DE CONTEÚDO:
   - Aplique: ${insights.contentPatterns.slice(0, 5).join(', ')}
   - Use técnicas específicas identificadas no vídeo viral

6. CALL TO ACTION:
   - Baseado em: "${viralFactors.callToAction}"
   - Adapte para o tópico mas mantenha a estratégia
   - Coloque nos últimos 5-10 segundos

═══════════════════════════════════════════════════════════════
⚠️ PRIORIDADE: Combine ESTILO "${params.style}" + TOM "${params.tone}" + Padrões Virais
═══════════════════════════════════════════════════════════════

IMPORTANTE: 
- REPLIQUE os padrões virais identificados
- MAS siga RIGOROSAMENTE o ESTILO "${params.style}": ${styleInstructions[params.style].split('\n')[0]}
- E use o TOM "${params.tone}" em TODO o roteiro: ${toneInstructions[params.tone].split('\n')[0]}
- Combine ambos: padrões virais + estilo/tom escolhidos
- Não seja genérico - seja ESPECÍFICO e use os padrões exatos que funcionaram
- Adapte para o tópico "${params.topic}" mantendo estilo, tom e padrões virais`;
  } else {
    prompt += `

═══════════════════════════════════════════════════════════════
🎬 ESTRUTURA RECOMENDADA PARA O NICHO "${nicheConfig.name}":
═══════════════════════════════════════════════════════════════

ESTRUTURA PREFERIDA: ${nicheConfig.preferredStructures[0]}

SEGMENTO 1 - HOOK (3-5 segundos):
- Use um dos exemplos de hook para este nicho:
${nicheConfig.hookExamples.map(e => `  • ${e}`).join('\n')}
- Crie "curiosidade gap" - faça o espectador querer saber mais
- Use linguagem específica do nicho ${nicheConfig.name}
- APLIQUE o ESTILO ${params.style}: ${styleInstructions[params.style].split('\n')[0]}
- Use o TOM ${params.tone}: ${toneInstructions[params.tone].split('\n')[0]}
- ${nicheConfig.languageStyle}

SEGMENTO 2 - SETUP/CONTEXTO (10-15% do vídeo):
- Estabeleça o contexto rapidamente usando técnicas do nicho
- Conecte com a experiência do público-alvo deste nicho
- Use exemplos específicos e concretos relevantes para ${nicheConfig.name}
- Mantenha ESTILO ${params.style}: ${styleInstructions[params.style].split('\n')[1]}
- Use TOM ${params.tone} consistentemente: ${toneInstructions[params.tone].split('\n')[0]}

SEGMENTO 3 - DESENVOLVIMENTO (60-70% do vídeo):
- Aplique as técnicas-chave do nicho:
${nicheConfig.keyTechniques.slice(0, 3).map(t => `  • ${t}`).join('\n')}
- Divida em 3-5 sub-segmentos com pontos-chave
- Cada sub-segmento: 10-20 segundos
- ${nicheConfig.pacingGuidance}
- Mude algo a cada segmento (tom, ritmo, informação)
- Use transições naturais entre ideias

SEGMENTO 4 - CLÍMAX/INSIGHT (10-15% do vídeo):
- Revele o insight principal ou conclusão
- Crie momento "aha!" ou surpresa
- Use linguagem memorável e específica do nicho

SEGMENTO 5 - CTA/CONCLUSÃO (5-10 segundos):
- ${nicheConfig.ctaStyle}
- ${styleInstructions[params.style].split('\n').find(l => l.includes('Termine')) || 'Termine com CTA claro'}
- Use TOM ${params.tone} no CTA: ${toneInstructions[params.tone].split('\n')[0]}
- Reforce o valor principal para o nicho ${nicheConfig.name}
- Deixe o espectador querendo mais

═══════════════════════════════════════════════════════════════
⚠️ LEMBRE-SE: Todo o roteiro deve seguir:
- ESTILO: ${params.style} - ${styleInstructions[params.style].split('\n')[0]}
- TOM: ${params.tone} - ${toneInstructions[params.tone].split('\n')[0]}
- NICHО: ${nicheConfig.name} - ${nicheConfig.languageStyle}`;
  }

  prompt += `

═══════════════════════════════════════════════════════════════
📐 REGRAS DE ESTRUTURA OBRIGATÓRIAS:
═══════════════════════════════════════════════════════════════

1. PRIMEIRO SEGMENTO (Hook - 3-8s):
   - DEVE criar "curiosidade gap" imediata
   - DEVE mencionar benefício/resultado específico (com números quando possível)
   - DEVE usar linguagem que desperte interesse
   - NÃO use: "Neste vídeo vou falar sobre...", "Vou explicar...", "É interessante..."
   - USE: "Você já se perguntou por que [resultado específico]?", "Esta estratégia gerou [número] em [tempo]..."

2. SEGMENTOS INTERMEDIÁRIOS (60-70% do vídeo):
   - Cada segmento DEVE ter um ponto específico e claro
   - Use transições naturais: "Agora que você entendeu X, vamos para Y"
   - Mude ritmo a cada 3-7 segundos (novo ponto, nova informação, nova emoção)
   - Adicione "dopamina hits": surpresas, revelações, insights inesperados
   - Seja ESPECÍFICO: use números, exemplos concretos, detalhes

3. ÚLTIMO SEGMENTO (CTA - 5-10s):
   - DEVE ter call-to-action claro e específico
   - DEVE criar urgência ou desejo de ação
   - NÃO use: "Se gostou, curta e se inscreva" (genérico demais)
   - USE: "Teste [ação específica] e me conte o resultado nos comentários", "Aplique [técnica] hoje e veja a diferença"

═══════════════════════════════════════════════════════════════
📝 FORMATO DE RESPOSTA (OBRIGATÓRIO):
═══════════════════════════════════════════════════════════════

Para cada segmento, forneça:
- id: Identificador único (ex: "seg-1", "seg-2")
- text: Texto COMPLETO e ESPECÍFICO do narrador/apresentador (não use placeholders genéricos)
- duration: Duração EXATA em segundos (soma total deve ser ${params.duration}s)
- timestamp: Tempo de início em segundos (0 para o primeiro, acumulativo)
- type: "intro" | "content" | "outro" | "transition"

REGRAS CRÍTICAS:
1. A SOMA de todas as durações DEVE ser exatamente ${params.duration} segundos
2. O texto deve ser ESPECÍFICO e PRONTO PARA USO (não genérico)
3. Cada segmento deve ter propósito claro na narrativa
4. Use transições naturais entre segmentos
5. O primeiro segmento (intro) deve ter hook forte
6. O último segmento (outro) deve ter CTA claro

EXEMPLOS CONCRETOS DE QUALIDADE POR NICHO:

NICHO: Marketing/Negócios
❌ RUIM: "Vou falar sobre marketing digital"
✅ BOM: "Empresas que usam esta estratégia aumentam conversão em 340%. Vou te mostrar exatamente como replicar isso em 3 passos simples."

NICHO: Educação
❌ RUIM: "Vou explicar como funciona"
✅ BOM: "95% das pessoas não sabem que este método pode reduzir tempo de aprendizado em 60%. Descubra o segredo que professores top usam."

NICHO: Entretenimento
❌ RUIM: "Isso é interessante"
✅ BOM: "Você não vai acreditar no que aconteceu quando testei isso. O resultado mudou TUDO que eu pensava sobre [tópico]."

NICHO: Saúde/Fitness
❌ RUIM: "Vou falar sobre exercícios"
✅ BOM: "Este treino queima 450 calorias em 20 minutos. E o melhor: você pode fazer em casa, sem equipamentos. Vou te mostrar agora."

REGRAS DE QUALIDADE:
- SEMPRE use números específicos quando possível
- SEMPRE mencione benefício/resultado concreto
- NUNCA use frases genéricas como "é interessante" ou "vou falar sobre"
- SEMPRE crie curiosidade gap no hook

Retorne APENAS um objeto JSON com esta estrutura EXATA:
{
  "segments": [
    {
      "id": "seg-1",
      "text": "Texto completo e específico do segmento, pronto para narração",
      "duration": 5,
      "timestamp": 0,
      "type": "intro"
    },
    {
      "id": "seg-2",
      "text": "Próximo segmento com conteúdo específico...",
      "duration": 8,
      "timestamp": 5,
      "type": "content"
    }
    ...
  ]
}

IMPORTANTE: 
- O campo "segments" DEVE ser um ARRAY
- A soma de todas as durações DEVE ser ${params.duration}
- Cada "text" deve ser texto completo e específico, não descrição genérica`;

  // Função para calcular temperature otimizada baseada no contexto
  const getOptimalTemperature = (params: ScriptGenerationParams): number => {
    // Mais criativo para entretenimento (precisa ser divertido e surpreendente)
    if (params.style === 'entertaining') return 0.85;
    
    // Mais consistente para educacional (precisa ser preciso e didático)
    if (params.style === 'educational') return 0.65;
    
    // Mais criativo quando há insights virais (replicar padrões virais)
    if (params.viralInsights) return 0.8;
    
    // Mais criativo para promocional (precisa ser persuasivo)
    if (params.style === 'promotional') return 0.75;
    
    // Documentário: balanceado
    if (params.style === 'documentary') return 0.7;
    
    // Default
    return 0.7;
  };

  // Calcular max_tokens baseado na duração (aproximadamente 30 tokens por segundo)
  const estimatedTokens = Math.max(2000, params.duration * 30);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: getOptimalTemperature(params),
      max_tokens: estimatedTokens, // Garante tokens suficientes para roteiros longos
      top_p: 0.95, // Permite mais diversidade nas escolhas
      presence_penalty: 0.1, // Incentiva usar palavras novas
      frequency_penalty: 0.1, // Evita repetição excessiva
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('Resposta vazia da OpenAI');

    const parsed = JSON.parse(response);
    let segments = parsed.segments || parsed;

    // Garantir que segments é um array
    if (!Array.isArray(segments)) {
      // Se não for array, tentar extrair de diferentes formatos possíveis
      if (typeof segments === 'object' && segments !== null) {
        // Pode estar em formato { script: [...] } ou { data: [...] }
        segments = (segments as any).script || (segments as any).data || Object.values(segments);
      }
      
      // Se ainda não for array, criar um array vazio ou lançar erro
      if (!Array.isArray(segments)) {
        console.error('Resposta da OpenAI não contém array de segments:', parsed);
        throw new Error('Formato de resposta inválido da OpenAI. Esperado array de segments.');
      }
    }

    // Garantir formato correto e validar
    const formattedSegments = segments.map((seg: any, index: number) => {
      const text = seg.text || seg.content || seg.description || '';
      
      // Validar que o texto não está vazio ou genérico
      if (!text || text.length < 10) {
        console.warn(`Segmento ${index} tem texto muito curto ou vazio:`, text);
      }
      
      return {
        id: seg.id || `seg-${Date.now()}-${index}`,
        text: text || `[Segmento ${index + 1} - Edite este texto]`,
        duration: Math.max(3, Math.min(seg.duration || 5, 30)), // Entre 3 e 30 segundos
        timestamp: seg.timestamp !== undefined 
          ? seg.timestamp 
          : segments.slice(0, index).reduce((acc: number, s: any) => acc + Math.max(3, Math.min(s.duration || 5, 30)), 0),
        type: seg.type || (index === 0 ? 'intro' : index === segments.length - 1 ? 'outro' : 'content'),
      };
    }) as ScriptSegment[];

    // Validar duração total
    const totalDuration = formattedSegments.reduce((sum, seg) => sum + seg.duration, 0);
    const durationDiff = Math.abs(totalDuration - params.duration);
    
    if (durationDiff > 5) {
      console.warn(`⚠️ Duração total (${totalDuration}s) difere da solicitada (${params.duration}s) em ${durationDiff}s`);
      
      // Ajustar proporcionalmente se a diferença for grande
      if (durationDiff > 10) {
        const scale = params.duration / totalDuration;
        formattedSegments.forEach(seg => {
          seg.duration = Math.round(seg.duration * scale);
        });
        
        // Recalcular timestamps
        let currentTime = 0;
        formattedSegments.forEach(seg => {
          seg.timestamp = currentTime;
          currentTime += seg.duration;
        });
      }
    }

    return formattedSegments;
  } catch (error) {
    console.error('Erro ao gerar roteiro:', error);
    throw error;
  }
}

/**
 * Gera um roteiro otimizado baseado diretamente em um diagnóstico viral
 */
export async function generateScriptFromViralDiagnosis(
  topic: string,
  duration: number,
  diagnosis: ViralDiagnosis
): Promise<ScriptSegment[]> {
  return generateScript({
    topic,
    duration,
    style: 'entertaining', // Pode ser ajustado depois
    tone: 'casual', // Pode ser ajustado depois
    viralInsights: {
      viralFactors: diagnosis.viralFactors,
      insights: diagnosis.insights,
      editingRecommendations: diagnosis.editingRecommendations,
    },
  });
}

