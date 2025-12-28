import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const RENDERS_DIR = path.join(process.cwd(), 'tmp', 'renders');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Nome do arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Sanitizar nome do arquivo (prevenir path traversal)
    const safeFilename = path.basename(filename);
    const filePath = path.join(RENDERS_DIR, safeFilename);

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      );
    }

    // Ler arquivo
    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);

    // Retornar arquivo
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao fazer download:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer download do arquivo' },
      { status: 500 }
    );
  }
}

