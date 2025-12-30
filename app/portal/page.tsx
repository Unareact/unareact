'use client';

import { Breadcrumb } from '../components/navigation/Breadcrumb';
import Link from 'next/link';
import { Sparkles, TrendingUp, FileText, Scissors, Video, Download, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PortalPage() {
  const router = useRouter();

  const quickActions = [
    {
      label: 'Buscar Vídeos Virais',
      description: 'Encontre vídeos sobre fitness e bem-estar',
      icon: TrendingUp,
      href: '/portal/viral',
      color: 'from-pink-500 to-purple-600',
    },
    {
      label: 'Criar Roteiro',
      description: 'Gere roteiro de conversão para Portal Magra',
      icon: FileText,
      href: '/portal/editor?panel=script',
      color: 'from-purple-500 to-blue-600',
    },
    {
      label: 'Editor',
      description: 'Edite seu vídeo completo',
      icon: Scissors,
      href: '/portal/editor',
      color: 'from-blue-500 to-cyan-600',
    },
  ];

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
                    Vídeos de fitness e bem-estar para conversão
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Comece Aqui</h2>
            <p className="text-gray-600">
              Escolha como você quer começar a criar seu vídeo
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-200"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{action.label}</h3>
                  <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                  <div className="flex items-center gap-2 text-purple-600 font-medium">
                    <span>Começar</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">🎯 Objetivo do Portal Magra</h3>
            <p className="text-gray-600 mb-4">
              Criar vídeos que convertam mulheres interessadas em se cuidar em clientes do Portal Magra.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>✓</strong> Buscar vídeos virais sobre fitness e bem-estar</p>
              <p><strong>✓</strong> Gerar roteiros de conversão otimizados</p>
              <p><strong>✓</strong> Criar vídeos com CTAs para avaliação de $10</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

