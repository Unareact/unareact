import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoTitle, videoDescription, videoStats } = body;

    // Gerar roteiro focado em conversão para avaliação de $10
    const script = generateConversionScript(videoTitle, videoDescription, videoStats);

    return NextResponse.json({ script });
  } catch (error: any) {
    console.error('Erro ao gerar roteiro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar roteiro' },
      { status: 500 }
    );
  }
}

function generateConversionScript(
  videoTitle: string,
  videoDescription: string,
  videoStats: { views: number; likes: number; comments: number; viralScore: number }
): string {
  // Extrair tema principal do vídeo
  const titleWords = videoTitle.toLowerCase();
  const isAboutHabits = titleWords.includes('hábito') || titleWords.includes('rotina');
  const isAboutTransformation = titleWords.includes('transformação') || titleWords.includes('antes') || titleWords.includes('depois');
  const isAboutRecipes = titleWords.includes('receita') || titleWords.includes('comida');

  let hook = '';
  let problem = '';
  let solution = '';

  if (isAboutHabits) {
    hook = 'Você já viu esse vídeo sobre hábitos saudáveis e pensou: "Eu quero isso, mas não sei por onde começar"?';
    problem = 'Muitas mulheres brasileiras nos EUA querem criar hábitos saudáveis, mas ficam perdidas tentando seguir dicas genéricas que não funcionam para o estilo de vida delas.';
  } else if (isAboutTransformation) {
    hook = 'Você viu essa transformação e pensou: "Eu quero resultados assim, mas de forma personalizada"?';
    problem = 'Muitas mulheres veem transformações incríveis, mas não sabem como começar sua própria jornada de forma segura e eficaz.';
  } else if (isAboutRecipes) {
    hook = 'Você viu essas receitas saudáveis e pensou: "Eu quero comer melhor, mas preciso de um plano completo"?';
    problem = 'Muitas mulheres querem melhorar sua alimentação, mas não sabem quais receitas são ideais para seus objetivos específicos.';
  } else {
    hook = 'Você viu esse vídeo e pensou: "Eu quero começar a me cuidar, mas preciso de orientação profissional"?';
    problem = 'Muitas mulheres brasileiras nos EUA querem começar a se cuidar, mas não sabem por onde começar e ficam perdidas com tanta informação.';
  }

  solution = `É por isso que criamos uma avaliação completa de bem-estar por apenas $10. 
Você vai descobrir seus pontos fortes e áreas de melhoria, receber um plano personalizado 
e entender exatamente o que fazer para começar sua transformação HOJE.`;

  const script = `[INTRO - 0-3s]
${hook}

[HOOK - 3-8s]
E se eu te disser que você pode ter resultados similares, mas de forma personalizada e com acompanhamento profissional?

[PROBLEMA - 8-15s]
${problem}

[SOLUÇÃO - 15-25s]
${solution}

[BENEFÍCIOS - 25-35s]
Com essa avaliação de $10, você vai:
- Entender seu estado atual de bem-estar
- Receber recomendações personalizadas para seu estilo de vida
- Ter um plano claro de ação com passos específicos
- Acesso a recursos exclusivos para brasileiras nos EUA

[PROVA SOCIAL - 35-42s]
Centenas de mulheres já fizeram essa avaliação e começaram sua transformação. 
Não é sobre seguir uma receita genérica - é sobre descobrir o que funciona para VOCÊ.

[CTA - 42-50s]
Clique no link na descrição e faça sua avaliação de $10 agora. 
São apenas alguns minutos que vão mudar completamente sua jornada de bem-estar.
O link está aqui embaixo - não deixe essa oportunidade passar!

[OUTRO - 50-55s]
Sua transformação começa AGORA! Não deixe para depois. 
Faça sua avaliação e dê o primeiro passo para uma vida mais saudável e feliz.`;

  return script;
}

