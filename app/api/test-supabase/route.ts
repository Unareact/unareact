import { createSupabaseClient } from '@/app/lib/supabase'
import { NextResponse } from 'next/server'

/**
 * Rota de teste para verificar conexão com Supabase
 * Acesse: http://localhost:3000/api/test-supabase
 */
export async function GET() {
  try {
    const supabase = createSupabaseClient()
    
    // Testa conexão fazendo uma query simples
    const { data, error } = await supabase
      .from('video_projects')
      .select('count')
      .limit(1)
    
    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          hint: 'Verifique se as tabelas foram criadas no Supabase'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Conexão com Supabase funcionando!',
      data
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        hint: 'Verifique as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY'
      },
      { status: 500 }
    )
  }
}



