import { create } from 'zustand';
import { ScriptSegment, VideoClip, Project, ScriptGenerationParams } from '@/app/types';

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
  
  // UI
  activePanel: 'script' | 'editor' | 'preview' | 'viral' | 'download';
  selectedClipId: string | null;
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  setScript: (script: ScriptSegment[]) => void;
  addScriptSegment: (segment: ScriptSegment) => void;
  updateScriptSegment: (id: string, updates: Partial<ScriptSegment>) => void;
  deleteScriptSegment: (id: string) => void;
  
  addClip: (clip: VideoClip) => void;
  updateClip: (id: string, updates: Partial<VideoClip>) => void;
  deleteClip: (id: string) => void;
  
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setDuration: (duration: number) => void;
  setActivePanel: (panel: 'script' | 'editor' | 'preview' | 'viral' | 'download') => void;
  setSelectedClipId: (id: string | null) => void;
  setIsGeneratingScript: (generating: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Estado inicial
  currentProject: null,
  script: [],
  clips: [],
  currentTime: 0,
  isPlaying: false,
  duration: 0,
  activePanel: 'script',
  selectedClipId: null,
  isGeneratingScript: false,
  
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
  
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setDuration: (duration) => set({ duration }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setSelectedClipId: (id) => set({ selectedClipId: id }),
  setIsGeneratingScript: (generating) => set({ isGeneratingScript: generating }),
}));

