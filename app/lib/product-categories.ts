/**
 * Categorias de Produtos/Nichos para filtros
 * Usado para filtrar vídeos relacionados a produtos específicos
 */

export interface ProductCategory {
  id: string;
  name: string;
  emoji: string;
  description: string; // Descrição para tooltip
  keywords: string[]; // Palavras-chave para buscar nos títulos e descrições
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'all',
    name: 'Todos os Produtos',
    emoji: '🌐',
    description: 'Mostra todos os vídeos sem filtro por categoria de produto',
    keywords: [],
  },
  {
    id: 'health',
    name: 'Saúde',
    emoji: '💊',
    description: 'Filtra vídeos sobre saúde, bem-estar, suplementos, vitaminas, saúde mental e cuidados gerais',
    keywords: [
      'saúde', 'health', 'bem-estar', 'wellness', 'cuidados', 'medicina',
      'tratamento', 'cura', 'prevenção', 'suplemento', 'vitamina', 'mineral',
      'imunidade', 'energia', 'vitalidade', 'longevidade', 'anti-aging',
      'saúde mental', 'mental health', 'ansiedade', 'depressão', 'stress',
      'dormir', 'sono', 'insônia', 'relaxamento'
    ],
  },
  {
    id: 'weight-loss',
    name: 'Emagrecimento',
    emoji: '⚖️',
    description: 'Filtra vídeos sobre perda de peso, dietas, queima de gordura, emagrecimento e definição corporal',
    keywords: [
      'emagrecimento', 'weight loss', 'perder peso', 'queimar gordura',
      'dieta', 'diet', 'emagrecer', 'secar', 'definir', 'corpo',
      'gordura', 'obesidade', 'sobrepeso', 'metabolismo', 'metabolismo acelerado',
      'queima de gordura', 'perda de peso', 'emagrecer rápido', 'secar barriga',
      'abdômen', 'cintura', 'culote', 'celulite', 'estrias', 'flacidez',
      'emagrecer', 'perder gordura', 'queima gordura', 'dieta emagrecimento',
      'como emagrecer', 'emagrecer rapido', 'perder peso rapido', 'dieta para emagrecer',
      'treino emagrecimento', 'exercicio emagrecer', 'cardio emagrecimento',
      'low carb', 'keto', 'dieta cetogenica', 'intermitente', 'jejum intermitente'
    ],
  },
  {
    id: 'healthy-food',
    name: 'Alimentação Saudável',
    emoji: '🥗',
    description: 'Filtra vídeos sobre nutrição, receitas saudáveis, dietas especiais (vegano, keto, low carb) e alimentação natural',
    keywords: [
      'alimentação saudável', 'healthy food', 'nutrição', 'nutrition',
      'comida saudável', 'dieta saudável', 'receitas saudáveis', 'healthy recipes',
      'superfood', 'superalimento', 'orgânico', 'natural', 'sem glúten',
      'sem lactose', 'vegano', 'vegetariano', 'plant-based', 'low carb',
      'keto', 'paleo', 'mediterrânea', 'detox', 'smoothie', 'suco verde',
      'salada', 'legumes', 'frutas', 'proteína', 'fibra', 'antioxidante'
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness',
    emoji: '💪',
    description: 'Filtra vídeos sobre treinos, exercícios, academia, musculação, yoga, pilates e condicionamento físico',
    keywords: [
      'fitness', 'treino', 'workout', 'exercício', 'exercise', 'academia',
      'gym', 'musculação', 'bodybuilding', 'crossfit', 'yoga', 'pilates',
      'corrida', 'running', 'ciclismo', 'cycling', 'natação', 'swimming',
      'hiit', 'cardio', 'força', 'resistência', 'flexibilidade', 'mobilidade',
      'ganhar massa', 'hipertrofia', 'definição', 'condicionamento físico',
      'personal trainer', 'treinamento', 'rotina de treino', 'plano de treino'
    ],
  },
  {
    id: 'portal-magra',
    name: 'Portal Magra',
    emoji: '✨',
    description: 'Filtra vídeos sobre o momento de decisão de se cuidar: hábitos alimentares, rotina saudável e acompanhamento para mulheres que estão começando sua jornada de bem-estar',
    keywords: [
      // Momento de decisão - quando decide começar
      'começar a se cuidar', 'decidir se cuidar', 'momento de mudança', 'vou me cuidar', 'começar hoje',
      'primeiro passo', 'iniciar transformação', 'começar agora', 'hora de mudar', 'decisão de mudar',
      
      // Hábitos alimentares e rotina (foco principal)
      'hábitos alimentares', 'rotina alimentar', 'alimentação saudável', 'rotina de alimentação',
      'hábitos saudáveis', 'mudança de hábitos', 'novos hábitos', 'criar hábitos', 'rotina saudável',
      'rotina de cuidados', 'rotina diária saudável', 'dia a dia saudável', 'organizar alimentação',
      'planejamento alimentar', 'cardápio saudável', 'refeições saudáveis', 'comer melhor',
      
      // Receitas saudáveis e culinária
      'receitas saudáveis', 'receita saudável', 'comida saudável', 'receitas fáceis saudáveis',
      'receitas para emagrecer', 'receitas light', 'receitas fit', 'receitas nutritivas',
      'receitas caseiras saudáveis', 'cozinha saudável', 'culinária saudável', 'pratos saudáveis',
      'receitas rápidas saudáveis', 'receitas simples saudáveis', 'cardápio semanal saudável',
      
      // Acompanhamento e suporte (seu negócio)
      'acompanhamento nutricional', 'acompanhamento alimentar', 'programa de acompanhamento',
      'acompanhamento personalizado', 'suporte nutricional', 'orientação alimentar',
      'acompanhamento 30 dias', 'programa 30 dias', 'desafio 30 dias', 'transformação 30 dias',
      'programa de transformação', 'jornada de transformação', 'processo de mudança',
      
      // Transformação e resultados práticos
      'antes e depois', 'transformação real', 'minha transformação', 'história de transformação',
      'resultados reais', 'mudança de vida', 'nova vida', 'vida nova', 'renovação',
      'depoimento real', 'testemunho', 'minha experiência', 'como mudei',
      
      // Bem-estar e autocuidado (não fitness pesado)
      'bem-estar', 'wellness', 'autocuidado', 'self care', 'cuidar de si', 'cuidar de mim',
      'qualidade de vida', 'vida saudável', 'equilíbrio', 'harmonia', 'saúde integral',
      'cuidado pessoal', 'me priorizar', 'me valorizar', 'amor próprio',
      
      // Brasileiras nos EUA (público-alvo)
      'brasileira nos eua', 'brasileira nos usa', 'brasileiras nos eua', 'brasileiras nos usa',
      'brasileira morando nos eua', 'brasileira morando nos usa', 'vida nos eua',
      'adaptação nos eua', 'comunidade brasileira', 'brasileiros nos eua',
      
      // Conteúdo que indica momento de decisão
      'preciso mudar', 'quero mudar', 'vou mudar', 'chega de', 'não aguento mais',
      'estou pronta', 'estou decidida', 'hora de', 'momento certo', 'agora é a hora',
      'vou começar', 'começando hoje', 'primeiro dia', 'dia 1', 'início da jornada',
      
      // Evitar: debates, teorias, fitness pesado (removidos)
      // Mantidos apenas termos práticos e de ação
    ],
  },
];

export function getCategoryById(id: string): ProductCategory | undefined {
  return PRODUCT_CATEGORIES.find(cat => cat.id === id);
}

export function matchesCategory(video: { title: string; description: string }, categoryId: string): boolean {
  if (categoryId === 'all') return true;
  
  const category = getCategoryById(categoryId);
  if (!category || category.keywords.length === 0) return true;
  
  const text = `${video.title} ${video.description}`.toLowerCase();
  
  // Normalizar texto (remover acentos e caracteres especiais para melhor matching)
  const normalizeText = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const normalizedText = normalizeText(text);
  
  // Verificar se pelo menos uma palavra-chave está presente
  // Tenta match exato primeiro, depois match parcial
  return category.keywords.some(keyword => {
    const normalizedKeyword = normalizeText(keyword.toLowerCase());
    
    // Match exato da palavra-chave completa
    if (normalizedText.includes(normalizedKeyword)) return true;
    
    // Match parcial - verifica se palavras individuais da keyword estão no texto
    const keywordWords = normalizedKeyword.split(' ').filter(w => w.length > 3); // Ignorar palavras muito curtas
    if (keywordWords.length > 1) {
      // Se a keyword tem múltiplas palavras, verifica se pelo menos 2 estão presentes
      const matches = keywordWords.filter(word => normalizedText.includes(word));
      return matches.length >= Math.min(2, keywordWords.length);
    }
    
    return false;
  });
}

