/**
 * Extrai informações de vídeos a partir de URLs do YouTube e TikTok
 */

export interface ParsedVideoUrl {
  platform: 'youtube' | 'tiktok';
  videoId: string;
  isValid: boolean;
  isChannel?: boolean;
  channelHandle?: string;
  channelId?: string;
  channelType?: 'handle' | 'custom' | 'user' | 'channel' | 'tiktok-profile';
  errorMessage?: string;
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
  // https://www.youtube.com/shorts/VIDEO_ID
  // https://youtube.com/shorts/VIDEO_ID
  
  const patterns = [
    // YouTube Shorts (verificar primeiro para não confundir com outros padrões)
    /(?:youtube\.com\/shorts\/|www\.youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    // Padrões tradicionais
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
 * Detecta se é uma URL de canal do YouTube e extrai informações
 */
function isYouTubeChannelUrl(url: string): { 
  isChannel: boolean; 
  channelHandle?: string;
  channelId?: string;
  channelType?: 'handle' | 'custom' | 'user' | 'channel';
} {
  // Padrões de URL de canal do YouTube:
  // https://www.youtube.com/@channelhandle
  // https://www.youtube.com/c/channelname
  // https://www.youtube.com/user/username
  // https://www.youtube.com/channel/CHANNEL_ID
  
  const handleMatch = url.match(/youtube\.com\/@([\w.-]+)/);
  if (handleMatch) {
    return { 
      isChannel: true, 
      channelHandle: handleMatch[1],
      channelType: 'handle'
    };
  }

  const customMatch = url.match(/youtube\.com\/c\/([\w.-]+)/);
  if (customMatch) {
    return { 
      isChannel: true, 
      channelHandle: customMatch[1],
      channelType: 'custom'
    };
  }

  const userMatch = url.match(/youtube\.com\/user\/([\w.-]+)/);
  if (userMatch) {
    return { 
      isChannel: true, 
      channelHandle: userMatch[1],
      channelType: 'user'
    };
  }

  const channelIdMatch = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
  if (channelIdMatch) {
    return { 
      isChannel: true, 
      channelId: channelIdMatch[1],
      channelType: 'channel'
    };
  }

  return { isChannel: false };
}

/**
 * Detecta se é uma URL de perfil do TikTok
 */
function isTikTokProfileUrl(url: string): { isProfile: boolean; username?: string } {
  // Padrões de URL de perfil do TikTok:
  // https://www.tiktok.com/@username
  // https://tiktok.com/@username
  // https://vm.tiktok.com/@username (menos comum)
  
  const profilePattern = /tiktok\.com\/@([\w.-]+)(?:\/|$)/;
  const match = url.match(profilePattern);
  
  if (match && match[1] && !url.includes('/video/')) {
    return { isProfile: true, username: match[1] };
  }

  return { isProfile: false };
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

  // Verificar se é URL de perfil do TikTok primeiro
  const tiktokProfileCheck = isTikTokProfileUrl(cleanUrl);
  if (tiktokProfileCheck.isProfile) {
    return {
      platform: 'tiktok',
      videoId: '',
      isValid: true, // Válido para buscar vídeos do perfil
      isChannel: true,
      channelHandle: tiktokProfileCheck.username,
      channelType: 'tiktok-profile',
    };
  }

  // Verificar se é URL de canal do YouTube
  const channelCheck = isYouTubeChannelUrl(cleanUrl);
  if (channelCheck.isChannel) {
    return {
      platform: 'youtube',
      videoId: '',
      isValid: true, // Agora é válido para buscar vídeos do canal
      isChannel: true,
      channelHandle: channelCheck.channelHandle,
      channelId: channelCheck.channelId,
      channelType: channelCheck.channelType,
    };
  }

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
    errorMessage: 'URL inválida. Use uma URL de vídeo do YouTube ou TikTok.',
  };
}

