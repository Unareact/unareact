import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'YouTube API Key não configurada',
          message: 'Adicione YOUTUBE_API_KEY no arquivo .env.local',
        },
        { status: 500 }
      );
    }

    // Teste simples: buscar informações de um vídeo conhecido
    // Usando um vídeo ID público do YouTube (vídeo de teste)
    const testVideoId = 'jNQXAC9IVRw'; // Vídeo público do YouTube

    const response = await youtube.videos.list({
      key: apiKey,
      part: ['snippet', 'statistics'],
      id: [testVideoId],
    });

    if (response.data.items && response.data.items.length > 0) {
      const video = response.data.items[0];
      
      return NextResponse.json({
        success: true,
        message: '✅ API Key do YouTube está funcionando!',
        apiKey: {
          configured: true,
          startsWith: apiKey.substring(0, 10) + '...',
          length: apiKey.length,
        },
        test: {
          videoId: testVideoId,
          videoTitle: video.snippet?.title || 'N/A',
          channelTitle: video.snippet?.channelTitle || 'N/A',
          viewCount: video.statistics?.viewCount || '0',
        },
        details: {
          quotaUsed: '~1 unidade',
          message: 'A API Key está válida e funcionando corretamente!',
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Vídeo de teste não encontrado',
          message: 'A API Key respondeu, mas não encontrou o vídeo de teste',
        },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Erro ao testar YouTube API:', error);

    // Verificar tipo de erro
    if (error.code === 403) {
      return NextResponse.json(
        {
          success: false,
          error: 'API Key inválida ou sem permissão',
          message: 'A API Key pode estar incorreta, expirada ou sem permissão para acessar a YouTube Data API v3',
          details: error.message,
          solution: [
            '1. Verifique se a API Key está correta no .env.local',
            '2. Verifique se a YouTube Data API v3 está ativada no Google Cloud Console',
            '3. Verifique se a API Key tem permissão para acessar a API',
            '4. Crie uma nova API Key se necessário',
          ],
        },
        { status: 403 }
      );
    }

    if (error.code === 400) {
      return NextResponse.json(
        {
          success: false,
          error: 'Requisição inválida',
          message: 'A requisição à API do YouTube falhou',
          details: error.message,
        },
        { status: 400 }
      );
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quota excedida',
          message: 'Você atingiu o limite diário de 10.000 unidades',
          solution: 'Aguarde 24 horas ou solicite aumento de quota no Google Cloud Console',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao testar API',
        message: error.message || 'Erro desconhecido',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

