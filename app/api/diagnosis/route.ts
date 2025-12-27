import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import OpenAI from 'openai';
import { ViralDiagnosis } from '@/app/types';

const youtube = google.youtube('v3');

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID não fornecido' },
        { status: 400 }
      );
    }

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    if (!youtubeApiKey) {
      return NextResponse.json(
        { error: 'YouTube API Key não configurada' },
        { status: 500 }
      );
    }

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API Key não configurada' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Buscar dados detalhados do vídeo
    const videoResponse = await youtube.videos.list({
      key: youtubeApiKey,
      part: ['snippet', 'statistics', 'contentDetails', 'status'],
      id: [videoId],
    });

    const video = videoResponse.data.items?.[0];
    if (!video) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      );
    }

    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;

    // Calcular métricas
    const views = parseInt(statistics?.viewCount || '0');
    const likes = parseInt(statistics?.likeCount || '0');
    const comments = parseInt(statistics?.commentCount || '0');
    const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
    const likeToViewRatio = views > 0 ? (likes / views) * 100 : 0;
    const commentToViewRatio = views > 0 ? (comments / views) * 100 : 0;

    // Parse duration
    const durationMatch = contentDetails?.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(durationMatch?.[1] || '0');
    const minutes = parseInt(durationMatch?.[2] || '0');
    const seconds = parseInt(durationMatch?.[3] || '0');
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    // Análise com IA - Prompt otimizado e treinado
    const category = snippet?.categoryId || '0';
    const tags = snippet?.tags?.join(', ') || 'Nenhuma tag';
    const description = snippet?.description?.substring(0, 1500) || '';
    const daysSincePublished = Math.floor((Date.now() - new Date(snippet?.publishedAt || 0).getTime()) / (1000 * 60 * 60 * 24));
    const likesPerDay = daysSincePublished > 0 ? (likes / daysSincePublished).toFixed(0) : likes;
    const viewsPerDay = daysSincePublished > 0 ? (views / daysSincePublished).toFixed(0) : views;
    const avgWatchTime = totalSeconds > 0 ? Math.round((totalSeconds * 0.6)) : 0; // Estimativa conservadora de retenção
    
    // Calcular benchmarks de viralização
    const isHighEngagement = engagementRate > 5;
    const isHighLikeRatio = likeToViewRatio > 3;
    const isHighCommentRatio = commentToViewRatio > 1;
    const isRapidGrowth = daysSincePublished < 30 && views > 1000000;
    
    const analysisPrompt = `Você é um ANALISTA ESPECIALISTA em vídeos virais com 10+ anos de experiência analisando milhões de vídeos do YouTube, TikTok, Instagram e outras plataformas. Você identifica padrões de viralização com precisão científica e fornece insights acionáveis baseados em dados reais.

═══════════════════════════════════════════════════════════════
📊 DADOS COMPLETOS DO VÍDEO PARA ANÁLISE:
═══════════════════════════════════════════════════════════════
📌 Título: "${snippet?.title}"
📝 Descrição (primeiros 1500 chars): "${description}"
👤 Canal: "${snippet?.channelTitle}"
⏱️ Duração: ${totalSeconds}s (${Math.floor(totalSeconds / 60)}min ${totalSeconds % 60}s)
📅 Publicado há: ${daysSincePublished} dias
📈 Visualizações: ${views.toLocaleString()} (${viewsPerDay} views/dia)
❤️ Curtidas: ${likes.toLocaleString()} (${likesPerDay} likes/dia)
💬 Comentários: ${comments.toLocaleString()}
📊 Taxa de Engajamento Total: ${engagementRate.toFixed(2)}% ${isHighEngagement ? '🔥 ALTA' : engagementRate > 2 ? '✅ BOA' : '⚠️ BAIXA'}
📊 Taxa Like/View: ${likeToViewRatio.toFixed(2)}% ${isHighLikeRatio ? '🔥 EXCELENTE' : likeToViewRatio > 1.5 ? '✅ BOA' : '⚠️ ABAIXO DA MÉDIA'}
📊 Taxa Comment/View: ${commentToViewRatio.toFixed(2)}% ${isHighCommentRatio ? '🔥 ALTA PARTICIPAÇÃO' : commentToViewRatio > 0.5 ? '✅ BOA' : '⚠️ BAIXA'}
🏷️ Tags: ${tags}
📂 Categoria ID: ${category}
⏱️ Tempo médio estimado de assistência: ~${avgWatchTime}s (60% da duração)

${isRapidGrowth ? '🚀 INDICADOR DE CRESCIMENTO RÁPIDO: Vídeo viralizou em menos de 30 dias!' : ''}
${isHighEngagement && isHighLikeRatio ? '💎 INDICADOR DE ALTA QUALIDADE: Engajamento excepcional!' : ''}

═══════════════════════════════════════════════════════════════
🎯 METODOLOGIA DE ANÁLISE (SIGA ESTE PROCESSO):
═══════════════════════════════════════════════════════════════

PASSO 1: ANÁLISE DE MÉTRICAS
- Compare as taxas com benchmarks da indústria:
  * Engajamento >5% = EXCELENTE | 2-5% = BOM | <2% = BAIXO
  * Like/View >3% = EXCELENTE | 1.5-3% = BOM | <1.5% = BAIXO
  * Comment/View >1% = ALTA PARTICIPAÇÃO | 0.5-1% = MÉDIA | <0.5% = BAIXA
- Identifique anomalias positivas (ex: muitos comentários = conteúdo polêmico/engajador)
- Calcule velocidade de crescimento (views/dia, likes/dia)

PASSO 2: ANÁLISE DE CONTEÚDO
- TÍTULO: Identifique estratégias (números, perguntas, promessas, urgência, curiosidade, controvérsia)
- DESCRIÇÃO: Analise SEO, palavras-chave, estrutura, call-to-action
- TAGS: Identifique nicho, temas, palavras-chave estratégicas
- DURAÇÃO: Relacione com retenção e formato (short-form vs long-form)

PASSO 3: IDENTIFICAÇÃO DE FATORES VIRAIS
- HOOK: O que acontece nos primeiros 3-5 segundos? (palavras exatas, imagens, sons, ações)
- ESTRUTURA: Identifique padrão narrativo (Problema-Solução, Storytelling 3-Act, Hook-Desenvolvimento-CTA, Lista/Top N, Tutorial, Reação, Comparação, etc.)
- RITMO: Baseado na duração e estrutura, determine se é fast/medium/slow
- GATILHOS EMOCIONAIS: Identifique 3-5 emoções específicas despertadas
- CTA: Analise se há call-to-action e como funciona

PASSO 4: ANÁLISE DE PADRÕES REPLICÁVEIS
- Identifique elementos que podem ser copiados/adaptados
- Extraia técnicas específicas de edição, narrativa, visual
- Crie recomendações práticas e mensuráveis

═══════════════════════════════════════════════════════════════
📋 ESTRUTURA DO JSON DE RESPOSTA (OBRIGATÓRIO):
═══════════════════════════════════════════════════════════════

{
  "viralFactors": {
    "hook": "Análise DETALHADA e ESPECÍFICA dos primeiros 3-5 segundos. Exemplo: 'O vídeo começa com uma pergunta direta: [texto exato]. A imagem mostra [descrição específica]. A música é [estilo específico]. Isso cria [emoção específica] porque [razão psicológica].' NÃO use genéricos como 'chama atenção' - seja CONCRETO.",
    "pacing": "fast|medium|slow - Justifique baseado na duração (${totalSeconds}s) e estrutura. Vídeos <60s geralmente são 'fast', 60-180s 'medium', >180s 'slow'.",
    "structure": "Nome ESPECÍFICO da estrutura narrativa identificada. Exemplos válidos: 'Problema-Solução', 'Storytelling 3-Act', 'Hook-Desenvolvimento-CTA', 'Lista/Top 10', 'Tutorial Passo-a-Passo', 'Reação/Review', 'Comparação A vs B', 'Transformação Antes-Depois', 'Pergunta-Resposta', 'Narrativa Linear', 'Não-Linear/Montagem'",
    "emotionalTriggers": ["Array de 3-5 emoções ESPECÍFICAS. Exemplos válidos: 'Curiosidade', 'Surpresa', 'Empatia', 'Medo', 'Alegria', 'Raiva', 'Inspiração', 'Nostalgia', 'Orgulho', 'Alívio', 'Antecipação', 'Confusão Resolvida'. Seja ESPECÍFICO sobre qual emoção e POR QUÊ."],
    "callToAction": "Análise DETALHADA do CTA. Se não houver CTA explícito, analise o CTA implícito (ex: 'O vídeo termina sem CTA explícito, mas o conteúdo gera curiosidade que leva a assistir mais vídeos do canal'). Se houver, cite o texto exato ou descreva a ação solicitada.",
    "thumbnailAppeal": "Análise ESPECÍFICA baseada em padrões de thumbnails virais. Analise: cores predominantes e por que funcionam, texto (se houver), expressão facial/linguagem corporal, composição (regra dos terços, contraste), elementos que geram curiosidade. Se não tiver acesso visual, INFIRA baseado no título e descrição.",
    "titleStrategy": "Análise DETALHADA da estratégia do título. Identifique: uso de números (ex: '5 maneiras'), perguntas, promessas/benefícios, palavras de poder (ex: 'SECRETO', 'NUNCA', 'ÚNICO'), urgência, curiosidade gap, palavras emocionais. Cite exemplos ESPECÍFICOS do título analisado."
  },
  "insights": {
    "whyItWentViral": "Análise PROFUNDA de 4-6 parágrafos explicando os fatores principais. ESTRUTURA: Parágrafo 1 = Fator principal (cite métricas), Parágrafo 2 = Fator secundário, Parágrafo 3 = Fator terciário, Parágrafo 4 = Combinação única de fatores, Parágrafo 5 = Timing/contexto (se relevante), Parágrafo 6 = Resumo executivo. Use DADOS CONCRETOS: 'Com ${engagementRate.toFixed(2)}% de engajamento, este vídeo está ${isHighEngagement ? 'acima' : 'abaixo'} da média da indústria (5%), indicando que...'",
    "keyMoments": [
      {
        "timestamp": "0:00-0:05",
        "description": "Descrição ESPECÍFICA do que acontece neste momento exato. Exemplo: 'O vídeo abre com close-up do rosto do criador fazendo uma expressão de surpresa, enquanto uma música eletrônica uptempo começa. O criador diz: [texto exato se possível ou descrição]'",
        "impact": "Explicação ESPECÍFICA de por que este momento é crucial. Exemplo: 'Este hook funciona porque combina estímulo visual (expressão), auditivo (música) e narrativo (palavras) em 3 segundos, criando curiosidade gap que força o espectador a continuar assistindo para entender o contexto.'"
      }
    ],
    "targetAudience": "Descrição ESPECÍFICA baseada em dados. Analise: faixa etária estimada (baseado em categoria, tags, estilo), interesses (baseado em tags e descrição), comportamento (baseado em engajamento - muitos comentários = audiência participativa, muitos likes = audiência que valoriza conteúdo). Exemplo: 'Audiência estimada: 18-35 anos, interessados em [tema específico das tags], comportamento altamente engajado (${commentToViewRatio.toFixed(2)}% de comentários indica participação ativa).'",
    "contentPatterns": ["Array de 5-8 padrões ESPECÍFICOS e replicáveis. Exemplos: 'Título usa número (${snippet?.title.match(/\d+/)?.[0] || 'N/A'}) para criar expectativa', 'Descrição tem ${description.split('\\n').length} parágrafos com estrutura clara', 'Duração de ${totalSeconds}s é ideal para formato [short/long]-form', 'Taxa de engajamento ${engagementRate > 5 ? 'excepcional' : engagementRate > 2 ? 'boa' : 'pode melhorar'} sugere [insight específico]'"],
    "recommendations": [
      "Array de 5-7 recomendações ESPECÍFICAS e ACIONÁVEIS. Formato: 'AÇÃO CONCRETA + CONTEXTO + RESULTADO ESPERADO'. Exemplos BONS: 'Use transições rápidas (corte a cada 1.5-2s) nos primeiros 15 segundos para manter atenção, depois aumente para 3-4s no desenvolvimento', 'Inclua números no título (ex: '5 maneiras', '10 segredos') pois aumenta CTR em 20-30%', 'Comece com pergunta direta nos primeiros 3 segundos para criar curiosidade gap'. Exemplos RUINS (NÃO USE): 'Use transições', 'Melhore o título', 'Seja interessante'."
    ]
  },
  "editingRecommendations": {
    "introDuration": ${Math.min(Math.max(Math.round(totalSeconds * 0.05), 2), 8)},
    "pacing": "Descrição ESPECÍFICA e MENSURÁVEL do ritmo. Exemplo: 'Cortes rápidos a cada 1.5-2 segundos nos primeiros ${Math.round(totalSeconds * 0.2)}s (primeiros 20%), depois transições mais lentas de 3-4s no desenvolvimento (meio 60%), e cortes de 2-3s no final (últimos 20%) para manter energia até o CTA.'",
    "transitions": ["Array de 3-5 tipos ESPECÍFICOS. Exemplos: 'Whip pan (transição rápida de movimento)', 'Zoom in (zoom rápido em momentos-chave)', 'Fade rápido (fade de 0.3s entre cenas)', 'Cut on action (corte no movimento)', 'Match cut (corte que conecta visualmente duas cenas)'. Seja ESPECÍFICO sobre quando usar cada uma."],
    "musicStyle": "Estilo ESPECÍFICO com detalhes técnicos. Exemplo: 'Música eletrônica uptempo 120-130 BPM com batida marcante, ideal para manter energia. Evite músicas com vocais no início para não competir com a narração. Use música instrumental ou com vocais apenas em momentos específicos de impacto.'",
    "visualStyle": "Estilo visual ESPECÍFICO com detalhes técnicos. Exemplo: 'Cores saturadas (+15-20%), alto contraste (níveis ajustados para destacar elementos principais), temperatura de cor ligeiramente quente (+200K) para criar atmosfera acolhedora, sharpness aumentado (+10%) para nitidez.'",
    "effects": ["Array de 3-5 efeitos ESPECÍFICOS com parâmetros. Exemplos: 'Zoom in de 100% para 120% em 0.5s nos momentos-chave (use keyframes)', 'Slow motion em 0.5x velocidade em momentos de impacto emocional', 'Text overlay com fontes bold (Impact ou similar) em momentos-chave, animação de entrada: fade in + slide up', 'Color grading: aumentar saturação de vermelhos e laranjas em 15%', 'Transição de wipe diagonal em momentos de mudança de tópico'"]
  },
  "scriptTemplate": {
    "structure": "Nome ESPECÍFICO da estrutura identificada. Deve corresponder ao campo 'structure' em viralFactors.",
    "segments": [
      {
        "type": "hook|setup|conflict|resolution|cta",
        "duration": ${Math.round(totalSeconds * 0.1)},
        "description": "Descrição ESPECÍFICA do objetivo deste segmento. Exemplo: 'Este segmento deve criar curiosidade gap apresentando uma pergunta intrigante que o espectador precisa responder assistindo o vídeo.'",
        "example": "Exemplo CONCRETO e REALISTA de texto/fala. Baseado no título '${snippet?.title.substring(0, 50)}...', crie um exemplo que faça sentido. Exemplo: 'Você já se perguntou por que alguns vídeos viralizam enquanto outros, com conteúdo similar, não conseguem nem 1000 visualizações? Hoje vou te mostrar os 3 segredos que ninguém fala...' NÃO use placeholders como '[texto aqui]'."
      }
    ]
  }
}

═══════════════════════════════════════════════════════════════
⚠️ REGRAS CRÍTICAS (SIGA RIGOROSAMENTE):
═══════════════════════════════════════════════════════════════

1. ESPECIFICIDADE É OBRIGATÓRIA:
   ❌ RUIM: "O vídeo tem um bom hook"
   ✅ BOM: "O vídeo começa com uma pergunta direta nos primeiros 2 segundos: '[texto exato ou descrição]', combinada com música uptempo e close-up do rosto, criando curiosidade gap"

2. USE OS DADOS FORNECIDOS:
   - Sempre cite métricas específicas: "${engagementRate.toFixed(2)}%", "${likeToViewRatio.toFixed(2)}%"
   - Compare com benchmarks: "Acima/abaixo da média de 5%"
   - Relacione causa-efeito: "A alta taxa de comentários (${commentToViewRatio.toFixed(2)}%) indica..."

3. EXEMPLOS CONCRETOS, NÃO GENÉRICOS:
   ❌ RUIM: "Use transições"
   ✅ BOM: "Use transições de whip pan a cada 2-3 segundos nos primeiros 15s, depois fade rápido de 0.3s no desenvolvimento"

4. ANÁLISE PROFUNDA, NÃO SUPERFICIAL:
   - Não pare na superfície: explique o PORQUÊ psicológico/emocional
   - Conecte elementos: "O título usa número + pergunta, o que funciona porque números criam expectativa e perguntas criam curiosidade gap"

5. TEMPLATE DE ROTEIRO DEVE SER USÁVEL:
   - Exemplos de texto devem ser REALISTAS e BASEADOS no vídeo analisado
   - Durações devem somar aproximadamente ${totalSeconds}s
   - Cada segmento deve ter propósito claro

6. CONSIDERE O CONTEXTO:
   - Duração ${totalSeconds}s = formato ${totalSeconds < 60 ? 'short-form' : totalSeconds < 180 ? 'médio' : 'long-form'}
   - ${daysSincePublished} dias desde publicação = ${isRapidGrowth ? 'crescimento rápido' : 'crescimento normal'}
   - Categoria ${category} = contexto de nicho

═══════════════════════════════════════════════════════════════
🚀 AGORA, EXECUTE A ANÁLISE COMPLETA:
═══════════════════════════════════════════════════════════════

Siga os 4 passos da metodologia acima e forneça o JSON completo com TODOS os campos preenchidos de forma ESPECÍFICA, DETALHADA e ACIONÁVEL.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um ANALISTA ESPECIALISTA em vídeos virais com expertise em:
- Análise de métricas de engajamento (YouTube, TikTok, Instagram)
- Identificação de padrões de viralização baseados em dados
- Criação de insights acionáveis e replicáveis
- Análise de estrutura narrativa e técnicas de storytelling
- Recomendações práticas de edição e produção

Sua missão é fornecer análises PROFUNDAS, ESPECÍFICAS e BASEADAS EM DADOS. 
NUNCA use respostas genéricas. Sempre cite dados concretos e forneça exemplos específicos.
Sempre retorne JSON válido e completo com todos os campos solicitados.`,
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5, // Reduzido para mais consistência e precisão
      max_tokens: 4000, // Aumentado para análises mais completas
    });

    const aiAnalysis = JSON.parse(completion.choices[0]?.message?.content || '{}');

    // Construir diagnóstico completo
    const diagnosis: ViralDiagnosis = {
      videoId,
      videoTitle: snippet?.title || '',
      
      metrics: {
        engagementRate,
        likeToViewRatio,
        commentToViewRatio,
      },
      
      viralFactors: {
        hook: aiAnalysis.viralFactors?.hook || 'Análise não disponível',
        pacing: aiAnalysis.viralFactors?.pacing || 'medium',
        structure: aiAnalysis.viralFactors?.structure || 'Não identificado',
        emotionalTriggers: aiAnalysis.viralFactors?.emotionalTriggers || [],
        callToAction: aiAnalysis.viralFactors?.callToAction || 'Não identificado',
        thumbnailAppeal: aiAnalysis.viralFactors?.thumbnailAppeal || 'Não analisado',
        titleStrategy: aiAnalysis.viralFactors?.titleStrategy || 'Não analisado',
      },
      
      insights: {
        whyItWentViral: aiAnalysis.insights?.whyItWentViral || 'Análise em processamento',
        keyMoments: aiAnalysis.insights?.keyMoments || [],
        targetAudience: aiAnalysis.insights?.targetAudience || 'Não identificado',
        contentPatterns: aiAnalysis.insights?.contentPatterns || [],
        recommendations: aiAnalysis.insights?.recommendations || [],
      },
      
      editingRecommendations: {
        introDuration: aiAnalysis.editingRecommendations?.introDuration || 3,
        pacing: aiAnalysis.editingRecommendations?.pacing || 'Médio',
        transitions: aiAnalysis.editingRecommendations?.transitions || [],
        musicStyle: aiAnalysis.editingRecommendations?.musicStyle || 'Não especificado',
        visualStyle: aiAnalysis.editingRecommendations?.visualStyle || 'Não especificado',
        effects: aiAnalysis.editingRecommendations?.effects || [],
      },
      
      scriptTemplate: {
        structure: aiAnalysis.scriptTemplate?.structure || 'Linear',
        segments: aiAnalysis.scriptTemplate?.segments || [],
      },
      
      generatedAt: new Date(),
    };

    return NextResponse.json({ diagnosis });
  } catch (error: any) {
    console.error('Erro ao gerar diagnóstico:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar diagnóstico' },
      { status: 500 }
    );
  }
}

