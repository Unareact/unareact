'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';
import { VideoClip } from '@/app/types';
import { useKeyboardShortcuts } from '@/app/hooks/useKeyboardShortcuts';
import { ScriptGenerator } from '../script/ScriptGenerator';
import { ScriptEditor } from '../script/ScriptEditor';
import { VideoPlayer } from '../player/VideoPlayer';
import { Timeline } from '../timeline/Timeline';
import { EnhancedTimeline } from '../timeline/EnhancedTimeline';
import { FileText, Video, Scissors, TrendingUp, Download, Upload, Menu, X, Sparkles, Bot, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/app/lib/utils';
import { ViralVideoList } from '../viral/ViralVideoList';
import { useRouter } from 'next/navigation';
import { YouTubeDownloader } from '../youtube/YouTubeDownloader';
import { FileUploader } from '../upload/FileUploader';
import { WorkflowGuide } from '../workflow/WorkflowGuide';
import { DownloadsList } from '../downloads/DownloadsList';
import { ExportButton } from './ExportButton';
import { DownloadButton } from './DownloadButton';
import { ImportButton } from './ImportButton';
import { AutoCutPanel } from '../ai-editing/AutoCutPanel';
import { NarrationPanel } from '../ai-editing/NarrationPanel';
import { AutoCaptionsPanel } from '../ai-editing/AutoCaptionsPanel';
import { TransitionsPanel } from '../ai-editing/TransitionsPanel';
import { TextOverlaysPanel } from '../ai-editing/TextOverlaysPanel';
import { AIEditingChat } from '../ai-editing/AIEditingChat';
import { EnhancedAIEditingChat } from '../ai-editing/EnhancedAIEditingChat';
import { CompleteAIChat } from '../ai-editing/CompleteAIChat';
import { AutoMediaSelector } from '../media/AutoMediaSelector';
import { AIImageGenerator } from '../media/AIImageGenerator';
import { AutoAssembly } from '../workflow/AutoAssembly';
import { MediaLibrary } from '../media/MediaLibrary';
import { VisualTemplateSelector } from '../templates/VisualTemplateSelector';
import { ResizableSplitter } from './ResizableSplitter';

export function MainEditor() {
  const { activePanel, setActivePanel, script, setScript, clips, addClip } = useEditorStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  // Ativar atalhos de teclado
  useKeyboardShortcuts();

  // Restaurar painel e roteiro do localStorage ao carregar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPanel = localStorage.getItem('una-active-panel');
      const savedScript = localStorage.getItem('una-nutri-script');
      
      if (savedPanel && ['script', 'editor', 'preview', 'viral', 'download', 'my-downloads'].includes(savedPanel)) {
        setActivePanel(savedPanel as typeof activePanel);
        // Limpar após usar
        localStorage.removeItem('una-active-panel');
      }
      
      if (savedScript && script.length === 0) {
        try {
          const parsedScript = JSON.parse(savedScript);
          setScript(parsedScript);
          // Limpar após usar
          localStorage.removeItem('una-nutri-script');
        } catch (e) {
          console.error('Erro ao restaurar roteiro:', e);
        }
      }
    }
  }, [setActivePanel, setScript, script.length]);

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

  // Removido handlePortalMagraClick - não deve permitir navegação entre áreas

  // Detectar área atual para botão voltar
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const getBackUrl = () => {
    if (pathname.includes('/nutri')) return '/nutri';
    if (pathname.includes('/portal')) return '/portal';
    if (pathname.includes('/react')) return '/react';
    return '/';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header - Simplificado quando em edição */}
      {activePanel === 'editor' ? (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={getBackUrl()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Voltar</span>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Editor por IA
            </h1>
            <div className="w-20"></div> {/* Spacer para centralizar */}
          </div>
        </header>
      ) : (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent truncate">
              UNA - Editor
            </h1>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-2 items-center">
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
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full h-full">
        {/* Left Panel - Roteiro */}
        {activePanel === 'script' && (
          <div className="w-full lg:w-1/2 h-full overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
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
          <div className="w-full h-full overflow-y-auto p-3 sm:p-4">
            <YouTubeDownloader />
          </div>
        ) : activePanel === 'my-downloads' ? (
          <div className="w-full h-full overflow-y-auto p-3 sm:p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
              <DownloadsList />
            </div>
          </div>
        ) : activePanel === 'viral' ? (
          <div className="w-full h-full overflow-y-auto p-3 sm:p-4">
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
          <div className="w-full h-full p-3 sm:p-4 overflow-y-auto">
            {activePanel === 'editor' ? (
              <div className="h-full">
                {/* Layout focado no Chat - Tudo acontece na conversa */}
                <div className="h-full flex flex-col">
                  {/* Header com botões Importar/Exportar */}
                  <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">Editor por IA</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Tudo acontece na conversa</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ImportButton />
                      <DownloadButton />
                      <ExportButton variant="button" />
                    </div>
                  </div>

                  {/* Layout: Player + Chat - Com divisão redimensionável */}
                  <div className="flex-1 min-h-0 p-4">
                    <ResizableSplitter
                      left={
                        <div className="h-full flex flex-col gap-3">
                          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                              <Video className="w-5 h-5 text-purple-600" />
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Preview do Vídeo</h3>
                            </div>
                            <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg min-h-[300px]">
                              <VideoPlayer />
                            </div>
                            {clips.length === 0 && (
                              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
                                💡 Adicione clips à timeline para visualizar o preview
                              </div>
                            )}
                          </div>
                          
                          {/* Info rápida */}
                          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-400">{script.length} segmentos</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-400">{clips.length} clips</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                      right={
                        <div className="h-full">
                          <CompleteAIChat />
                        </div>
                      }
                      defaultLeftWidth={35}
                      minLeftWidth={25}
                      maxLeftWidth={60}
                      storageKey="editor-video-chat-split"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Layout normal para outros painéis */
              <div className="w-full h-full overflow-y-auto">
                <div className="space-y-3 sm:space-y-4">
                  <VideoPlayer />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Panel - Preview Info */}
        {activePanel === 'preview' && (
          <div className="w-full lg:w-1/3 h-full overflow-y-auto p-3 sm:p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
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
          </div>
        )}
      </div>

    </div>
  );
}

