'use client';

import { useState } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { VideoClip } from '@/app/types';
import { Scissors, Copy, Gauge, RotateCw, Crop, Palette, X } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface ClipEditControlsProps {
  clip: VideoClip;
  onClose: () => void;
}

export function ClipEditControls({ clip, onClose }: ClipEditControlsProps) {
  const { updateClip, clips, setClips } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'split' | 'duplicate' | 'speed' | 'rotation' | 'crop' | 'color' | null>(null);

  // Split
  const handleSplit = () => {
    const midPoint = (clip.startTime + clip.endTime) / 2;
    const firstPart: VideoClip = {
      ...clip,
      id: `${clip.id}-part1`,
      endTime: midPoint,
    };
    const secondPart: VideoClip = {
      ...clip,
      id: `${clip.id}-part2`,
      startTime: midPoint,
    };

    const clipIndex = clips.findIndex((c) => c.id === clip.id);
    if (clipIndex !== -1) {
      const newClips = [...clips];
      newClips.splice(clipIndex, 1, firstPart, secondPart);
      setClips(newClips);
    }
    onClose();
  };

  // Duplicar
  const handleDuplicate = () => {
    const duration = clip.endTime - clip.startTime;
    const lastClip = clips[clips.length - 1];
    const newStartTime = lastClip ? lastClip.endTime : clip.endTime;

    const duplicated: VideoClip = {
      ...clip,
      id: `${clip.id}-copy-${Date.now()}`,
      startTime: newStartTime,
      endTime: newStartTime + duration,
    };

    setClips([...clips, duplicated]);
    onClose();
  };

  // Velocidade
  const handleSpeedChange = (speed: number) => {
    const duration = clip.endTime - clip.startTime;
    const newDuration = duration / speed;
    
    updateClip(clip.id, {
      speed,
      endTime: clip.startTime + newDuration,
    });
  };

  // Rotação
  const handleRotation = (degrees: number) => {
    const currentRotation = clip.rotation || 0;
    const newRotation = (currentRotation + degrees) % 360;
    updateClip(clip.id, { rotation: newRotation });
  };

  // Crop
  const handleCrop = (crop: { x: number; y: number; width: number; height: number }) => {
    updateClip(clip.id, { crop });
  };

  // Ajustes de cor
  const handleColorAdjustment = (adjustments: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
  }) => {
    const current = clip.colorAdjustments || {
      brightness: 0,
      contrast: 0,
      saturation: 0,
    };
    updateClip(clip.id, {
      colorAdjustments: {
        ...current,
        ...adjustments,
      },
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Editar Clip
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab(activeTab === 'split' ? null : 'split')}
          className={cn(
            'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
            activeTab === 'split'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
          )}
        >
          <Scissors className="w-5 h-5" />
          <span className="text-xs">Dividir</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'duplicate' ? null : 'duplicate')}
          className={cn(
            'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
            activeTab === 'duplicate'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
          )}
        >
          <Copy className="w-5 h-5" />
          <span className="text-xs">Duplicar</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'speed' ? null : 'speed')}
          className={cn(
            'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
            activeTab === 'speed'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
          )}
        >
          <Gauge className="w-5 h-5" />
          <span className="text-xs">Velocidade</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'rotation' ? null : 'rotation')}
          className={cn(
            'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
            activeTab === 'rotation'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
          )}
        >
          <RotateCw className="w-5 h-5" />
          <span className="text-xs">Rotação</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'crop' ? null : 'crop')}
          className={cn(
            'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
            activeTab === 'crop'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
          )}
        >
          <Crop className="w-5 h-5" />
          <span className="text-xs">Crop</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'color' ? null : 'color')}
          className={cn(
            'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
            activeTab === 'color'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
          )}
        >
          <Palette className="w-5 h-5" />
          <span className="text-xs">Cor</span>
        </button>
      </div>

      {/* Conteúdo da Tab Ativa */}
      {activeTab === 'split' && (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dividir o clip ao meio no ponto atual.
          </p>
          <button
            onClick={handleSplit}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Dividir Clip
          </button>
        </div>
      )}

      {activeTab === 'duplicate' && (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Criar uma cópia do clip após o último clip na timeline.
          </p>
          <button
            onClick={handleDuplicate}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Duplicar Clip
          </button>
        </div>
      )}

      {activeTab === 'speed' && (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Velocidade atual: {clip.speed || 1}x
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[0.25, 0.5, 1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={cn(
                  'py-2 px-3 rounded-lg border-2 transition-all',
                  (clip.speed || 1) === speed
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            • 0.25x = Câmera lenta<br />
            • 1x = Normal<br />
            • 4x = Acelerado
          </p>
        </div>
      )}

      {activeTab === 'rotation' && (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Rotação atual: {clip.rotation || 0}°
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[0, 90, 180, 270].map((degrees) => (
              <button
                key={degrees}
                onClick={() => updateClip(clip.id, { rotation: degrees })}
                className={cn(
                  'py-2 px-3 rounded-lg border-2 transition-all',
                  (clip.rotation || 0) === degrees
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                )}
              >
                {degrees}°
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleRotation(-90)}
              className="flex-1 py-2 px-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ↺ -90°
            </button>
            <button
              onClick={() => handleRotation(90)}
              className="flex-1 py-2 px-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ↻ +90°
            </button>
          </div>
        </div>
      )}

      {activeTab === 'crop' && (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ajuste de crop será implementado com seleção visual na preview.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCrop({ x: 0, y: 0, width: 50, height: 50 })}
              className="py-2 px-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Centralizar
            </button>
            <button
              onClick={() => updateClip(clip.id, { crop: undefined })}
              className="py-2 px-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Remover Crop
            </button>
          </div>
        </div>
      )}

      {activeTab === 'color' && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Brilho */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Brilho
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {clip.colorAdjustments?.brightness || 0}
              </span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={clip.colorAdjustments?.brightness || 0}
              onChange={(e) => handleColorAdjustment({ brightness: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Contraste */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraste
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {clip.colorAdjustments?.contrast || 0}
              </span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={clip.colorAdjustments?.contrast || 0}
              onChange={(e) => handleColorAdjustment({ contrast: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Saturação */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Saturação
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {clip.colorAdjustments?.saturation || 0}
              </span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={clip.colorAdjustments?.saturation || 0}
              onChange={(e) => handleColorAdjustment({ saturation: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <button
            onClick={() => updateClip(clip.id, { colorAdjustments: undefined })}
            className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Resetar Ajustes
          </button>
        </div>
      )}
    </div>
  );
}

