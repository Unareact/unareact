/**
 * Sistema de Comandos de IA para Edição Automática
 * Permite que a IA execute ações diretamente baseado em comandos do usuário
 */

import { VideoClip, ScriptSegment } from '@/app/types';
import { suggestAutoCuts, applyCuts, CutSuggestion } from './auto-cut';
import { suggestTransitions, applyTransitions, Transition } from './transitions';
import { applyVisualTemplate, VISUAL_TEMPLATES } from '@/app/lib/visual-templates';

export interface AICommand {
  type: 'cut' | 'transition' | 'template' | 'speed' | 'caption' | 'narration' | 'text-overlay';
  action: string;
  params?: any;
  confidence: number;
}

export interface AICommandResult {
  success: boolean;
  message: string;
  applied: boolean;
  data?: any;
}

/**
 * Analisa o comando do usuário e retorna ação a ser executada
 */
export async function parseUserCommand(
  userInput: string,
  script: ScriptSegment[],
  clips: VideoClip[]
): Promise<AICommand | null> {
  const lowerInput = userInput.toLowerCase();
  
  // Comandos de corte
  if (lowerInput.includes('cort') || lowerInput.includes('cut') || lowerInput.includes('remov')) {
    if (lowerInput.includes('rápido') || lowerInput.includes('rapido') || lowerInput.includes('frequente')) {
      return {
        type: 'cut',
        action: 'apply-fast-cuts',
        params: { style: 'fast', frequency: 'high' },
        confidence: 0.9,
      };
    }
    if (lowerInput.includes('aplic') || lowerInput.includes('faça') || lowerInput.includes('fazer')) {
      return {
        type: 'cut',
        action: 'apply-auto-cuts',
        params: {},
        confidence: 0.85,
      };
    }
    return {
      type: 'cut',
      action: 'suggest-cuts',
      params: {},
      confidence: 0.7,
    };
  }
  
  // Comandos de transição
  if (lowerInput.includes('transi') || lowerInput.includes('efeito')) {
    if (lowerInput.includes('suav') || lowerInput.includes('fade')) {
      return {
        type: 'transition',
        action: 'apply-smooth-transitions',
        params: { type: 'fade' },
        confidence: 0.9,
      };
    }
    if (lowerInput.includes('dinâmico') || lowerInput.includes('dinamico') || lowerInput.includes('wipe')) {
      return {
        type: 'transition',
        action: 'apply-dynamic-transitions',
        params: { type: 'wipe' },
        confidence: 0.9,
      };
    }
    if (lowerInput.includes('aplic') || lowerInput.includes('faça')) {
      return {
        type: 'transition',
        action: 'apply-auto-transitions',
        params: {},
        confidence: 0.85,
      };
    }
  }
  
  // Comandos de template
  if (lowerInput.includes('template') || lowerInput.includes('estilo') || lowerInput.includes('visual')) {
    if (lowerInput.includes('profissional') || lowerInput.includes('corporativo')) {
      return {
        type: 'template',
        action: 'apply-template',
        params: { templateId: 'classic-professional' },
        confidence: 0.9,
      };
    }
    if (lowerInput.includes('moderno') || lowerInput.includes('limpo')) {
      return {
        type: 'template',
        action: 'apply-template',
        params: { templateId: 'modern-clean' },
        confidence: 0.9,
      };
    }
    if (lowerInput.includes('elegant') || lowerInput.includes('luxo')) {
      return {
        type: 'template',
        action: 'apply-template',
        params: { templateId: 'elegant-luxury' },
        confidence: 0.9,
      };
    }
  }
  
  // Comandos de velocidade
  if (lowerInput.includes('velocidade') || lowerInput.includes('rápido') || lowerInput.includes('rapido') || lowerInput.includes('aceler')) {
    if (lowerInput.includes('2x') || lowerInput.includes('dobro')) {
      return {
        type: 'speed',
        action: 'set-speed',
        params: { speed: 2 },
        confidence: 0.9,
      };
    }
    if (lowerInput.includes('1.5x') || lowerInput.includes('meio')) {
      return {
        type: 'speed',
        action: 'set-speed',
        params: { speed: 1.5 },
        confidence: 0.9,
      };
    }
    if (lowerInput.includes('lento') || lowerInput.includes('slow')) {
      return {
        type: 'speed',
        action: 'set-speed',
        params: { speed: 0.5 },
        confidence: 0.9,
      };
    }
  }
  
  // Comandos de legenda
  if (lowerInput.includes('legenda') || lowerInput.includes('caption') || lowerInput.includes('subtítulo')) {
    if (lowerInput.includes('aplic') || lowerInput.includes('adicion') || lowerInput.includes('ger')) {
      return {
        type: 'caption',
        action: 'generate-captions',
        params: {},
        confidence: 0.85,
      };
    }
  }
  
  // Comandos de narração
  if (lowerInput.includes('narra') || lowerInput.includes('narracao') || lowerInput.includes('voz')) {
    if (lowerInput.includes('aplic') || lowerInput.includes('ger')) {
      return {
        type: 'narration',
        action: 'generate-narration',
        params: { voice: lowerInput.includes('feminin') ? 'feminine' : 'masculine' },
        confidence: 0.85,
      };
    }
  }
  
  return null;
}

/**
 * Executa um comando de IA
 */
export async function executeAICommand(
  command: AICommand,
  script: ScriptSegment[],
  clips: VideoClip[],
  setClips: (clips: VideoClip[]) => void,
  setScript?: (script: ScriptSegment[]) => void
): Promise<AICommandResult> {
  try {
    switch (command.type) {
      case 'cut':
        if (command.action === 'apply-auto-cuts' || command.action === 'apply-fast-cuts') {
          const suggestions = await suggestAutoCuts(clips, script);
          if (suggestions.length === 0) {
            return {
              success: false,
              message: 'Não foi possível gerar sugestões de corte. Verifique se há roteiro e clips.',
              applied: false,
            };
          }
          
          // Aplicar automaticamente se for comando direto
          const newClips = applyCuts(clips, suggestions);
          setClips(newClips);
          
          return {
            success: true,
            message: `✅ Apliquei ${suggestions.length} cortes automaticamente!`,
            applied: true,
            data: { cutsApplied: suggestions.length },
          };
        }
        break;
        
      case 'transition':
        if (command.action === 'apply-auto-transitions' || command.action.includes('apply')) {
          const transitions = await suggestTransitions(clips, script);
          if (transitions.length === 0) {
            return {
              success: false,
              message: 'Não foi possível gerar transições. Adicione pelo menos 2 clips.',
              applied: false,
            };
          }
          
          // Aplicar automaticamente
          const newClips = applyTransitions(clips, transitions);
          setClips(newClips);
          
          return {
            success: true,
            message: `✅ Apliquei ${transitions.length} transições automaticamente!`,
            applied: true,
            data: { transitionsApplied: transitions.length },
          };
        }
        break;
        
      case 'template':
        if (command.action === 'apply-template' && command.params?.templateId) {
          const template = VISUAL_TEMPLATES.find(t => t.id === command.params.templateId);
          if (!template) {
            return {
              success: false,
              message: 'Template não encontrado.',
              applied: false,
            };
          }
          
          const newClips = applyVisualTemplate(template, clips);
          setClips(newClips);
          
          return {
            success: true,
            message: `✅ Template "${template.name}" aplicado com sucesso!`,
            applied: true,
            data: { template: template.name },
          };
        }
        break;
        
      case 'speed':
        if (command.action === 'set-speed' && command.params?.speed) {
          const updatedClips = clips.map(clip => ({
            ...clip,
            speed: command.params.speed,
          }));
          setClips(updatedClips);
          
          return {
            success: true,
            message: `✅ Velocidade ajustada para ${command.params.speed}x em todos os clips!`,
            applied: true,
            data: { speed: command.params.speed },
          };
        }
        break;
    }
    
    return {
      success: false,
      message: 'Comando não reconhecido ou não implementado.',
      applied: false,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao executar comando: ${error.message}`,
      applied: false,
    };
  }
}

/**
 * Sistema de aprendizado - salva preferências do usuário
 */
const LEARNING_STORAGE_KEY = 'una-ai-learning-preferences';

export interface UserPreferences {
  preferredCutStyle: 'fast' | 'smooth' | 'balanced';
  preferredTransitions: 'fade' | 'wipe' | 'zoom' | 'auto';
  preferredTemplate?: string;
  preferredSpeed?: number;
  preferredVoice?: 'masculine' | 'feminine' | 'energetic' | 'calm';
  history: Array<{
    command: string;
    action: string;
    success: boolean;
    timestamp: Date;
  }>;
}

export function loadUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return getDefaultPreferences();
  }
  
  try {
    const saved = localStorage.getItem(LEARNING_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Converter timestamps de string para Date
      if (parsed.history) {
        parsed.history = parsed.history.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        }));
      }
      return parsed;
    }
  } catch (e) {
    console.error('Erro ao carregar preferências:', e);
  }
  
  return getDefaultPreferences();
}

export function saveUserPreferences(prefs: UserPreferences) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Erro ao salvar preferências:', e);
  }
}

export function getDefaultPreferences(): UserPreferences {
  return {
    preferredCutStyle: 'balanced',
    preferredTransitions: 'auto',
    history: [],
  };
}

export function learnFromCommand(
  command: string,
  action: string,
  success: boolean
) {
  const prefs = loadUserPreferences();
  
  // Adicionar ao histórico
  prefs.history.push({
    command,
    action,
    success,
    timestamp: new Date(),
  });
  
  // Manter apenas últimos 100 comandos
  if (prefs.history.length > 100) {
    prefs.history = prefs.history.slice(-100);
  }
  
  // Aprender preferências baseado em comandos bem-sucedidos
  if (success) {
    // Analisar padrões nos comandos bem-sucedidos
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('rápido') || lowerCommand.includes('rapido')) {
      prefs.preferredCutStyle = 'fast';
    } else if (lowerCommand.includes('suav')) {
      prefs.preferredCutStyle = 'smooth';
    }
    
    if (lowerCommand.includes('fade')) {
      prefs.preferredTransitions = 'fade';
    } else if (lowerCommand.includes('wipe')) {
      prefs.preferredTransitions = 'wipe';
    }
  }
  
  saveUserPreferences(prefs);
}

export function getSuggestedCommand(userInput: string): string | null {
  const prefs = loadUserPreferences();
  const lowerInput = userInput.toLowerCase();
  
  // Se o usuário não especificou, usar preferências aprendidas
  if (lowerInput.includes('cort') && !lowerInput.includes('rápido') && !lowerInput.includes('suav')) {
    if (prefs.preferredCutStyle === 'fast') {
      return `${userInput} rápidos`;
    } else if (prefs.preferredCutStyle === 'smooth') {
      return `${userInput} suaves`;
    }
  }
  
  return null;
}

