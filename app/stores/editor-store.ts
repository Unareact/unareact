import { create } from 'zustand';
import { ScriptSegment, VideoClip, Project, ScriptGenerationParams, ViralDiagnosis } from '@/app/types';

interface EditorState {
  // Projeto atual
  currentProject: Project | null;
  
  // Roteiro
  script: ScriptSegment[];
  isGeneratingScript: boolean;
  
  // Vídeo
  clips: VideoClip[];
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  
  // Diagnóstico Viral (para otimização de roteiros)
  currentViralDiagnosis: ViralDiagnosis | null;
  
  // UI
  activePanel: 'script' | 'editor' | 'preview' | 'viral' | 'download' | 'my-downloads';
  selectedClipId: string | null;
  pendingDownloadUrl: string | null; // URL do vídeo para download
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  setScript: (script: ScriptSegment[]) => void;
  addScriptSegment: (segment: ScriptSegment) => void;
  updateScriptSegment: (id: string, updates: Partial<ScriptSegment>) => void;
  deleteScriptSegment: (id: string) => void;
  
  addClip: (clip: VideoClip) => void;
  updateClip: (id: string, updates: Partial<VideoClip>) => void;
  deleteClip: (id: string) => void;
  setClips: (clips: VideoClip[]) => void;
  
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setDuration: (duration: number) => void;
  setActivePanel: (panel: 'script' | 'editor' | 'preview' | 'viral' | 'download' | 'my-downloads') => void;
  setSelectedClipId: (id: string | null) => void;
  setIsGeneratingScript: (generating: boolean) => void;
  setCurrentViralDiagnosis: (diagnosis: ViralDiagnosis | null) => void;
  setPendingDownloadUrl: (url: string | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Estado inicial
  currentProject: null,
  script: [],
  clips: [],
  currentTime: 0,
  isPlaying: false,
  duration: 0,
  activePanel: 'viral', // Sempre abre na aba Virais
  selectedClipId: null,
  isGeneratingScript: false,
  currentViralDiagnosis: null,
  pendingDownloadUrl: null,
  
  // Actions
  setCurrentProject: (project) => set({ currentProject: project }),
  
  setScript: (script) => set({ script }),
  
  addScriptSegment: (segment) =>
    set((state) => ({
      script: [...state.script, segment],
    })),
  
  updateScriptSegment: (id, updates) =>
    set((state) => ({
      script: state.script.map((seg) =>
        seg.id === id ? { ...seg, ...updates } : seg
      ),
    })),
  
  deleteScriptSegment: (id) =>
    set((state) => ({
      script: state.script.filter((seg) => seg.id !== id),
    })),
  
  addClip: (clip) =>
    set((state) => ({
      clips: [...state.clips, clip],
    })),
  
  updateClip: (id, updates) =>
    set((state) => ({
      clips: state.clips.map((clip) =>
        clip.id === id ? { ...clip, ...updates } : clip
      ),
    })),
  
  deleteClip: (id) =>
    set((state) => ({
      clips: state.clips.filter((clip) => clip.id !== id),
    })),
  
  setClips: (clips) => set({ clips }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setDuration: (duration) => set({ duration }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setSelectedClipId: (id) => set({ selectedClipId: id }),
  setIsGeneratingScript: (generating) => set({ isGeneratingScript: generating }),
  setCurrentViralDiagnosis: (diagnosis) => set({ currentViralDiagnosis: diagnosis }),
  setPendingDownloadUrl: (url) => set({ pendingDownloadUrl: url }),
}));

