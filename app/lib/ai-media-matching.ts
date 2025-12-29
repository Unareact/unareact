import { ScriptSegment, VideoClip } from '@/app/types';
import { MediaAsset } from './ai-media-selector';
import { MediaSuggestion } from './ai-media-selector';

/**
 * Mapeia cada segmento do roteiro para mídia relevante
 */
export function matchMediaToSegments(
  segments: ScriptSegment[],
  suggestions: MediaSuggestion[],
  selectedMedia: Map<string, MediaAsset>
): Array<{ segment: ScriptSegment; media: MediaAsset; startTime: number }> {
  const matches: Array<{ segment: ScriptSegment; media: MediaAsset; startTime: number }> = [];
  let currentTime = 0;

  segments.forEach((segment) => {
    const suggestion = suggestions.find((s) => s.segmentId === segment.id);
    if (suggestion && selectedMedia.has(segment.id)) {
      const media = selectedMedia.get(segment.id)!;
      matches.push({
        segment,
        media,
        startTime: currentTime,
      });
    }
    currentTime += segment.duration;
  });

  return matches;
}

/**
 * Converte matches em clips para a timeline
 */
export function matchesToClips(
  matches: Array<{ segment: ScriptSegment; media: MediaAsset; startTime: number }>
): VideoClip[] {
  return matches.map((match, index) => {
    const duration = match.media.duration || match.segment.duration || 5;
    const endTime = match.startTime + duration;

    return {
      id: `clip-${match.segment.id}-${Date.now()}-${index}`,
      source: match.media.src,
      type: match.media.type,
      startTime: match.startTime,
      endTime,
      duration,
      thumbnail: match.media.thumbnail || match.media.src,
    };
  });
}

