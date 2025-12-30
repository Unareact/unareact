'use client';

import { useState } from 'react';
import { ViralVideo } from '@/app/types';
import { FileText, Sparkles, ArrowRight, Copy, Check, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/app/stores/editor-store';
import { useRouter } from 'next/navigation';

interface PortalScriptGeneratorProps {
  video: ViralVideo;
  onClose: () => void;
}

export function PortalScriptGenerator({ video, onClose }: PortalScriptGeneratorProps) {
  const [script, setScript] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { setScript: setEditorScript, setActivePanel } = useEditorStore();
  const router = useRouter();

  const generateScript = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/script/generate-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: video.title,
          videoDescription: video.description,
          videoStats: {
            views: video.viewCount,
            likes: video.likeCount,
            comments: video.commentCount,
            viralScore: video.viralScore,
          },
        }),
      });

      if (!response.ok) throw new Error('Erro ao gerar roteiro');

      const data = await response.json();
      setScript(data.script);
    } catch (error) {
      console.error('Erro ao gerar roteiro:', error);
      // Roteiro padrão caso a API falhe
      setScript(generateDefaultScript());
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultScript = (): string => {
    return `[INTRO - 0-3s]
Olá! Você já viu esse vídeo viral sobre ${video.title.substring(0, 50)}...?

[HOOK - 3-8s]
E se eu te disser que você pode ter resultados similares, mas de forma personalizada e com acompanhamento profissional?

[PROBLEMA - 8-15s]
Muitas mulheres brasileiras nos EUA querem começar a se cuidar, mas não sabem por onde começar. 
Ficam perdidas tentando seguir dicas genéricas que não funcionam para o estilo de vida delas.

[SOLUÇÃO - 15-25s]
É por isso que criamos uma avaliação completa de bem-estar por apenas $10. 
Você vai descobrir seus pontos fortes e áreas de melhoria, receber um plano personalizado 
e entender exatamente o que fazer para começar sua transformação HOJE.

[BENEFÍCIOS - 25-35s]
Com essa avaliação, você vai:
- Entender seu estado atual de bem-estar
- Receber recomendações personalizadas
- Ter um plano claro de ação
- Acesso a recursos exclusivos

[CTA - 35-45s]
Clique no link na descrição e faça sua avaliação de $10 agora. 
São apenas alguns minutos que vão mudar completamente sua jornada de bem-estar.

[OUTRO - 45-50s]
Não deixe para depois. Sua transformação começa AGORA!`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyToEditor = () => {
    // Converter script em formato de clips para o editor
    const scriptLines = script.split('\n').filter(line => line.trim());
    const clips = scriptLines.map((line, index) => {
      const match = line.match(/\[([^\]]+)\s*-\s*(\d+)-(\d+)s\]/);
      if (match) {
        const [, label, start, end] = match;
        const text = line.substring(line.indexOf(']') + 1).trim();
        return {
          id: `clip-${index}`,
          text: text || label,
          startTime: parseInt(start),
          endTime: parseInt(end),
          label,
        };
      }
      return null;
    }).filter(Boolean);

    // Se não tiver timestamps, criar clips simples
    if (clips.length === 0) {
      const simpleClips = scriptLines
        .filter(line => line.trim() && !line.startsWith('['))
        .map((line, index) => ({
          id: `clip-${index}`,
          text: line.trim(),
          startTime: index * 5,
          endTime: (index + 1) * 5,
        }));
      setEditorScript(simpleClips as any);
    } else {
      setEditorScript(clips as any);
    }

    // Redirecionar para o editor
    router.push('/');
    setActivePanel('editor');
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Gerar Roteiro para Portal Magra
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Roteiro focado em conversão para avaliação de $10
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <p className="text-sm text-purple-800 dark:text-purple-300">
          <strong>Vídeo base:</strong> {video.title}
        </p>
        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
          {video.viewCount.toLocaleString()} views • {video.likeCount.toLocaleString()} likes
        </p>
      </div>

      {!script && (
        <button
          onClick={generateScript}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gerando roteiro...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Gerar Roteiro de Conversão
            </>
          )}
        </button>
      )}

      {script && (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Roteiro será gerado aqui..."
            />
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Copiar roteiro"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={generateScript}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              Regenerar
            </button>
            <button
              onClick={applyToEditor}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Aplicar ao Editor
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>💡 Dica:</strong> Este roteiro é otimizado para converter visualizações em avaliações de $10. 
              Você pode editar e personalizar antes de aplicar ao editor.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

