export type TemplateStyle = 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant' | 'playful';

export interface VisualTemplate {
  id: string;
  name: string;
  description: string;
  style: TemplateStyle;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold' | 'semibold';
  };
  animations: {
    textEntrance: 'fade' | 'slide' | 'zoom' | 'bounce';
    transition: 'fade' | 'slide' | 'zoom' | 'wipe';
  };
  effects: {
    blur: number;
    brightness: number;
    contrast: number;
  };
}

export const VISUAL_TEMPLATES: VisualTemplate[] = [
  {
    id: 'modern-clean',
    name: 'Moderno e Limpo',
    description: 'Design minimalista com cores vibrantes e tipografia moderna',
    style: 'modern',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#ffffff',
      text: '#1f2937',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: 24,
      fontWeight: 'semibold',
    },
    animations: {
      textEntrance: 'fade',
      transition: 'fade',
    },
    effects: {
      blur: 0,
      brightness: 1,
      contrast: 1,
    },
  },
  {
    id: 'classic-professional',
    name: 'Clássico Profissional',
    description: 'Estilo tradicional e elegante para conteúdo corporativo',
    style: 'classic',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      background: '#f8fafc',
      text: '#0f172a',
    },
    typography: {
      fontFamily: 'Georgia, serif',
      fontSize: 22,
      fontWeight: 'normal',
    },
    animations: {
      textEntrance: 'slide',
      transition: 'fade',
    },
    effects: {
      blur: 0,
      brightness: 1,
      contrast: 1.1,
    },
  },
  {
    id: 'minimal-elegant',
    name: 'Minimalista Elegante',
    description: 'Simplicidade com toque sofisticado',
    style: 'minimal',
    colors: {
      primary: '#000000',
      secondary: '#4b5563',
      accent: '#9ca3af',
      background: '#ffffff',
      text: '#111827',
    },
    typography: {
      fontFamily: 'Helvetica, sans-serif',
      fontSize: 20,
      fontWeight: 'normal',
    },
    animations: {
      textEntrance: 'fade',
      transition: 'fade',
    },
    effects: {
      blur: 0,
      brightness: 1,
      contrast: 1,
    },
  },
  {
    id: 'bold-vibrant',
    name: 'Ousado e Vibrante',
    description: 'Cores intensas e animações dinâmicas para máximo impacto',
    style: 'bold',
    colors: {
      primary: '#ef4444',
      secondary: '#f59e0b',
      accent: '#10b981',
      background: '#000000',
      text: '#ffffff',
    },
    typography: {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: 28,
      fontWeight: 'bold',
    },
    animations: {
      textEntrance: 'bounce',
      transition: 'zoom',
    },
    effects: {
      blur: 0,
      brightness: 1.1,
      contrast: 1.2,
    },
  },
  {
    id: 'elegant-luxury',
    name: 'Elegante e Luxuoso',
    description: 'Refinado e sofisticado para marcas premium',
    style: 'elegant',
    colors: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      accent: '#fbbf24',
      background: '#0f172a',
      text: '#f1f5f9',
    },
    typography: {
      fontFamily: 'Playfair Display, serif',
      fontSize: 26,
      fontWeight: 'semibold',
    },
    animations: {
      textEntrance: 'zoom',
      transition: 'fade',
    },
    effects: {
      blur: 0,
      brightness: 0.9,
      contrast: 1.1,
    },
  },
  {
    id: 'playful-fun',
    name: 'Divertido e Descontraído',
    description: 'Energético e descontraído para conteúdo casual',
    style: 'playful',
    colors: {
      primary: '#f59e0b',
      secondary: '#ec4899',
      accent: '#06b6d4',
      background: '#fef3c7',
      text: '#78350f',
    },
    typography: {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: 24,
      fontWeight: 'normal',
    },
    animations: {
      textEntrance: 'bounce',
      transition: 'slide',
    },
    effects: {
      blur: 0,
      brightness: 1.2,
      contrast: 1,
    },
  },
];

/**
 * Aplica um template visual a um vídeo
 */
export function applyVisualTemplate(
  template: VisualTemplate,
  clips: any[]
): any[] {
  return clips.map(clip => ({
    ...clip,
    template: {
      colors: template.colors,
      typography: template.typography,
      animations: template.animations,
      effects: template.effects,
    },
  }));
}

