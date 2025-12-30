'use client';

import { useState } from 'react';
import { NutriVideoCreator } from '@/app/components/nutri/NutriVideoCreator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NutriPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/nutri/editor"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Ir para o Editor</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                YLADA Nutri - Criador de Vídeos
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NutriVideoCreator />
      </main>
    </div>
  );
}

