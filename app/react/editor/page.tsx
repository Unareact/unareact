'use client';

import { MainEditor } from '../../components/editor/MainEditor';
import { Breadcrumb } from '../../components/navigation/Breadcrumb';
import { useEffect } from 'react';
import { useEditorStore } from '../../stores/editor-store';

export default function ReactEditorPage() {
  const { setActivePanel } = useEditorStore();

  useEffect(() => {
    setActivePanel('editor');
  }, [setActivePanel]);

  return (
    <>
      <Breadcrumb />
      <MainEditor />
    </>
  );
}

