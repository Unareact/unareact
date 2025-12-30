'use client';

import { MainEditor } from '../components/editor/MainEditor';
import { Breadcrumb } from '../components/navigation/Breadcrumb';
import { useEffect } from 'react';
import { useEditorStore } from '../stores/editor-store';

const LAST_SEARCH_KEY = 'una-last-viral-search';

export default function ReactPage() {
  const { setActivePanel } = useEditorStore();

  useEffect(() => {
    // Abrir na aba Virais por padrão para React
    setActivePanel('viral');
    
    // Apenas configurar filtros padrão, SEM buscar automaticamente
    // Isso evita consumo desnecessário de créditos da API
    if (typeof window !== 'undefined') {
      const reactFilters = {
        platform: 'all',
        region: 'ALL_AMERICAS',
        minLikes: 0,
        maxDaysAgo: 0,
        minLikesPerDay: 0,
        unifiedCategory: 'all',
        category: '0',
        productCategory: 'all',
        sortBy: 'viralScore',
        videos: [],
        stats: { total: 0, filtered: false, regions: 'ALL_AMERICAS' },
      };
      
      // Salvar no localStorage (apenas para restaurar filtros)
      localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(reactFilters));
      
      // Disparar evento apenas para atualizar filtros, SEM buscar
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('react-viral-search', { detail: reactFilters }));
      }, 100);
    }
  }, [setActivePanel]);

  return (
    <>
      <Breadcrumb />
      <MainEditor />
    </>
  );
}

