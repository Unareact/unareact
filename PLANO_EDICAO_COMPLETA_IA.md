# 🎬 Plano Completo: Edição Final com IA - Cobrindo Todos os Itens da Opção 1

## 📋 Análise: O Que Falta para Edição Completa

### ✅ O que JÁ temos:
- [x] Geração de roteiro com IA
- [x] Download de vídeos (YouTube/TikTok)
- [x] Upload de arquivos
- [x] Timeline básica (drag & drop, ajuste de duração)
- [x] Preview básico

### ❌ O que FALTA para edição completa:

#### 1. **Edição Básica Avançada**
- [ ] Corte preciso (frame-by-frame)
- [ ] Split de clips
- [ ] Duplicar clips
- [ ] Velocidade de reprodução (slow motion, fast forward)
- [ ] Rotação e crop
- [ ] Ajuste de brilho/contraste/saturação

#### 2. **Efeitos e Transições**
- [ ] Transições entre clips (fade, wipe, zoom, etc.)
- [ ] Filtros de cor
- [ ] Efeitos visuais (blur, sharpen, etc.)
- [ ] Animações de entrada/saída

#### 3. **Texto e Legendas**
- [ ] Adicionar textos sobrepostos
- [ ] Legendas automáticas (geradas por IA)
- [ ] Estilos de texto (fontes, cores, animações)
- [ ] Sincronização com roteiro

#### 4. **Áudio**
- [ ] Música de fundo
- [ ] Narração (TTS - Text-to-Speech por IA)
- [ ] Mixagem de áudio
- [ ] Ajuste de volume por clip
- [ ] Remoção de ruído (IA)

#### 5. **Edição por IA (Automática)**
- [ ] Auto-cut (cortes automáticos baseados em roteiro)
- [ ] Auto-sync (sincronizar vídeo com narração)
- [ ] Auto-transitions (transições inteligentes)
- [ ] Auto-captions (legendas automáticas)
- [ ] Auto-color (correção de cor automática)
- [ ] Auto-pacing (ajuste de ritmo automático)

#### 6. **Renderização e Exportação**
- [ ] Renderização com Remotion
- [ ] Exportação em diferentes formatos (MP4, MOV, etc.)
- [ ] Opções de qualidade (1080p, 4K, etc.)
- [ ] Progresso de renderização
- [ ] Download do vídeo final

---

## 🤖 Opções de Edição por IA

### **Opção 1: APIs de Edição por IA**

#### **A) Runway ML API** ⭐⭐⭐⭐⭐
**O que oferece:**
- Gen-2: Geração de vídeo por IA
- Inpainting: Remoção/adição de objetos
- Motion tracking
- Color grading automático
- Text-to-video

**Custo:** ~$0.05 por segundo de vídeo processado
**API:** ✅ Disponível
**Documentação:** https://docs.runwayml.com

**Exemplo de uso:**
```typescript
// Auto-cut baseado em roteiro
const response = await fetch('https://api.runwayml.com/v1/editing/auto-cut', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RUNWAY_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    video_url: videoUrl,
    script: scriptSegments,
    style: 'fast-paced',
  }),
});
```

#### **B) Pika Labs API** ⭐⭐⭐⭐
**O que oferece:**
- Geração de vídeo por IA
- Animações
- Efeitos visuais

**Custo:** Variável
**API:** ✅ Disponível
**Status:** Mais focado em geração que edição

#### **C) HeyGen API** ⭐⭐⭐⭐⭐
**O que oferece:**
- Avatares com IA
- Narração automática (TTS)
- Sincronização labial
- Vídeos de apresentação automáticos

**Custo:** ~$0.20 por minuto
**API:** ✅ Disponível
**Documentação:** https://docs.heygen.com

**Ideal para:** Narração automática sincronizada

#### **D) Descript API** ⭐⭐⭐⭐⭐
**O que oferece:**
- Edição por transcrição
- Overdub (clonagem de voz)
- Auto-captions
- Remoção de "ums" e "ahs"

**Custo:** ~$24/mês
**API:** ✅ Disponível
**Documentação:** https://www.descript.com/api

**Ideal para:** Edição baseada em roteiro

#### **E) AssemblyAI** ⭐⭐⭐⭐
**O que oferece:**
- Transcrição automática
- Auto-captions
- Sumarização
- Detecção de sentimentos

**Custo:** ~$0.00025 por segundo
**API:** ✅ Disponível
**Documentação:** https://www.assemblyai.com/docs

**Ideal para:** Legendas e transcrição

---

### **Opção 2: Ferramentas Open Source**

#### **A) FFmpeg + Scripts de IA** ⭐⭐⭐⭐
**O que oferece:**
- Controle total
- Gratuito
- Pode integrar modelos de IA próprios

**Implementação:**
```typescript
// Auto-cut com FFmpeg + análise de áudio
import ffmpeg from 'fluent-ffmpeg';
import { analyzeAudio } from './ai-audio-analyzer';

const cutPoints = await analyzeAudio(videoPath);
// Gerar comandos FFmpeg para cortes automáticos
```

#### **B) Whisper (OpenAI) + FFmpeg** ⭐⭐⭐⭐⭐
**O que oferece:**
- Transcrição automática (gratuita)
- Sincronização com vídeo
- Auto-captions

**Custo:** Gratuito (self-hosted) ou API OpenAI
**Documentação:** https://github.com/openai/whisper

---

### **Opção 3: Integração com CapCut/Premiere**

#### **A) CapCut API** ⚠️
**Status:** Não tem API pública oficial
**Alternativa:** Usar automação via scripts

#### **B) Adobe Premiere Pro API** ⭐⭐⭐
**O que oferece:**
- Extensões CEP (Common Extensibility Platform)
- Scripting com ExtendScript
- Integração limitada

**Custo:** Requer licença Adobe
**Complexidade:** Alta

---

## 🎯 Solução Recomendada: Stack Completo

### **Arquitetura Proposta:**

```
┌─────────────────────────────────────────────────────────┐
│              GERAR ROTEIRO (IA) ✅                      │
│  • OpenAI GPT-4o                                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         PREPARAR MATERIAL ✅                             │
│  • Download YouTube/TikTok                               │
│  • Upload de arquivos                                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│      EDITAR NA TIMELINE (Manual + IA) 🆕                │
│  • Timeline avançada (drag & drop, cortes)              │
│  • Auto-cut baseado em roteiro (IA)                     │
│  • Auto-sync com narração (IA)                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│      APLICAR EFEITOS E TRANSIÇÕES (IA) 🆕                │
│  • Auto-transitions (Runway/FFmpeg)                     │
│  • Auto-color correction (Runway)                        │
│  • Filtros inteligentes                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│      ADICIONAR ÁUDIO E LEGENDAS (IA) 🆕                  │
│  • Narração TTS (HeyGen/OpenAI TTS)                      │
│  • Auto-captions (AssemblyAI/Whisper)                    │
│  • Música de fundo (biblioteca)                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│      RENDERIZAR E EXPORTAR 🆕                            │
│  • Remotion para renderização                           │
│  • Exportação em diferentes formatos                     │
│  • Download do vídeo final                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Plano de Implementação Detalhado

### **Fase 1: Edição Básica Avançada (3-5 dias)**

#### 1.1 Melhorar Timeline
```typescript
// app/components/timeline/AdvancedTimeline.tsx
- Split de clips (dividir em dois)
- Duplicar clips
- Corte frame-by-frame
- Velocidade de reprodução (0.25x a 4x)
- Rotação e crop
```

#### 1.2 Controles de Edição
```typescript
// app/components/editor/EditControls.tsx
- Slider de brilho/contraste/saturação
- Controles de velocidade
- Rotação (90°, 180°, 270°)
- Crop (seleção de área)
```

**Tecnologias:**
- React Slider
- Canvas API para preview
- FFmpeg para processamento

---

### **Fase 2: Edição por IA - Auto-Cut (2-3 dias)**

#### 2.1 Auto-Cut Baseado em Roteiro
```typescript
// app/lib/ai-editing/auto-cut.ts
export async function autoCutVideo(
  videoUrl: string,
  script: ScriptSegment[]
): Promise<VideoClip[]> {
  // Analisar vídeo e roteiro
  // Identificar pontos de corte ideais
  // Gerar clips automaticamente
  
  // Opção A: Usar Runway ML
  const cuts = await runwayAutoCut(videoUrl, script);
  
  // Opção B: Usar FFmpeg + análise própria
  const cuts = await ffmpegAutoCut(videoUrl, script);
  
  return cuts;
}
```

#### 2.2 Integração com Runway ML
```typescript
// app/lib/services/runway-service.ts
export class RunwayService {
  async autoCut(videoUrl: string, script: ScriptSegment[]) {
    const response = await fetch('https://api.runwayml.com/v1/editing/auto-cut', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: videoUrl,
        script_segments: script.map(s => ({
          text: s.text,
          duration: s.duration,
          timestamp: s.timestamp,
        })),
      }),
    });
    
    return response.json();
  }
}
```

---

### **Fase 3: Transições e Efeitos Automáticos (2-3 dias)**

#### 3.1 Auto-Transitions
```typescript
// app/lib/ai-editing/auto-transitions.ts
export async function applyAutoTransitions(
  clips: VideoClip[]
): Promise<VideoClip[]> {
  // Analisar conteúdo de cada clip
  // Escolher transição ideal (fade, wipe, zoom, etc.)
  // Aplicar automaticamente
  
  return clips.map((clip, index) => {
    if (index === 0) return clip;
    
    const transition = chooseBestTransition(
      clips[index - 1],
      clip
    );
    
    return {
      ...clip,
      transition,
    };
  });
}
```

#### 3.2 Auto-Color Correction
```typescript
// app/lib/ai-editing/auto-color.ts
export async function autoColorCorrect(
  videoUrl: string
): Promise<string> {
  // Usar Runway ML para correção automática
  const response = await fetch('https://api.runwayml.com/v1/color/auto-correct', {
    method: 'POST',
    body: JSON.stringify({ video_url: videoUrl }),
  });
  
  return response.json().processed_url;
}
```

---

### **Fase 4: Áudio e Legendas por IA (3-4 dias)**

#### 4.1 Narração Automática (TTS)
```typescript
// app/lib/ai-editing/text-to-speech.ts
export async function generateNarration(
  script: ScriptSegment[],
  voice: 'male' | 'female' | 'custom'
): Promise<AudioSegment[]> {
  // Opção A: OpenAI TTS
  const audio = await openai.audio.speech.create({
    model: 'tts-1',
    voice: voice === 'male' ? 'alloy' : 'nova',
    input: script.map(s => s.text).join(' '),
  });
  
  // Opção B: HeyGen (com sincronização labial)
  const audio = await heygen.generateNarration({
    script,
    avatar: 'default',
  });
  
  return audio;
}
```

#### 4.2 Auto-Captions
```typescript
// app/lib/ai-editing/auto-captions.ts
export async function generateCaptions(
  videoUrl: string,
  language: 'pt' | 'en' = 'pt'
): Promise<Caption[]> {
  // Opção A: AssemblyAI
  const transcript = await assemblyai.transcribe(videoUrl, {
    language_code: language,
    auto_chapters: true,
  });
  
  // Opção B: Whisper (OpenAI)
  const transcript = await openai.audio.transcriptions.create({
    file: videoFile,
    model: 'whisper-1',
    language: language,
  });
  
  // Gerar legendas sincronizadas
  return syncCaptions(transcript, videoUrl);
}
```

---

### **Fase 5: Renderização e Exportação (3-5 dias)**

#### 5.1 Integração Remotion Completa
```typescript
// app/components/remotion/VideoComposition.tsx
import { Composition, useCurrentFrame, useVideoConfig } from 'remotion';
import { VideoClip, ScriptSegment } from '@/app/types';

export const VideoComposition: React.FC<{
  clips: VideoClip[];
  script: ScriptSegment[];
  transitions: Transition[];
  captions: Caption[];
}> = ({ clips, script, transitions, captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Renderizar cada clip na timeline
  // Aplicar transições
  // Adicionar legendas
  // Sincronizar áudio
  
  return (
    <div>
      {clips.map((clip, index) => (
        <ClipComponent
          key={clip.id}
          clip={clip}
          transition={transitions[index]}
        />
      ))}
      {captions.map(caption => (
        <CaptionComponent key={caption.id} caption={caption} />
      ))}
    </div>
  );
};
```

#### 5.2 API de Renderização
```typescript
// app/api/render/route.ts
export async function POST(request: NextRequest) {
  const { clips, script, transitions, captions } = await request.json();
  
  // Bundle Remotion
  const bundle = await bundleRemotion();
  
  // Renderizar
  const outputPath = await renderMedia({
    composition: 'VideoComposition',
    inputProps: { clips, script, transitions, captions },
    codec: 'h264',
    outputLocation: `tmp/renders/video-${Date.now()}.mp4`,
  });
  
  return NextResponse.json({ 
    success: true,
    videoUrl: `/api/download/${path.basename(outputPath)}`,
  });
}
```

---

## 📦 Stack Tecnológica Completa

### **Edição Manual:**
- ✅ Remotion (já instalado)
- ✅ FFmpeg (via fluent-ffmpeg)
- ✅ Canvas API (preview)

### **Edição por IA:**
- 🤖 **Runway ML** - Auto-cut, color correction
- 🤖 **OpenAI TTS** - Narração automática
- 🤖 **AssemblyAI/Whisper** - Legendas automáticas
- 🤖 **HeyGen** - Narração com avatar (opcional)

### **Renderização:**
- ✅ Remotion (renderização)
- ✅ FFmpeg (processamento final)

---

## 💰 Estimativa de Custos

### **APIs de IA (por vídeo de 1 minuto):**
- Runway ML: ~$3 (auto-cut + color)
- OpenAI TTS: ~$0.015 (narração)
- AssemblyAI: ~$0.015 (legendas)
- **Total: ~$3.03 por vídeo**

### **Alternativa Gratuita:**
- Whisper (self-hosted): $0
- FFmpeg: $0
- OpenAI TTS: ~$0.015
- **Total: ~$0.015 por vídeo** (só narração)

---

## 🎯 Checklist de Implementação

### **Fase 1: Edição Básica** (3-5 dias)
- [ ] Split de clips
- [ ] Duplicar clips
- [ ] Velocidade de reprodução
- [ ] Rotação e crop
- [ ] Ajustes de cor (brilho/contraste)

### **Fase 2: Edição por IA** (2-3 dias)
- [ ] Auto-cut baseado em roteiro
- [ ] Integração Runway ML (ou alternativa)
- [ ] Auto-sync com narração

### **Fase 3: Efeitos Automáticos** (2-3 dias)
- [ ] Auto-transitions
- [ ] Auto-color correction
- [ ] Filtros inteligentes

### **Fase 4: Áudio e Legendas** (3-4 dias)
- [ ] Narração TTS (OpenAI/HeyGen)
- [ ] Auto-captions (AssemblyAI/Whisper)
- [ ] Música de fundo
- [ ] Mixagem de áudio

### **Fase 5: Renderização** (3-5 dias)
- [ ] Integração Remotion completa
- [ ] API de renderização
- [ ] Exportação em diferentes formatos
- [ ] Progresso de renderização
- [ ] Download do vídeo final

**Total: ~13-20 dias para implementação completa**

---

## 🚀 Começar Agora

### **Prioridade 1: Edição Básica Avançada**
Implementar funcionalidades básicas que faltam:
- Split, duplicar, velocidade, rotação

### **Prioridade 2: Auto-Cut por IA**
Integrar Runway ML ou criar solução própria com FFmpeg

### **Prioridade 3: Narração e Legendas**
OpenAI TTS + Whisper/AssemblyAI

### **Prioridade 4: Renderização**
Remotion completo

---

**Quer que eu comece implementando alguma dessas fases agora?** 🚀

