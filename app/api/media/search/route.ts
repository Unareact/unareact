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
  const pexelsKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY || process.env.PEXELS_API_KEY;
  if (pexelsKey && (type === 'image' || type === 'all')) {
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
        {
          headers: { Authorization: pexelsKey },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API Pexels:', response.status, errorText);
        // Continuar mesmo se Pexels falhar, tentar Unsplash
      } else {
        const data = await response.json();
        if (data.photos && Array.isArray(data.photos)) {
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
          console.log(`✅ Pexels: ${data.photos.length} imagens encontradas`);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar Pexels:', error);
    }
  } else if (!pexelsKey) {
    console.warn('⚠️ PEXELS_API_KEY não configurada. Configure em .env.local');
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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API Pexels (vídeos):', response.status, errorText);
      } else {
        const data = await response.json();
        if (data.videos && Array.isArray(data.videos)) {
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
          console.log(`✅ Pexels: ${data.videos.length} vídeos encontrados`);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar vídeos Pexels:', error);
    }
  }

  // Buscar no Unsplash
  const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY || process.env.UNSPLASH_API_KEY;
  if (unsplashKey && (type === 'image' || type === 'all')) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`,
        {
          headers: { Authorization: `Client-ID ${unsplashKey}` },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API Unsplash:', response.status, errorText);
      } else {
        const data = await response.json();
        if (data.results && Array.isArray(data.results)) {
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
          console.log(`✅ Unsplash: ${data.results.length} imagens encontradas`);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar Unsplash:', error);
    }
  } else if (!unsplashKey) {
    console.warn('⚠️ UNSPLASH_API_KEY não configurada. Configure em .env.local');
  }

  console.log(`📊 Total de resultados: ${results.length} (Pexels + Unsplash)`);
  return NextResponse.json({ results, total: results.length });
}

