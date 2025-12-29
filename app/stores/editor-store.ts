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
  
  // Undo/Redo
  history: Array<{ clips: VideoClip[]; script: ScriptSegment[] }>;
  historyIndex: number;
  maxHistorySize: number;
  isUndoRedo: boolean;
  
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
  
  // Undo/Redo Actions
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setIsUndoRedo: (value: boolean) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
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
  
  // Undo/Redo
  history: [{ clips: [], script: [] }], // Estado inicial
  historyIndex: 0,
  maxHistorySize: 50,
  isUndoRedo: false, // Flag para evitar salvar durante undo/redo
  
  // Actions
  setCurrentProject: (project) => set({ currentProject: project }),
  
  setScript: (script) => {
    set({ script });
    get().saveToHistory();
  },
  
  addScriptSegment: (segment) =>
    set((state) => {
      const newScript = [...state.script, segment];
      setTimeout(() => get().saveToHistory(), 0);
      return { script: newScript };
    }),
  
  updateScriptSegment: (id, updates) =>
    set((state) => {
      const newScript = state.script.map((seg) =>
        seg.id === id ? { ...seg, ...updates } : seg
      );
      setTimeout(() => get().saveToHistory(), 0);
      return { script: newScript };
    }),
  
  deleteScriptSegment: (id) =>
    set((state) => {
      const newScript = state.script.filter((seg) => seg.id !== id);
      setTimeout(() => get().saveToHistory(), 0);
      return { script: newScript };
    }),
  
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
  
  setClips: (clips) => {
    set({ clips });
    get().saveToHistory();
  },
  
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setDuration: (duration) => set({ duration }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setSelectedClipId: (id) => set({ selectedClipId: id }),
  setIsGeneratingScript: (generating) => set({ isGeneratingScript: generating }),
  setCurrentViralDiagnosis: (diagnosis) => set({ currentViralDiagnosis: diagnosis }),
  setPendingDownloadUrl: (url) => set({ pendingDownloadUrl: url }),
  
  // Undo/Redo
  setIsUndoRedo: (value) => set({ isUndoRedo: value }),
  
  saveToHistory: () => {
    const state = get();
    // Não salvar se estiver fazendo undo/redo
    if (state.isUndoRedo) return;
    
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    const currentState = {
      clips: JSON.parse(JSON.stringify(state.clips)),
      script: JSON.parse(JSON.stringify(state.script)),
    };
    
    // Não salvar se o estado for igual ao último
    const lastState = newHistory[newHistory.length - 1];
    if (
      lastState &&
      JSON.stringify(lastState.clips) === JSON.stringify(currentState.clips) &&
      JSON.stringify(lastState.script) === JSON.stringify(currentState.script)
    ) {
      return;
    }
    
    newHistory.push(currentState);
    
    // Limitar tamanho do histórico
    if (newHistory.length > state.maxHistorySize) {
      newHistory.shift();
    } else {
      // Apenas incrementar o índice se não estiver no final
      if (state.historyIndex < newHistory.length - 1) {
        // Se houver histórico futuro, descartá-lo
        newHistory.splice(state.historyIndex + 1);
      }
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
  
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      set({ isUndoRedo: true });
      const previousState = state.history[state.historyIndex - 1];
      set({
        clips: JSON.parse(JSON.stringify(previousState.clips)),
        script: JSON.parse(JSON.stringify(previousState.script)),
        historyIndex: state.historyIndex - 1,
        isUndoRedo: false,
      });
    }
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      set({ isUndoRedo: true });
      const nextState = state.history[state.historyIndex + 1];
      set({
        clips: JSON.parse(JSON.stringify(nextState.clips)),
        script: JSON.parse(JSON.stringify(nextState.script)),
        historyIndex: state.historyIndex + 1,
        isUndoRedo: false,
      });
    }
  },
  
  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },
  
  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },
}));

