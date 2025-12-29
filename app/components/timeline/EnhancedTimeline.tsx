'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { VideoClip } from '@/app/types';
import { Film, Image, Type, Trash2, ZoomIn, ZoomOut, GripVertical, Play, Settings } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { ClipEditControls } from '../editor/ClipEditControls';

const PIXELS_PER_SECOND = 50; // Escala base: 50px por segundo
const MIN_ZOOM = 0.5; // 25px por segundo
const MAX_ZOOM = 3; // 150px por segundo

export function EnhancedTimeline() {
  const { clips, selectedClipId, setSelectedClipId, deleteClip, currentTime, updateClip, setCurrentTime } = useEditorStore();
  const [zoom, setZoom] = useState(1);
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [resizingClipId, setResizingClipId] = useState<string | null>(null);
  const [resizeSide, setResizeSide] = useState<'start' | 'end' | null>(null);
  const [editingClipId, setEditingClipId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const pixelsPerSecond = PIXELS_PER_SECOND * zoom;
  const totalDuration = clips.length > 0 
    ? Math.max(...clips.map(c => c.endTime)) 
    : 60; // Default 60s se não houver clips

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeToPosition = (time: number) => time * pixelsPerSecond;
  const positionToTime = (position: number) => position / pixelsPerSecond;

  const getClipIcon = (type: VideoClip['type']) => {
    switch (type) {
      case 'video':
        return <Film className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'text':
        return <Type className="w-4 h-4" />;
    }
  };

  const getClipColor = (type: VideoClip['type']) => {
    switch (type) {
      case 'video':
        return 'bg-blue-500';
      case 'image':
        return 'bg-green-500';
      case 'text':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, clipId: string) => {
    setDraggingClipId(clipId);
    const clip = clips.find(c => c.id === clipId);
    if (clip && timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clipStartX = timeToPosition(clip.startTime);
      setDragOffset(e.clientX - rect.left - clipStartX);
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingClipId || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset;
    const newStartTime = Math.max(0, positionToTime(x));
    
    const clip = clips.find(c => c.id === draggingClipId);
    if (clip) {
      const duration = clip.endTime - clip.startTime;
      updateClip(draggingClipId, {
        startTime: newStartTime,
        endTime: newStartTime + duration,
      });
    }

    setDraggingClipId(null);
    setDragOffset(0);
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, clipId: string, side: 'start' | 'end') => {
    e.stopPropagation();
    setResizingClipId(clipId);
    setResizeSide(side);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingClipId || !resizeSide || !timelineRef.current) return;

    const currentPixelsPerSecond = PIXELS_PER_SECOND * zoom;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, x / currentPixelsPerSecond);

    const clip = clips.find(c => c.id === resizingClipId);
    if (!clip) return;

    if (resizeSide === 'start') {
      const minTime = 0;
      const maxTime = clip.endTime - 0.1; // Mínimo 0.1s de duração
      const clampedTime = Math.max(minTime, Math.min(maxTime, newTime));
      updateClip(resizingClipId, { startTime: clampedTime });
    } else {
      const minTime = clip.startTime + 0.1; // Mínimo 0.1s de duração
      const clampedTime = Math.max(minTime, newTime);
      updateClip(resizingClipId, { endTime: clampedTime });
    }
  }, [resizingClipId, resizeSide, clips, updateClip, zoom]);

  const handleMouseUp = useCallback(() => {
    setResizingClipId(null);
    setResizeSide(null);
  }, []);

  useEffect(() => {
    if (resizingClipId) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingClipId, handleMouseMove, handleMouseUp]);

  // Seek to time
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || resizingClipId) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = positionToTime(x);
    setCurrentTime(Math.max(0, Math.min(totalDuration, newTime)));
  };

  // Generate time markers
  const generateTimeMarkers = () => {
    const markers = [];
    const interval = zoom < 1 ? 10 : zoom < 2 ? 5 : 1; // Intervalo baseado no zoom
    for (let i = 0; i <= totalDuration; i += interval) {
      markers.push(i);
    }
    return markers;
  };

  if (clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <Film className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Nenhum clip na timeline
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Faça upload de arquivos acima para começar a editar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Duração Total: {formatTime(totalDuration)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            • {clips.length} {clips.length === 1 ? 'clip' : 'clips'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(MIN_ZOOM, zoom - 0.25))}
            disabled={zoom <= MIN_ZOOM}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            title="Zoom Out"
            aria-label="Diminuir zoom"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 min-w-[50px] sm:min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(MAX_ZOOM, zoom + 0.25))}
            disabled={zoom >= MAX_ZOOM}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            title="Zoom In"
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 sm:p-4 overflow-x-auto -mx-2 sm:mx-0">
        <div className="relative min-h-[100px] sm:min-h-[120px]" style={{ width: `${timeToPosition(totalDuration)}px` }}>
          {/* Time Ruler */}
          <div className="sticky top-0 z-10 bg-gray-200 dark:bg-gray-700 h-6 sm:h-8 mb-2 rounded flex items-end">
            {generateTimeMarkers().map((time) => (
              <div
                key={time}
                className="absolute border-l border-gray-400 dark:border-gray-500"
                style={{ left: `${timeToPosition(time)}px` }}
              >
                <span className="absolute -top-5 sm:-top-6 left-0 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline Track */}
          <div
            ref={timelineRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleTimelineClick}
            className="relative h-16 sm:h-20 bg-gray-50 dark:bg-gray-900 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer touch-manipulation"
          >
            {/* Current Time Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-purple-600 z-20 pointer-events-none"
            style={{ left: `${timeToPosition(currentTime)}px` }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600" />
          </div>

            {/* Clips */}
            {clips.map((clip) => {
              const width = timeToPosition(clip.endTime - clip.startTime);
              const left = timeToPosition(clip.startTime);
              const isSelected = selectedClipId === clip.id;
              const isDragging = draggingClipId === clip.id;

              return (
                <div
                  key={clip.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, clip.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClipId(clip.id);
                  }}
                  className={cn(
                    'absolute h-12 sm:h-16 rounded border-2 cursor-move transition-all touch-manipulation',
                    'flex items-center gap-1 sm:gap-2 px-1 sm:px-2 overflow-hidden',
                    isSelected
                      ? 'border-purple-500 shadow-lg z-30'
                      : 'border-gray-400 dark:border-gray-600 hover:border-purple-400 z-10',
                    isDragging && 'opacity-50',
                    getClipColor(clip.type)
                  )}
                  style={{
                    left: `${left}px`,
                    width: `${Math.max(50, width)}px`, // Mínimo 50px de largura no mobile
                  }}
                >
                  {/* Resize Handle - Start */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, clip.id, 'start')}
                    className="absolute left-0 top-0 bottom-0 w-2 sm:w-3 bg-black/20 hover:bg-black/40 active:bg-black/60 cursor-ew-resize z-40 touch-manipulation"
                  />

                  {/* Clip Content */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                    <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 text-white/80 flex-shrink-0" />
                    <div className="text-white flex-shrink-0">
                      {getClipIcon(clip.type)}
                    </div>
                    {/* Indicador de Edições Aplicadas */}
                    {clip.effects && clip.effects.length > 0 && (
                      <div className="flex-shrink-0" title={`Edições aplicadas: ${clip.effects.join(', ')}`}>
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-full animate-pulse" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 hidden sm:block">
                      <div className="text-xs font-medium text-white truncate">
                        {clip.source.length > 20 
                          ? clip.source.substring(0, 20) + '...' 
                          : clip.source}
                      </div>
                      <div className="text-xs text-white/80">
                        {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                        {clip.effects && clip.effects.length > 0 && (
                          <span className="ml-1 text-green-400">✨</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 sm:hidden">
                      <div className="text-[10px] text-white/90 truncate">
                        {formatTime(clip.startTime)}
                      </div>
                    </div>
                  </div>

                  {/* Resize Handle - End */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, clip.id, 'end')}
                    className="absolute right-0 top-0 bottom-0 w-2 sm:w-3 bg-black/20 hover:bg-black/40 active:bg-black/60 cursor-ew-resize z-40 touch-manipulation"
                  />

                  {/* Edit Button */}
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClipId(clip.id);
                      }}
                      className="absolute -top-2 -left-2 p-1 bg-purple-600 text-white rounded-full hover:bg-purple-700 z-50"
                      title="Editar clip"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                  )}

                  {/* Delete Button */}
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteClip(clip.id);
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 z-50"
                      title="Remover clip"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clip Info */}
      {selectedClipId && !editingClipId && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-800">
          {(() => {
            const clip = clips.find(c => c.id === selectedClipId);
            if (!clip) return null;
            return (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                    Clip Selecionado
                  </h3>
                  <button
                    onClick={() => setCurrentTime(clip.startTime)}
                    className="w-full sm:w-auto px-3 py-1.5 sm:py-1 text-xs sm:text-sm bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center justify-center gap-1 touch-manipulation"
                  >
                    <Play className="w-3 h-3" />
                    Ir para início
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Início</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatTime(clip.startTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Fim</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatTime(clip.endTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Duração</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatTime(clip.endTime - clip.startTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Tipo</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {clip.type}
                    </p>
                  </div>
                  {clip.speed && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Velocidade</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {clip.speed}x
                      </p>
                    </div>
                  )}
                  {clip.rotation && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Rotação</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {clip.rotation}°
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Edit Controls */}
      {editingClipId && (
        <ClipEditControls
          clip={clips.find(c => c.id === editingClipId)!}
          onClose={() => setEditingClipId(null)}
        />
      )}
    </div>
  );
}

