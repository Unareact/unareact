'use client';

import { Breadcrumb } from '../components/navigation/Breadcrumb';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { PortalWorkflowGuide } from '../components/portal/PortalWorkflowGuide';

export default function PortalPage() {

  return (
    <>
      <Breadcrumb />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex items-center gap-3 mb-4">
              <Link 
                href="/"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">Portal Magra</h1>
                  <p className="text-lg text-white/90 mt-1">
                    Vídeos de alimentação, nutrição e receitas para mulheres brasileiras nos EUA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-8">
          {/* Workflow Guide - Tudo integrado aqui */}
          <PortalWorkflowGuide />

          {/* Info Box */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">🎯 Foco Exclusivo do Portal</h3>
            <p className="text-gray-600 mb-4">
              Escanear os <strong>melhores vídeos de alimentação, nutrição e receitas</strong> que estão engajando <strong>mulheres brasileiras nos Estados Unidos</strong> e criar conteúdo que converta.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>✓</strong> Buscar vídeos virais sobre alimentação, nutrição e receitas</p>
              <p><strong>✓</strong> Foco em conteúdo que engaja mulheres brasileiras nos EUA</p>
              <p><strong>✓</strong> Gerar roteiros de conversão otimizados para esse perfil</p>
              <p><strong>✓</strong> Criar vídeos com CTAs para avaliação de $10</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

