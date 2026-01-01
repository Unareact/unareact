'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Bot, User, Sparkles, CheckCircle2, X } from 'lucide-react';
import { useEditorStore } from '@/app/stores/editor-store';
import { cn } from '@/app/lib/utils';
import { parseUserCommand, executeAICommand, learnFromCommand, loadUserPreferences, getSuggestedCommand } from '@/app/lib/ai-editing/ai-commands';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actionApplied?: boolean;
  actionType?: string;
}

export function AIEditingChat() {
  const { script, clips, setClips, setScript } = useEditorStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! O que você gostaria de editar?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userPreferences, setUserPreferences] = useState(loadUserPreferences());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Verificar se há sugestão baseada em preferências aprendidas
      const suggestedCommand = getSuggestedCommand(userInput);
      const finalInput = suggestedCommand || userInput;
      
      // Tentar parsear como comando executável
      const command = await parseUserCommand(finalInput, script, clips);
      
      if (command && command.confidence > 0.7) {
        // Executar comando automaticamente
        const result = await executeAICommand(command, script, clips, setClips, setScript);
        
        // Aprender com o resultado
        learnFromCommand(userInput, command.action, result.success);
        setUserPreferences(loadUserPreferences());
        
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.message,
          timestamp: new Date(),
          actionApplied: result.applied,
          actionType: command.type,
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Resposta conversacional normal
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

  const generateAIResponse = async (
    userInput: string,
    script: any[],
    clips: any[],
    preferences: any
  ): Promise<string> => {
    // Análise básica da solicitação do usuário
    const lowerInput = userInput.toLowerCase();
    
    // Detectar intenções e oferecer aplicar diretamente
    if (lowerInput.includes('corte') || lowerInput.includes('cortar') || lowerInput.includes('cut')) {
      const cutStyle = preferences.preferredCutStyle || 'balanced';
      return `Perfeito! Com base no seu roteiro de ${script.length} segmentos e ${clips.length} clips, posso aplicar cortes automaticamente!\n\n💡 **Comandos que eu posso executar agora:**\n\n✅ "Aplique cortes rápidos" → Eu aplico cortes automáticos\n✅ "Faça cortes suaves" → Cortes mais espaçados\n✅ "Aplique cortes automáticos" → Análise inteligente do roteiro\n\nBaseado no seu histórico, você prefere cortes ${cutStyle === 'fast' ? 'rápidos' : cutStyle === 'smooth' ? 'suaves' : 'balanceados'}. Quer que eu aplique agora?`;
    }
    
    if (lowerInput.includes('legenda') || lowerInput.includes('narração') || lowerInput.includes('narracao')) {
      return `Ótimo! Para legendas e narração:\n\n📝 **Legendas Automáticas:**\n- Use o painel "Legendas Automáticas" acima\n- As legendas serão geradas do seu roteiro\n- Você pode editar cada legenda antes de aplicar\n\n🎤 **Narração:**\n- Use o painel "Narração" acima\n- Escolha uma voz (masculina, feminina, energética, calma)\n- A IA vai gerar a narração do seu roteiro\n\nVocê tem ${script.length} segmentos no roteiro. Quer ajuda com algum específico?`;
    }
    
    if (lowerInput.includes('transição') || lowerInput.includes('transicao') || lowerInput.includes('efeito')) {
      const transType = preferences.preferredTransitions || 'auto';
      return `Para transições e efeitos, posso aplicar automaticamente!\n\n💡 **Comandos que eu posso executar:**\n\n✅ "Aplique transições suaves" → Transições fade entre todos os clips\n✅ "Faça transições dinâmicas" → Transições wipe/zoom\n✅ "Aplique transições automáticas" → IA escolhe o melhor tipo\n\nVocê tem ${clips.length} clips. Baseado no seu histórico, você prefere transições ${transType === 'fade' ? 'suaves (fade)' : transType === 'wipe' ? 'dinâmicas (wipe)' : 'automáticas'}. Quer que eu aplique agora?`;
    }
    
    if (lowerInput.includes('rápido') || lowerInput.includes('rapido') || lowerInput.includes('dinâmico') || lowerInput.includes('dinamico')) {
      return `Perfeito! Para um vídeo dinâmico e rápido, posso aplicar tudo automaticamente! 🚀\n\n**O que vou fazer:**\n\n1. ✅ Aplicar cortes rápidos e frequentes\n2. ✅ Adicionar transições wipe/zoom dinâmicas\n3. ✅ Ajustar velocidade para 1.5x-2x em clips selecionados\n4. ✅ Sugerir textos grandes e bold\n\n**Comandos diretos:**\n- "Aplique tudo para vídeo dinâmico" → Eu faço tudo automaticamente\n- "Apenas cortes rápidos" → Só os cortes\n- "Apenas transições dinâmicas" → Só as transições\n\nQuer que eu aplique tudo agora?`;
    }
    
    if (lowerInput.includes('profissional') || lowerInput.includes('corporativo') || lowerInput.includes('negócio')) {
      return `Para um vídeo profissional:\n\n1. **Template Clássico Profissional:** Use na seção Templates acima\n2. **Transições Suaves:** Fade entre clips\n3. **Legendas Claras:** Fonte legível, posição inferior\n4. **Narração Formal:** Voz masculina ou feminina calma\n5. **Cores Corporativas:** Azul, cinza, branco\n\nVocê tem ${clips.length} clips. Quer que eu configure tudo automaticamente?`;
    }
    
    // Resposta genérica com comandos diretos
    return `Entendi! Com base no seu vídeo (${clips.length} clips, ${script.length} segmentos), posso APLICAR edições automaticamente! 🎬\n\n**Comandos que eu posso executar agora:**\n\n✅ **Cortes:**\n- "Aplique cortes rápidos" → Aplico automaticamente\n- "Faça cortes suaves" → Cortes espaçados\n\n✅ **Transições:**\n- "Aplique transições suaves" → Fade automático\n- "Faça transições dinâmicas" → Wipe/Zoom\n\n✅ **Templates:**\n- "Use template profissional" → Aplico template clássico\n- "Template moderno" → Template moderno e limpo\n\n✅ **Velocidade:**\n- "Acelere 2x" → Velocidade 2x\n- "Lento 0.5x" → Slow motion\n\n✅ **Legendas e Narração:**\n- "Adicione legendas" → Gero legendas do roteiro\n- "Gere narração" → Narração com IA\n\n💡 **Dica:** Quanto mais você usa, mais eu aprendo suas preferências!\n\nMe diga o que quer e eu aplico agora!`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 500px)', minHeight: '300px', maxHeight: '400px' }}>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ maxHeight: '200px' }}>
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
                'max-w-[80%] rounded-lg p-3',
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                message.actionApplied && 'ring-2 ring-green-500'
              )}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  {message.actionApplied && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-700 dark:text-green-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Edição aplicada automaticamente!</span>
                    </div>
                  )}
                </div>
              </div>
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
        
        {isLoading && (
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

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Digite o que quer que eu faça..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        <div className="flex flex-wrap gap-1.5 mt-2">
          {['Cortes rápidos', 'Transições suaves', 'Template profissional', 'Acelerar 2x'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setInput(cmd);
                setTimeout(() => handleSend(), 100);
              }}
              className="text-[10px] px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

