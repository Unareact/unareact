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

