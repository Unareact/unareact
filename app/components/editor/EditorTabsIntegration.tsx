'use client';

import { useState } from 'react';
import { EditorTabs } from './EditorTabs';
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
import { Upload } from 'lucide-react';

export function EditorTabsIntegration() {
  const [activeTab, setActiveTab] = useState('library');

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Upload e Timeline - Sempre visíveis */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            Upload de Arquivos
          </h2>
        </div>
        <FileUploader />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Timeline de Edição
        </h2>
        <EnhancedTimeline />
      </div>

      {/* Funcionalidades organizadas em Tabs */}
      <EditorTabs activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'library' && (
          <div className="space-y-4">
            <MediaLibrary />
          </div>
        )}

        {activeTab === 'auto' && (
          <div className="space-y-4">
            <AutoMediaSelector />
            <AIImageGenerator />
            <AutoAssembly />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <VisualTemplateSelector />
          </div>
        )}

        {activeTab === 'editing' && (
          <div className="space-y-4">
            <AutoCutPanel />
            <NarrationPanel />
            <AutoCaptionsPanel />
            <TransitionsPanel />
            <TextOverlaysPanel />
          </div>
        )}
      </EditorTabs>

      {/* Exportar - Sempre visível */}
      <ExportButton />
    </div>
  );
}

