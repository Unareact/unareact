/**
 * Configuração e informações sobre APIs de plataformas
 */

export interface PlatformConfig {
  name: string;
  apiAvailable: boolean;
  isFree: boolean;
  requiresApproval: boolean;
  dailyLimit?: number;
  cost?: string;
  status: 'implemented' | 'in-development' | 'planned';
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  youtube: {
    name: 'YouTube',
    apiAvailable: true,
    isFree: true,
    requiresApproval: false,
    dailyLimit: 10000, // unidades/dia
    cost: 'Gratuito até 10.000 unidades/dia',
    status: 'implemented',
  },
  tiktok: {
    name: 'TikTok',
    apiAvailable: true, // Via APIs de terceiros (RapidAPI)
    isFree: false,
    requiresApproval: false,
    cost: '$20-100/mês (APIs terceiros)',
    status: 'implemented',
  },
  facebook: {
    name: 'Facebook',
    apiAvailable: true,
    isFree: true,
    requiresApproval: false,
    dailyLimit: 4800, // requisições/dia
    cost: 'Gratuito (apenas páginas próprias)',
    status: 'planned',
  },
  instagram: {
    name: 'Instagram',
    apiAvailable: true,
    isFree: true,
    requiresApproval: false,
    cost: 'Gratuito (apenas contas próprias)',
    status: 'planned',
  },
};

export function getPlatformInfo(platform: string): PlatformConfig {
  return PLATFORMS[platform] || {
    name: platform,
    apiAvailable: false,
    isFree: false,
    requiresApproval: true,
    status: 'planned',
  };
}

export function isPlatformAvailable(platform: string): boolean {
  const config = getPlatformInfo(platform);
  return config.apiAvailable && config.status === 'implemented';
}

