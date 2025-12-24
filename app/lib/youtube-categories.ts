/**
 * Categorias do YouTube (nichos)
 * Baseado na YouTube Data API v3
 */

export interface YouTubeCategory {
  id: string;
  name: string;
  emoji: string;
}

export const YOUTUBE_CATEGORIES: YouTubeCategory[] = [
  { id: '0', name: 'Todas', emoji: '🌐' },
  { id: '1', name: 'Filmes e Animações', emoji: '🎬' },
  { id: '2', name: 'Carros e Veículos', emoji: '🚗' },
  { id: '10', name: 'Música', emoji: '🎵' },
  { id: '15', name: 'Animais e Pets', emoji: '🐾' },
  { id: '17', name: 'Esportes', emoji: '⚽' },
  { id: '19', name: 'Viagens e Eventos', emoji: '✈️' },
  { id: '20', name: 'Games', emoji: '🎮' },
  { id: '22', name: 'Pessoas e Blogs', emoji: '👤' },
  { id: '23', name: 'Comédia', emoji: '😂' },
  { id: '24', name: 'Entretenimento', emoji: '🎭' },
  { id: '25', name: 'Notícias e Política', emoji: '📰' },
  { id: '26', name: 'Como Fazer e Estilo', emoji: '💅' },
  { id: '27', name: 'Educação', emoji: '📚' },
  { id: '28', name: 'Ciência e Tecnologia', emoji: '🔬' },
  { id: '29', name: 'Não Lucrativos e Ativismo', emoji: '🤝' },
];

export function getCategoryById(id: string): YouTubeCategory | undefined {
  return YOUTUBE_CATEGORIES.find(cat => cat.id === id);
}

export function getCategoryName(id: string): string {
  const category = getCategoryById(id);
  return category?.name || 'Desconhecida';
}

