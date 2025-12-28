import { VideoClip, ScriptSegment } from '@/app/types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export type TransitionType = 'fade' | 'wipe' | 'zoom' | 'slide' | 'dissolve' | 'none';

export interface Transition {
  id: string;
  fromClipId: string;
  toClipId: string;
  type: TransitionType;
  duration: number; // em segundos
  reason: string;
  confidence: number;
}

/**
 * Sugere transições inteligentes entre clips baseado no conteúdo
 */
export async function suggestTransitions(
  clips: VideoClip[],
  script: ScriptSegment[]
): Promise<Transition[]> {
  if (clips.length < 2) {
    return [];
  }

  // Preparar contexto
  const clipsInfo = clips.map((clip, index) => {
    const scriptSegment = script.find(
      (s) => s.timestamp >= clip.startTime && s.timestamp < clip.endTime
    );
    return {
      index,
      id: clip.id,
      type: clip.type,
      startTime: clip.startTime,
      endTime: clip.endTime,
      scriptText: scriptSegment?.text || '',
    };
  });

  const prompt = `Você é um editor de vídeo especialista em transições. Analise os clips e sugira transições ideais entre eles.

CLIPS:
${clipsInfo.map((c, i) => 
  `Clip ${i + 1} (${c.type}): ${c.scriptText || 'Sem roteiro'}`
).join('\n')}

Para cada transição entre clips consecutivos, sugira:
- type: Tipo de transição (fade, wipe, zoom, slide, dissolve, none)
- duration: Duração da transição em segundos (0.3 a 1.5)
- reason: Razão específica da escolha
- confidence: Confiança de 0 a 1

TIPOS DE TRANSIÇÃO:
- fade: Suave, universal, bom para mudanças de tema
- wipe: Dinâmico, bom para mudanças rápidas
- zoom: Impactante, bom para revelações
- slide: Moderno, bom para sequências
- dissolve: Clássico, bom para transições suaves
- none: Sem transição, bom para continuidade

Retorne APENAS um JSON array:
[
  {
    "id": "trans-1",
    "fromClipId": "clip-1-id",
    "toClipId": "clip-2-id",
    "type": "fade",
    "duration": 0.5,
    "reason": "Transição suave entre temas diferentes",
    "confidence": 0.85
  }
]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um editor de vídeo profissional especializado em transições cinematográficas. Suas sugestões melhoram o fluxo narrativo e engajamento visual.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return [];

    const parsed = JSON.parse(response);
    const transitions = parsed.transitions || parsed;

    // Validar e formatar
    return (Array.isArray(transitions) ? transitions : [transitions])
      .filter((t: any) => t.fromClipId && t.toClipId)
      .map((t: any, index: number) => ({
        id: t.id || `trans-${Date.now()}-${index}`,
        fromClipId: t.fromClipId,
        toClipId: t.toClipId,
        type: (t.type || 'fade') as TransitionType,
        duration: Math.min(1.5, Math.max(0.3, Number(t.duration || 0.5))),
        reason: t.reason || 'Transição sugerida para melhorar fluxo',
        confidence: Math.min(1, Math.max(0, Number(t.confidence || 0.7))),
      })) as Transition[];
  } catch (error) {
    console.error('Erro ao gerar sugestões de transição:', error);
    return [];
  }
}

/**
 * Aplica transições aprovadas
 */
export function applyTransitions(
  clips: VideoClip[],
  approvedTransitions: Transition[]
): VideoClip[] {
  // Adicionar informações de transição aos clips
  return clips.map((clip, index) => {
    if (index === 0) return clip;

    const transition = approvedTransitions.find(
      (t) => t.toClipId === clip.id
    );

    return {
      ...clip,
      effects: transition
        ? [...(clip.effects || []), `transition:${transition.type}:${transition.duration}`]
        : clip.effects,
    };
  });
}

