import OpenAI from 'openai';
import { ScriptSegment, ScriptGenerationParams, ViralDiagnosis } from '@/app/types';
import { detectNiche, getNicheConfig, type NicheConfig } from './niche-detector';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Apenas para desenvolvimento
});

export async function generateScript(params: ScriptGenerationParams): Promise<ScriptSegment[]> {
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

  let prompt = `Crie um ROTEIRO DE VÍDEO VIRAL otimizado para máximo engajamento e compartilhamento.

═══════════════════════════════════════════════════════════════
📋 ESPECIFICAÇÕES DO VÍDEO:
═══════════════════════════════════════════════════════════════
🎬 Tópico: "${params.topic}"
🎯 Nicho Detectado: ${nicheConfig.name}
⏱️ Duração: ${params.duration} segundos (CRÍTICO: respeitar exatamente)
🎨 Estilo: ${params.style}
🎭 Tom: ${params.tone}

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

IMPORTANTE: Este roteiro deve REPLICAR os padrões virais identificados, adaptando-os para "${params.topic}". Não seja genérico - seja ESPECÍFICO e use os padrões exatos que funcionaram.`;
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
- ${nicheConfig.languageStyle}

SEGMENTO 2 - SETUP/CONTEXTO (10-15% do vídeo):
- Estabeleça o contexto rapidamente usando técnicas do nicho
- Conecte com a experiência do público-alvo deste nicho
- Use exemplos específicos e concretos relevantes para ${nicheConfig.name}

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
- Reforce o valor principal para o nicho ${nicheConfig.name}
- Deixe o espectador querendo mais`;
  }

  prompt += `

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

EXEMPLO DE QUALIDADE:
❌ RUIM: "Fale sobre o tópico de forma interessante"
✅ BOM: "Você já se perguntou por que algumas pessoas conseguem resultados incríveis enquanto outras ficam estagnadas? A resposta está em um segredo que 95% das pessoas ignoram completamente."

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
      temperature: params.viralInsights ? 0.8 : 0.7, // Mais criativo quando há insights virais
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

    // Garantir formato correto
    return segments.map((seg: any, index: number) => ({
      id: seg.id || `seg-${Date.now()}-${index}`,
      text: seg.text || seg.content || '',
      duration: seg.duration || 5,
      timestamp: seg.timestamp || segments.slice(0, index).reduce((acc: number, s: any) => acc + (s.duration || 5), 0),
      type: seg.type || 'content',
    })) as ScriptSegment[];
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

