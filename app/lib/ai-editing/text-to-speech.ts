import { ScriptSegment } from '@/app/types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface NarrationSegment {
  id: string;
  scriptSegmentId: string;
  audioUrl: string;
  duration: number;
  text: string;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

/**
 * Gera narração TTS para o roteiro
 */
export async function generateNarration(
  script: ScriptSegment[],
  voice: 'male' | 'female' | 'energetic' | 'calm' = 'male'
): Promise<NarrationSegment[]> {
  if (script.length === 0) {
    return [];
  }

  // Mapear voz escolhida para voz OpenAI
  const voiceMap: Record<string, 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'> = {
    male: 'onyx',
    female: 'nova',
    energetic: 'echo',
    calm: 'alloy',
  };

  const openaiVoice = voiceMap[voice] || 'onyx';

  const segments: NarrationSegment[] = [];

  try {
    // Gerar narração para cada segmento
    for (const segment of script) {
      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: openaiVoice,
        input: segment.text,
        speed: 1.0, // Velocidade normal
      });

      // Converter resposta para blob URL
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);

      // Estimar duração (aproximada, baseada no texto)
      // TTS geralmente fala ~150 palavras por minuto
      const words = segment.text.split(/\s+/).length;
      const estimatedDuration = (words / 150) * 60; // segundos

      segments.push({
        id: `narration-${segment.id}`,
        scriptSegmentId: segment.id,
        audioUrl,
        duration: estimatedDuration,
        text: segment.text,
        voice: openaiVoice,
      });
    }

    return segments;
  } catch (error) {
    console.error('Erro ao gerar narração:', error);
    throw error;
  }
}

/**
 * Gera narração completa de uma vez (mais eficiente)
 */
export async function generateNarrationComplete(
  script: ScriptSegment[],
  voice: 'male' | 'female' | 'energetic' | 'calm' = 'male'
): Promise<{ audioUrl: string; duration: number }> {
  if (script.length === 0) {
    throw new Error('Roteiro vazio');
  }

  const voiceMap: Record<string, 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'> = {
    male: 'onyx',
    female: 'nova',
    energetic: 'echo',
    calm: 'alloy',
  };

  const openaiVoice = voiceMap[voice] || 'onyx';
  const fullText = script.map((s) => s.text).join(' ');

  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: openaiVoice,
      input: fullText,
      speed: 1.0,
    });

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(blob);

    // Estimar duração total
    const totalWords = fullText.split(/\s+/).length;
    const estimatedDuration = (totalWords / 150) * 60;

    return {
      audioUrl,
      duration: estimatedDuration,
    };
  } catch (error) {
    console.error('Erro ao gerar narração completa:', error);
    throw error;
  }
}

