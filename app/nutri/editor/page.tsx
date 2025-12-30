'use client';

import { MainEditor } from '../../components/editor/MainEditor';
import { Breadcrumb } from '../../components/navigation/Breadcrumb';
import { useEffect } from 'react';
import { useEditorStore } from '../../stores/editor-store';

export default function NutriEditorPage() {
  const { setActivePanel, setScript, script } = useEditorStore();

  useEffect(() => {
    // Restaurar script do localStorage se não houver script ainda
    if (script.length === 0 && typeof window !== 'undefined') {
      const savedScript = localStorage.getItem('una-nutri-script');
      if (savedScript) {
        try {
          const parsedScript = JSON.parse(savedScript);
          setScript(parsedScript);
        } catch (e) {
          console.error('Erro ao restaurar roteiro:', e);
        }
      }
    }
    
    // Garantir que está no painel editor
    setActivePanel('editor');
  }, [setActivePanel, setScript, script.length]);

  return (
    <>
      <Breadcrumb />
      <MainEditor />
    </>
  );
}

