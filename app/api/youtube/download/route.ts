import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

// Diretório temporário para downloads
const DOWNLOAD_DIR = path.join(process.cwd(), 'tmp', 'downloads');

// Garantir que o diretório existe
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, format = 'mp4', quality = 'best' } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'URL do vídeo não fornecida' },
        { status: 400 }
      );
    }

    // Validar URL do YouTube
    const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!videoIdMatch) {
      return NextResponse.json(
        { error: 'URL do YouTube inválida' },
        { status: 400 }
      );
    }

    const videoId = videoIdMatch[1];
    const outputPath = path.join(DOWNLOAD_DIR, `${videoId}-${uuidv4()}.${format}`);

    // Verificar se yt-dlp está instalado
    let ytDlpCommand = 'yt-dlp';
    try {
      await execAsync('which yt-dlp');
    } catch {
      try {
        await execAsync('which youtube-dl');
        ytDlpCommand = 'youtube-dl';
      } catch {
        return NextResponse.json(
          { 
            error: 'yt-dlp não está instalado. Instale com: brew install yt-dlp (macOS) ou pip install yt-dlp',
            installInstructions: {
              macOS: 'brew install yt-dlp',
              linux: 'pip install yt-dlp',
              windows: 'pip install yt-dlp'
            }
          },
          { status: 500 }
        );
      }
    }

    // Comando yt-dlp
    const command = `${ytDlpCommand} "${videoUrl}" -f "${quality}" -o "${outputPath}" --no-playlist --extract-flat false`;

    console.log('Iniciando download:', videoUrl);
    
    // Executar download
    const { stdout, stderr } = await execAsync(command, {
      timeout: 300000, // 5 minutos timeout
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    // Verificar se o arquivo foi criado
    if (!fs.existsSync(outputPath)) {
      // Tentar encontrar arquivo com nome diferente (yt-dlp pode renomear)
      const files = fs.readdirSync(DOWNLOAD_DIR);
      const downloadedFile = files.find(f => f.includes(videoId));
      
      if (!downloadedFile) {
        return NextResponse.json(
          { error: 'Download falhou. Verifique os logs.', stderr },
          { status: 500 }
        );
      }
      
      const finalPath = path.join(DOWNLOAD_DIR, downloadedFile);
      const stats = fs.statSync(finalPath);
      
      return NextResponse.json({
        success: true,
        videoId,
        filename: downloadedFile,
        size: stats.size,
        path: finalPath,
        message: 'Download concluído com sucesso!',
        // Em produção, você faria upload para cloud storage e retornaria URL
      });
    }

    const stats = fs.statSync(outputPath);
    
    return NextResponse.json({
      success: true,
      videoId,
      filename: path.basename(outputPath),
      size: stats.size,
      path: outputPath,
      message: 'Download concluído com sucesso!',
    });

  } catch (error: any) {
    console.error('Erro ao fazer download:', error);
    
    // Limpar arquivos parciais em caso de erro
    try {
      const files = fs.readdirSync(DOWNLOAD_DIR);
      files.forEach(file => {
        if (file.includes('.part') || file.includes('.tmp')) {
          fs.unlinkSync(path.join(DOWNLOAD_DIR, file));
        }
      });
    } catch (cleanupError) {
      console.error('Erro ao limpar arquivos:', cleanupError);
    }

    return NextResponse.json(
      { 
        error: error.message || 'Erro ao fazer download',
        details: error.stderr || error.stdout
      },
      { status: 500 }
    );
  }
}

// Endpoint para obter informações do vídeo sem baixar
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'URL do vídeo não fornecida' },
        { status: 400 }
      );
    }

    // Verificar se yt-dlp está instalado
    let ytDlpCommand = 'yt-dlp';
    try {
      await execAsync('which yt-dlp');
    } catch {
      try {
        await execAsync('which youtube-dl');
        ytDlpCommand = 'youtube-dl';
      } catch {
        return NextResponse.json(
          { error: 'yt-dlp não está instalado' },
          { status: 500 }
        );
      }
    }

    // Obter informações do vídeo
    const command = `${ytDlpCommand} "${videoUrl}" --dump-json --no-playlist`;
    const { stdout } = await execAsync(command);
    const videoInfo = JSON.parse(stdout);

    return NextResponse.json({
      success: true,
      videoInfo: {
        id: videoInfo.id,
        title: videoInfo.title,
        duration: videoInfo.duration,
        thumbnail: videoInfo.thumbnail,
        formats: videoInfo.formats?.map((f: any) => ({
          format_id: f.format_id,
          ext: f.ext,
          resolution: f.resolution,
          filesize: f.filesize,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao obter informações do vídeo' },
      { status: 500 }
    );
  }
}

