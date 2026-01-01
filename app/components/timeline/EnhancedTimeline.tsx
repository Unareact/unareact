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
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
          <Film className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Timeline Vazia
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 max-w-md">
          Adicione vídeos, imagens ou áudios para começar a editar
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          💡 Dica: Use o upload acima ou baixe vídeos do YouTube/TikTok
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Guia de Como Usar a Timeline */}
      {clips.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                📹 Como Usar a Timeline
              </h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold">1️⃣ <strong>Adicionar Vídeos:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                  <li>Faça upload de arquivos acima</li>
                  <li>Ou busque na Biblioteca de Mídia</li>
                  <li>Ou baixe do YouTube</li>
                </ul>
                
                <p className="font-semibold mt-3">2️⃣ <strong>Arrastar e Soltar:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                  <li>Clique e arraste os clips para mover na timeline</li>
                  <li>Arraste as bordas (esquerda/direita) para cortar</li>
                </ul>
                
                <p className="font-semibold mt-3">3️⃣ <strong>Editar Clips:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                  <li>Clique em um clip para selecionar</li>
                  <li>Use os botões que aparecem para editar</li>
                </ul>
                
                <p className="font-semibold mt-3">4️⃣ <strong>Usar IA (Mais Fácil!):</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                  <li>Vá no chat com IA (lado direito, abaixo do vídeo)</li>
                  <li>Fale: "Aplique cortes rápidos" → IA faz automaticamente!</li>
                  <li>Fale: "Faça transições suaves" → IA aplica!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Dicas Rápidas quando há clips */}
      {clips.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 mb-2">
          <div className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-300">
            <Play className="w-4 h-4" />
            <span>
              <strong>Dica:</strong> Clique no clip para editar • Arraste para mover • Arraste bordas para cortar • 
              Use a IA (lado direito) para edições automáticas!
            </span>
          </div>
        </div>
      )}
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {clips.length} {clips.length === 1 ? 'clip' : 'clips'}
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Duração: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatTime(totalDuration)}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setZoom(Math.max(MIN_ZOOM, zoom - 0.25))}
            disabled={zoom <= MIN_ZOOM}
            className="p-2 rounded hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Diminuir zoom (Ctrl + Scroll)"
            aria-label="Diminuir zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[55px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(MAX_ZOOM, zoom + 0.25))}
            disabled={zoom >= MAX_ZOOM}
            className="p-2 rounded hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Aumentar zoom (Ctrl + Scroll)"
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="w-4 h-4" />
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
            className="relative h-20 sm:h-24 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer touch-manipulation hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
            title="Clique para navegar no tempo • Arraste clips para reordenar"
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
                    'absolute h-16 sm:h-20 rounded-lg border-2 cursor-move transition-all touch-manipulation group',
                    'flex items-center gap-2 px-2 sm:px-3 overflow-hidden shadow-sm',
                    isSelected
                      ? 'border-purple-500 dark:border-purple-400 shadow-xl ring-2 ring-purple-200 dark:ring-purple-900 z-30 scale-[1.02]'
                      : 'border-gray-400 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md z-10',
                    isDragging && 'opacity-60 scale-95',
                    getClipColor(clip.type)
                  )}
                  style={{
                    left: `${left}px`,
                    width: `${Math.max(80, width)}px`, // Mínimo 80px de largura
                  }}
                  title={`${clip.type === 'video' ? 'Vídeo' : clip.type === 'image' ? 'Imagem' : 'Texto'}: ${formatTime(clip.startTime)} - ${formatTime(clip.endTime)} • Clique para selecionar • Arraste para mover • Arraste as bordas para ajustar duração`}
                >
                  {/* Resize Handle - Start */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, clip.id, 'start')}
                    className="absolute left-0 top-0 bottom-0 w-4 sm:w-5 bg-black/30 hover:bg-black/50 active:bg-black/70 cursor-ew-resize z-40 touch-manipulation rounded-l-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Arraste para ajustar início do clip"
                  >
                    <div className="w-1 h-6 bg-white/60 rounded" />
                  </div>

                  {/* Clip Content */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <GripVertical className="w-4 h-4 text-white/70 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="text-white flex-shrink-0 bg-white/20 rounded p-1">
                      {getClipIcon(clip.type)}
                    </div>
                    {/* Indicador de Edições Aplicadas */}
                    {clip.effects && clip.effects.length > 0 && (
                      <div className="flex-shrink-0" title={`Edições aplicadas: ${clip.effects.join(', ')}`}>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ring-2 ring-green-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate leading-tight">
                        {(() => {
                          // Extrair nome do arquivo do caminho
                          const fileName = clip.source.split('/').pop() || clip.source;
                          return fileName.length > 15 ? fileName.substring(0, 15) + '...' : fileName;
                        })()}
                      </div>
                      <div className="text-[10px] text-white/70 font-mono">
                        {formatTime(clip.startTime)} → {formatTime(clip.endTime)}
                        {clip.speed && clip.speed !== 1 && (
                          <span className="ml-1 text-yellow-300">⚡{clip.speed}x</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resize Handle - End */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, clip.id, 'end')}
                    className="absolute right-0 top-0 bottom-0 w-4 sm:w-5 bg-black/30 hover:bg-black/50 active:bg-black/70 cursor-ew-resize z-40 touch-manipulation rounded-r-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Arraste para ajustar fim do clip"
                  >
                    <div className="w-1 h-6 bg-white/60 rounded" />
                  </div>

                  {/* Edit Button */}
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClipId(clip.id);
                      }}
                      className="absolute -top-3 -left-3 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-lg hover:shadow-xl z-50 transition-all hover:scale-110"
                      title="Editar clip (velocidade, rotação, crop, etc)"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete Button */}
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Tem certeza que deseja remover este clip?')) {
                          deleteClip(clip.id);
                        }
                      }}
                      className="absolute -top-3 -right-3 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg hover:shadow-xl z-50 transition-all hover:scale-110"
                      title="Remover clip (Delete)"
                    >
                      <Trash2 className="w-4 h-4" />
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
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
          {(() => {
            const clip = clips.find(c => c.id === selectedClipId);
            if (!clip) return null;
            const fileName = clip.source.split('/').pop() || clip.source;
            return (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                      Clip Selecionado
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
                      {fileName}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTime(clip.startTime)}
                    className="w-full sm:w-auto px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Play className="w-4 h-4" />
                    Ir para início
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-purple-200 dark:border-purple-800">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">⏱️ Início</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">
                      {formatTime(clip.startTime)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">⏹️ Fim</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">
                      {formatTime(clip.endTime)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">⏱️ Duração</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">
                      {formatTime(clip.endTime - clip.startTime)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">📁 Tipo</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize flex items-center gap-1">
                      {getClipIcon(clip.type)}
                      {clip.type === 'video' ? 'Vídeo' : clip.type === 'image' ? 'Imagem' : 'Texto'}
                    </p>
                  </div>
                  {clip.speed && clip.speed !== 1 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">⚡ Velocidade</p>
                      <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
                        {clip.speed}x
                      </p>
                    </div>
                  )}
                  {clip.rotation && clip.rotation !== 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">🔄 Rotação</p>
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                        {clip.rotation}°
                      </p>
                    </div>
                  )}
                  {clip.effects && clip.effects.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800 col-span-2 sm:col-span-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">✨ Efeitos</p>
                      <p className="text-sm font-bold text-green-700 dark:text-green-400">
                        {clip.effects.length} aplicado{clip.effects.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingClipId(clip.id);
                    }}
                    className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Editar Clip
                  </button>
                  <button
                    onClick={() => setCurrentTime(clip.startTime)}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Reproduzir
                  </button>
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

