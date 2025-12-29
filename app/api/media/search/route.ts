import { NextRequest, NextResponse } from 'next/server';

// API route para buscar mídia (mais seguro que expor API keys no cliente)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const type = searchParams.get('type') || 'all';
  const perPage = parseInt(searchParams.get('perPage') || '20');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const results: any[] = [];

  // Buscar no Pexels
  const pexelsKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  if (pexelsKey && (type === 'image' || type === 'all')) {
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
        {
          headers: { Authorization: pexelsKey },
        }
      );
      if (response.ok) {
        const data = await response.json();
        results.push(...data.photos.map((photo: any) => ({
          id: `pexels-${photo.id}`,
          type: 'image',
          url: photo.src.large,
          thumbnail: photo.src.medium,
          width: photo.width,
          height: photo.height,
          author: photo.photographer,
          source: 'pexels',
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar Pexels:', error);
    }
  }

  // Buscar vídeos no Pexels
  if (pexelsKey && (type === 'video' || type === 'all')) {
    try {
      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
        {
          headers: { Authorization: pexelsKey },
        }
      );
      if (response.ok) {
        const data = await response.json();
        results.push(...data.videos.map((video: any) => ({
          id: `pexels-video-${video.id}`,
          type: 'video',
          url: video.video_files[0]?.link || video.video_files.find((f: any) => f.quality === 'hd')?.link,
          thumbnail: video.image,
          width: video.width,
          height: video.height,
          duration: video.duration,
          author: video.user.name,
          source: 'pexels',
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar vídeos Pexels:', error);
    }
  }

  // Buscar no Unsplash
  const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY;
  if (unsplashKey && (type === 'image' || type === 'all')) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`,
        {
          headers: { Authorization: `Client-ID ${unsplashKey}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        results.push(...data.results.map((photo: any) => ({
          id: `unsplash-${photo.id}`,
          type: 'image',
          url: photo.urls.regular,
          thumbnail: photo.urls.thumb,
          width: photo.width,
          height: photo.height,
          author: photo.user.name,
          source: 'unsplash',
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar Unsplash:', error);
    }
  }

  return NextResponse.json({ results });
}

