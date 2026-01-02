'use client';

import { Breadcrumb } from '../components/navigation/Breadcrumb';
import Link from 'next/link';
import { Target, TrendingUp, FileText, Scissors, Video, Download, ArrowRight, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VendasPage() {
  const router = useRouter();

  const quickActions = [
    {
      label: 'Buscar Vídeos Virais',
      description: 'Analise vídeos virais e aplique insights em anúncios',
      icon: TrendingUp,
      href: '/viral',
      color: 'from-purple-500 to-pink-600',
    },
    {
      label: 'Criar Roteiro de Vendas',
      description: 'Gere roteiros focados em conversão',
      icon: FileText,
      href: '/vendas/editor?panel=script',
      color: 'from-yellow-500 to-orange-600',
    },
    {
      label: 'Editor de Anúncios',
      description: 'Crie criativos de vendas profissionais',
      icon: Scissors,
      href: '/vendas/editor',
      color: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <>
      <Breadcrumb />
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Target className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">Vendas Marketing</h1>
                <p className="text-lg sm:text-xl text-white/90 mt-1">
                  Vídeos, posts e criativos de vendas em geral
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Descrição */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg mb-8 border border-yellow-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Crie Anúncios que Convertem 🎯
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              Plataforma completa para criar <strong>criativos de vendas profissionais</strong>:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-yellow-600">✓</span>
                <span>Vídeos de anúncios otimizados para conversão</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-600">✓</span>
                <span>Posts e criativos para redes sociais</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-600">✓</span>
                <span>Roteiros de vendas com CTAs poderosos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-600">✓</span>
                <span>Análise de vídeos virais para aplicar em anúncios</span>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-200 hover:border-transparent"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{action.label}</h3>
                  <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                  <div className="flex items-center text-yellow-600 font-semibold group-hover:gap-2 transition-all">
                    <span>Acessar</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 border border-yellow-300">
            <div className="flex items-start gap-4">
              <ShoppingCart className="w-8 h-8 text-yellow-700 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Foco em Conversão e ROI
                </h3>
                <p className="text-gray-700">
                  Todos os recursos são otimizados para criar anúncios que <strong>vendem</strong>. 
                  Use insights de vídeos virais, templates de vendas e roteiros focados em conversão 
                  para maximizar seus resultados.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

