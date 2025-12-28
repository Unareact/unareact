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
    const { videoUrl, platform = 'youtube' } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'URL do vídeo não fornecida' },
        { status: 400 }
      );
    }

    // Detectar plataforma pela URL
    let detectedPlatform = 'unknown';
    let videoId = null;

    // YouTube
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      detectedPlatform = 'youtube';
      videoId = youtubeMatch[1];
    }

    // TikTok - múltiplos formatos
    const tiktokMatch = videoUrl.match(/(?:tiktok\.com\/@[\w.-]+\/video\/|vm\.tiktok\.com\/|tiktok\.com\/t\/)(\d+)/);
    if (tiktokMatch) {
      detectedPlatform = 'tiktok';
      videoId = tiktokMatch[1];
    }

    if (!videoId || detectedPlatform === 'unknown') {
      return NextResponse.json(
        { 
          error: 'URL inválida ou plataforma não suportada',
          supportedPlatforms: ['YouTube', 'TikTok'],
          receivedUrl: videoUrl
        },
        { status: 400 }
      );
    }

    // Verificar se yt-dlp está instalado
    // Tentar múltiplos caminhos possíveis (começar pelos mais comuns)
    const possiblePaths = [
      '/opt/homebrew/bin/yt-dlp', // Homebrew no Apple Silicon
      '/usr/local/bin/yt-dlp',     // Homebrew no Intel Mac
      'yt-dlp',                    // No PATH
      '/usr/bin/yt-dlp',           // Sistema
      '/opt/homebrew/bin/youtube-dl',
      '/usr/local/bin/youtube-dl',
      'youtube-dl',
      '/usr/bin/youtube-dl'
    ];
    
    let ytDlpCommand: string | null = null;
    
    for (const cmdPath of possiblePaths) {
      try {
        // Tentar executar --version para verificar se funciona
        const { stdout } = await execAsync(`${cmdPath} --version`, { timeout: 2000 });
        if (stdout) {
          ytDlpCommand = cmdPath;
          console.log(`✅ yt-dlp encontrado em: ${cmdPath} (versão: ${stdout.trim()})`);
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!ytDlpCommand) {
      // Detectar sistema operacional
      const isMacOS = process.platform === 'darwin';
      const isWindows = process.platform === 'win32';
      const isLinux = process.platform === 'linux';
      
      let installCommand = 'pip install yt-dlp';
      if (isMacOS) {
        installCommand = 'brew install yt-dlp';
      } else if (isWindows) {
        installCommand = 'pip install yt-dlp';
      } else if (isLinux) {
        installCommand = 'pip install yt-dlp';
      }
      
      return NextResponse.json(
        { 
          error: `yt-dlp não está instalado ou não está no PATH. Para instalar, execute no terminal: ${installCommand}`,
          installInstructions: {
            macOS: 'brew install yt-dlp',
            linux: 'pip install yt-dlp',
            windows: 'pip install yt-dlp',
            current: installCommand
          },
          platform: process.platform,
          hint: 'Após instalar, reinicie o servidor Next.js (npm run dev)'
        },
        { status: 500 }
      );
    }

    const outputPath = path.join(DOWNLOAD_DIR, `${detectedPlatform}-${videoId}-${uuidv4()}.mp4`);

    // Comando yt-dlp (funciona com YouTube e TikTok)
    // Usar caminho absoluto se for um caminho completo
    const command = ytDlpCommand.includes('/') 
      ? `"${ytDlpCommand}" "${videoUrl}" -f "best[ext=mp4]/best" -o "${outputPath}" --no-playlist`
      : `${ytDlpCommand} "${videoUrl}" -f "best[ext=mp4]/best" -o "${outputPath}" --no-playlist`;

    console.log(`Iniciando download de ${detectedPlatform}:`, videoUrl);
    
    // Executar download
    const { stdout, stderr } = await execAsync(command, {
      timeout: 300000, // 5 minutos timeout
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    // Verificar se o arquivo foi criado
    if (!fs.existsSync(outputPath)) {
      // Tentar encontrar arquivo com nome diferente (yt-dlp pode renomear)
      const files = fs.readdirSync(DOWNLOAD_DIR);
      const downloadedFile = files.find(f => f.includes(videoId) || f.includes(detectedPlatform));
      
      if (!downloadedFile) {
        return NextResponse.json(
          { 
            error: 'Download falhou. Verifique os logs.',
            platform: detectedPlatform,
            videoId,
            stderr: stderr?.substring(0, 500) // Limitar tamanho do erro
          },
          { status: 500 }
        );
      }
      
      const finalPath = path.join(DOWNLOAD_DIR, downloadedFile);
      const stats = fs.statSync(finalPath);
      
      return NextResponse.json({
        success: true,
        platform: detectedPlatform,
        videoId,
        filename: downloadedFile,
        size: stats.size,
        path: finalPath,
        message: `Download de ${detectedPlatform} concluído com sucesso!`,
      });
    }

    const stats = fs.statSync(outputPath);
    
    return NextResponse.json({
      success: true,
      platform: detectedPlatform,
      videoId,
      filename: path.basename(outputPath),
      size: stats.size,
      path: outputPath,
      message: `Download de ${detectedPlatform} concluído com sucesso!`,
    });

  } catch (error: any) {
    console.error('Erro ao fazer download:', error);
    
    // Erro mais específico
    if (error.message?.includes('yt-dlp') || error.message?.includes('youtube-dl')) {
      return NextResponse.json(
        { 
          error: 'yt-dlp não está instalado ou não está no PATH',
          installInstructions: {
            macOS: 'brew install yt-dlp',
            linux: 'pip install yt-dlp',
            windows: 'pip install yt-dlp'
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Erro ao fazer download',
        details: error.stderr?.substring(0, 500) || error.toString()
      },
      { status: 500 }
    );
  }
}

