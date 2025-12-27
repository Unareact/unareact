export interface ScriptSegment {
  id: string;
  text: string;
  duration: number;
  timestamp: number;
  type: 'intro' | 'content' | 'outro' | 'transition';
}

export interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  source: string;
  type: 'video' | 'image' | 'text';
  effects?: string[];
}

export interface Project {
  id: string;
  name: string;
  script: ScriptSegment[];
  clips: VideoClip[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScriptGenerationParams {
  topic: string;
  duration: number;
  style: 'educational' | 'entertaining' | 'promotional' | 'documentary';
  tone: 'formal' | 'casual' | 'energetic' | 'calm';
  viralInsights?: {
    viralFactors: ViralDiagnosis['viralFactors'];
    insights: ViralDiagnosis['insights'];
    editingRecommendations: ViralDiagnosis['editingRecommendations'];
  };
}

export interface ViralVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  url: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook';
  viralScore: number; // Score calculado baseado em views, likes, etc.
  trendingRank: number;
  daysSincePublished?: number; // Dias desde a publicação
  likesPerDay?: number; // Curtidas por dia (taxa de crescimento)
}

export interface ViralVideoMetrics {
  views: number;
  likes: number;
  comments: number;
  shares?: number;
  engagementRate: number;
  growthRate: number; // Crescimento nas últimas 24h
}

export interface ViralDiagnosis {
  videoId: string;
  videoTitle: string;
  
  // Análise de Métricas
  metrics: {
    engagementRate: number;
    likeToViewRatio: number;
    commentToViewRatio: number;
    averageWatchTime?: number;
    retentionRate?: number;
  };
  
  // Fatores de Viralização Identificados
  viralFactors: {
    hook: string; // O que prende atenção no início
    pacing: 'fast' | 'medium' | 'slow';
    structure: string; // Estrutura do vídeo (ex: "problema-solução", "storytelling", etc.)
    emotionalTriggers: string[]; // Emoções despertadas
    callToAction: string; // CTA usado
    thumbnailAppeal: string; // Por que a thumbnail funciona
    titleStrategy: string; // Estratégia do título
  };
  
  // Insights Gerados por IA
  insights: {
    whyItWentViral: string; // Análise principal
    keyMoments: Array<{ timestamp: string; description: string; impact: string }>;
    targetAudience: string;
    contentPatterns: string[];
    recommendations: string[];
  };
  
  // Recomendações para Edição
  editingRecommendations: {
    introDuration: number; // Duração ideal do hook
    pacing: string; // Ritmo sugerido
    transitions: string[]; // Tipos de transições recomendadas
    musicStyle: string; // Estilo de música
    visualStyle: string; // Estilo visual
    effects: string[]; // Efeitos recomendados
  };
  
  // Template de Roteiro Sugerido
  scriptTemplate: {
    structure: string;
    segments: Array<{
      type: 'hook' | 'setup' | 'conflict' | 'resolution' | 'cta';
      duration: number;
      description: string;
      example: string;
    }>;
  };
  
  generatedAt: Date;
}

