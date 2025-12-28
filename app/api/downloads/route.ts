import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/app/lib/supabase';

// GET - Listar downloads
export async function GET(request: NextRequest) {
  try {
    // Verificar se Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.warn('⚠️ Supabase não configurado - retornando lista vazia');
      return NextResponse.json({
        downloads: [],
        total: 0,
        message: 'Supabase não está configurado. Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY',
      });
    }

    const supabase = createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('video_downloads')
      .select('*')
      .order('downloaded_at', { ascending: false })
      .limit(100);

    if (error) {
      // Se a tabela não existe, retornar lista vazia com mensagem
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('⚠️ Tabela video_downloads não existe no Supabase');
        return NextResponse.json({
          downloads: [],
          total: 0,
          message: 'Tabela video_downloads não existe. Execute o SQL em SUPABASE_DOWNLOADS_TABLE.sql no Supabase SQL Editor',
        });
      }

      console.error('Erro ao buscar downloads:', error);
      return NextResponse.json(
        { 
          error: error.message || 'Erro ao buscar downloads',
          downloads: [],
          total: 0,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      downloads: data || [],
      total: data?.length || 0,
    });
  } catch (error: any) {
    console.error('Erro ao listar downloads:', error);
    
    // Se for erro de configuração do Supabase, retornar lista vazia
    if (error.message?.includes('Missing Supabase')) {
      return NextResponse.json({
        downloads: [],
        total: 0,
        message: 'Supabase não está configurado. Configure as variáveis de ambiente.',
      });
    }

    return NextResponse.json(
      { 
        error: error.message || 'Erro ao listar downloads',
        downloads: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}

// POST - Criar novo download
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      video_url,
      video_id,
      platform,
      title,
      filename,
      file_size,
      file_path,
      storage_url,
      format,
      quality,
      duration,
    } = body;

    if (!video_url || !video_id || !platform) {
      return NextResponse.json(
        { error: 'video_url, video_id e platform são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.warn('⚠️ Supabase não configurado - download não será salvo');
      return NextResponse.json({
        success: true,
        download: null,
        message: 'Download concluído, mas não foi salvo no Supabase (não configurado)',
      });
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from('video_downloads')
      .insert({
        video_url,
        video_id,
        platform,
        title: title || null,
        filename: filename || `${video_id}.${format || 'mp4'}`,
        file_size: file_size || 0,
        file_path: file_path || null,
        storage_url: storage_url || null,
        format: format || 'mp4',
        quality: quality || 'best',
        duration: duration || null,
        downloaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Se a tabela não existe, retornar sucesso mas avisar
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('⚠️ Tabela video_downloads não existe - download não foi salvo');
        return NextResponse.json({
          success: true,
          download: null,
          message: 'Download concluído, mas não foi salvo (tabela não existe). Execute SUPABASE_DOWNLOADS_TABLE.sql no Supabase',
        });
      }

      console.error('Erro ao salvar download:', error);
      // Não falhar o download se houver erro ao salvar
      return NextResponse.json({
        success: true,
        download: null,
        message: 'Download concluído, mas houve erro ao salvar no Supabase: ' + error.message,
      });
    }

    return NextResponse.json({
      success: true,
      download: data,
    });
  } catch (error: any) {
    console.error('Erro ao criar download:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar download' },
      { status: 500 }
    );
  }
}

