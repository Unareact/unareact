'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { VideoClip, ScriptSegment } from '@/app/types';

interface VideoCompositionProps {
  clips: VideoClip[];
  script: ScriptSegment[];
  transitions?: Transition[];
  captions?: Caption[];
}

interface Transition {
  type: 'fade' | 'wipe' | 'zoom' | 'slide';
  duration: number;
}

interface Caption {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style?: {
    fontSize?: number;
    color?: string;
    position?: 'top' | 'center' | 'bottom';
  };
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  clips,
  script,
  transitions = [],
  captions = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const currentTime = frame / fps;

  // Encontrar clip atual baseado no tempo
  const currentClip = clips.find(
    (clip) => currentTime >= clip.startTime && currentTime < clip.endTime
  );

  // Encontrar legendas ativas
  const activeCaptions = captions.filter(
    (caption) => currentTime >= caption.startTime && currentTime < caption.endTime
  );

  // Calcular transição
  const getTransitionOpacity = (clipIndex: number): number | { opacity: number; scale: number } => {
    if (clipIndex === 0) return 1;
    
    const transition = transitions[clipIndex - 1];
    if (!transition) return 1;

    const clip = clips[clipIndex];
    if (!clip) return 1;

    const transitionStart = clip.startTime - transition.duration;
    const transitionEnd = clip.startTime;

    if (currentTime < transitionStart) return 0;
    if (currentTime > transitionEnd) return 1;

    const progress = (currentTime - transitionStart) / transition.duration;
    
    switch (transition.type) {
      case 'fade':
        return interpolate(progress, [0, 1], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
      case 'zoom':
        const scale = interpolate(progress, [0, 1], [1.2, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return { opacity: progress, scale };
      default:
        return progress;
    }
  };

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Renderizar clips */}
      {clips.map((clip, index) => {
        const clipStartFrame = clip.startTime * fps;
        const clipEndFrame = clip.endTime * fps;
        const isActive = frame >= clipStartFrame && frame < clipEndFrame;
        
        if (!isActive) return null;

        const transition = getTransitionOpacity(index);
        const opacity = typeof transition === 'number' ? transition : transition.opacity || 1;
        const scale = typeof transition === 'object' && transition.scale ? transition.scale : 1;

        return (
          <div
            key={clip.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity,
              transform: `scale(${scale})`,
            }}
          >
            {clip.type === 'video' && (
              <video
                src={clip.source}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: clip.rotation ? `rotate(${clip.rotation}deg)` : undefined,
                  filter: clip.colorAdjustments
                    ? `brightness(${1 + (clip.colorAdjustments.brightness || 0) / 100}) contrast(${1 + (clip.colorAdjustments.contrast || 0) / 100}) saturate(${1 + (clip.colorAdjustments.saturation || 0) / 100})`
                    : undefined,
                  clipPath: clip.crop
                    ? `inset(${clip.crop.y}% ${100 - clip.crop.x - clip.crop.width}% ${100 - clip.crop.y - clip.crop.height}% ${clip.crop.x}%)`
                    : undefined,
                }}
                muted
                playsInline
                playbackRate={clip.speed || 1}
              />
            )}
            {clip.type === 'image' && (
              <img
                src={clip.source}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: clip.rotation ? `rotate(${clip.rotation}deg)` : undefined,
                  filter: clip.colorAdjustments
                    ? `brightness(${1 + (clip.colorAdjustments.brightness || 0) / 100}) contrast(${1 + (clip.colorAdjustments.contrast || 0) / 100}) saturate(${1 + (clip.colorAdjustments.saturation || 0) / 100})`
                    : undefined,
                  clipPath: clip.crop
                    ? `inset(${clip.crop.y}% ${100 - clip.crop.x - clip.crop.width}% ${100 - clip.crop.y - clip.crop.height}% ${clip.crop.x}%)`
                    : undefined,
                }}
                alt=""
              />
            )}
            {clip.type === 'text' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  color: '#fff',
                  textAlign: 'center',
                  padding: 40,
                }}
              >
                {clip.source}
              </div>
            )}
          </div>
        );
      })}

      {/* Renderizar legendas */}
      {activeCaptions.map((caption) => (
        <div
          key={caption.id}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: caption.style?.position === 'top' ? 'auto' : 
                   caption.style?.position === 'center' ? '50%' : '10%',
            top: caption.style?.position === 'top' ? '10%' : 'auto',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: caption.style?.color || '#fff',
            fontSize: caption.style?.fontSize || 32,
            padding: '10px 20px',
            borderRadius: 8,
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          {caption.text}
        </div>
      ))}
    </div>
  );
};

