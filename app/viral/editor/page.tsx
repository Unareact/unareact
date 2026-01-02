'use client';

import { MainEditor } from '../../components/editor/MainEditor';
import { Breadcrumb } from '../../components/navigation/Breadcrumb';
import { useEffect, Suspense } from 'react';
import { useEditorStore } from '../../stores/editor-store';
import { useSearchParams } from 'next/navigation';

function ViralEditorContent() {
  const { setActivePanel } = useEditorStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const panel = searchParams.get('panel');
    if (panel && ['script', 'editor', 'preview', 'viral', 'download'].includes(panel)) {
      setActivePanel(panel as any);
    } else {
      setActivePanel('editor');
    }
    
    // Marcar contexto como "viral" para o editor
    if (typeof window !== 'undefined') {
      localStorage.setItem('una-editor-context', 'viral');
    }
  }, [searchParams, setActivePanel]);

  return <MainEditor />;
}

export default function ViralEditorPage() {
  return (
    <>
      <Breadcrumb />
      <Suspense fallback={<div>Carregando...</div>}>
        <ViralEditorContent />
      </Suspense>
    </>
  );
}

