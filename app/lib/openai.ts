import OpenAI from 'openai';
import { ScriptSegment, ScriptGenerationParams } from '@/app/types';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Apenas para desenvolvimento
});

export async function generateScript(params: ScriptGenerationParams): Promise<ScriptSegment[]> {
  const prompt = `Crie um roteiro de vídeo ${params.style} com tom ${params.tone} sobre "${params.topic}".

O vídeo deve ter aproximadamente ${params.duration} segundos.

Estruture o roteiro em segmentos claros com:
- Introdução cativante (5-10 segundos)
- Conteúdo principal dividido em partes lógicas
- Conclusão/CTA (5-10 segundos)

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
          content: 'Você é um especialista em criação de roteiros de vídeo altamente eficazes e envolventes.',
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

