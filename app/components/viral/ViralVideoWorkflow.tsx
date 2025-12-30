'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ViralVideo } from '@/app/types';
import { ScriptSegment } from '@/app/types';
import { useEditorStore } from '@/app/stores/editor-store';
import { ScriptEditor } from '../script/ScriptEditor';
import { generateScript } from '@/app/lib/openai';
import { ScriptGenerationParams } from '@/app/types';
import { 
  Video, 
  FileText, 
  Download, 
  CheckCircle2, 
  Edit2, 
  Sparkles, 
  ArrowRight,
  Loader2,
  Play,
  Plus
} from 'lucide-react';
import { cn } from '@/app/lib/utils';

type WorkflowStep = 'select' | 'download' | 'script' | 'edit' | 'complete';

interface ViralVideoWorkflowProps {
  initialVideo?: ViralVideo;
  onClose?: () => void;
}

export function ViralVideoWorkflow({ initialVideo, onClose }: ViralVideoWorkflowProps) {
  const router = useRouter();
  const { setScript, setActivePanel, addClip, clips } = useEditorStore();
  
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(initialVideo ? 'download' : 'select');
  const [selectedVideo, setSelectedVideo] = useState<ViralVideo | null>(initialVideo || null);
  const [downloadedVideo, setDownloadedVideo] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedSegments, setGeneratedSegments] = useState<ScriptSegment[]>([]);
  const [editedSegments, setEditedSegments] = useState<ScriptSegment[]>([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: 'select', label: 'Escolher Vídeo', icon: Video },
    { id: 'download', label: 'Baixar', icon: Download },
    { id: 'script', label: 'Roteiro', icon: Sparkles },
    { id: 'edit', label: 'Editar', icon: Edit2 },
    { id: 'complete', label: 'Pronto', icon: CheckCircle2 },
  ];

  const handleVideoSelect = (video: ViralVideo) => {
    setSelectedVideo(video);
    setCurrentStep('download');
    setError(null);
  };

  const handleDownload = async () => {
    if (!selectedVideo) return;

    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch('/api/viral/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: selectedVideo.url,
          platform: selectedVideo.platform,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao baixar vídeo');
      }

      const data = await response.json();
      setDownloadedVideo(data);
      
      // Adicionar vídeo à timeline automaticamente
      const duration = selectedVideo.duration 
        ? parseDuration(selectedVideo.duration) 
        : 60; // padrão 60s

      addClip({
        id: `viral-${selectedVideo.id}-${Date.now()}`,
        startTime: clips.length > 0 ? Math.max(...clips.map(c => c.endTime)) : 0,
        endTime: clips.length > 0 
          ? Math.max(...clips.map(c => c.endTime)) + duration 
          : duration,
        source: data.path || selectedVideo.url,
        type: 'video',
      });

      // Avançar para geração de roteiro
      setCurrentStep('script');
    } catch (err: any) {
      setError(err.message || 'Erro ao baixar vídeo');
      console.error('Erro ao baixar vídeo:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const parseDuration = (duration: string): number => {
    // Formato ISO 8601: PT1H2M3S ou PT60S
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 60;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleGenerateScript = async () => {
    if (!selectedVideo) return;

    setIsGeneratingScript(true);
    setError(null);

    try {
      // Gerar roteiro baseado no vídeo viral
      const topic = selectedVideo.title || 'Vídeo viral';
      const duration = selectedVideo.duration 
        ? parseDuration(selectedVideo.duration) 
        : 60;

      const params: ScriptGenerationParams = {
        topic,
        duration,
        style: 'educational', // Usar estilo educacional como padrão
        tone: 'casual',
      };

      const segments = await generateScript(params);

      setGeneratedSegments(segments);
      setEditedSegments(segments);
      setCurrentStep('edit');
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar roteiro');
      console.error('Erro ao gerar roteiro:', err);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleScriptUpdate = (segments: ScriptSegment[]) => {
    setEditedSegments(segments);
  };

  const handleApprove = () => {
    // Aplicar roteiro à timeline
    setScript(editedSegments);
    
    // Salvar no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('una-viral-script', JSON.stringify(editedSegments));
      localStorage.setItem('una-active-panel', 'editor');
    }

    setCurrentStep('complete');
  };

  const handleAddMore = () => {
    // Resetar para escolher outro vídeo
    setSelectedVideo(null);
    setDownloadedVideo(null);
    setGeneratedSegments([]);
    setEditedSegments([]);
    setCurrentStep('select');
  };

  const handleFinish = () => {
    // Ir para o editor
    setScript(editedSegments);
    setActivePanel('editor');
    router.push('/');
    if (onClose) onClose();
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all",
                      isActive && "bg-purple-600 text-white shadow-lg scale-110",
                      isCompleted && "bg-green-500 text-white",
                      !isActive && !isCompleted && "bg-gray-200 text-gray-500"
                    )}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs sm:text-sm font-medium hidden sm:block",
                      isActive && "text-purple-600",
                      isCompleted && "text-green-600",
                      !isActive && !isCompleted && "text-gray-500"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-1 w-8 sm:w-16 mx-2 transition-all",
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Step 1: Select Video */}
        {currentStep === 'select' && (
          <div className="text-center py-8">
            <Video className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Escolha um Vídeo Viral
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Selecione um vídeo da lista de virais para começar
            </p>
            <p className="text-sm text-gray-500">
              (Este componente será integrado com a lista de vídeos virais)
            </p>
          </div>
        )}

        {/* Step 2: Download */}
        {currentStep === 'download' && selectedVideo && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Vídeo Selecionado
              </h3>
              <div className="flex gap-4">
                {selectedVideo.thumbnail && (
                  <img
                    src={selectedVideo.thumbnail}
                    alt={selectedVideo.title}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {selectedVideo.title}
                  </h4>
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>👁️ {selectedVideo.viewCount?.toLocaleString()}</span>
                    <span>❤️ {selectedVideo.likeCount?.toLocaleString()}</span>
                    <span>💬 {selectedVideo.commentCount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Baixando vídeo...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Baixar e Adicionar à Timeline
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generate Script */}
        {currentStep === 'script' && selectedVideo && (
          <div className="text-center py-8">
            <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Gerar Roteiro
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vamos criar um roteiro baseado no vídeo selecionado
            </p>
            <button
              onClick={handleGenerateScript}
              disabled={isGeneratingScript}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {isGeneratingScript ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando roteiro...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Roteiro com IA
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 4: Edit Script */}
        {currentStep === 'edit' && editedSegments.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Edite o Roteiro
              </h3>
              <button
                onClick={() => setCurrentStep('script')}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                ← Voltar
              </button>
            </div>
            <ScriptEditor />
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleApprove}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Aprovar e Adicionar à Timeline
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {currentStep === 'complete' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Tudo Pronto!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Vídeo baixado e roteiro adicionados à timeline. Você pode adicionar mais vídeos ou finalizar.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAddMore}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar Mais Vídeos
              </button>
              <button
                onClick={handleFinish}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Ir para o Editor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

