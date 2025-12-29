'use client';

import { useState } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { autoAssembleVideo, AssemblyConfig } from '@/app/lib/auto-assembly';
import { syncMediaWithNarration, adjustImageDurationsForNarration } from '@/app/lib/auto-sync';
import { GeneratedImage } from '@/app/lib/ai-image-generation';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function AutoAssembly() {
  const { script, clips, setClips } = useEditorStore();
  const [isAssembling, setIsAssembling] = useState(false);
  const [config, setConfig] = useState<AssemblyConfig>({
    autoSequence: true,
    autoTransitions: true,
    autoSync: true,
    defaultImageDuration: 5,
    transitionDuration: 0.5,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  // Buscar imagens geradas do localStorage ou estado
  const getGeneratedImages = (): Array<{ url: string; segmentId: string; duration?: number }> => {
    // Em produção, isso viria de um estado global ou API
    // Por enquanto, vamos usar imagens que já estão nos clips
    return clips
      .filter(clip => clip.type === 'image')
      .map(clip => ({
        url: clip.source,
        segmentId: `segment-${clip.id}`,
        duration: clip.endTime - clip.startTime,
      }));
  };

  const handleAssemble = async () => {
    if (script.length === 0) {
      setError('Adicione um roteiro primeiro');
      return;
    }

    setIsAssembling(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const images = getGeneratedImages();
      
      if (images.length === 0) {
        setError('Gere imagens primeiro ou adicione mídia à timeline');
        setIsAssembling(false);
        return;
      }

      // Montar vídeo automaticamente
      let assembledClips = autoAssembleVideo(images, script, config);

      // Sincronizar com narração se configurado
      if (config.autoSync) {
        assembledClips = adjustImageDurationsForNarration(assembledClips, script);
      }

      // Aplicar à timeline
      setClips(assembledClips);

      setSuccessMessage(`✅ Vídeo montado automaticamente com ${assembledClips.length} clip(s)!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Erro ao montar vídeo:', err);
      setError(err.message || 'Erro ao montar vídeo automaticamente');
    } finally {
      setIsAssembling(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Montagem Automática
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Configurações"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleAssemble}
            disabled={isAssembling || script.length === 0}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              'bg-purple-600 text-white hover:bg-purple-700',
              'disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            {isAssembling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Montando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Montar Automaticamente</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sequenciamento Automático
            </label>
            <input
              type="checkbox"
              checked={config.autoSequence}
              onChange={(e) => setConfig({ ...config, autoSequence: e.target.checked })}
              className="rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Transições Automáticas
            </label>
            <input
              type="checkbox"
              checked={config.autoTransitions}
              onChange={(e) => setConfig({ ...config, autoTransitions: e.target.checked })}
              className="rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sincronizar com Narração
            </label>
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
              className="rounded"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Duração Padrão de Imagens (segundos)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={config.defaultImageDuration}
              onChange={(e) => setConfig({ ...config, defaultImageDuration: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Duração de Transições (segundos)
            </label>
            <input
              type="number"
              min="0.1"
              max="2"
              step="0.1"
              value={config.transitionDuration}
              onChange={(e) => setConfig({ ...config, transitionDuration: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )}

      {script.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">Adicione um roteiro e gere imagens primeiro.</p>
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Esta ferramenta monta automaticamente seu vídeo:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Sequencia imagens na ordem do roteiro</li>
          <li>Aplica transições entre clips</li>
          <li>Sincroniza durações com narração</li>
        </ul>
      </div>
    </div>
  );
}

