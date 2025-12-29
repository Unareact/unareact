'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/app/stores/editor-store';

export function useKeyboardShortcuts() {
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em um input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Space - Play/Pause
      if (e.code === 'Space' && !e.shiftKey) {
        e.preventDefault();
        setIsPlaying(!isPlaying);
        return;
      }

      // Ctrl+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
        return;
      }

      // Ctrl+Shift+Z ou Ctrl+Y - Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
        return;
      }

      // Setas - Navegar no vídeo
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
          setCurrentTime(Math.max(0, currentTime - 10)); // Shift + ← = -10s
        } else {
          setCurrentTime(Math.max(0, currentTime - 1)); // ← = -1s
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
          setCurrentTime(Math.min(duration, currentTime + 10)); // Shift + → = +10s
        } else {
          setCurrentTime(Math.min(duration, currentTime + 1)); // → = +1s
        }
        return;
      }

      // Home - Ir para início
      if (e.key === 'Home') {
        e.preventDefault();
        setCurrentTime(0);
        return;
      }

      // End - Ir para fim
      if (e.key === 'End') {
        e.preventDefault();
        setCurrentTime(duration);
        return;
      }

      // K - Play/Pause (alternativa)
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
        return;
      }

      // J - Voltar 10s
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setCurrentTime(Math.max(0, currentTime - 10));
        return;
      }

      // L - Avançar 10s
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setCurrentTime(Math.min(duration, currentTime + 10));
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);
}

