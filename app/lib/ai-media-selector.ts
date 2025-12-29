import { ScriptSegment } from '@/app/types';
import { searchMedia } from './media-search';

export interface MediaAsset {
  id: string;
  src: string;
  thumbnail: string;
  alt: string;
  type: 'image' | 'video';
  provider: 'pexels' | 'unsplash' | 'upload';
  duration?: number;
}
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface MediaSuggestion {
  segmentId: string;
  segmentText: string;
  suggestions: MediaAsset[];
  keywords: string[];
  confidence: number;
}

/**
 * Gera sugestões de mídia baseadas no conteúdo do roteiro
 */
export async function suggestMediaForScript(
  segments: ScriptSegment[]
): Promise<MediaSuggestion[]> {
  if (segments.length === 0) return [];

  try {
    // Analisar cada segmento e extrair keywords
    const segmentAnalyses = await Promise.all(
      segments.map(async (segment) => {
        const prompt = `Analise este texto de roteiro de vídeo e sugira:
1. 3-5 palavras-chave (keywords) para buscar imagens/vídeos relevantes
2. Tipo de mídia mais adequado (image ou video)
3. Estilo visual sugerido (ex: profissional, casual, moderno, etc)

Texto: "${segment.text}"

Retorne APENAS um JSON:
{
  "keywords": ["palavra1", "palavra2", "palavra3"],
  "mediaType": "image" ou "video",
  "style": "descrição do estilo",
  "confidence": 0.0 a 1.0
}`;

        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Você é um especialista em seleção de mídia para vídeos. Suas sugestões melhoram o engajamento visual.',
              },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
          });

          const response = completion.choices[0]?.message?.content;
          if (!response) {
            // Fallback: extrair palavras-chave simples
            const words = segment.text
              .toLowerCase()
              .replace(/[^\w\s]/g, '')
              .split(/\s+/)
              .filter((w) => w.length > 3)
              .slice(0, 5);
            return {
              keywords: words,
              mediaType: 'image' as const,
              style: 'profissional',
              confidence: 0.5,
            };
          }

          const parsed = JSON.parse(response);
          return {
            keywords: parsed.keywords || [],
            mediaType: parsed.mediaType || 'image',
            style: parsed.style || 'profissional',
            confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
          };
        } catch (error) {
          console.error('Erro ao analisar segmento:', error);
          // Fallback
          const words = segment.text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter((w) => w.length > 3)
            .slice(0, 5);
          return {
            keywords: words,
            mediaType: 'image' as const,
            style: 'profissional',
            confidence: 0.5,
          };
        }
      })
    );

    // Buscar mídia para cada segmento
    const suggestions = await Promise.all(
      segments.map(async (segment, index) => {
        const analysis = segmentAnalyses[index];
        const query = analysis.keywords.join(' ');
        
        if (!query) {
          return {
            segmentId: segment.id,
            segmentText: segment.text,
            suggestions: [],
            keywords: [],
            confidence: 0,
          };
        }

        try {
          const mediaResults = await searchMedia(
            query,
            analysis.mediaType === 'video' ? 'video' : 'image'
          );
          
          // Converter MediaItem para MediaAsset
          const media: MediaAsset[] = mediaResults.map((item: any) => ({
            id: item.id || `media-${Date.now()}-${Math.random()}`,
            src: item.url || item.src,
            thumbnail: item.thumbnail || item.url || item.src,
            alt: item.alt || query,
            type: item.type,
            provider: item.source || 'pexels',
            duration: item.duration,
          }));

          return {
            segmentId: segment.id,
            segmentText: segment.text,
            suggestions: media.slice(0, 5), // Top 5
            keywords: analysis.keywords,
            confidence: analysis.confidence,
          };
        } catch (error) {
          console.error('Erro ao buscar mídia:', error);
          return {
            segmentId: segment.id,
            segmentText: segment.text,
            suggestions: [],
            keywords: analysis.keywords,
            confidence: analysis.confidence,
          };
        }
      })
    );

    return suggestions;
  } catch (error) {
    console.error('Erro ao gerar sugestões de mídia:', error);
    return [];
  }
}

/**
 * Aplica mídia sugerida automaticamente na timeline
 */
export function applySuggestedMedia(
  suggestions: MediaSuggestion[],
  selectedMedia: Map<string, MediaAsset>
): { source: string; type: 'image' | 'video'; duration: number }[] {
  return suggestions
    .filter((s) => selectedMedia.has(s.segmentId))
    .map((s) => {
      const media = selectedMedia.get(s.segmentId)!;
      return {
        source: media.src,
        type: media.type,
        duration: media.duration || 5, // Default 5s para imagens
      };
    });
}

