import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/app/lib/supabase';

// DELETE - Excluir download
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do download é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from('video_downloads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir download:', error);
      return NextResponse.json(
        { error: error.message || 'Erro ao excluir download' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Download excluído com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao excluir download:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir download' },
      { status: 500 }
    );
  }
}

