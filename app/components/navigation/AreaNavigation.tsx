'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Dumbbell, Apple, TrendingUp, ArrowLeft } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function AreaNavigation() {
  const pathname = usePathname();

  const getAreaInfo = () => {
    if (pathname?.startsWith('/react')) {
      return {
        name: 'React',
        icon: Sparkles,
        color: 'from-purple-600 to-blue-600',
        href: '/react',
      };
    }
    if (pathname?.startsWith('/portal')) {
      return {
        name: 'Portal Magra',
        icon: Dumbbell,
        color: 'from-pink-500 to-purple-600',
        href: '/portal',
      };
    }
    if (pathname?.startsWith('/nutri')) {
      return {
        name: 'YLADA Nutri',
        icon: Apple,
        color: 'from-green-600 to-emerald-600',
        href: '/nutri',
      };
    }
    return null;
  };

  const areaInfo = getAreaInfo();
  if (!areaInfo) return null;

  const Icon = areaInfo.icon;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={areaInfo.href}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <Icon className={`w-5 h-5 bg-gradient-to-r ${areaInfo.color} bg-clip-text text-transparent`} />
            <span className="font-medium">{areaInfo.name}</span>
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trocar Área</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

