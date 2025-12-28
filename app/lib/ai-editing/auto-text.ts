import { ScriptSegment } from '@/app/types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  position: 'top' | 'center' | 'bottom';
  style: {
    fontSize: number;
    color: string;
    backgroundColor?: string;
    animation?: 'fade-in' | 'slide-up' | 'zoom-in' | 'none';
  };
  reason: string;
  confidence: number;
}

/**
 * Gera textos sobrepostos baseados no roteiro
 */
export async function suggestTextOverlays(
  script: ScriptSegment[],
  videoDuration: number
): Promise<TextOverlay[]> {
  if (script.length === 0) {
    return [];
  }

  const scriptText = script.map((seg, index) => 
    `[${index + 1}] ${seg.text} (${seg.timestamp}s - ${seg.timestamp + seg.duration}s)`
  ).join('\n');

  const prompt = `Você é um editor de vídeo especialista em textos sobrepostos. Analise o roteiro e sugira textos que devem aparecer sobre o vídeo.

ROTEIRO:
${scriptText}

DURAÇÃO TOTAL: ${videoDuration}s

Sugira textos que:
1. Destacam pontos-chave importantes
2. Reforçam mensagens principais
3. Melhoram compreensão
4. Aumentam engajamento

Para cada texto, forneça:
- text: Texto a exibir (curto, impactante, máximo 50 caracteres)
- startTime: Quando começar (em segundos)
- endTime: Quando terminar (em segundos)
- position: Onde posicionar (top, center, bottom)
- fontSize: Tamanho da fonte (24 a 72)
- color: Cor do texto (hex, ex: #FFFFFF)
- backgroundColor: Cor de fundo opcional (hex ou transparente)
- animation: Animação de entrada (fade-in, slide-up, zoom-in, none)
- reason: Razão específica
- confidence: Confiança de 0 a 1

REGRAS:
- Textos devem ser curtos e impactantes
- Não sobrepor muitos textos ao mesmo tempo
- Posicionar estrategicamente (top para títulos, bottom para CTAs)
- Usar animações sutis

Retorne APENAS um JSON array:
[
  {
    "id": "text-1",
    "text": "Ponto Principal",
    "startTime": 5.0,
    "endTime": 8.0,
    "position": "center",
    "style": {
      "fontSize": 48,
      "color": "#FFFFFF",
      "backgroundColor": "rgba(0,0,0,0.7)",
      "animation": "fade-in"
    },
    "reason": "Destaca o ponto principal do segmento",
    "confidence": 0.9
  }
]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um designer gráfico especializado em textos sobrepostos em vídeos. Suas sugestões melhoram clareza e engajamento visual.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return [];

    const parsed = JSON.parse(response);
    const texts = parsed.texts || parsed.overlays || parsed;

    // Validar e formatar
    return (Array.isArray(texts) ? texts : [texts])
      .filter((t: any) => t.text && t.startTime !== undefined)
      .map((t: any, index: number) => ({
        id: t.id || `text-${Date.now()}-${index}`,
        text: String(t.text).substring(0, 50), // Limitar tamanho
        startTime: Math.max(0, Number(t.startTime || 0)),
        endTime: Math.min(videoDuration, Number(t.endTime || t.startTime + 3)),
        position: (t.position || 'bottom') as 'top' | 'center' | 'bottom',
        style: {
          fontSize: Math.min(72, Math.max(24, Number(t.style?.fontSize || 32))),
          color: t.style?.color || '#FFFFFF',
          backgroundColor: t.style?.backgroundColor || 'rgba(0,0,0,0.7)',
          animation: (t.style?.animation || 'fade-in') as any,
        },
        reason: t.reason || 'Texto sugerido para destacar informação',
        confidence: Math.min(1, Math.max(0, Number(t.confidence || 0.7))),
      })) as TextOverlay[];
  } catch (error) {
    console.error('Erro ao gerar sugestões de texto:', error);
    return [];
  }
}

