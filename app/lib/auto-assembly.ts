import { VideoClip, ScriptSegment } from '@/app/types';
import { GeneratedImage } from './ai-image-generation';
import { MediaAsset } from './ai-media-selector';

export interface AssemblyConfig {
  autoSequence: boolean;
  autoTransitions: boolean;
  autoSync: boolean;
  defaultImageDuration: number;
  transitionDuration: number;
}

const DEFAULT_CONFIG: AssemblyConfig = {
  autoSequence: true,
  autoTransitions: true,
  autoSync: true,
  defaultImageDuration: 5,
  transitionDuration: 0.5,
};

/**
 * Sequencia imagens automaticamente na ordem do roteiro
 */
export function sequenceImages(
  images: Array<{ url: string; segmentId: string; duration?: number }>,
  segments: ScriptSegment[],
  config: Partial<AssemblyConfig> = {}
): VideoClip[] {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const clips: VideoClip[] = [];
  let currentTime = 0;

  // Ordenar segmentos por timestamp
  const sortedSegments = [...segments].sort((a, b) => a.timestamp - b.timestamp);

  sortedSegments.forEach((segment, index) => {
    const image = images.find(img => img.segmentId === segment.id);
    if (!image) return;

    const duration = image.duration || segment.duration || finalConfig.defaultImageDuration;
    const clip: VideoClip = {
      id: `auto-seq-${segment.id}-${Date.now()}`,
      source: image.url,
      type: 'image',
      startTime: currentTime,
      endTime: currentTime + duration,
    };

    clips.push(clip);
    currentTime += duration;

    // Adicionar transição se configurado e não for o último
    if (finalConfig.autoTransitions && index < sortedSegments.length - 1) {
      currentTime += finalConfig.transitionDuration;
    }
  });

  return clips;
}

/**
 * Aplica transições automáticas entre clips
 */
export function applyAutoTransitions(
  clips: VideoClip[],
  transitionDuration: number = 0.5
): VideoClip[] {
  return clips.map((clip, index) => {
    if (index === 0) return clip;

    return {
      ...clip,
      effects: [
        ...(clip.effects || []),
        `transition:fade:${transitionDuration}`,
      ],
    };
  });
}

/**
 * Monta vídeo completo automaticamente
 */
export function autoAssembleVideo(
  images: Array<{ url: string; segmentId: string; duration?: number }>,
  segments: ScriptSegment[],
  config: Partial<AssemblyConfig> = {}
): VideoClip[] {
  let clips = sequenceImages(images, segments, config);

  if (config.autoTransitions !== false) {
    clips = applyAutoTransitions(clips, config.transitionDuration);
  }

  return clips;
}

