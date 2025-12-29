import { ScriptSegment } from '@/app/types';

export interface NutriVideoTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  style: 'educational' | 'promotional' | 'entertaining' | 'documentary';
  tone: 'casual' | 'formal' | 'energetic' | 'calm';
  segments: ScriptSegment[];
  targetAudience: string;
  cta: string;
  yladaUrl: string;
}

export const NUTRI_VIDEO_TEMPLATES: NutriVideoTemplate[] = [
  {
    id: 'encher-agenda',
    name: 'Como Encher Sua Agenda Automaticamente',
    description: 'Vídeo focado em captação de clientes através de quizzes e links inteligentes',
    duration: 60,
    style: 'educational',
    tone: 'casual',
    targetAudience: 'Nutricionistas que querem aumentar número de clientes',
    cta: 'Comece a encher sua agenda hoje mesmo. Link na descrição.',
    yladaUrl: 'https://ylada.com/pt/nutri',
    segments: [
      {
        id: 'hook',
        text: 'Você já se sentiu frustrada por ter dias vazios na agenda enquanto outras nutricionistas estão lotadas?',
        duration: 5,
        timestamp: 0,
        type: 'intro'
      },
      {
        id: 'problema',
        text: 'A maioria das nutricionistas depende apenas de indicações. Mas existe uma forma de captar clientes automaticamente, 24 horas por dia, enquanto você dorme.',
        duration: 8,
        timestamp: 5,
        type: 'content'
      },
      {
        id: 'solucao-intro',
        text: 'Com o YLADA Nutri, você cria quizzes e links inteligentes que trabalham para você. Cada pessoa que responde seu quiz vira automaticamente um lead qualificado.',
        duration: 10,
        timestamp: 13,
        type: 'content'
      },
      {
        id: 'beneficio-1',
        text: 'Quizzes que conscientizam sobre saúde e geram leads ao mesmo tempo. Sua cliente descobre seu biotipo nutricional, e você descobre uma nova cliente potencial.',
        duration: 12,
        timestamp: 23,
        type: 'content'
      },
      {
        id: 'beneficio-2',
        text: 'Links personalizados que você compartilha no Instagram, WhatsApp, ou onde quiser. Cada clique pode virar um agendamento.',
        duration: 10,
        timestamp: 35,
        type: 'content'
      },
      {
        id: 'resultado',
        text: 'Nutricionistas que usam o YLADA conseguem encher a agenda em 30 dias. Não é sorte, é sistema.',
        duration: 8,
        timestamp: 45,
        type: 'content'
      },
      {
        id: 'cta',
        text: 'Quer encher sua agenda também? Conheça o YLADA Nutri. Link na descrição.',
        duration: 7,
        timestamp: 53,
        type: 'outro'
      }
    ]
  },
  {
    id: 'organizar-clientes',
    name: 'Como Organizar Seus Clientes Profissionalmente',
    description: 'Vídeo sobre o sistema GSAL e organização de clientes',
    duration: 60,
    style: 'educational',
    tone: 'casual',
    targetAudience: 'Nutricionistas que se sentem desorganizadas',
    cta: 'Organize seus clientes hoje mesmo. Link na descrição.',
    yladaUrl: 'https://ylada.com/pt/nutri',
    segments: [
      {
        id: 'hook',
        text: 'Você já perdeu informações de clientes? Esqueceu follow-ups? Trabalhou na base do improviso?',
        duration: 5,
        timestamp: 0,
        type: 'intro'
      },
      {
        id: 'problema',
        text: '73% das nutricionistas trabalham sem um sistema organizado. Perdem informações, esquecem compromissos, e se sentem sobrecarregadas.',
        duration: 8,
        timestamp: 5,
        type: 'content'
      },
      {
        id: 'solucao',
        text: 'O YLADA Nutri tem o sistema GSAL: Gerar, Servir, Acompanhar e Lucrar. Tudo organizado em um lugar só.',
        duration: 10,
        timestamp: 13,
        type: 'content'
      },
      {
        id: 'beneficio-1',
        text: 'Gerar: Capte leads automaticamente com quizzes e formulários. Servir: Organize todo o atendimento da sua cliente.',
        duration: 12,
        timestamp: 23,
        type: 'content'
      },
      {
        id: 'beneficio-2',
        text: 'Acompanhar: Nunca mais perca informações. Histórico completo, evolução documentada, follow-ups automáticos.',
        duration: 10,
        timestamp: 35,
        type: 'content'
      },
      {
        id: 'beneficio-3',
        text: 'Lucrar: Com organização, você trabalha menos e ganha mais. Foca no que importa: transformar vidas.',
        duration: 10,
        timestamp: 45,
        type: 'content'
      },
      {
        id: 'cta',
        text: 'Pare de trabalhar no improviso. Organize seus clientes com o YLADA Nutri. Link na descrição.',
        duration: 5,
        timestamp: 55,
        type: 'outro'
      }
    ]
  },
  {
    id: 'quizzes-conscientizacao',
    name: 'Quizzes que Conscientizam e Geram Leads',
    description: 'Vídeo sobre como usar quizzes para educar e captar clientes',
    duration: 60,
    style: 'educational',
    tone: 'energetic',
    targetAudience: 'Nutricionistas que querem educar e captar ao mesmo tempo',
    cta: 'Crie seu primeiro quiz hoje. Link na descrição.',
    yladaUrl: 'https://ylada.com/pt/nutri',
    segments: [
      {
        id: 'hook',
        text: 'E se você pudesse conscientizar sobre saúde E gerar leads ao mesmo tempo?',
        duration: 4,
        timestamp: 0,
        type: 'intro'
      },
      {
        id: 'problema',
        text: 'Você passa horas criando conteúdo educativo, mas não gera leads. Ou gera leads, mas não educa. Por que não fazer os dois juntos?',
        duration: 8,
        timestamp: 4,
        type: 'content'
      },
      {
        id: 'solucao',
        text: 'Com o YLADA Nutri, você cria quizzes interativos que conscientizam sobre saúde enquanto captam leads automaticamente.',
        duration: 10,
        timestamp: 12,
        type: 'content'
      },
      {
        id: 'exemplo-1',
        text: 'Quiz "Descubra seu Biotipo Nutricional": Sua cliente aprende sobre os diferentes biotipos, e você descobre o perfil dela automaticamente.',
        duration: 12,
        timestamp: 22,
        type: 'content'
      },
      {
        id: 'exemplo-2',
        text: 'Quiz "Pronto para Emagrecer?": Ela reflete sobre sua relação com a comida, e você identifica leads qualificados.',
        duration: 10,
        timestamp: 34,
        type: 'content'
      },
      {
        id: 'beneficio',
        text: 'Cada quiz trabalha 24 horas por dia. Educa, conscientiza e gera leads enquanto você dorme.',
        duration: 10,
        timestamp: 44,
        type: 'content'
      },
      {
        id: 'cta',
        text: 'Crie quizzes que conscientizam e geram leads. Conheça o YLADA Nutri. Link na descrição.',
        duration: 6,
        timestamp: 54,
        type: 'outro'
      }
    ]
  },
  {
    id: 'mentoria-lya',
    name: 'Mentoria LYA: Sua Assistente Estratégica 24/7',
    description: 'Vídeo sobre a mentoria LYA e como ela ajuda nutricionistas',
    duration: 60,
    style: 'promotional',
    tone: 'energetic',
    targetAudience: 'Nutricionistas que se sentem sozinhas na jornada',
    cta: 'Tenha sua mentora estratégica hoje. Link na descrição.',
    yladaUrl: 'https://ylada.com/pt/nutri',
    segments: [
      {
        id: 'hook',
        text: 'Você já se sentiu sozinha na jornada de construir seu negócio como nutricionista?',
        duration: 5,
        timestamp: 0,
        type: 'intro'
      },
      {
        id: 'problema',
        text: 'A maioria das nutricionistas trabalha sozinha. Sem orientação, sem método, sem suporte. Tentativa e erro constante.',
        duration: 8,
        timestamp: 5,
        type: 'content'
      },
      {
        id: 'solucao',
        text: 'LYA é sua mentora estratégica digital. Disponível 24 horas por dia, 7 dias por semana. Ela te guia em cada decisão.',
        duration: 10,
        timestamp: 13,
        type: 'content'
      },
      {
        id: 'beneficio-1',
        text: 'LYA entende seu momento atual, seus objetivos, suas travas. Ela analisa seus dados e te diz: "Agora, o foco é isso."',
        duration: 12,
        timestamp: 23,
        type: 'content'
      },
      {
        id: 'beneficio-2',
        text: 'Não é uma lista infinita de opções. É direcionamento claro: ação recomendada, onde aplicar, métrica de sucesso.',
        duration: 10,
        timestamp: 35,
        type: 'content'
      },
      {
        id: 'beneficio-3',
        text: 'LYA não é tecnologia. É mentoria estratégica que funciona. Você não está sozinha.',
        duration: 8,
        timestamp: 45,
        type: 'content'
      },
      {
        id: 'cta',
        text: 'Tenha sua mentora estratégica 24/7. Conheça o YLADA Nutri com LYA. Link na descrição.',
        duration: 7,
        timestamp: 53,
        type: 'outro'
      }
    ]
  },
  {
    id: 'transformacao-nutri-empresaria',
    name: 'De Nutricionista a Nutri-Empresária',
    description: 'Vídeo sobre a transformação profissional completa',
    duration: 90,
    style: 'promotional',
    tone: 'energetic',
    targetAudience: 'Nutricionistas que querem se tornar empresárias',
    cta: 'Torne-se uma Nutri-Empresária. Link na descrição.',
    yladaUrl: 'https://ylada.com/pt/nutri',
    segments: [
      {
        id: 'hook',
        text: 'Você não precisa ser só nutricionista. Você precisa se tornar uma Nutri-Empresária.',
        duration: 5,
        timestamp: 0,
        type: 'intro'
      },
      {
        id: 'problema',
        text: 'A faculdade te ensinou a ser excelente nutricionista. Mas não te ensinou a construir um negócio que funciona.',
        duration: 10,
        timestamp: 5,
        type: 'content'
      },
      {
        id: 'diferenca',
        text: 'Nutri Tradicional: Depende de indicação, agenda inconsistente, trabalha no improviso. Nutri-Empresária: Cria sistemas, agenda organizada, segue método.',
        duration: 15,
        timestamp: 15,
        type: 'content'
      },
      {
        id: 'solucao',
        text: 'O YLADA Nutri é o sistema completo que transforma nutricionistas em Nutri-Empresárias. Formação, ferramentas, mentoria, tudo integrado.',
        duration: 12,
        timestamp: 30,
        type: 'content'
      },
      {
        id: 'beneficio-1',
        text: 'Captação previsível: Quizzes e links que geram leads automaticamente. Você para de depender de sorte.',
        duration: 12,
        timestamp: 42,
        type: 'content'
      },
      {
        id: 'beneficio-2',
        text: 'Gestão profissional: Sistema GSAL que organiza tudo. Você para de trabalhar no improviso.',
        duration: 10,
        timestamp: 54,
        type: 'content'
      },
      {
        id: 'beneficio-3',
        text: 'Mentoria estratégica: LYA te guia em cada decisão. Você para de se sentir sozinha.',
        duration: 10,
        timestamp: 64,
        type: 'content'
      },
      {
        id: 'resultado',
        text: 'A transformação não é sorte. É método. E o método está pronto para você.',
        duration: 8,
        timestamp: 74,
        type: 'content'
      },
      {
        id: 'cta',
        text: 'Torne-se uma Nutri-Empresária hoje. Conheça o YLADA Nutri. Link na descrição.',
        duration: 6,
        timestamp: 82,
        type: 'outro'
      }
    ]
  }
];

export function getNutriTemplate(id: string): NutriVideoTemplate | undefined {
  return NUTRI_VIDEO_TEMPLATES.find(template => template.id === id);
}

export function getAllNutriTemplates(): NutriVideoTemplate[] {
  return NUTRI_VIDEO_TEMPLATES;
}

