import { VideoClip, ScriptSegment } from '@/app/types';

/**
 * Sincroniza imagens com narração/legendas ajustando durações
 */
export function syncMediaWithNarration(
  clips: VideoClip[],
  segments: ScriptSegment[]
): VideoClip[] {
  // Criar mapa de segmentos por timestamp
  const segmentMap = new Map<number, ScriptSegment>();
  segments.forEach(seg => {
    segmentMap.set(seg.timestamp, seg);
  });

  // Ajustar clips para corresponder à duração dos segmentos
  return clips.map((clip, index) => {
    // Encontrar segmento correspondente
    const segment = segments.find(
      seg => seg.timestamp <= clip.startTime && seg.timestamp + seg.duration >= clip.startTime
    ) || segments[index];

    if (segment) {
      const newDuration = segment.duration;
      return {
        ...clip,
        duration: newDuration,
        endTime: clip.startTime + newDuration,
      };
    }

    return clip;
  });
}

/**
 * Sincroniza legendas com áudio
 */
export function syncCaptionsWithAudio(
  captions: Array<{ text: string; startTime: number; endTime: number }>,
  audioSegments: ScriptSegment[]
): Array<{ text: string; startTime: number; endTime: number }> {
  return captions.map((caption, index) => {
    const segment = audioSegments[index];
    if (segment) {
      return {
        ...caption,
        startTime: segment.timestamp,
        endTime: segment.timestamp + segment.duration,
      };
    }
    return caption;
  });
}

/**
 * Ajusta durações de imagens para corresponder ao tempo de narração
 */
export function adjustImageDurationsForNarration(
  clips: VideoClip[],
  narrationSegments: ScriptSegment[]
): VideoClip[] {
  let currentTime = 0;

  return clips.map((clip, index) => {
    const segment = narrationSegments[index];
    
    if (segment && clip.type === 'image') {
      const newDuration = segment.duration;
      const newClip = {
        ...clip,
        startTime: currentTime,
        duration: newDuration,
        endTime: currentTime + newDuration,
      };
      currentTime += newDuration;
      return newClip;
    }

    const clipDuration = clip.endTime - clip.startTime;
    currentTime += clipDuration;
    return {
      ...clip,
      startTime: currentTime - clipDuration,
      endTime: currentTime,
    };
  });
}

