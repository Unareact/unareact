'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Film, Image, Music, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/app/stores/editor-store';
import { VideoClip } from '@/app/types';
import { cn } from '@/app/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: 'video' | 'image' | 'audio' | 'other';
  duration?: number; // Para vídeos e áudios
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addClip, clips } = useEditorStore();

  const getFileType = (file: File): UploadedFile['type'] => {
    if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return 'video';
    if (ACCEPTED_AUDIO_TYPES.includes(file.type)) return 'audio';
    if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'image';
    return 'other';
  };

  const getFileIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'video':
        return <Film className="w-5 h-5" />;
      case 'audio':
        return <Music className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => resolve(0);
      video.src = URL.createObjectURL(file);
    });
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      };
      audio.onerror = () => resolve(0);
      audio.src = URL.createObjectURL(file);
    });
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const newFiles: UploadedFile[] = [];

    setIsProcessing(true);
    setErrors([]);

    for (const file of fileArray) {
      // Validar tamanho
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`${file.name}: Arquivo muito grande (máx. ${formatFileSize(MAX_FILE_SIZE)})`);
        continue;
      }

      // Validar tipo
      const fileType = getFileType(file);
      if (fileType === 'other') {
        newErrors.push(`${file.name}: Formato não suportado`);
        continue;
      }

      // Criar preview
      let preview = '';
      let duration = 0;

      if (fileType === 'video') {
        preview = URL.createObjectURL(file);
        duration = await getVideoDuration(file);
      } else if (fileType === 'audio') {
        preview = ''; // Sem preview visual para áudio
        duration = await getAudioDuration(file);
      } else if (fileType === 'image') {
        preview = URL.createObjectURL(file);
        duration = 5; // Imagens duram 5s por padrão
      }

      newFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview,
        type: fileType,
        duration,
      });
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setErrors(newErrors);
    setIsProcessing(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const addToTimeline = useCallback(
    (uploadedFile: UploadedFile) => {
      // Determinar tipo de clip (áudio vira 'video' por enquanto, pois VideoClip não tem tipo 'audio')
      const clipType: VideoClip['type'] =
        uploadedFile.type === 'video' ? 'video' : uploadedFile.type === 'image' ? 'image' : 'video';

      // Calcular posição na timeline (após o último clip)
      const lastClip = clips.length > 0 ? clips[clips.length - 1] : null;
      const startTime = lastClip ? lastClip.endTime : 0;
      const endTime = startTime + (uploadedFile.duration || 5);

      // Para áudio, usar o blob URL se disponível, senão o nome do arquivo
      let source = uploadedFile.file.name;
      if (uploadedFile.preview && uploadedFile.preview.startsWith('blob:')) {
        source = uploadedFile.preview;
      } else if (uploadedFile.type === 'audio') {
        // Criar blob URL para áudio se não tiver preview
        source = URL.createObjectURL(uploadedFile.file);
      }

      const clip: VideoClip = {
        id: `upload-${uploadedFile.id}`,
        startTime,
        endTime,
        source,
        type: clipType,
      };

      addClip(clip);
    },
    [clips, addClip]
  );

  const addAllToTimeline = useCallback(() => {
    uploadedFiles.forEach((file) => {
      addToTimeline(file);
    });
  }, [uploadedFiles, addToTimeline]);

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-900/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,audio/*,image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          {isProcessing ? (
            <>
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Processando arquivos...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vídeos, áudios e imagens (máx. {formatFileSize(MAX_FILE_SIZE)})
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Erros */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 dark:text-red-300 mb-2">Erros ao processar arquivos:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-400">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Arquivos Carregados */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Arquivos Carregados ({uploadedFiles.length})
            </h3>
            <button
              onClick={addAllToTimeline}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Adicionar Todos à Timeline
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Preview */}
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                  {uploadedFile.type === 'video' && (
                    <video
                      src={uploadedFile.preview}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  )}
                  {uploadedFile.type === 'image' && (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {uploadedFile.type === 'audio' && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
                      <Music className="w-16 h-16 text-white opacity-80 mb-2" />
                      <p className="text-white text-sm font-medium">{uploadedFile.file.name}</p>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(uploadedFile.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5">
                      {getFileIcon(uploadedFile.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(uploadedFile.file.size)}
                        {uploadedFile.duration && ` • ${Math.floor(uploadedFile.duration)}s`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => addToTimeline(uploadedFile)}
                    className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
                  >
                    Adicionar à Timeline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

