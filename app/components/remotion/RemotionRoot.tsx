'use client';

import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';
import { VideoClip, ScriptSegment } from '@/app/types';

interface RemotionRootProps {
  clips: VideoClip[];
  script: ScriptSegment[];
  transitions?: Array<{
    type: 'fade' | 'wipe' | 'zoom' | 'slide';
    duration: number;
  }>;
  captions?: Array<{
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    style?: {
      fontSize?: number;
      color?: string;
      position?: 'top' | 'center' | 'bottom';
    };
  }>;
}

export const RemotionRoot: React.FC<RemotionRootProps> = ({
  clips,
  script,
  transitions,
  captions,
}) => {
  // Calcular duração total em frames (30fps)
  const totalDuration = clips.length > 0
    ? Math.max(...clips.map((c) => c.endTime))
    : 60; // Default 60 segundos

  const fps = 30;
  const durationInFrames = Math.ceil(totalDuration * fps);

  return (
    <Composition
      id="VideoComposition"
      component={VideoComposition}
      durationInFrames={durationInFrames}
      fps={fps}
      width={1920}
      height={1080}
      defaultProps={{
        clips,
        script,
        transitions: transitions || [],
        captions: captions || [],
      }}
    />
  );
};

