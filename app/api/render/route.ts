import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { VideoClip, ScriptSegment } from '@/app/types';

const OUTPUT_DIR = path.join(process.cwd(), 'tmp', 'renders');

// Garantir que o diretório existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clips, script, transitions, captions, quality = '1080p' } = body;

    if (!clips || clips.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum clip fornecido' },
        { status: 400 }
      );
    }

    // Configurações de qualidade
    const qualitySettings = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '4K': { width: 3840, height: 2160 },
    };

    const { width, height } = qualitySettings[quality as keyof typeof qualitySettings] || qualitySettings['1080p'];

    // Calcular duração total
    const totalDuration = clips.length > 0 
      ? Math.max(...clips.map((c: VideoClip) => c.endTime))
      : 60;
    const fps = 30;
    const durationInFrames = Math.ceil(totalDuration * fps);

    console.log('📦 Iniciando bundle do Remotion...');
    
    // Bundle do Remotion
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'app', 'components', 'remotion', 'RemotionRoot.tsx'),
      webpackOverride: (config) => config,
    });

    console.log('✅ Bundle concluído. Iniciando renderização...');

    // Caminho de saída
    const outputPath = path.join(
      OUTPUT_DIR,
      `video-${Date.now()}.mp4`
    );

    // Renderizar vídeo
    await renderMedia({
      composition: {
        id: 'VideoComposition',
        width,
        height,
        fps,
        durationInFrames,
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        clips,
        script: script || [],
        transitions: transitions || [],
        captions: captions || [],
      },
      onProgress: (progress) => {
        console.log(`📊 Progresso: ${Math.round(progress * 100)}%`);
      },
    });

    console.log('✅ Renderização concluída!');

    // Verificar se o arquivo foi criado
    if (!fs.existsSync(outputPath)) {
      return NextResponse.json(
        { error: 'Erro ao criar arquivo de vídeo' },
        { status: 500 }
      );
    }

    const stats = fs.statSync(outputPath);
    const fileSize = stats.size;

    // Retornar URL relativa para download
    const filename = path.basename(outputPath);
    const downloadUrl = `/api/downloads/${filename}`;

    return NextResponse.json({
      success: true,
      videoUrl: downloadUrl,
      filename,
      size: fileSize,
      path: outputPath,
      message: 'Vídeo renderizado com sucesso!',
    });
  } catch (error: any) {
    console.error('❌ Erro ao renderizar vídeo:', error);
    return NextResponse.json(
      {
        error: 'Erro ao renderizar vídeo',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET para verificar status
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API de renderização ativa',
  });
}

