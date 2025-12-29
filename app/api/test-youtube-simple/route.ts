import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API Key não configurada',
        success: false 
      }, { status: 500 });
    }

    // Teste simples: buscar vídeos com query genérica
    console.log('🧪 Testando API do YouTube com query simples...');
    
    const searchResponse = await youtube.search.list({
      key: apiKey,
      part: ['snippet'],
      q: 'receitas saudáveis',
      type: 'video',
      maxResults: 5,
      order: 'viewCount',
    } as any);

    const items = searchResponse.data.items || [];
    
    return NextResponse.json({
      success: true,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      videosFound: items.length,
      videos: items.map(item => ({
        id: item.id?.videoId,
        title: item.snippet?.title,
        channel: item.snippet?.channelTitle,
      })),
      rawResponse: searchResponse.data,
    });
  } catch (error: any) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({
      success: false,
      error: error.message || error.toString(),
      code: error.code,
      response: error.response?.data,
    }, { status: 500 });
  }
}

