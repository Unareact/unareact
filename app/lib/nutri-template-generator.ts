import { generateScript } from './openai';
import { ScriptSegment, ScriptGenerationParams } from '@/app/types';
import { NutriVideoTemplate } from './nutri-templates';

export async function generateNutriTemplatesFromTopic(
  topic: string,
  duration: number = 60
): Promise<NutriVideoTemplate[]> {
  const templates: NutriVideoTemplate[] = [];

  // Gerar diferentes variações do mesmo tópico
  const variations = [
    {
      style: 'educational' as const,
      tone: 'casual' as const,
      name: `Como ${topic} - Guia Completo`,
      description: `Vídeo educativo sobre ${topic} para nutricionistas`
    },
    {
      style: 'promotional' as const,
      tone: 'energetic' as const,
      name: `${topic} - Transforme Sua Carreira`,
      description: `Vídeo promocional sobre ${topic} com foco em resultados`
    },
    {
      style: 'educational' as const,
      tone: 'formal' as const,
      name: `${topic} - Método Profissional`,
      description: `Vídeo educativo formal sobre ${topic}`
    }
  ];

  for (const variation of variations) {
    try {
      const params: ScriptGenerationParams = {
        topic: `${topic} para nutricionistas usando YLADA Nutri`,
        duration,
        style: variation.style,
        tone: variation.tone
      };

      const segments = await generateScript(params);

      const template: NutriVideoTemplate = {
        id: `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: variation.name,
        description: variation.description,
        duration,
        style: variation.style,
        tone: variation.tone,
        segments,
        targetAudience: 'Nutricionistas que querem crescer profissionalmente',
        cta: 'Conheça o YLADA Nutri. Link na descrição.',
        yladaUrl: 'https://ylada.com/pt/nutri'
      };

      templates.push(template);
    } catch (error) {
      console.error(`Erro ao gerar template ${variation.name}:`, error);
    }
  }

  return templates;
}

