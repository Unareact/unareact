import OpenAI from 'openai';
import { ScriptSegment, ScriptGenerationParams, ViralDiagnosis } from '@/app/types';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Apenas para desenvolvimento
});

export async function generateScript(params: ScriptGenerationParams): Promise<ScriptSegment[]> {
  let prompt = `Crie um roteiro de vídeo ${params.style} com tom ${params.tone} sobre "${params.topic}".

O vídeo deve ter aproximadamente ${params.duration} segundos.`;

  // Se houver insights virais, use-os para otimizar o roteiro
  if (params.viralInsights) {
    const { viralFactors, insights, editingRecommendations } = params.viralInsights;
    
    prompt += `

═══════════════════════════════════════════════════════════════
🎯 INSIGHTS DE VÍDEOS VIRAIS PARA OTIMIZAÇÃO:
═══════════════════════════════════════════════════════════════

📊 POR QUE VIRALIZOU:
${insights.whyItWentViral}

🎣 HOOK EFICAZ (Primeiros ${editingRecommendations.introDuration}s):
${viralFactors.hook}

⚡ RITMO RECOMENDADO:
${editingRecommendations.pacing}

📐 ESTRUTURA QUE FUNCIONA:
${viralFactors.structure}

💡 GATILHOS EMOCIONAIS:
${viralFactors.emotionalTriggers.join(', ')}

🎯 PADRÕES DE CONTEÚDO QUE FUNCIONAM:
${insights.contentPatterns.join('\n- ')}

📢 CALL TO ACTION EFICAZ:
${viralFactors.callToAction}

═══════════════════════════════════════════════════════════════
🎬 INSTRUÇÕES PARA O ROTEIRO:
═══════════════════════════════════════════════════════════════

1. Use o HOOK identificado como inspiração para os primeiros ${editingRecommendations.introDuration} segundos
2. Siga a ESTRUTURA "${viralFactors.structure}" que funcionou no vídeo viral
3. Mantenha o RITMO sugerido: ${editingRecommendations.pacing}
4. Incorpore os GATILHOS EMOCIONAIS: ${viralFactors.emotionalTriggers.join(', ')}
5. Use um CTA similar ao que funcionou: ${viralFactors.callToAction}
6. Aplique os PADRÕES identificados: ${insights.contentPatterns.slice(0, 3).join(', ')}

IMPORTANTE: Adapte esses insights para o tópico "${params.topic}", mas mantenha os elementos que tornaram o vídeo viral eficaz.`;
  } else {
    prompt += `

Estruture o roteiro em segmentos claros com:
- Introdução cativante (5-10 segundos)
- Conteúdo principal dividido em partes lógicas
- Conclusão/CTA (5-10 segundos)`;
  }

  prompt += `

Para cada segmento, forneça:
- Texto do narrador/apresentador
- Duração estimada em segundos
- Tipo (intro, content, outro, transition)

Formate como JSON array de objetos com: id, text, duration, timestamp, type`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: params.viralInsights 
            ? 'Você é um especialista em criação de roteiros de vídeo virais. Use os insights fornecidos de vídeos que viralizaram para criar roteiros otimizados que replicam os padrões de sucesso.'
            : 'Você é um especialista em criação de roteiros de vídeo altamente eficazes e envolventes.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('Resposta vazia da OpenAI');

    const parsed = JSON.parse(response);
    const segments = parsed.segments || parsed;

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

