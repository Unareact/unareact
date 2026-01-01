'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Video, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useEditorStore } from '@/app/stores/editor-store';
import { VideoClip } from '@/app/types';

export default function NutriUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addClip, setActivePanel } = useEditorStore();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de vídeo ou imagem');
      return;
    }

    // Validar tamanho (500MB máximo)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Tamanho máximo: 500MB');
      return;
    }

    setError(null);
    setUploadedFile(file);
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      // Criar URL do arquivo
      const url = URL.createObjectURL(uploadedFile);
      
      // Determinar tipo
      const isVideo = uploadedFile.type.startsWith('video/');
      const type: VideoClip['type'] = isVideo ? 'video' : 'image';

      // Obter duração se for vídeo
      let duration = 5; // padrão para imagens
      if (isVideo) {
        duration = await new Promise<number>((resolve) => {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration);
          };
          video.onerror = () => resolve(10); // fallback
          video.src = url;
        });
      }

      // Criar clip
      const clip: VideoClip = {
        id: `nutri-upload-${Date.now()}`,
        startTime: 0,
        endTime: duration,
        source: url,
        type: type,
      };

      // Adicionar à timeline
      addClip(clip);

      // Salvar no localStorage para garantir persistência
      if (typeof window !== 'undefined') {
        localStorage.setItem('una-active-panel', 'editor');
      }

      // Ir para o editor
      setActivePanel('editor');
      router.push('/nutri/editor');
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      setError('Erro ao processar arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      // Simular evento de input
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({ target: { files: dataTransfer.files } } as any);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/nutri"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Voltar</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <Link
                href="/nutri/editor"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="text-sm font-medium">Ir para o Editor</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Upload Rápido - YLADA Nutri
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Adicione Seu Vídeo para Editar
            </h2>
            <p className="text-lg text-gray-600">
              Faça upload do seu vídeo e vá direto para o editor
            </p>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${uploadedFile 
                ? 'border-green-500 bg-green-50' 
                : error
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            {!uploadedFile ? (
              <>
                <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Arraste seu vídeo aqui ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Formatos suportados: MP4, MOV, AVI, WEBM (máx. 500MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Video className="w-5 h-5" />
                  Selecionar Arquivo
                </button>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Arquivo selecionado!
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500 mb-6">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Trocar Arquivo
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5" />
                        Ir para o Editor
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <Link
              href="/nutri/editor"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-center"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Editor Vazio
              </h3>
              <p className="text-sm text-gray-600">
                Começar sem vídeo e adicionar depois
              </p>
            </Link>
            <Link
              href="/nutri"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-center"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Criar Roteiro
              </h3>
              <p className="text-sm text-gray-600">
                Gerar roteiro com IA primeiro
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

