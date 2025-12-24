import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'URL do vídeo não fornecida' },
        { status: 400 }
      );
    }

    // Para produção, você precisaria usar yt-dlp ou similar no servidor
    // Por enquanto, retornamos a URL para download no cliente
    // NOTA: Download direto de vídeos do YouTube pode violar ToS
    // Considere usar serviços como yt-dlp em um servidor dedicado

    // Extrair video ID do YouTube
    const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return NextResponse.json(
        { error: 'URL do YouTube inválida' },
        { status: 400 }
      );
    }

    // Retornar informações do vídeo
    // Em produção, você faria o download real aqui usando yt-dlp
    return NextResponse.json({
      success: true,
      videoId,
      message: 'Download iniciado. Em produção, o vídeo seria baixado aqui.',
      // Em produção, retornaria o arquivo ou URL temporária
    });
  } catch (error: any) {
    console.error('Erro ao fazer download:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer download' },
      { status: 500 }
    );
  }
}

