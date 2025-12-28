'use client';

import { useState } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { ScriptGenerator } from '../script/ScriptGenerator';
import { ScriptEditor } from '../script/ScriptEditor';
import { VideoPlayer } from '../player/VideoPlayer';
import { Timeline } from '../timeline/Timeline';
import { EnhancedTimeline } from '../timeline/EnhancedTimeline';
import { FileText, Video, Scissors, TrendingUp, Download, Upload, Menu, X } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { ViralVideoList } from '../viral/ViralVideoList';
import { YouTubeDownloader } from '../youtube/YouTubeDownloader';
import { FileUploader } from '../upload/FileUploader';
import { WorkflowGuide } from '../workflow/WorkflowGuide';
import { DownloadsList } from '../downloads/DownloadsList';
import { ExportButton } from './ExportButton';
import { AutoCutPanel } from '../ai-editing/AutoCutPanel';
import { NarrationPanel } from '../ai-editing/NarrationPanel';
import { AutoCaptionsPanel } from '../ai-editing/AutoCaptionsPanel';
import { TransitionsPanel } from '../ai-editing/TransitionsPanel';
import { TextOverlaysPanel } from '../ai-editing/TextOverlaysPanel';

export function MainEditor() {
  const { activePanel, setActivePanel } = useEditorStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const panels = [
    { id: 'viral' as const, label: 'Virais', icon: TrendingUp },
    { id: 'script' as const, label: 'Roteiro', icon: FileText },
    { id: 'editor' as const, label: 'Editor', icon: Scissors },
    { id: 'preview' as const, label: 'Preview', icon: Video },
    { id: 'download' as const, label: 'Download', icon: Download },
    { id: 'my-downloads' as const, label: 'Meus Downloads', icon: Download },
  ];

  const handlePanelClick = (panelId: typeof activePanel) => {
    setActivePanel(panelId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent truncate">
            UNA - Editor
          </h1>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-2">
            {panels.map((panel) => {
              const Icon = panel.icon;
              return (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm",
                    activePanel === panel.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {panel.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-2">
              {panels.map((panel) => {
                const Icon = panel.icon;
                return (
                  <button
                    key={panel.id}
                    onClick={() => handlePanelClick(panel.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left",
                      activePanel === panel.id
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {panel.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden grid grid-cols-12 gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Left Panel - Roteiro */}
        {activePanel === 'script' && (
          <div className="col-span-12 lg:col-span-6 overflow-y-auto space-y-3 sm:space-y-4">
            <ScriptGenerator />
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Roteiro Gerado
              </h2>
              <ScriptEditor />
            </div>
          </div>
        )}

        {/* Painel Download */}
        {activePanel === 'download' ? (
          <div className="col-span-12 overflow-y-auto">
            <YouTubeDownloader />
          </div>
        ) : activePanel === 'my-downloads' ? (
          <div className="col-span-12 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
              <DownloadsList />
            </div>
          </div>
        ) : activePanel === 'viral' ? (
          <div className="col-span-12 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Vídeos Virais Globais
                </h2>
              </div>
              <ViralVideoList />
            </div>
          </div>
        ) : (
          /* Center - Preview/Editor */
          <div className={cn(
            "overflow-y-auto",
            activePanel === 'script' ? "col-span-12 lg:col-span-6" : "col-span-12 lg:col-span-8"
          )}>
            <div className="space-y-3 sm:space-y-4">
              <VideoPlayer />
              {activePanel === 'editor' && (
                <div className="space-y-3 sm:space-y-4">
                  {/* Upload de Arquivos */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Upload de Arquivos
                      </h2>
                    </div>
                    <FileUploader />
                  </div>

                  {/* Timeline de Edição */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Timeline de Edição
                    </h2>
                    <EnhancedTimeline />
                  </div>

                  {/* Edição por IA */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Edição por IA
                    </h2>
                    <div className="space-y-4">
                      <AutoCutPanel />
                      <NarrationPanel />
                      <AutoCaptionsPanel />
                      <TransitionsPanel />
                      <TextOverlaysPanel />
                    </div>
                  </div>

                  {/* Exportar Vídeo */}
                  <ExportButton />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Panel - Preview Info */}
        {activePanel === 'preview' && (
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Informações do Projeto
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">Em edição</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Duração Total</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">0:00</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

