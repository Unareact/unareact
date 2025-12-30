'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { generateImageForSegment, generateImagesForSegments, GeneratedImage } from '@/app/lib/ai-image-generation';
import { Sparkles, Loader2, CheckCircle2, Image, AlertCircle, Download } from 'lucide-react';
import { cn } from '@/app/lib/utils';

const STORAGE_KEY = 'una-generated-images';

export function AIImageGenerator() {
  const { script, addClip } = useEditorStore();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  // Carregar imagens salvas do localStorage ao montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Filtrar apenas imagens que ainda têm URLs válidas (não expiradas) ou são base64
          const validImages = parsed.filter((img: GeneratedImage) => 
            img.url && (img.url.startsWith('http') || img.url.startsWith('data:image'))
          );
          setGeneratedImages(validImages);
        }
      } catch (error) {
        console.error('Erro ao carregar imagens salvas:', error);
      }
    }
  }, []);

  // Salvar imagens no localStorage sempre que mudarem
  useEffect(() => {
    if (typeof window !== 'undefined' && generatedImages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(generatedImages));
      } catch (error) {
        console.error('Erro ao salvar imagens:', error);
      }
    }
  }, [generatedImages]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSegmentId, setGeneratingSegmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerateForSegment = async (segmentId: string) => {
    const segment = script.find(s => s.id === segmentId);
    if (!segment) return;

    setGeneratingSegmentId(segmentId);
    setError(null);

    try {
      const generated = await generateImageForSegment(segment);
      if (generated) {
        setGeneratedImages(prev => {
          // Remover imagem anterior do mesmo segmento se existir
          const filtered = prev.filter(img => img.segmentId !== segmentId);
          return [...filtered, generated];
        });
        setSuccessMessage(`✅ Imagem gerada para: "${segment.text.substring(0, 50)}..."`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Não foi possível gerar a imagem. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao gerar imagem:', err);
      setError(err.message || 'Erro ao gerar imagem');
    } finally {
      setGeneratingSegmentId(null);
    }
  };

  const handleGenerateAll = async () => {
    if (script.length === 0) {
      setError('Adicione um roteiro primeiro');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const generated = await generateImagesForSegments(script);
      setGeneratedImages(generated);
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
        } catch (error) {
          console.error('Erro ao salvar imagens:', error);
        }
      }
      setSuccessMessage(`✅ ${generated.length} imagem(ns) gerada(s) com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Erro ao gerar imagens:', err);
      setError(err.message || 'Erro ao gerar imagens');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToTimeline = (image: GeneratedImage) => {
    const segment = script.find(s => s.id === image.segmentId);
    if (!segment) return;

    // Calcular posição na timeline
    let startTime = 0;
    const segmentIndex = script.findIndex(s => s.id === image.segmentId);
    for (let i = 0; i < segmentIndex; i++) {
      startTime += script[i].duration;
    }

    const duration = segment.duration || 5;
    addClip({
      id: `ai-img-${image.id}`,
      source: image.url,
      type: 'image',
      startTime,
      endTime: startTime + duration,
    });

    setSuccessMessage(`✅ Imagem adicionada à timeline!`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // Função para baixar e converter imagem para base64 (armazenamento permanente)
  const handleDownloadAndSave = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      
      // Converter para base64 para armazenamento permanente
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const updatedImage = {
          ...image,
          url: base64, // Substituir URL temporária por base64
          isBase64: true,
        };
        
        setGeneratedImages(prev => {
          const filtered = prev.filter(img => img.id !== image.id);
          const updated = [...filtered, updatedImage];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (error) {
              console.error('Erro ao salvar imagem:', error);
            }
          }
          return updated;
        });
        
        setSuccessMessage(`✅ Imagem salva permanentemente!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      setError('Erro ao baixar imagem. Tente novamente.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Geração de Imagens por IA
          </h3>
        </div>
        <button
          onClick={handleGenerateAll}
          disabled={isGenerating || script.length === 0}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            'bg-purple-600 text-white hover:bg-purple-700',
            'disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed',
            'flex items-center gap-2'
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Gerar Todas</span>
            </>
          )}
        </button>
      </div>

      {script.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">Adicione um roteiro primeiro para gerar imagens.</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
            <CheckCircle2 className="w-4 h-4" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de segmentos para gerar imagens */}
      {script.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {generatedImages.length} de {script.length} imagens geradas
            </p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {script.map((segment) => {
              const generated = generatedImages.find(img => img.segmentId === segment.id);
              const isGeneratingThis = generatingSegmentId === segment.id;

              return (
                <div
                  key={segment.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {segment.text}
                      </p>
                      {generated && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Prompt: {generated.prompt.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!generated && (
                        <button
                          onClick={() => handleGenerateForSegment(segment.id)}
                          disabled={isGeneratingThis}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            'bg-purple-600 text-white hover:bg-purple-700',
                            'disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed',
                            'flex items-center gap-1'
                          )}
                        >
                          {isGeneratingThis ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Gerando...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              <span>Gerar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {generated && (
                    <div className="mt-3">
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={generated.url}
                          alt={generated.prompt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleAddToTimeline(generated)}
                          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Image className="w-4 h-4" />
                          <span>Adicionar à Timeline</span>
                        </button>
                        <button
                          onClick={() => handleDownloadAndSave(generated)}
                          className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                          title="Salvar permanentemente (converte para base64)"
                        >
                          <Download className="w-4 h-4" />
                          <span>Salvar</span>
                        </button>
                        <a
                          href={generated.url}
                          download={`image-${generated.id}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                          title="Baixar imagem"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

