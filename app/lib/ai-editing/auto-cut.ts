import { VideoClip, ScriptSegment } from '@/app/types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface CutSuggestion {
  id: string;
  clipId: string;
  timestamp: number;
  reason: string;
  confidence: number;
  action: 'split' | 'trim-start' | 'trim-end' | 'remove';
}

/**
 * Analisa roteiro e vídeo para sugerir cortes automáticos
 */
export async function suggestAutoCuts(
  clips: VideoClip[],
  script: ScriptSegment[]
): Promise<CutSuggestion[]> {
  if (clips.length === 0 || script.length === 0) {
    return [];
  }

  // Preparar contexto para IA
  const scriptText = script.map((seg, index) => 
    `[${index + 1}] ${seg.text} (${seg.timestamp}s - ${seg.timestamp + seg.duration}s)`
  ).join('\n');

  const clipsInfo = clips.map((clip, index) => 
    `Clip ${index + 1}: ${clip.startTime}s - ${clip.endTime}s (${clip.type})`
  ).join('\n');

  const prompt = `Você é um editor de vídeo especialista. Analise o roteiro e os clips de vídeo e sugira pontos de corte ideais.

ROTEIRO:
${scriptText}

CLIPS:
${clipsInfo}

Sugira cortes que:
1. Sincronizem melhor o vídeo com o roteiro
2. Removam momentos vazios ou desnecessários
3. Melhorem o ritmo e fluxo do vídeo
4. Alinhem transições com mudanças no roteiro

Para cada sugestão, forneça:
- clipId: ID do clip afetado
- timestamp: Momento exato do corte (em segundos)
- reason: Razão do corte (específica e clara)
- confidence: Confiança de 0 a 1
- action: Tipo de ação (split, trim-start, trim-end, remove)

Retorne APENAS um JSON array com as sugestões:
[
  {
    "id": "cut-1",
    "clipId": "clip-id",
    "timestamp": 5.5,
    "reason": "Momento de pausa desnecessária que quebra o ritmo",
    "confidence": 0.85,
    "action": "split"
  }
]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um editor de vídeo profissional especializado em criar vídeos virais. Suas sugestões são precisas e baseadas em análise de ritmo, narrativa e engajamento.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Mais consistente para análise
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return [];

    const parsed = JSON.parse(response);
    const suggestions = parsed.suggestions || parsed.cuts || parsed;

    // Validar e formatar sugestões
    return (Array.isArray(suggestions) ? suggestions : [suggestions])
      .filter((s: any) => s.clipId && s.timestamp !== undefined)
      .map((s: any, index: number) => ({
        id: s.id || `cut-${Date.now()}-${index}`,
        clipId: s.clipId,
        timestamp: Number(s.timestamp),
        reason: s.reason || 'Corte sugerido para melhorar ritmo',
        confidence: Math.min(1, Math.max(0, Number(s.confidence || 0.7))),
        action: s.action || 'split',
      })) as CutSuggestion[];
  } catch (error) {
    console.error('Erro ao gerar sugestões de corte:', error);
    return [];
  }
}

/**
 * Aplica cortes aprovados aos clips
 */
export function applyCuts(
  clips: VideoClip[],
  approvedCuts: CutSuggestion[]
): VideoClip[] {
  let result = [...clips];

  // Ordenar cortes por timestamp (do último para o primeiro para não afetar índices)
  const sortedCuts = [...approvedCuts].sort((a, b) => b.timestamp - a.timestamp);

  for (const cut of sortedCuts) {
    const clipIndex = result.findIndex((c) => c.id === cut.clipId);
    if (clipIndex === -1) continue;

    const clip = result[clipIndex];

    switch (cut.action) {
      case 'split':
        // Dividir clip em dois
        const splitTime = cut.timestamp - clip.startTime;
        if (splitTime > 0.1 && splitTime < (clip.endTime - clip.startTime - 0.1)) {
          const firstPart: VideoClip = {
            ...clip,
            id: `${clip.id}-part1`,
            endTime: cut.timestamp,
          };
          const secondPart: VideoClip = {
            ...clip,
            id: `${clip.id}-part2`,
            startTime: cut.timestamp,
          };
          result.splice(clipIndex, 1, firstPart, secondPart);
        }
        break;

      case 'trim-start':
        // Cortar início do clip
        if (cut.timestamp > clip.startTime && cut.timestamp < clip.endTime) {
          result[clipIndex] = {
            ...clip,
            startTime: cut.timestamp,
          };
        }
        break;

      case 'trim-end':
        // Cortar fim do clip
        if (cut.timestamp > clip.startTime && cut.timestamp < clip.endTime) {
          result[clipIndex] = {
            ...clip,
            endTime: cut.timestamp,
          };
        }
        break;

      case 'remove':
        // Remover clip inteiro
        result.splice(clipIndex, 1);
        break;
    }
  }

  return result;
}

