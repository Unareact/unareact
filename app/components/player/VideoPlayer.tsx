'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/app/lib/utils';

// Função para obter textos sobrepostos do store global
const getTextOverlays = () => {
  if (typeof window !== 'undefined' && (window as any).textOverlaysStore) {
    return (window as any).textOverlaysStore.overlays || [];
  }
  return [];
};

export function VideoPlayer() {
  const { clips, currentTime, duration, isPlaying, setIsPlaying, setCurrentTime, setDuration } = useEditorStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentClipSource, setCurrentClipSource] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [textOverlays, setTextOverlays] = useState<any[]>([]);
  
  // Atualizar textos sobrepostos quando mudarem
  useEffect(() => {
    const updateOverlays = () => {
      const overlays = getTextOverlays();
      setTextOverlays(overlays);
    };
    
    updateOverlays();
    const interval = setInterval(updateOverlays, 500); // Atualizar a cada 500ms
    
    return () => clearInterval(interval);
  }, []);

  // Encontrar clip atual baseado no tempo
  const currentClip = clips.find(
    (clip) => currentTime >= clip.startTime && currentTime < clip.endTime
  );

  // Atualizar source do vídeo quando o clip muda
  useEffect(() => {
    if (currentClip && currentClip.source) {
      setCurrentClipSource(currentClip.source);
      setVideoError(null);
    } else if (clips.length > 0 && clips[0].source) {
      // Se não há clip no tempo atual, usar o primeiro
      setCurrentClipSource(clips[0].source);
    } else {
      setCurrentClipSource(null);
    }
  }, [currentClip, clips]);

  // Atualizar duração total quando clips mudam
  useEffect(() => {
    if (clips.length > 0) {
      const totalDuration = Math.max(...clips.map(c => c.endTime));
      setDuration(totalDuration);
    }
  }, [clips, setDuration]);

  // Controlar play/pause do vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch((err) => {
        console.error('Erro ao reproduzir vídeo:', err);
        setIsPlaying(false);
      });
    } else {
      video.pause();
    }
  }, [isPlaying, setIsPlaying]);

  // Sincronizar tempo do vídeo com o store
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentClip) return;

    // Calcular tempo relativo dentro do clip
    const relativeTime = currentTime - currentClip.startTime;
    const clipDuration = currentClip.endTime - currentClip.startTime;
    
    // Converter para tempo do vídeo (0 a clipDuration)
    const videoTime = Math.max(0, Math.min(clipDuration, relativeTime));
    
    // Só atualizar se a diferença for significativa (> 0.5s)
    if (Math.abs(video.currentTime - videoTime) > 0.5) {
      video.currentTime = videoTime;
    }
  }, [currentTime, currentClip]);

  // Atualizar currentTime quando vídeo está reproduzindo
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying || !currentClip) return;

    const interval = setInterval(() => {
      if (video && !video.paused) {
        const relativeTime = video.currentTime;
        const absoluteTime = currentClip.startTime + relativeTime;
        
        // Se passou do fim do clip, ir para o próximo ou parar
        if (absoluteTime >= currentClip.endTime) {
          const nextClip = clips.find(c => c.startTime >= currentClip.endTime);
          if (nextClip) {
            setCurrentTime(nextClip.startTime);
          } else {
            setCurrentTime(currentClip.endTime);
            setIsPlaying(false);
          }
        } else {
          setCurrentTime(absoluteTime);
        }
      }
    }, 100); // Atualizar a cada 100ms

    return () => clearInterval(interval);
  }, [isPlaying, currentClip, clips, setCurrentTime, setIsPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    
    // Atualizar vídeo imediatamente
    const video = videoRef.current;
    if (video && currentClip) {
      const relativeTime = newTime - currentClip.startTime;
      video.currentTime = Math.max(0, Math.min(currentClip.endTime - currentClip.startTime, relativeTime));
    }
  };

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
  };

  const handleVideoError = () => {
    setVideoError('Erro ao carregar vídeo. Verifique se o arquivo está acessível.');
    console.error('Erro no elemento de vídeo');
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden w-full relative z-10">
      {/* Preview Area - Ocupa 50% da página */}
      <div className="aspect-video bg-gray-800 flex items-center justify-center relative w-full overflow-hidden">
        {currentClipSource ? (
          <>
            <video
              ref={videoRef}
              src={currentClipSource}
              className="w-full h-full object-contain"
              onError={handleVideoError}
              onLoadedMetadata={() => {
                const video = videoRef.current;
                if (video && currentClip) {
                  const relativeTime = currentTime - currentClip.startTime;
                  video.currentTime = Math.max(0, Math.min(currentClip.endTime - currentClip.startTime, relativeTime));
                  
                  // Detectar se o vídeo tem faixas de áudio e legendas
                  if (video.textTracks && video.textTracks.length > 0) {
                    console.log(`📝 Vídeo tem ${video.textTracks.length} faixa(s) de legenda embutida(s)`);
                  }
                  // audioTracks é uma propriedade experimental, usar type assertion
                  const videoWithAudioTracks = video as HTMLVideoElement & { audioTracks?: { length: number } };
                  if (videoWithAudioTracks.audioTracks && videoWithAudioTracks.audioTracks.length > 0) {
                    console.log(`🔊 Vídeo tem ${videoWithAudioTracks.audioTracks.length} faixa(s) de áudio`);
                  }
                }
              }}
              playsInline
              muted={false}
              controls={false}
            />
            
            {/* Textos Sobrepostos - Preview Visual */}
            {textOverlays
              .filter((overlay: any) => overlay && currentTime >= overlay.startTime && currentTime < overlay.endTime)
              .map((overlay: any) => {
                const positionStyles = overlay.position === 'top'
                  ? { top: '10%', bottom: 'auto', left: '50%', transform: 'translateX(-50%)' }
                  : overlay.position === 'center'
                  ? { top: '50%', bottom: 'auto', left: '50%', transform: 'translate(-50%, -50%)' }
                  : { top: 'auto', bottom: '10%', left: '50%', transform: 'translateX(-50%)' };

                return (
                  <div
                    key={overlay.id}
                    className="absolute z-20 px-4 py-2 rounded-lg text-center max-w-[90%] pointer-events-none"
                    style={{
                      ...positionStyles,
                      fontSize: `${overlay.style?.fontSize || 48}px`,
                      color: overlay.style?.color || '#FFFFFF',
                      backgroundColor: overlay.style?.backgroundColor || 'rgba(0, 0, 0, 0.7)',
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      animation: overlay.style?.animation === 'fade-in' ? 'fadeIn 0.5s ease-in' : 'none',
                    }}
                  >
                    {overlay.text}
                  </div>
                );
              })}
          </>
        ) : (
          <div className="text-gray-500 text-center px-4">
            <p className="text-xs sm:text-sm mb-2 font-semibold">Preview do Vídeo</p>
            <p className="text-xs text-gray-400">
              {clips.length === 0 
                ? 'Adicione clips à timeline para visualizar'
                : `${formatTime(currentTime)} / ${formatTime(duration)}`}
            </p>
          </div>
        )}
        
        {videoError && (
          <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center z-30">
            <p className="text-red-300 text-sm px-4">{videoError}</p>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Controls */}
      <div className="p-3 sm:p-4 bg-gray-950 space-y-2 sm:space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => skip(-10)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors touch-manipulation"
            title="Voltar 10s"
            aria-label="Voltar 10 segundos"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              "p-2.5 sm:p-3 rounded-full transition-all touch-manipulation",
              "bg-purple-600 hover:bg-purple-700 text-white",
              "flex items-center justify-center"
            )}
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
            )}
          </button>
          <button
            onClick={() => skip(10)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors touch-manipulation"
            title="Avançar 10s"
            aria-label="Avançar 10 segundos"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

