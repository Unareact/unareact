'use client';

import { useEffect } from 'react';
import { ViralVideoList } from '../components/viral/ViralVideoList';
import { TrendingUp, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const LAST_SEARCH_KEY = 'una-last-viral-search';

export default function PortalPage() {
  useEffect(() => {
    // Aplicar filtros do Portal Magra automaticamente ao carregar a página
    const portalMagraFilters = {
      platform: 'all',
      region: 'US', // Focar em vídeos dos EUA
      minLikes: 0,
      maxDaysAgo: 0,
      minLikesPerDay: 0,
      unifiedCategory: 'prod:portal-magra', // Categoria Portal Magra
      category: '0',
      productCategory: 'portal-magra',
      sortBy: 'viralScore',
      videos: [],
      stats: { total: 0, filtered: false, regions: 'US' },
    };
    
    if (typeof window !== 'undefined') {
      // Salvar no localStorage
      localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(portalMagraFilters));
      
      // Aguardar um pouco antes de disparar o evento para garantir que o componente está montado
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('portal-magra-search', { detail: portalMagraFilters }));
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header do Portal */}
      <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link 
                href="/"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Voltar para o editor"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">Portal Magra</h1>
                  <p className="text-sm sm:text-base text-white/90 mt-1">
                    Vídeos virais para mulheres que estão decidindo se cuidar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Vídeos Virais - Portal Magra
            </h2>
          </div>
          
          {/* Info sobre os filtros aplicados */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <p className="text-sm text-purple-800 dark:text-purple-300">
              <strong>✨ Filtros aplicados:</strong> Buscando vídeos sobre hábitos alimentares, rotina saudável e 
              acompanhamento para mulheres no momento de decisão de se cuidar. Região: EUA.
            </p>
          </div>

          <ViralVideoList />
        </div>
      </main>
    </div>
  );
}

