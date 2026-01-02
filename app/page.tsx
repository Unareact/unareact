'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Dumbbell, 
  Apple, 
  Video, 
  TrendingUp, 
  FileText, 
  Scissors,
  ArrowRight,
  Zap,
  CheckCircle2,
  ShoppingCart,
  Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const businesses = [
    {
      id: 'react',
      name: 'React',
      icon: Sparkles,
      description: 'Criação de vídeos virais e trending',
      color: 'from-purple-600 to-blue-600',
      hoverColor: 'from-purple-700 to-blue-700',
      bgColor: 'from-purple-50 to-blue-50',
      features: [
        'Buscar vídeos virais',
        'Gerar roteiros com IA',
        'Editor completo',
        'Exportação de vídeos'
      ],
      route: '/viral/editor',
      badge: 'Popular'
    },
    {
      id: 'vendas',
      name: 'Vendas',
      icon: Target,
      description: 'Vídeos, posts e criativos de vendas em geral',
      color: 'from-yellow-600 to-orange-600',
      hoverColor: 'from-yellow-700 to-orange-700',
      bgColor: 'from-yellow-50 to-orange-50',
      features: [
        'Criativos de anúncios',
        'Roteiros de vendas',
        'Templates de marketing',
        'Foco em conversão'
      ],
      route: '/vendas',
      badge: 'Novo'
    },
    {
      id: 'portal',
      name: 'Portal Magra',
      icon: Dumbbell,
      description: 'Vídeos de fitness e bem-estar',
      color: 'from-orange-600 to-red-600',
      hoverColor: 'from-orange-700 to-red-700',
      bgColor: 'from-orange-50 to-red-50',
      features: [
        'Templates de fitness',
        'Roteiros otimizados',
        'Biblioteca de mídia',
        'Foco em resultados'
      ],
      route: '/portal',
      badge: null
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">UNA</h1>
                <p className="text-xs text-gray-500">Plataforma de Criação de Vídeos</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/viral/editor" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                React
              </Link>
              <Link href="/vendas/editor" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Vendas
              </Link>
              <Link href="/portal" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Portal Magra
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Escolha Seu Negócio
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Crie vídeos profissionais com IA. Escolha o negócio que melhor se adapta ao seu conteúdo.
          </p>
        </div>

        {/* Business Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-12">
          {businesses.map((business) => {
            const Icon = business.icon;
            return (
              <Link
                key={business.id}
                href={business.route}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-transparent"
              >
                {/* Badge */}
                {business.badge && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${business.color} z-10`}>
                    {business.badge}
                  </div>
                )}

                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${business.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative p-6 sm:p-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${business.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 transition-all">
                    {business.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {business.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {business.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className={`w-4 h-4 text-transparent bg-gradient-to-r ${business.color} bg-clip-text flex-shrink-0`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className={`flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r ${business.color} text-white hover:opacity-90 transition-all`}>
                    <span className="font-semibold">Criar Vídeo</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 mb-1">500+</div>
            <div className="text-sm text-gray-600">Vídeos Criados</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 mb-1">2</div>
            <div className="text-sm text-gray-600">Modelos de Negócio</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 mb-1">IA</div>
            <div className="text-sm text-gray-600">Powered</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 UNA - Plataforma de Criação de Vídeos</p>
            <p className="mt-2">Crie vídeos profissionais com inteligência artificial</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
