'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Bot, User, Sparkles, CheckCircle2, X, Eye, Play, AlertCircle, Zap, Settings, Video, Image, Music, Type, Scissors } from 'lucide-react';
import { useEditorStore } from '@/app/stores/editor-store';
import { cn } from '@/app/lib/utils';
import { parseUserCommand, executeAICommand, learnFromCommand, loadUserPreferences } from '@/app/lib/ai-editing/ai-commands';
import { VideoClip, ScriptSegment } from '@/app/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actionType?: string;
  preview?: {
    type: 'cut' | 'transition' | 'template' | 'speed' | 'caption' | 'narration' | 'text-overlay' | 'upload' | 'download';
    data: any;
    command: any;
  };
  status?: 'pending' | 'approved' | 'rejected' | 'applied';
}

export function EnhancedAIEditingChat() {
  const { script, clips, setClips, setScript, duration } = useEditorStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou sua assistente de edição inteligente. 🎬\n\nPosso ajudar você a:\n\n✅ **Editar vídeos** - Cortes, transições, velocidade\n✅ **Adicionar mídia** - Upload, download do YouTube/TikTok\n✅ **Criar legendas** - Legendas automáticas do roteiro\n✅ **Gerar narração** - Vozes com IA\n✅ **Aplicar templates** - Estilos profissionais\n✅ **Otimizar vídeo** - Análise completa e sugestões\n\nMe diga o que você precisa e eu vou analisar, sugerir e executar! 💜',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userPreferences, setUserPreferences] = useState(loadUserPreferences());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Analisar vídeo atual e gerar insights
  const analyzeVideo = async (): Promise<string> => {
    const totalDuration = clips.reduce((sum, clip) => sum + (clip.endTime - clip.startTime), 0);
    const avgClipDuration = clips.length > 0 ? totalDuration / clips.length : 0;
    
    let analysis = `📊 **Análise do seu vídeo:**\n\n`;
    analysis += `• **Clips:** ${clips.length} ${clips.length === 1 ? 'clip' : 'clips'}\n`;
    analysis += `• **Duração total:** ${Math.floor(totalDuration / 60)}:${String(Math.floor(totalDuration % 60)).padStart(2, '0')}\n`;
    analysis += `• **Duração média por clip:** ${avgClipDuration.toFixed(1)}s\n`;
    analysis += `• **Roteiro:** ${script.length} ${script.length === 1 ? 'segmento' : 'segmentos'}\n\n`;
    
    // Sugestões baseadas na análise
    const suggestions: string[] = [];
    
    if (clips.length === 0) {
      suggestions.push('📥 Adicionar vídeos (upload ou download do YouTube/TikTok)');
    }
    
    if (clips.length > 1 && avgClipDuration > 10) {
      suggestions.push('✂️ Aplicar cortes rápidos para ritmo dinâmico');
    }
    
    if (clips.length > 1) {
      suggestions.push('✨ Adicionar transições entre clips');
    }
    
    if (script.length > 0 && clips.length > 0) {
      suggestions.push('📝 Gerar legendas automáticas do roteiro');
      suggestions.push('🎤 Gerar narração com IA');
    }
    
    if (suggestions.length > 0) {
      analysis += `💡 **Sugestões:**\n${suggestions.map(s => `  ${s}`).join('\n')}\n\n`;
    }
    
    analysis += `Me diga o que você quer fazer e eu vou executar! 🚀`;
    
    return analysis;
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

    try {
      // Detectar se é comando de análise
      const lowerInput = userInput.toLowerCase();
      if (lowerInput.includes('analisar') || lowerInput.includes('analise') || lowerInput.includes('status') || lowerInput.includes('como está')) {
        setIsAnalyzing(true);
        const analysis = await analyzeVideo();
        setIsAnalyzing(false);
        
        const analysisMessage: ChatMessage = {
          id: `analysis-${Date.now()}`,
          role: 'assistant',
          content: analysis,
          timestamp: new Date(),
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
            type: command.type as any,
            data: {},
            command: command,
          },
          status: 'pending',
        };

        setMessages(prev => [...prev, previewMessage]);
      } else {
        // Resposta conversacional com sugestões
        const response = await generateAIResponse(userInput, script, clips, userPreferences);
        
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
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
        return `✂️ **Cortes Automáticos**\n\nVou analisar seu roteiro de ${script.length} segmentos e ${clips.length} clips para aplicar cortes inteligentes.\n\n**O que vou fazer:**\n• Analisar pontos de corte baseado no roteiro\n• Aplicar cortes nos momentos ideais\n• Manter sincronização com o conteúdo\n\nQuer que eu aplique agora?`;
      
      case 'transition':
        return `✨ **Transições Automáticas**\n\nVou adicionar transições suaves entre seus ${clips.length} clips.\n\n**O que vou fazer:**\n• Analisar o ritmo do vídeo\n• Aplicar transições fade/wipe/zoom\n• Garantir fluidez visual\n\nQuer que eu aplique agora?`;
      
      case 'template':
        return `🎨 **Template Visual**\n\nVou aplicar um template profissional ao seu vídeo.\n\n**O que vou fazer:**\n• Aplicar estilo visual consistente\n• Adicionar elementos gráficos\n• Otimizar cores e tipografia\n\nQuer que eu aplique agora?`;
      
      case 'speed':
        return `⚡ **Ajuste de Velocidade**\n\nVou ajustar a velocidade do vídeo para ${command.params?.speed}x.\n\n**O que vou fazer:**\n• Aplicar velocidade ${command.params?.speed}x em todos os clips\n• Manter sincronização de áudio\n• Ajustar duração total\n\nQuer que eu aplique agora?`;
      
      default:
        return `Vou executar: ${command.action}`;
    }
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

      // Aprender com o resultado
      learnFromCommand(message.content, message.preview.command.action, result.success);
      setUserPreferences(loadUserPreferences());

      // Atualizar mensagem
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, status: 'applied' as const, content: `${m.content}\n\n✅ **Aplicado com sucesso!**\n${result.message}` }
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

  const generateAIResponse = async (
    userInput: string,
    script: ScriptSegment[],
    clips: VideoClip[],
    preferences: any
  ): Promise<string> => {
    const lowerInput = userInput.toLowerCase();
    
    // Resposta inteligente baseada no contexto
    if (lowerInput.includes('ajud') || lowerInput.includes('help') || lowerInput.includes('como')) {
      return `Claro! Posso ajudar você com tudo! 🚀\n\n**Comandos que posso executar:**\n\n📥 **Mídia:**\n• "Baixar vídeo do YouTube [URL]"\n• "Upload de vídeo"\n• "Buscar imagens de [tema]"\n\n✂️ **Edição:**\n• "Aplicar cortes rápidos"\n• "Transições suaves"\n• "Acelerar 2x"\n• "Template profissional"\n\n📝 **Conteúdo:**\n• "Gerar legendas"\n• "Narração feminina"\n• "Adicionar texto [conteúdo]"\n\n💡 **Análise:**\n• "Analisar vídeo"\n• "Otimizar vídeo"\n• "Sugerir melhorias"\n\nMe diga o que você precisa! 💜`;
    }

    if (lowerInput.includes('otimizar') || lowerInput.includes('melhorar') || lowerInput.includes('ajustar')) {
      const suggestions = [];
      if (clips.length === 0) suggestions.push('Adicionar vídeos');
      if (clips.length > 1) suggestions.push('Aplicar transições');
      if (script.length > 0) suggestions.push('Gerar legendas e narração');
      if (clips.length > 3) suggestions.push('Aplicar cortes para ritmo dinâmico');
      
      return `💡 **Sugestões de Otimização:**\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nQuer que eu aplique alguma dessas otimizações? Posso fazer tudo automaticamente! 🚀`;
    }

    // Resposta padrão com contexto
    return `Entendi! Com base no seu vídeo (${clips.length} clips, ${script.length} segmentos), posso ajudar! 🎬\n\n**O que você quer fazer?**\n\nPosso executar comandos como:\n• "Aplicar cortes rápidos"\n• "Transições suaves"\n• "Gerar legendas"\n• "Template profissional"\n• "Acelerar 2x"\n\nOu me diga sua necessidade e eu vou analisar e sugerir a melhor solução! 💜`;
  };

  const quickActions = [
    { icon: Eye, label: 'Analisar', command: 'Analisar vídeo' },
    { icon: Scissors, label: 'Cortes', command: 'Aplicar cortes rápidos' },
    { icon: Sparkles, label: 'Transições', command: 'Aplicar transições suaves' },
    { icon: Type, label: 'Legendas', command: 'Gerar legendas' },
    { icon: Music, label: 'Narração', command: 'Gerar narração' },
    { icon: Zap, label: 'Otimizar', command: 'Otimizar vídeo' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-full" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Assistente de Edição IA</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Converse e eu executo</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
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
                'max-w-[85%] rounded-lg p-3',
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
              
              {message.preview && message.status === 'pending' && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <button
                    onClick={() => handleApprove(message.id)}
                    className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Aprovar e Aplicar
                  </button>
                  <button
                    onClick={() => handleReject(message.id)}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Rejeitar
                  </button>
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

      {/* Quick Actions */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => {
                  setInput(action.command);
                  setTimeout(() => handleSend(), 100);
                }}
                className="flex items-center gap-1.5 text-[10px] px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Icon className="w-3 h-3" />
                {action.label}
              </button>
            );
          })}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Digite o que quer que eu faça..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
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

