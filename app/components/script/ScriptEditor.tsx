'use client';

import { useEditorStore } from '@/app/stores/editor-store';
import { ScriptSegment } from '@/app/types';
import { FileText, Clock, Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function ScriptEditor() {
  const { script, updateScriptSegment, deleteScriptSegment } = useEditorStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeColor = (type: ScriptSegment['type']) => {
    switch (type) {
      case 'intro':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'outro':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'transition':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getTypeLabel = (type: ScriptSegment['type']) => {
    switch (type) {
      case 'intro':
        return 'Introdução';
      case 'outro':
        return 'Conclusão';
      case 'transition':
        return 'Transição';
      default:
        return 'Conteúdo';
    }
  };

  if (script.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum roteiro gerado ainda. Use o gerador acima para criar um roteiro.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {script.map((segment, index) => (
        <div
          key={segment.id}
          className={cn(
            "p-4 rounded-lg border-2 transition-all",
            "bg-white dark:bg-gray-800",
            "border-gray-200 dark:border-gray-700",
            "hover:border-purple-300 dark:hover:border-purple-700"
          )}
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                #{index + 1}
              </span>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  getTypeColor(segment.type)
                )}
              >
                {getTypeLabel(segment.type)}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                {formatTime(segment.timestamp)} - {formatTime(segment.timestamp + segment.duration)}
                {' '}({segment.duration}s)
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newText = prompt('Editar texto:', segment.text);
                  if (newText) updateScriptSegment(segment.id, { text: newText });
                }}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteScriptSegment(segment.id)}
                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {segment.text}
          </p>
        </div>
      ))}
    </div>
  );
}

