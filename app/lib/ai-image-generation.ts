import OpenAI from 'openai';
import { ScriptSegment } from '@/app/types';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  segmentId: string;
  segmentText: string;
}

/**
 * Gera um prompt otimizado para DALL-E baseado no texto do segmento
 */
async function generateImagePrompt(segmentText: string): Promise<string> {
  const prompt = `Crie um prompt detalhado e otimizado para geração de imagem (DALL-E) baseado neste texto de roteiro de vídeo.

Texto: "${segmentText}"

O prompt deve:
- Ser específico e visual
- Incluir estilo (profissional, moderno, clean)
- Incluir composição (centro, plano médio, etc)
- Ser em inglês (para melhor resultado no DALL-E)
- Ter no máximo 100 palavras

Retorne APENAS o prompt, sem explicações.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em criação de prompts para geração de imagens por IA.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const generatedPrompt = completion.choices[0]?.message?.content?.trim();
    return generatedPrompt || `Professional illustration of: ${segmentText}`;
  } catch (error) {
    console.error('Erro ao gerar prompt:', error);
    return `Professional illustration of: ${segmentText}`;
  }
}

/**
 * Gera uma imagem usando DALL-E
 */
export async function generateImageWithDALLE(
  prompt: string,
  size: '256x256' | '512x512' | '1024x1024' = '1024x1024'
): Promise<string | null> {
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: size === '256x256' ? '1024x1024' : size === '512x512' ? '1024x1024' : '1024x1024', // DALL-E 3 só suporta 1024x1024
      quality: 'standard',
    });

    const imageUrl = response.data?.[0]?.url;
    return imageUrl || null;
  } catch (error) {
    console.error('Erro ao gerar imagem com DALL-E:', error);
    return null;
  }
}

/**
 * Gera imagens para múltiplos segmentos do roteiro
 */
export async function generateImagesForSegments(
  segments: ScriptSegment[]
): Promise<GeneratedImage[]> {
  const generatedImages: GeneratedImage[] = [];

  for (const segment of segments) {
    try {
      // Gerar prompt otimizado
      const imagePrompt = await generateImagePrompt(segment.text);
      
      // Gerar imagem
      const imageUrl = await generateImageWithDALLE(imagePrompt);
      
      if (imageUrl) {
        generatedImages.push({
          id: `img-${segment.id}-${Date.now()}`,
          url: imageUrl,
          prompt: imagePrompt,
          segmentId: segment.id,
          segmentText: segment.text,
        });
      }
    } catch (error) {
      console.error(`Erro ao gerar imagem para segmento ${segment.id}:`, error);
    }
  }

  return generatedImages;
}

/**
 * Gera uma única imagem para um segmento específico
 */
export async function generateImageForSegment(
  segment: ScriptSegment
): Promise<GeneratedImage | null> {
  try {
    const imagePrompt = await generateImagePrompt(segment.text);
    const imageUrl = await generateImageWithDALLE(imagePrompt);
    
    if (!imageUrl) return null;

    return {
      id: `img-${segment.id}-${Date.now()}`,
      url: imageUrl,
      prompt: imagePrompt,
      segmentId: segment.id,
      segmentText: segment.text,
    };
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    return null;
  }
}

