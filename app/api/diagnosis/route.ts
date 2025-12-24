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

    // Análise com IA - Prompt melhorado
    const category = snippet?.categoryId || '0';
    const tags = snippet?.tags?.join(', ') || 'Nenhuma tag';
    const description = snippet?.description?.substring(0, 1000) || '';
    const daysSincePublished = Math.floor((Date.now() - new Date(snippet?.publishedAt || 0).getTime()) / (1000 * 60 * 60 * 24));
    const likesPerDay = daysSincePublished > 0 ? (likes / daysSincePublished).toFixed(0) : likes;
    
    const analysisPrompt = `Você é um especialista em análise de vídeos virais do YouTube, TikTok e outras plataformas. Analise este vídeo viral e forneça um diagnóstico PROFUNDO e ACIONÁVEL.

═══════════════════════════════════════════════════════════════
📊 DADOS COMPLETOS DO VÍDEO:
═══════════════════════════════════════════════════════════════
📌 Título: "${snippet?.title}"
📝 Descrição: "${description}"
👤 Canal: "${snippet?.channelTitle}"
⏱️ Duração: ${totalSeconds} segundos (${Math.floor(totalSeconds / 60)}min ${totalSeconds % 60}s)
📅 Publicado há: ${daysSincePublished} dias
📈 Visualizações: ${views.toLocaleString()}
❤️ Curtidas: ${likes.toLocaleString()} (${likesPerDay} curtidas/dia)
💬 Comentários: ${comments.toLocaleString()}
📊 Taxa de Engajamento: ${engagementRate.toFixed(2)}%
📊 Taxa Like/View: ${likeToViewRatio.toFixed(2)}%
📊 Taxa Comment/View: ${commentToViewRatio.toFixed(2)}%
🏷️ Tags: ${tags}
📂 Categoria: ${category}

═══════════════════════════════════════════════════════════════
🎯 SUA MISSÃO:
═══════════════════════════════════════════════════════════════
Analise PROFUNDAMENTE por que este vídeo viralizou e forneça:
1. Fatores de viralização DETALHADOS e ESPECÍFICOS
2. Insights baseados em DADOS REAIS (não genéricos)
3. Recomendações PRÁTICAS e ACIONÁVEIS para replicar o sucesso
4. Template de roteiro COMPLETO com exemplos REAIS

═══════════════════════════════════════════════════════════════
📋 ESTRUTURA DO JSON DE RESPOSTA:
═══════════════════════════════════════════════════════════════

{
  "viralFactors": {
    "hook": "Análise DETALHADA do que prende atenção nos primeiros 3-5 segundos. Seja ESPECÍFICO sobre palavras, imagens, sons ou ações usadas.",
    "pacing": "fast|medium|slow - Baseado na duração e estrutura do vídeo",
    "structure": "Estrutura narrativa identificada (ex: 'Problema-Solução', 'Storytelling 3-Act', 'Hook-Desenvolvimento-CTA', 'Lista/Top 10', etc.)",
    "emotionalTriggers": ["Array de emoções específicas despertadas (ex: 'Curiosidade', 'Surpresa', 'Empatia', 'Medo', 'Alegria', 'Raiva', 'Inspiração')"],
    "callToAction": "Análise do CTA usado (se houver) e por que funciona",
    "thumbnailAppeal": "Análise do que torna a thumbnail eficaz (cores, texto, expressão facial, composição)",
    "titleStrategy": "Estratégia do título (números, perguntas, promessas, urgência, etc.)"
  },
  "insights": {
    "whyItWentViral": "Análise PROFUNDA de 3-5 parágrafos explicando os fatores principais de viralização. Use DADOS CONCRETOS das métricas acima. Não seja genérico.",
    "keyMoments": [
      {
        "timestamp": "0:00-0:05",
        "description": "O que acontece neste momento",
        "impact": "Por que este momento é crucial para a viralização"
      }
    ],
    "targetAudience": "Descrição ESPECÍFICA da audiência-alvo baseada em dados (idade estimada, interesses, comportamento)",
    "contentPatterns": ["Padrões identificados que podem ser replicados (ex: 'Uso de números no título', 'Transições rápidas a cada 3s', 'Música uptempo')"],
    "recommendations": [
      "Recomendações ESPECÍFICAS e ACIONÁVEIS (não genéricas). Ex: 'Use transições rápidas a cada 2-3 segundos nos primeiros 15s' ao invés de 'Use transições'"
    ]
  },
  "editingRecommendations": {
    "introDuration": 3,
    "pacing": "Descrição ESPECÍFICA do ritmo (ex: 'Cortes a cada 1.5s nos primeiros 10s, depois 3s')",
    "transitions": ["Tipos ESPECÍFICOS de transições (ex: 'Whip pan', 'Zoom in', 'Fade rápido')"],
    "musicStyle": "Estilo ESPECÍFICO de música (ex: 'Eletrônica uptempo 120bpm', 'Lo-fi hip-hop relaxante')",
    "visualStyle": "Estilo visual ESPECÍFICO (ex: 'Cores saturadas, alto contraste', 'Filtro warm, tons terrosos')",
    "effects": ["Efeitos ESPECÍFICOS recomendados (ex: 'Zoom in nos momentos-chave', 'Slow motion em 0.5x', 'Text overlay com fontes bold')"]
  },
  "scriptTemplate": {
    "structure": "Nome da estrutura (ex: 'Hook-Desenvolvimento-CTA', 'Problema-Solução')",
    "segments": [
      {
        "type": "hook|setup|conflict|resolution|cta",
        "duration": 3,
        "description": "O que este segmento deve fazer",
        "example": "Exemplo CONCRETO de texto/fala para este segmento baseado no vídeo analisado"
      }
    ]
  }
}

═══════════════════════════════════════════════════════════════
⚠️ REGRAS IMPORTANTES:
═══════════════════════════════════════════════════════════════
- Seja ESPECÍFICO, não genérico
- Use os DADOS fornecidos para fundamentar suas análises
- Forneça exemplos CONCRETOS baseados no vídeo analisado
- As recomendações devem ser ACIONÁVEIS (alguém deve conseguir implementar)
- O template de roteiro deve ter exemplos REAIS, não placeholders
- Analise o título, descrição e tags para entender o contexto
- Considere a duração do vídeo ao fazer recomendações de pacing

AGORA, ANALISE ESTE VÍDEO E FORNEÇA O JSON COMPLETO:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em análise de vídeos virais e criação de conteúdo. Forneça análises detalhadas e acionáveis em formato JSON.',
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
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

