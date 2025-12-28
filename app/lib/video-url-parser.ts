/**
 * Extrai informações de vídeos a partir de URLs do YouTube e TikTok
 */

export interface ParsedVideoUrl {
  platform: 'youtube' | 'tiktok';
  videoId: string;
  isValid: boolean;
}

/**
 * Extrai o videoId de uma URL do YouTube
 */
function extractYouTubeVideoId(url: string): string | null {
  // Padrões de URL do YouTube:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  // https://m.youtube.com/watch?v=VIDEO_ID
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extrai o videoId de uma URL do TikTok
 */
function extractTikTokVideoId(url: string): string | null {
  // Padrões de URL do TikTok:
  // https://www.tiktok.com/@username/video/VIDEO_ID
  // https://vm.tiktok.com/VIDEO_ID
  // https://tiktok.com/@username/video/VIDEO_ID
  
  const patterns = [
    /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    /vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
    /tiktok\.com\/.*\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Parse uma URL de vídeo e retorna informações estruturadas
 */
export function parseVideoUrl(url: string): ParsedVideoUrl {
  if (!url || typeof url !== 'string') {
    return { platform: 'youtube', videoId: '', isValid: false };
  }

  // Limpar espaços
  const cleanUrl = url.trim();

  // Tentar YouTube primeiro
  const youtubeId = extractYouTubeVideoId(cleanUrl);
  if (youtubeId) {
    return {
      platform: 'youtube',
      videoId: youtubeId,
      isValid: true,
    };
  }

  // Tentar TikTok
  const tiktokId = extractTikTokVideoId(cleanUrl);
  if (tiktokId) {
    return {
      platform: 'tiktok',
      videoId: tiktokId,
      isValid: true,
    };
  }

  // Se não encontrou nenhum padrão, pode ser apenas o ID
  // Tentar detectar pelo tamanho/forma
  if (cleanUrl.length === 11 && /^[a-zA-Z0-9_-]+$/.test(cleanUrl)) {
    // Provavelmente é um ID do YouTube
    return {
      platform: 'youtube',
      videoId: cleanUrl,
      isValid: true,
    };
  }

  if (/^\d+$/.test(cleanUrl) && cleanUrl.length > 15) {
    // Provavelmente é um ID do TikTok
    return {
      platform: 'tiktok',
      videoId: cleanUrl,
      isValid: true,
    };
  }

  return {
    platform: 'youtube',
    videoId: '',
    isValid: false,
  };
}

