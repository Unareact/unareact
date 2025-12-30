'use client';

import { useState } from 'react';
import { FileUploader } from '../upload/FileUploader';
import { EnhancedTimeline } from '../timeline/EnhancedTimeline';
import { MediaLibrary } from '../media/MediaLibrary';
import { AutoMediaSelector } from '../media/AutoMediaSelector';
import { AIImageGenerator } from '../media/AIImageGenerator';
import { AutoAssembly } from '../workflow/AutoAssembly';
import { VisualTemplateSelector } from '../templates/VisualTemplateSelector';
import { AutoCutPanel } from '../ai-editing/AutoCutPanel';
import { NarrationPanel } from '../ai-editing/NarrationPanel';
import { AutoCaptionsPanel } from '../ai-editing/AutoCaptionsPanel';
import { TransitionsPanel } from '../ai-editing/TransitionsPanel';
import { TextOverlaysPanel } from '../ai-editing/TextOverlaysPanel';
import { ExportButton } from './ExportButton';
import { 
  Upload, 
  Film, 
  Image, 
  Sparkles, 
  Palette, 
  Scissors, 
  Mic, 
  Type, 
  Move,
  Zap,
  Info
} from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

const tabs: Tab[] = [
  { 
    id: 'library', 
    label: 'Biblioteca', 
    icon: Image, 
    description: 'Suas mídias e arquivos',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'auto', 
    label: 'IA Automática', 
    icon: Sparkles, 
    description: 'Seleção e geração automática',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    id: 'templates', 
    label: 'Templates', 
    icon: Palette, 
    description: 'Estilos e layouts prontos',
    color: 'from-pink-500 to-pink-600'
  },
  { 
    id: 'editing', 
    label: 'Edição IA', 
    icon: Scissors, 
    description: 'Cortes, narração e legendas',
    color: 'from-green-500 to-green-600'
  },
];

export function EnhancedEditorLayout() {
  const [activeTab, setActiveTab] = useState('library');

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Upload Section - Destaque */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Upload de Arquivos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Adicione vídeos, áudios e imagens ao seu projeto
            </p>
          </div>
        </div>
        <FileUploader />
      </div>

      {/* Timeline Section - Sempre visível */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Timeline de Edição
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Organize e edite seus clips na linha do tempo
            </p>
          </div>
        </div>
        <EnhancedTimeline />
      </div>

      {/* Tabs Section - Melhorado */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Tabs Header - Melhorado */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 px-6 py-4 min-w-[140px] transition-all relative',
                    'border-b-2 -mb-px',
                    isActive
                      ? (tab.id === 'library' ? 'border-blue-600 dark:border-blue-400' :
                         tab.id === 'auto' ? 'border-purple-600 dark:border-purple-400' :
                         tab.id === 'templates' ? 'border-pink-600 dark:border-pink-400' :
                         'border-green-600 dark:border-green-400')
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all",
                    isActive 
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      "text-sm font-semibold",
                      isActive 
                        ? (tab.id === 'library' ? 'text-blue-600 dark:text-blue-400' :
                           tab.id === 'auto' ? 'text-purple-600 dark:text-purple-400' :
                           tab.id === 'templates' ? 'text-pink-600 dark:text-pink-400' :
                           'text-green-600 dark:text-green-400')
                        : "text-gray-600 dark:text-gray-400"
                    )}>
                      {tab.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                      {tab.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r",
                      tab.color
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs Content */}
        <div className="p-6">
          {activeTab === 'library' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                    Biblioteca de Mídia
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Acesse todos os seus arquivos de mídia, organize por pastas e adicione à timeline.
                  </p>
                </div>
              </div>
              <MediaLibrary />
            </div>
          )}

          {activeTab === 'auto' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">
                    IA Automática
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Deixe a IA selecionar mídia automaticamente, gerar imagens e montar seu vídeo.
                  </p>
                </div>
              </div>
              <AutoMediaSelector />
              <AIImageGenerator />
              <AutoAssembly />
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                <Palette className="w-5 h-5 text-pink-600 dark:text-pink-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-pink-800 dark:text-pink-300 font-medium">
                    Templates Visuais
                  </p>
                  <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                    Escolha entre templates prontos com estilos, transições e efeitos pré-configurados.
                  </p>
                </div>
              </div>
              <VisualTemplateSelector />
            </div>
          )}

          {activeTab === 'editing' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Scissors className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                    Edição com IA
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Use IA para cortes automáticos, narração, legendas, transições e textos sobrepostos.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <AutoCutPanel />
                  <NarrationPanel />
                  <AutoCaptionsPanel />
                </div>
                <div className="space-y-4">
                  <TransitionsPanel />
                  <TextOverlaysPanel />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Section - Destaque */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
        <ExportButton />
      </div>
    </div>
  );
}

