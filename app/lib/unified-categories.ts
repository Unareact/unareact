/**
 * Categorias Unificadas - Combina categorias do YouTube e categorias de produtos
 */

import { YOUTUBE_CATEGORIES } from './youtube-categories';
import { PRODUCT_CATEGORIES } from './product-categories';

export interface UnifiedCategory {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  type: 'youtube' | 'product';
  platform: 'youtube' | 'all'; // Em qual plataforma funciona
}

// Prefixos para distinguir tipos
const YT_PREFIX = 'yt:';
const PROD_PREFIX = 'prod:';

export const UNIFIED_CATEGORIES: UnifiedCategory[] = [
  // Opção "Todas" - funciona para todas as plataformas
  {
    id: 'all',
    name: 'Todas as Categorias',
    emoji: '🌐',
    description: 'Mostra todos os vídeos sem filtro por categoria',
    type: 'youtube',
    platform: 'all',
  },
  
  // Categorias do YouTube (só funcionam no YouTube)
  ...YOUTUBE_CATEGORIES.filter(cat => cat.id !== '0').map(cat => ({
    id: `${YT_PREFIX}${cat.id}`,
    name: cat.name,
    emoji: cat.emoji,
    type: 'youtube' as const,
    platform: 'youtube' as const,
  })),
  
  // Categorias de Produtos (funcionam em todas as plataformas)
  ...PRODUCT_CATEGORIES.filter(cat => cat.id !== 'all').map(cat => ({
    id: `${PROD_PREFIX}${cat.id}`,
    name: cat.name,
    emoji: cat.emoji,
    description: cat.description,
    type: 'product' as const,
    platform: 'all' as const,
  })),
];

export function getUnifiedCategoryById(id: string): UnifiedCategory | undefined {
  return UNIFIED_CATEGORIES.find(cat => cat.id === id);
}

export function parseCategoryId(unifiedId: string): { type: 'youtube' | 'product' | 'all'; id: string } {
  if (unifiedId === 'all') {
    return { type: 'all', id: 'all' };
  }
  
  if (unifiedId.startsWith(YT_PREFIX)) {
    return { type: 'youtube', id: unifiedId.replace(YT_PREFIX, '') };
  }
  
  if (unifiedId.startsWith(PROD_PREFIX)) {
    return { type: 'product', id: unifiedId.replace(PROD_PREFIX, '') };
  }
  
  // Fallback: assumir que é categoria do YouTube (compatibilidade)
  return { type: 'youtube', id: unifiedId };
}

export function getCategoriesForPlatform(platform: 'youtube' | 'tiktok' | 'all'): UnifiedCategory[] {
  if (platform === 'tiktok') {
    // TikTok só mostra categorias de produtos
    return UNIFIED_CATEGORIES.filter(cat => cat.platform === 'all');
  }
  
  if (platform === 'youtube') {
    // YouTube mostra todas as categorias
    return UNIFIED_CATEGORIES;
  }
  
  // 'all' mostra todas as categorias
  return UNIFIED_CATEGORIES;
}

