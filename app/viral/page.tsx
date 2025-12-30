'use client';

import { useEffect } from 'react';
import { ViralVideoList } from '../components/viral/ViralVideoList';
import { TrendingUp, Sparkles, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

const LAST_SEARCH_KEY = 'una-last-viral-search';

export default function ViralPage() {
  useEffect(() => {
    // Aplicar filtros para busca de vídeos virais (foco em views e reação)
    const viralFilters = {
      platform: 'all',
      region: 'all',
      minLikes: 0,
      maxDaysAgo: 0,
      minLikesPerDay: 0,
      unifiedCategory: 'all',
      category: '0',
      productCategory: 'all',
      sortBy: 'viralScore',
      videos: [],
      stats: { total: 0, filtered: false, regions: 'all' },
    };
    
    if (typeof window !== 'undefined') {
      // Salvar no localStorage
      localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(viralFilters));
      
      // Aguardar um pouco antes de disparar o evento
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('viral-search', { detail: viralFilters }));
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link 
                href="/"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Voltar para a página inicial"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">Vídeos Virais</h1>
                  <p className="text-sm sm:text-base text-white/90 mt-1">
                    Encontre vídeos virais para reagir e conseguir muitos views
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
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Buscar Vídeos Virais
            </h2>
          </div>
          
          {/* Info sobre o fluxo */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              <strong>🎯 Objetivo deste fluxo:</strong> Encontrar vídeos virais para criar conteúdo de reação, 
              conseguir muitos views e engajamento. Foque em vídeos com alto viral score e engajamento.
            </p>
          </div>

          <ViralVideoList />
        </div>
      </main>
    </div>
  );
}

