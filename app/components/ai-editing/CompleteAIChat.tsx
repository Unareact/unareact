'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Bot, User, Sparkles, CheckCircle2, X, Eye, Play, AlertCircle, Zap, Settings, Video, Image, Music, Type, Scissors, FileText, Clock, TrendingUp, Download, Upload, Search, Wand2, Lightbulb, Edit3 } from 'lucide-react';
import { useEditorStore } from '@/app/stores/editor-store';
import { cn } from '@/app/lib/utils';
import { parseUserCommand, executeAICommand, learnFromCommand, loadUserPreferences } from '@/app/lib/ai-editing/ai-commands';
import { VideoClip, ScriptSegment } from '@/app/types';
import { analyzeVideoWithAI } from '@/app/lib/ai-editing/video-analysis';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actionType?: string;
  preview?: {
    type: string;
    data: any;
    command: any;
  };
  status?: 'pending' | 'approved' | 'rejected' | 'applied';
  suggestions?: string[];
  showScript?: boolean;
  showTimeline?: boolean;
}

export function CompleteAIChat() {
  const { script, clips, setClips, setScript, duration, addClip } = useEditorStore();
  
  // Detectar contexto do editor
  const editorContext = typeof window !== 'undefined' ? localStorage.getItem('una-editor-context') : null;
  
  // Mensagem de boas-vindas baseada no contexto
  const getWelcomeMessage = () => {
    if (editorContext === 'vendas') {
      return `🎯 **Bem-vindo ao Editor de Anúncios por IA!**\n\nEu sou sua assistente especializada em criar **anúncios que convertem**! Posso fazer tudo através de conversa!\n\n**O que eu posso fazer:**\n\n📝 **Roteiro de Vendas:** Criar roteiros focados em conversão\n✂️ **Edição Profissional:** Cortes, transições, templates de anúncios\n📥 **Mídia:** Upload, download YouTube/TikTok, buscar imagens\n🎨 **Efeitos:** Legendas, narração, CTAs, textos de vendas\n📊 **Análise:** Analisar vídeos virais e aplicar insights em anúncios\n💡 **Otimização:** Otimizar para conversão e ROI\n\n**Como usar:**\n• Me diga o que precisa\n• Eu mostro preview e você aprova\n• Eu executo tudo automaticamente\n\nVamos criar anúncios que vendem! Me diga o que você quer fazer! 🚀`;
    } else if (editorContext === 'viral') {
      return `🔥 **Bem-vindo ao Editor de Vídeos Virais por IA!**\n\nEu sou sua assistente especializada em criar **vídeos virais com muitos views**! Posso fazer tudo através de conversa!\n\n**O que eu posso fazer:**\n\n📝 **Roteiro Viral:** Criar roteiros com hooks poderosos\n✂️ **Edição Dinâmica:** Cortes rápidos, transições, ritmo viral\n📥 **Mídia:** Upload, download YouTube/TikTok, buscar imagens\n🎨 **Efeitos:** Legendas, narração, textos impactantes\n📊 **Análise:** Analisar vídeos virais e replicar padrões\n⚡ **Otimização:** Otimizar para views e engajamento\n\n**Como usar:**\n• Me diga o que precisa\n• Eu mostro preview e você aprova\n• Eu executo tudo automaticamente\n\nVamos criar vídeos virais! Me diga o que você quer fazer! 🚀`;
    } else {
      return `🎬 **Bem-vindo ao Editor Completo por IA!**\n\nEu sou sua assistente de edição inteligente e posso fazer **TUDO** através de conversa!\n\n**O que eu posso fazer:**\n\n📝 **Roteiro:** Criar, editar, otimizar roteiros\n✂️ **Edição:** Cortes, transições, velocidade, templates\n📥 **Mídia:** Upload, download YouTube/TikTok, buscar imagens\n🎨 **Efeitos:** Legendas, narração, textos, filtros\n📊 **Análise:** Analisar vídeo, otimizar, sugerir melhorias\n\n**Como usar:**\n• Me diga o que precisa\n• Eu mostro preview e você aprova\n• Eu executo tudo automaticamente\n\nVamos começar! Me diga o que você quer fazer! 🚀`;
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date(),
      showScript: true,
      showTimeline: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userPreferences, setUserPreferences] = useState(loadUserPreferences());
  const [showSuggestions, setShowSuggestions] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateActionableSuggestions = (analysisText: string): string[] => {
    const suggestions: string[] = [];
    
    // Extrair sugestões acionáveis do texto de análise
    if (analysisText.includes('Hook precisa melhorar')) {
      suggestions.push('Melhorar hook do roteiro');
    }
    if (analysisText.includes('Clips para remover') || analysisText.includes('Clips para dividir')) {
      suggestions.push('Aplicar cortes sugeridos');
    }
    if (analysisText.includes('Imagens para adicionar')) {
      suggestions.push('Buscar imagens sugeridas');
    }
    if (analysisText.includes('Gerar roteiro') || analysisText.includes('Criar roteiro')) {
      suggestions.push('Criar roteiro');
    }
    if (analysisText.includes('Aplicar cortes')) {
      suggestions.push('Aplicar cortes rápidos');
    }
    if (analysisText.includes('Adicionar transições')) {
      suggestions.push('Adicionar transições');
    }
    
    return suggestions.slice(0, 4);
  };

  const getActionIcon = (action: string): { icon: any; color: string } => {
    const lowerAction = action.toLowerCase();
    
    if (lowerAction.includes('analisar') || lowerAction.includes('diagnosticar')) {
      return { icon: Eye, color: 'blue' };
    }
    if (lowerAction.includes('roteiro') || lowerAction.includes('script')) {
      return { icon: FileText, color: 'purple' };
    }
    if (lowerAction.includes('cort') || lowerAction.includes('cut')) {
      return { icon: Scissors, color: 'red' };
    }
    if (lowerAction.includes('transi') || lowerAction.includes('efeito')) {
      return { icon: Sparkles, color: 'purple' };
    }
    if (lowerAction.includes('imagem') || lowerAction.includes('mídia') || lowerAction.includes('buscar')) {
      return { icon: Image, color: 'green' };
    }
    if (lowerAction.includes('legenda') || lowerAction.includes('caption')) {
      return { icon: Type, color: 'blue' };
    }
    if (lowerAction.includes('narra') || lowerAction.includes('voz')) {
      return { icon: Music, color: 'purple' };
    }
    if (lowerAction.includes('otimizar') || lowerAction.includes('melhorar')) {
      return { icon: Zap, color: 'yellow' };
    }
    if (lowerAction.includes('aplicar') || lowerAction.includes('executar')) {
      return { icon: CheckCircle2, color: 'green' };
    }
    
    return { icon: Wand2, color: 'purple' };
  };

  // Análise completa do vídeo com IA
  const analyzeVideoComplete = async (): Promise<string> => {
    setIsAnalyzing(true);
    
    try {
      // Análise avançada com IA
      const aiAnalysis = await analyzeVideoWithAI(clips, script);
      
      let analysis = `📊 **Análise Completa do Vídeo (IA)**\n\n`;
      
      // Estatísticas
      analysis += `**📹 Resumo:**\n`;
      analysis += `• ${aiAnalysis.summary.totalClips} ${aiAnalysis.summary.totalClips === 1 ? 'clip' : 'clips'}\n`;
      analysis += `• Duração total: ${Math.floor(aiAnalysis.summary.totalDuration / 60)}:${String(Math.floor(aiAnalysis.summary.totalDuration % 60)).padStart(2, '0')}\n`;
      analysis += `• Duração média/clip: ${aiAnalysis.summary.avgClipDuration.toFixed(1)}s\n`;
      analysis += `• Roteiro: ${aiAnalysis.summary.scriptSegments} ${aiAnalysis.summary.scriptSegments === 1 ? 'segmento' : 'segmentos'}\n\n`;
      
      // Sugestões de Roteiro
      if (aiAnalysis.scriptSuggestions.improvements.length > 0 || 
          aiAnalysis.scriptSuggestions.missingElements.length > 0 ||
          aiAnalysis.scriptSuggestions.hookQuality === 'needs-improvement') {
        analysis += `**📝 Sugestões de Roteiro:**\n\n`;
        
        if (aiAnalysis.scriptSuggestions.hookQuality === 'needs-improvement' && aiAnalysis.scriptSuggestions.hookSuggestion) {
          analysis += `⚠️ **Hook precisa melhorar:**\n`;
          analysis += `Sugestão: "${aiAnalysis.scriptSuggestions.hookSuggestion}"\n\n`;
        }
        
        if (aiAnalysis.scriptSuggestions.missingElements.length > 0) {
          analysis += `❌ **Elementos faltando:**\n`;
          analysis += aiAnalysis.scriptSuggestions.missingElements.map(e => `• ${e}`).join('\n') + '\n\n';
        }
        
        if (aiAnalysis.scriptSuggestions.improvements.length > 0) {
          analysis += `✨ **Melhorias sugeridas:**\n`;
          analysis += aiAnalysis.scriptSuggestions.improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n') + '\n\n';
        }
        
        if (aiAnalysis.scriptSuggestions.pacingIssues.length > 0) {
          analysis += `⏱️ **Problemas de ritmo:**\n`;
          analysis += aiAnalysis.scriptSuggestions.pacingIssues.map(p => `• ${p}`).join('\n') + '\n\n';
        }
      }
      
      // Sugestões de Cortes
      if (aiAnalysis.cutSuggestions.clipsToCut.length > 0 || 
          aiAnalysis.cutSuggestions.clipsToSplit.length > 0) {
        analysis += `**✂️ Sugestões de Cortes:**\n\n`;
        
        if (aiAnalysis.cutSuggestions.clipsToCut.length > 0) {
          analysis += `🗑️ **Clips para remover:**\n`;
          aiAnalysis.cutSuggestions.clipsToCut.forEach(cut => {
            analysis += `• Clip ${cut.clipId.substring(0, 8)}... (${cut.timestamp.toFixed(1)}s): ${cut.reason}\n`;
          });
          analysis += '\n';
        }
        
        if (aiAnalysis.cutSuggestions.clipsToSplit.length > 0) {
          analysis += `📐 **Clips para dividir:**\n`;
          aiAnalysis.cutSuggestions.clipsToSplit.forEach(split => {
            analysis += `• Clip ${split.clipId.substring(0, 8)}... em ${split.timestamp.toFixed(1)}s: ${split.reason}\n`;
          });
          analysis += '\n';
        }
      }
      
      // Sugestões de Imagens
      if (aiAnalysis.imageSuggestions.imagesToAdd.length > 0 || 
          aiAnalysis.imageSuggestions.imagesToRemove.length > 0) {
        analysis += `**🖼️ Sugestões de Imagens:**\n\n`;
        
        if (aiAnalysis.imageSuggestions.imagesToAdd.length > 0) {
          analysis += `➕ **Imagens para adicionar:**\n`;
          aiAnalysis.imageSuggestions.imagesToAdd.forEach((img, i) => {
            analysis += `${i + 1}. Em ${img.timing.toFixed(1)}s: "${img.description}"\n`;
            analysis += `   Keywords: ${img.keywords.join(', ')}\n`;
            analysis += `   Razão: ${img.reason}\n\n`;
          });
        }
        
        if (aiAnalysis.imageSuggestions.imagesToRemove.length > 0) {
          analysis += `➖ **Imagens para remover:**\n`;
          aiAnalysis.imageSuggestions.imagesToRemove.forEach(rm => {
            analysis += `• Clip ${rm.clipId.substring(0, 8)}...: ${rm.reason}\n`;
          });
          analysis += '\n';
        }
        
        if (aiAnalysis.imageSuggestions.styleRecommendations.length > 0) {
          analysis += `🎨 **Recomendações de estilo:**\n`;
          analysis += aiAnalysis.imageSuggestions.styleRecommendations.map(r => `• ${r}`).join('\n') + '\n\n';
        }
      }
      
      // Recomendações Gerais
      if (aiAnalysis.overallRecommendations.length > 0) {
        analysis += `**🚀 Recomendações Prioritárias:**\n\n`;
        analysis += aiAnalysis.overallRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n\n') + '\n\n';
      }
      
      // Se não houver sugestões específicas
      if (aiAnalysis.scriptSuggestions.improvements.length === 0 &&
          aiAnalysis.cutSuggestions.clipsToCut.length === 0 &&
          aiAnalysis.cutSuggestions.clipsToSplit.length === 0 &&
          aiAnalysis.imageSuggestions.imagesToAdd.length === 0 &&
          aiAnalysis.overallRecommendations.length === 0) {
        analysis += `✅ **Seu vídeo está bem estruturado!**\n\n`;
        analysis += `Posso ajudar com:\n`;
        analysis += `• Ajustes finos\n`;
        analysis += `• Exportação\n`;
        analysis += `• Otimizações adicionais\n`;
      }
      
      analysis += `\n**💡 Quer que eu aplique alguma dessas sugestões?**\nMe diga qual e eu executo!`;
      
      return analysis;
    } catch (error) {
      console.error('Erro na análise:', error);
      // Fallback para análise básica
      const totalDuration = clips.reduce((sum, clip) => sum + (clip.endTime - clip.startTime), 0);
      return `📊 **Análise Básica do Vídeo**\n\n• ${clips.length} clips\n• Duração: ${Math.floor(totalDuration / 60)}:${String(Math.floor(totalDuration % 60)).padStart(2, '0')}\n• Roteiro: ${script.length} segmentos\n\nMe diga o que você quer fazer!`;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const lowerInput = userInput.toLowerCase();
      
      // Comando de análise
      if (lowerInput.includes('analisar') || lowerInput.includes('analise') || lowerInput.includes('status') || lowerInput.includes('como está') || lowerInput.includes('sugestões') || lowerInput.includes('sugestoes')) {
        const analysis = await analyzeVideoComplete();
        
        const analysisMessage: ChatMessage = {
          id: `analysis-${Date.now()}`,
          role: 'assistant',
          content: analysis,
          timestamp: new Date(),
          showScript: true,
          showTimeline: true,
          suggestions: generateActionableSuggestions(analysis),
        };
        setMessages(prev => [...prev, analysisMessage]);
        setIsLoading(false);
        return;
      }

      // Tentar parsear como comando executável
      const command = await parseUserCommand(userInput, script, clips);
      
      if (command && command.confidence > 0.7) {
        // Criar preview antes de aplicar
        const previewMessage: ChatMessage = {
          id: `preview-${Date.now()}`,
          role: 'assistant',
          content: generatePreviewMessage(command, clips, script),
          timestamp: new Date(),
          actionType: command.type,
          preview: {
            type: command.type,
            data: {},
            command: command,
          },
          status: 'pending',
          suggestions: generateSuggestions(command.type),
        };

        setMessages(prev => [...prev, previewMessage]);
      } else {
        // Resposta conversacional inteligente
        const response = await generateAIResponse(userInput, script, clips, userPreferences);
        
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          showScript: script.length > 0,
          showTimeline: clips.length > 0,
          suggestions: generateContextualSuggestions(userInput, clips, script),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente ou me diga o que você precisa de outra forma.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreviewMessage = (command: any, clips: VideoClip[], script: ScriptSegment[]): string => {
    switch (command.type) {
      case 'cut':
        return `✂️ **Cortes Automáticos**\n\nVou analisar seu roteiro de ${script.length} segmentos e ${clips.length} clips para aplicar cortes inteligentes.\n\n**O que vou fazer:**\n• Analisar pontos de corte baseado no roteiro\n• Aplicar cortes nos momentos ideais\n• Manter sincronização com o conteúdo\n• Otimizar ritmo do vídeo\n\n**Resultado esperado:** Vídeo mais dinâmico e engajador!\n\nQuer que eu aplique agora?`;
      
      case 'transition':
        return `✨ **Transições Automáticas**\n\nVou adicionar transições suaves entre seus ${clips.length} clips.\n\n**O que vou fazer:**\n• Analisar o ritmo do vídeo\n• Aplicar transições fade/wipe/zoom\n• Garantir fluidez visual\n• Manter consistência\n\n**Resultado esperado:** Vídeo mais profissional e polido!\n\nQuer que eu aplique agora?`;
      
      case 'template':
        return `🎨 **Template Visual**\n\nVou aplicar um template profissional ao seu vídeo.\n\n**O que vou fazer:**\n• Aplicar estilo visual consistente\n• Adicionar elementos gráficos\n• Otimizar cores e tipografia\n• Padronizar visual\n\n**Resultado esperado:** Vídeo com identidade visual forte!\n\nQuer que eu aplique agora?`;
      
      case 'speed':
        return `⚡ **Ajuste de Velocidade**\n\nVou ajustar a velocidade do vídeo para ${command.params?.speed}x.\n\n**O que vou fazer:**\n• Aplicar velocidade ${command.params?.speed}x em todos os clips\n• Manter sincronização de áudio\n• Ajustar duração total\n• Otimizar ritmo\n\n**Resultado esperado:** Vídeo mais ${command.params?.speed > 1 ? 'dinâmico' : 'dramático'}!\n\nQuer que eu aplique agora?`;
      
      case 'caption':
        return `📝 **Legendas Automáticas**\n\nVou gerar legendas do seu roteiro de ${script.length} segmentos.\n\n**O que vou fazer:**\n• Gerar legendas de cada segmento\n• Sincronizar com o áudio\n• Aplicar estilo profissional\n• Posicionar estrategicamente\n\n**Resultado esperado:** Vídeo mais acessível e engajador!\n\nQuer que eu aplique agora?`;
      
      case 'narration':
        return `🎤 **Narração com IA**\n\nVou gerar narração do seu roteiro com voz ${command.params?.voice || 'natural'}.\n\n**O que vou fazer:**\n• Gerar narração de ${script.length} segmentos\n• Usar voz ${command.params?.voice || 'natural'}\n• Sincronizar com vídeo\n• Ajustar volume e ritmo\n\n**Resultado esperado:** Vídeo com narração profissional!\n\nQuer que eu aplique agora?`;
      
      case 'upload':
        return `📥 **Importar Arquivo**\n\nVou abrir o seletor de arquivos para você escolher o vídeo, imagem ou áudio.\n\n**Formatos suportados:**\n• Vídeos: MP4, MOV, AVI, WEBM\n• Imagens: JPG, PNG, GIF\n• Áudios: MP3, WAV\n\n**Tamanho máximo:** 500MB\n\nClique em "Aprovar" para abrir o seletor!`;
      
      default:
        return `Vou executar: ${command.action}`;
    }
  };

  const generateSuggestions = (actionType: string): string[] => {
    const suggestions: string[] = [];
    
    switch (actionType) {
      case 'cut':
        suggestions.push('Aplicar transições também');
        suggestions.push('Ajustar velocidade');
        break;
      case 'transition':
        suggestions.push('Aplicar cortes rápidos');
        suggestions.push('Template profissional');
        break;
      case 'caption':
        suggestions.push('Gerar narração');
        suggestions.push('Aplicar template');
        break;
    }
    
    return suggestions;
  };

  const generateContextualSuggestions = (userInput: string, clips: VideoClip[], script: ScriptSegment[]): string[] => {
    const suggestions: string[] = [];
    const lowerInput = userInput.toLowerCase();
    
    // Sempre mostrar análise/diagnóstico como primeira opção
    if (!lowerInput.includes('analisar') && !lowerInput.includes('diagnosticar')) {
      suggestions.push('Analisar vídeo');
    }
    
    if (clips.length === 0) {
      suggestions.push('Fazer upload de vídeo');
      suggestions.push('Baixar do YouTube');
      suggestions.push('Adicionar URL de vídeo');
    } else if (script.length === 0) {
      suggestions.push('Criar roteiro');
      suggestions.push('Gerar roteiro com IA');
      suggestions.push('Sugerir roteiro');
    } else {
      if (!lowerInput.includes('cort')) {
        suggestions.push('Aplicar cortes rápidos');
      }
      if (!lowerInput.includes('transi')) {
        suggestions.push('Adicionar transições');
      }
      if (!lowerInput.includes('legend')) {
        suggestions.push('Gerar legendas');
      }
      if (!lowerInput.includes('narra')) {
        suggestions.push('Gerar narração');
      }
      if (!lowerInput.includes('otimizar') && !lowerInput.includes('melhorar')) {
        suggestions.push('Otimizar vídeo');
      }
    }
    
    return suggestions.slice(0, 6);
  };

  const handleApprove = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.preview) return;

    setIsLoading(true);
    
    try {
      const result = await executeAICommand(
        message.preview.command,
        script,
        clips,
        setClips,
        setScript
      );

      learnFromCommand(message.content, message.preview.command.action, result.success);
      setUserPreferences(loadUserPreferences());

      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { 
              ...m, 
              status: 'applied' as const, 
              content: `${m.content}\n\n✅ **Aplicado com sucesso!**\n${result.message}`,
              showScript: script.length > 0,
              showTimeline: clips.length > 0,
            }
          : m
      ));
    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, status: 'rejected' as const, content: `${m.content}\n\n❌ **Erro ao aplicar.** Tente novamente.` }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId 
        ? { ...m, status: 'rejected' as const }
        : m
    ));
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  const generateAIResponse = async (
    userInput: string,
    script: ScriptSegment[],
    clips: VideoClip[],
    preferences: any
  ): Promise<string> => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('ajud') || lowerInput.includes('help') || lowerInput.includes('como') || lowerInput.includes('o que')) {
      return `Claro! Posso fazer **TUDO** através de conversa! 🚀\n\n**📝 Roteiro:**\n• "Criar roteiro sobre [tema]"\n• "Editar roteiro"\n• "Otimizar roteiro"\n\n**✂️ Edição:**\n• "Aplicar cortes rápidos"\n• "Transições suaves"\n• "Acelerar 2x"\n• "Template profissional"\n\n**📥 Mídia:**\n• "Baixar vídeo do YouTube [URL]"\n• "Upload de vídeo"\n• "Buscar imagens de [tema]"\n• "Gerar imagem de [descrição]"\n\n**📝 Conteúdo:**\n• "Gerar legendas"\n• "Narração feminina"\n• "Adicionar texto [conteúdo]"\n\n**📊 Análise:**\n• "Analisar vídeo"\n• "Otimizar vídeo"\n• "Sugerir melhorias"\n\nMe diga o que você precisa! 💜`;
    }

    if (lowerInput.includes('otimizar') || lowerInput.includes('melhorar') || lowerInput.includes('ajustar')) {
      const suggestions = [];
      if (clips.length === 0) suggestions.push('Adicionar vídeos');
      if (clips.length > 1) suggestions.push('Aplicar transições');
      if (script.length > 0) suggestions.push('Gerar legendas e narração');
      if (clips.length > 3) suggestions.push('Aplicar cortes para ritmo dinâmico');
      
      return `💡 **Sugestões de Otimização:**\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nQuer que eu aplique alguma dessas otimizações? Posso fazer tudo automaticamente! 🚀`;
    }

    return `Entendi! Com base no seu vídeo (${clips.length} clips, ${script.length} segmentos), posso ajudar! 🎬\n\n**O que você quer fazer?**\n\nPosso executar comandos como:\n• "Aplicar cortes rápidos"\n• "Transições suaves"\n• "Gerar legendas"\n• "Template profissional"\n• "Acelerar 2x"\n• "Analisar vídeo"\n\nOu me diga sua necessidade e eu vou analisar e sugerir a melhor solução! 💜`;
  };

  // Sequência lógica para criar vídeos espetaculares
  const quickActions = [
    { icon: Eye, label: '1. Analisar', command: 'Analisar vídeo', step: 1 },
    { icon: FileText, label: '2. Roteiro', command: 'Criar roteiro', step: 2 },
    { icon: Video, label: '3. Mídia', command: 'Adicionar mídia', step: 3 },
    { icon: Scissors, label: '4. Cortes', command: 'Aplicar cortes rápidos', step: 4 },
    { icon: Sparkles, label: '5. Transições', command: 'Aplicar transições suaves', step: 5 },
    { icon: Type, label: '6. Legendas', command: 'Gerar legendas', step: 6 },
    { icon: Music, label: '7. Narração', command: 'Gerar narração', step: 7 },
    { icon: Zap, label: '8. Otimizar', command: 'Otimizar vídeo', step: 8 },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-pink-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                {editorContext === 'vendas' ? 'Editor de Anúncios por IA' : 
                 editorContext === 'viral' ? 'Editor de Vídeos Virais por IA' : 
                 'Editor Completo por IA'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {editorContext === 'vendas' ? 'Crie anúncios que convertem' : 
                 editorContext === 'viral' ? 'Crie vídeos virais com muitos views' : 
                 'Converse e eu executo tudo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <FileText className="w-4 h-4" />
            <span>{script.length} segmentos</span>
            <Video className="w-4 h-4 ml-2" />
            <span>{clips.length} clips</span>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-lg p-4',
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : message.status === 'applied'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : message.status === 'rejected'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                )}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                
                {/* Roteiro inline */}
                {message.showScript && script.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold">Roteiro ({script.length} segmentos)</span>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {script.slice(0, 3).map((seg, i) => (
                        <div key={i} className="text-xs bg-white dark:bg-gray-700 p-2 rounded">
                          <span className="font-medium">{i + 1}.</span> {seg.text.substring(0, 60)}...
                        </div>
                      ))}
                      {script.length > 3 && (
                        <div className="text-xs text-gray-500">+ {script.length - 3} mais...</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Timeline inline */}
                {message.showTimeline && clips.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold">Timeline ({clips.length} clips)</span>
                    </div>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                      {clips.slice(0, 5).map((clip, i) => (
                        <div key={clip.id} className="flex-shrink-0 w-16 h-10 bg-blue-500 rounded text-white text-xs flex items-center justify-center">
                          {i + 1}
                        </div>
                      ))}
                      {clips.length > 5 && (
                        <div className="flex-shrink-0 w-16 h-10 bg-gray-300 dark:bg-gray-700 rounded text-xs flex items-center justify-center">
                          +{clips.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Preview com aprovação */}
                {message.preview && message.status === 'pending' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(message.id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Aprovar e Aplicar
                      </button>
                      <button
                        onClick={() => handleReject(message.id)}
                        className="px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Rejeitar
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Sugestões - Botões Clicáveis Destacados */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Ações Rápidas:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {message.suggestions.map((suggestion, i) => {
                        const actionIcon = getActionIcon(suggestion);
                        const Icon = actionIcon.icon;
                        return (
                          <button
                            key={i}
                            onClick={() => handleSuggestion(suggestion)}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-lg hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50 transition-all text-xs font-medium shadow-sm hover:shadow-md"
                          >
                            <Icon className="w-4 h-4" />
                            <span>{suggestion}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {message.status === 'applied' && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-700 dark:text-green-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Edição aplicada!</span>
                  </div>
                )}
                
                <div className={cn(
                  'text-xs mt-2',
                  message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                )}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {(isLoading || isAnalyzing) && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions e Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800/50">
        <div className="mb-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
            📋 Sequência para Vídeos Espetaculares:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const isCompleted = action.step && (
                (action.step === 1 && clips.length > 0) ||
                (action.step === 2 && script.length > 0) ||
                (action.step === 3 && clips.length > 0) ||
                (action.step === 4 && clips.length > 1) ||
                (action.step === 5 && clips.length > 1) ||
                (action.step === 6 && script.length > 0) ||
                (action.step === 7 && script.length > 0) ||
                (action.step === 8 && clips.length > 0)
              );
              
              return (
                <button
                  key={action.label}
                  onClick={() => {
                    setInput(action.command);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg font-medium transition-all",
                    isCompleted
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700"
                  )}
                  title={action.step ? `Passo ${action.step} da sequência` : action.label}
                >
                  <Icon className="w-3 h-3" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Digite o que quer que eu faça... (roteiro, edição, mídia, tudo!)"
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

