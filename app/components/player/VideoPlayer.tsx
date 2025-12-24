'use client';

import { useEditorStore } from '@/app/stores/editor-store';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function VideoPlayer() {
  const { currentTime, duration, isPlaying, setIsPlaying, setCurrentTime } = useEditorStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
  };

  const skip = (seconds: number) => {
    setCurrentTime(Math.max(0, Math.min(duration, currentTime + seconds)));
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Preview Area */}
      <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
        <div className="text-gray-500 text-center">
          <p className="text-sm mb-2">Preview do Vídeo</p>
          <p className="text-xs text-gray-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-950 space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => skip(-10)}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Voltar 10s"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              "p-3 rounded-full transition-all",
              "bg-purple-600 hover:bg-purple-700 text-white",
              "flex items-center justify-center"
            )}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>
          <button
            onClick={() => skip(10)}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Avançar 10s"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

