'use client';

import { MainEditor } from '../../components/editor/MainEditor';
import { Breadcrumb } from '../../components/navigation/Breadcrumb';
import { useEffect, Suspense } from 'react';
import { useEditorStore } from '../../stores/editor-store';
import { useSearchParams } from 'next/navigation';

function PortalEditorContent() {
  const { setActivePanel } = useEditorStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Salvar contexto do Portal
    if (typeof window !== 'undefined') {
      localStorage.setItem('una-editor-context', 'portal');
    }

    const panel = searchParams.get('panel');
    if (panel && ['script', 'editor', 'preview', 'viral', 'download'].includes(panel)) {
      setActivePanel(panel as any);
    } else {
      setActivePanel('editor');
    }
  }, [searchParams, setActivePanel]);

  return <MainEditor />;
}

export default function PortalEditorPage() {
  return (
    <>
      <Breadcrumb />
      <Suspense fallback={<div>Carregando...</div>}>
        <PortalEditorContent />
      </Suspense>
    </>
  );
}

