'use client';

import { MainEditor } from '../components/editor/MainEditor';
import { Breadcrumb } from '../components/navigation/Breadcrumb';
import { useEffect } from 'react';
import { useEditorStore } from '../stores/editor-store';

export default function ReactPage() {
  const { setActivePanel } = useEditorStore();

  useEffect(() => {
    // Abrir na aba Virais por padrão para React
    setActivePanel('viral');
  }, [setActivePanel]);

  return (
    <>
      <Breadcrumb />
      <MainEditor />
    </>
  );
}

