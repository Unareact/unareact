'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { Transition } from '@/app/lib/ai-editing/transitions';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface TransitionPreviewProps {
  transition: Transition;
  onClose: () => void;
}

export function TransitionPreview({ transition, onClose }: TransitionPreviewProps) {
  const { clips, currentTime, setCurrentTime, isPlaying, setIsPlaying } = useEditorStore();
  const [previewTime, setPreviewTime] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const fromClip = clips.find(c => c.id === transition.fromClipId);
  const toClip = clips.find(c => c.id === transition.toClipId);

  const transitionStart = toClip ? toClip.startTime - transition.duration : 0;
  const transitionEnd = toClip ? toClip.startTime : transition.duration;

  useEffect(() => {
    if (isPreviewPlaying) {
      const interval = setInterval(() => {
        setPreviewTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= transition.duration) {
            setIsPreviewPlaying(false);
            return transition.duration;
          }
          return newTime;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPreviewPlaying, transition.duration]);

  const progress = (previewTime / transition.duration) * 100;
  const opacity = transition.type === 'fade' ? progress / 100 : 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Preview de Transição: {transition.type}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Preview Visual */}
        <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
          {/* Clip de Origem */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: transition.type === 'fade' ? 1 - opacity : 1,
              transform: transition.type === 'zoom' ? `scale(${1 + progress / 200})` : 'none',
            }}
          >
            <div className="text-white text-center">
              <div className="text-sm mb-2">Clip Anterior</div>
              <div className="text-xs text-gray-400">{fromClip?.source || 'Clip 1'}</div>
            </div>
          </div>

          {/* Clip de Destino */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: transition.type === 'fade' ? opacity : 1,
              transform: transition.type === 'zoom' 
                ? `scale(${1.2 - progress / 200})` 
                : transition.type === 'slide'
                ? `translateX(${(1 - progress / 100) * 100}%)`
                : 'none',
            }}
          >
            <div className="text-white text-center">
              <div className="text-sm mb-2">Próximo Clip</div>
              <div className="text-xs text-gray-400">{toClip?.source || 'Clip 2'}</div>
            </div>
          </div>

          {/* Indicador de Progresso */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className="h-full bg-purple-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
            className={cn(
              "p-3 rounded-full transition-all",
              "bg-purple-600 hover:bg-purple-700 text-white",
              "flex items-center justify-center"
            )}
          >
            {isPreviewPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={transition.duration}
              value={previewTime}
              onChange={(e) => {
                setPreviewTime(Number(e.target.value));
                setIsPreviewPlaying(false);
              }}
              step={0.1}
              className="w-full"
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {previewTime.toFixed(1)}s / {transition.duration.toFixed(1)}s
          </span>
        </div>

        {/* Informações */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
              <span className="ml-2 font-medium capitalize">{transition.type}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Duração:</span>
              <span className="ml-2 font-medium">{transition.duration}s</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 dark:text-gray-400">Razão:</span>
              <p className="mt-1 text-gray-700 dark:text-gray-300">{transition.reason}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

