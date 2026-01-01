/**
 * Análise Avançada de Vídeo com IA
 * Analisa vídeo e gera sugestões específicas de roteiro, cortes e imagens
 */

import OpenAI from 'openai';
import { VideoClip, ScriptSegment } from '@/app/types';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface VideoAnalysis {
  summary: {
    totalClips: number;
    totalDuration: number;
    avgClipDuration: number;
    scriptSegments: number;
    scriptDuration: number;
  };
  scriptSuggestions: {
    improvements: string[];
    missingElements: string[];
    pacingIssues: string[];
    hookQuality: 'excellent' | 'good' | 'needs-improvement';
    hookSuggestion?: string;
  };
  cutSuggestions: {
    clipsToCut: Array<{
      clipId: string;
      reason: string;
      timestamp: number;
      confidence: number;
    }>;
    clipsToSplit: Array<{
      clipId: string;
      reason: string;
      timestamp: number;
      confidence: number;
    }>;
    pacingIssues: string[];
  };
  imageSuggestions: {
    imagesToAdd: Array<{
      segmentId?: string;
      description: string;
      keywords: string[];
      timing: number;
      reason: string;
    }>;
    imagesToRemove: Array<{
      clipId: string;
      reason: string;
    }>;
    styleRecommendations: string[];
  };
  overallRecommendations: string[];
}

export async function analyzeVideoWithAI(
  clips: VideoClip[],
  script: ScriptSegment[]
): Promise<VideoAnalysis> {
  // Preparar contexto
  const totalDuration = clips.reduce((sum, clip) => sum + (clip.endTime - clip.startTime), 0);
  const avgClipDuration = clips.length > 0 ? totalDuration / clips.length : 0;
  const scriptDuration = script.reduce((sum, seg) => sum + seg.duration, 0);
  
  const scriptText = script.map((seg, index) => 
    `[${index + 1}] ${seg.text} (${seg.timestamp}s - ${seg.timestamp + seg.duration}s)`
  ).join('\n\n');

  const clipsInfo = clips.map((clip, index) => 
    `Clip ${index + 1} (ID: ${clip.id}): ${clip.startTime}s - ${clip.endTime}s (${clip.endTime - clip.startTime}s) - Tipo: ${clip.type}`
  ).join('\n');

  const prompt = `Você é um EDITOR DE VÍDEO PROFISSIONAL e ESPECIALISTA EM ANÁLISE DE CONTEÚDO com 15+ anos de experiência. Analise este vídeo e forneça sugestões ESPECÍFICAS e ACIONÁVEIS.

═══════════════════════════════════════════════════════════════
📊 DADOS DO VÍDEO:
═══════════════════════════════════════════════════════════════

ROTEIRO (${script.length} segmentos, ${Math.floor(scriptDuration)}s total):
${scriptText || 'Nenhum roteiro ainda'}

CLIPS (${clips.length} clips, ${Math.floor(totalDuration)}s total):
${clipsInfo || 'Nenhum clip ainda'}

Duração média por clip: ${avgClipDuration.toFixed(1)}s

═══════════════════════════════════════════════════════════════
🎯 ANÁLISE SOLICITADA:
═══════════════════════════════════════════════════════════════

1. **ROTEIRO:**
   - Melhorias específicas no texto
   - Elementos faltando (hook, CTA, storytelling, etc)
   - Problemas de ritmo/pacing
   - Qualidade do hook (primeiros 3-5s)
   - Sugestão de hook melhorado (se necessário)

2. **CORTES:**
   - Clips que devem ser REMOVIDOS (com razão específica)
   - Clips que devem ser DIVIDIDOS (com timestamp exato)
   - Problemas de ritmo que cortes podem resolver
   - Momentos vazios ou desnecessários

3. **IMAGENS:**
   - Imagens que devem ser ADICIONADAS (descrição, keywords, timing, razão)
   - Imagens que devem ser REMOVIDAS (com razão)
   - Recomendações de estilo visual

4. **RECOMENDAÇÕES GERAIS:**
   - Melhorias prioritárias
   - Próximos passos sugeridos

═══════════════════════════════════════════════════════════════
📋 FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
═══════════════════════════════════════════════════════════════

{
  "scriptSuggestions": {
    "improvements": ["Lista de melhorias específicas no roteiro"],
    "missingElements": ["Elementos que faltam: hook, CTA, storytelling, etc"],
    "pacingIssues": ["Problemas de ritmo identificados"],
    "hookQuality": "excellent|good|needs-improvement",
    "hookSuggestion": "Sugestão de hook melhorado (se hookQuality for needs-improvement)"
  },
  "cutSuggestions": {
    "clipsToCut": [
      {
        "clipId": "ID do clip",
        "reason": "Razão específica para remover",
        "timestamp": 0,
        "confidence": 0.85
      }
    ],
    "clipsToSplit": [
      {
        "clipId": "ID do clip",
        "reason": "Razão específica para dividir",
        "timestamp": 5.5,
        "confidence": 0.9
      }
    ],
    "pacingIssues": ["Problemas de ritmo que cortes resolvem"]
  },
  "imageSuggestions": {
    "imagesToAdd": [
      {
        "segmentId": "ID do segmento (se houver)",
        "description": "Descrição da imagem sugerida",
        "keywords": ["keyword1", "keyword2"],
        "timing": 10.5,
        "reason": "Razão específica para adicionar"
      }
    ],
    "imagesToRemove": [
      {
        "clipId": "ID do clip",
        "reason": "Razão específica para remover"
      }
    ],
    "styleRecommendations": ["Recomendações de estilo visual"]
  },
  "overallRecommendations": ["Recomendações gerais prioritárias"]
}

IMPORTANTE:
- Seja ESPECÍFICO e ACIONÁVEL
- Use dados reais do vídeo (timestamps, IDs, etc)
- Dê razões claras para cada sugestão
- Priorize sugestões por impacto
- Se não houver roteiro/clips, sugira criar`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um editor de vídeo profissional especializado em análise e otimização de conteúdo. Suas análises são específicas, acionáveis e baseadas em dados reais.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Resposta vazia da IA');
    }

    const parsed = JSON.parse(response);

    // Construir análise completa
    const analysis: VideoAnalysis = {
      summary: {
        totalClips: clips.length,
        totalDuration,
        avgClipDuration,
        scriptSegments: script.length,
        scriptDuration,
      },
      scriptSuggestions: parsed.scriptSuggestions || {
        improvements: [],
        missingElements: [],
        pacingIssues: [],
        hookQuality: 'good',
      },
      cutSuggestions: parsed.cutSuggestions || {
        clipsToCut: [],
        clipsToSplit: [],
        pacingIssues: [],
      },
      imageSuggestions: parsed.imageSuggestions || {
        imagesToAdd: [],
        imagesToRemove: [],
        styleRecommendations: [],
      },
      overallRecommendations: parsed.overallRecommendations || [],
    };

    return analysis;
  } catch (error) {
    console.error('Erro na análise de vídeo:', error);
    
    // Fallback: análise básica
    return {
      summary: {
        totalClips: clips.length,
        totalDuration,
        avgClipDuration,
        scriptSegments: script.length,
        scriptDuration,
      },
      scriptSuggestions: {
        improvements: [],
        missingElements: clips.length > 0 && script.length === 0 ? ['Roteiro não criado ainda'] : [],
        pacingIssues: [],
        hookQuality: 'good',
      },
      cutSuggestions: {
        clipsToCut: [],
        clipsToSplit: [],
        pacingIssues: [],
      },
      imageSuggestions: {
        imagesToAdd: [],
        imagesToRemove: [],
        styleRecommendations: [],
      },
      overallRecommendations: [],
    };
  }
}

