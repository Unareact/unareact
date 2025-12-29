// Busca de mídia da web (Pexels, Unsplash, etc.)

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  width: number;
  height: number;
  duration?: number; // Para vídeos
  author?: string;
  source: 'pexels' | 'unsplash' | 'pixabay' | 'upload';
  searchQuery?: string;
}

// Buscar mídia via API route (mais seguro)
export async function searchMedia(
  query: string,
  type: 'image' | 'video' | 'all' = 'all',
  perPage: number = 20
): Promise<MediaItem[]> {
  try {
    const response = await fetch(
      `/api/media/search?query=${encodeURIComponent(query)}&type=${type}&perPage=${perPage}`
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar mídia');
    }

    const data = await response.json();
    return data.results.map((item: any) => ({
      ...item,
      searchQuery: query,
    }));
  } catch (error) {
    console.error('Erro ao buscar mídia:', error);
    return [];
  }
}

// Gerar queries de busca baseadas no roteiro
export function generateSearchQueriesFromScript(scriptText: string): string[] {
  const keywords = [
    'nutricionista',
    'nutrição',
    'saúde',
    'alimentação saudável',
    'dieta',
    'bem-estar',
    'fitness',
    'consultório',
    'agenda',
    'organização',
    'profissional',
    'mulher profissional',
    'tecnologia',
    'digital',
    'sucesso',
    'crescimento',
  ];

  const queries: string[] = [];
  const lowerText = scriptText.toLowerCase();

  // Encontrar palavras-chave relevantes no texto
  keywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      queries.push(keyword);
    }
  });

  // Adicionar queries genéricas se não encontrar muitas
  if (queries.length < 3) {
    queries.push('nutricionista profissional', 'saúde e bem-estar', 'organização profissional');
  }

  return queries.slice(0, 5); // Máximo 5 queries
}

