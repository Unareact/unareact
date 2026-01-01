# 🎭 INTEGRAÇÃO HEYGEN - AVATAR FALANDO ROTEIROS

## 📋 COMO FUNCIONA

### Fluxo Simplificado
```
1. Criar Avatar (1x) → HeyGen API → Salva avatar_id
2. Gerar Roteiro → Sistema atual (já funciona)
3. Avatar fala roteiro → HeyGen API → Vídeo com avatar
4. Integrar vídeo → Remotion/Editor (já funciona)
```

---

## 🔄 FLUXO DETALHADO

### Passo 1: Criar Avatar (Uma Vez)
```
Usuário → Upload vídeo/foto (5-10 min)
  ↓
HeyGen API → Cria avatar personalizado
  ↓
Salva avatar_id no Supabase
  ↓
Avatar pronto para usar
```

### Passo 2: Usar Avatar para Falar Roteiros
```
Sistema gera roteiro (já funciona)
  ↓
Pega avatar_id do usuário
  ↓
HeyGen API → Gera vídeo com avatar falando roteiro
  ↓
Download vídeo
  ↓
Adiciona vídeo aos clips do editor
  ↓
Renderiza com Remotion (já funciona)
```

---

## 🏗️ ESTRUTURA TÉCNICA

### 1. API Routes

#### `/app/api/heygen/avatar/create/route.ts`
```typescript
// Criar avatar a partir de vídeo/foto
POST /api/heygen/avatar/create
Body: { videoUrl: string, name: string }
Response: { avatarId: string, status: string }
```

#### `/app/api/heygen/avatar/generate/route.ts`
```typescript
// Gerar vídeo com avatar falando texto
POST /api/heygen/avatar/generate
Body: { 
  avatarId: string, 
  script: ScriptSegment[], 
  language: string 
}
Response: { videoUrl: string, status: string }
```

#### `/app/api/heygen/avatar/list/route.ts`
```typescript
// Listar avatares do usuário
GET /api/heygen/avatar/list
Response: { avatars: Avatar[] }
```

### 2. Biblioteca HeyGen

#### `/app/lib/heygen/client.ts`
```typescript
// Cliente HeyGen API
export class HeyGenClient {
  async createAvatar(videoUrl: string): Promise<string>
  async generateVideo(avatarId: string, text: string, language: string): Promise<string>
  async getAvatarStatus(avatarId: string): Promise<string>
}
```

#### `/app/lib/heygen/avatar-generator.ts`
```typescript
// Gerador de vídeo com avatar
export async function generateAvatarVideo(
  avatarId: string,
  script: ScriptSegment[],
  language: string = 'pt'
): Promise<{ videoUrl: string; duration: number }>
```

### 3. Integração com Roteiros

#### Modificar `/app/lib/ai-editing/text-to-speech.ts`
```typescript
// ADICIONAR: Função para usar avatar ao invés de TTS
export async function generateNarrationWithAvatar(
  script: ScriptSegment[],
  avatarId: string,
  language: string = 'pt'
): Promise<{ videoUrl: string; duration: number }> {
  // Usa HeyGen ao invés de OpenAI TTS
}
```

### 4. Componentes UI

#### `/app/components/avatar/HeyGenAvatarCreator.tsx`
```typescript
// Wizard para criar avatar
- Upload vídeo/foto
- Preview
- Salvar avatar
```

#### `/app/components/avatar/AvatarSelector.tsx`
```typescript
// Seletor de avatar no editor
- Lista avatares do usuário
- Seleciona avatar para usar
- Preview
```

---

## 💻 CÓDIGO DE EXEMPLO

### 1. Cliente HeyGen
```typescript
// app/lib/heygen/client.ts
import axios from 'axios';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com/v1';

export class HeyGenClient {
  private apiKey: string;

  constructor() {
    this.apiKey = HEYGEN_API_KEY || '';
  }

  // Criar avatar a partir de vídeo
  async createAvatar(videoUrl: string, name: string): Promise<string> {
    const response = await axios.post(
      `${HEYGEN_API_URL}/avatar/create`,
      {
        video_url: videoUrl,
        name: name,
      },
      {
        headers: {
          'X-API-KEY': this.apiKey,
        },
      }
    );

    return response.data.avatar_id;
  }

  // Gerar vídeo com avatar falando
  async generateVideo(
    avatarId: string,
    text: string,
    language: string = 'pt'
  ): Promise<string> {
    const response = await axios.post(
      `${HEYGEN_API_URL}/video/generate`,
      {
        avatar_id: avatarId,
        text: text,
        language: language,
      },
      {
        headers: {
          'X-API-KEY': this.apiKey,
        },
      }
    );

    return response.data.video_url;
  }

  // Verificar status do processamento
  async getVideoStatus(videoId: string): Promise<string> {
    const response = await axios.get(
      `${HEYGEN_API_URL}/video/${videoId}/status`,
      {
        headers: {
          'X-API-KEY': this.apiKey,
        },
      }
    );

    return response.data.status; // 'processing', 'completed', 'failed'
  }
}
```

### 2. Gerador de Vídeo com Avatar
```typescript
// app/lib/heygen/avatar-generator.ts
import { ScriptSegment } from '@/app/types';
import { HeyGenClient } from './client';

export async function generateAvatarVideo(
  avatarId: string,
  script: ScriptSegment[],
  language: string = 'pt'
): Promise<{ videoUrl: string; duration: number }> {
  const client = new HeyGenClient();
  
  // Juntar todo o texto do roteiro
  const fullText = script.map((s) => s.text).join(' ');
  
  // Gerar vídeo com avatar falando
  const videoUrl = await client.generateVideo(avatarId, fullText, language);
  
  // Estimar duração (baseado no texto)
  const words = fullText.split(/\s+/).length;
  const estimatedDuration = (words / 150) * 60; // ~150 palavras/minuto
  
  return {
    videoUrl,
    duration: estimatedDuration,
  };
}
```

### 3. Integração com Roteiros
```typescript
// app/lib/ai-editing/text-to-speech.ts
// ADICIONAR esta função:

import { generateAvatarVideo } from '@/app/lib/heygen/avatar-generator';

export async function generateNarrationWithAvatar(
  script: ScriptSegment[],
  avatarId: string,
  language: string = 'pt'
): Promise<{ videoUrl: string; duration: number }> {
  // Usa HeyGen ao invés de OpenAI TTS
  return await generateAvatarVideo(avatarId, script, language);
}
```

### 4. API Route - Criar Avatar
```typescript
// app/api/heygen/avatar/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HeyGenClient } from '@/app/lib/heygen/client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, name } = await request.json();
    
    // Criar avatar no HeyGen
    const client = new HeyGenClient();
    const avatarId = await client.createAvatar(videoUrl, name);
    
    // Salvar no Supabase
    const { data, error } = await supabase
      .from('avatars')
      .insert({
        heygen_avatar_id: avatarId,
        name: name,
        status: 'processing',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      avatarId: data.id,
      heygenAvatarId: avatarId,
      status: 'processing',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 5. API Route - Gerar Vídeo
```typescript
// app/api/heygen/avatar/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateAvatarVideo } from '@/app/lib/heygen/avatar-generator';
import { ScriptSegment } from '@/app/types';

export async function POST(request: NextRequest) {
  try {
    const { avatarId, script, language = 'pt' } = await request.json();
    
    // Gerar vídeo com avatar
    const result = await generateAvatarVideo(
      avatarId,
      script as ScriptSegment[],
      language
    );
    
    return NextResponse.json({
      videoUrl: result.videoUrl,
      duration: result.duration,
      status: 'completed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🎨 INTERFACE DO USUÁRIO

### 1. Botão "Criar Avatar" na Primeira Tela
```typescript
// app/page.tsx
<Link
  href="/avatar/create"
  className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg"
>
  <User className="w-5 h-5 inline mr-2" />
  Criar Avatar
</Link>
```

### 2. Tela de Criação de Avatar
```typescript
// app/avatar/create/page.tsx
- Upload vídeo/foto
- Preview
- Nome do avatar
- Botão "Criar Avatar"
- Progresso do processamento
```

### 3. Seletor de Avatar no Editor
```typescript
// app/components/editor/MainEditor.tsx
// ADICIONAR: Seletor de avatar
<AvatarSelector 
  onSelect={(avatar) => {
    // Usar avatar para narrar roteiro
    generateVideoWithAvatar(avatar.id, script);
  }}
/>
```

### 4. Integração no Fluxo de Reacts
```typescript
// app/components/viral/ViralVideoWorkflow.tsx
// MODIFICAR: Após gerar roteiro, perguntar se quer usar avatar

const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

// Após aprovar roteiro:
if (selectedAvatar) {
  const avatarVideo = await generateAvatarVideo(
    selectedAvatar,
    editedSegments,
    'pt'
  );
  // Adicionar avatarVideo aos clips
}
```

---

## 🗄️ BANCO DE DADOS

### Tabela: `avatars`
```sql
CREATE TABLE avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  heygen_avatar_id TEXT NOT NULL,  -- ID do avatar no HeyGen
  preview_url TEXT,
  status VARCHAR(50) DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 FLUXO COMPLETO DE USO

### Cenário: Usuário cria React com avatar

1. **Usuário vai em React** → Seleciona vídeo viral
2. **Sistema gera roteiro** → (já funciona)
3. **Usuário escolhe avatar** → Seleciona avatar criado
4. **Sistema gera vídeo** → Avatar fala roteiro (HeyGen API)
5. **Vídeo pronto** → Adiciona aos clips
6. **Renderiza** → Remotion (já funciona)

---

## 💰 CUSTOS HEYGEN

### Planos
- **Starter**: $24/mês → 10 vídeos/mês
- **Pro**: $99/mês → 50 vídeos/mês
- **Enterprise**: Custom → Ilimitado

### Custo por Vídeo
- **Starter**: ~$2.40/vídeo
- **Pro**: ~$2.00/vídeo
- **Enterprise**: Negociável

---

## ✅ VANTAGENS

1. **Simples**: API fácil de integrar
2. **Rápido**: Vídeo pronto em 1-3 minutos
3. **Qualidade**: Alta qualidade de sincronização
4. **Multi-idioma**: Suporta vários idiomas
5. **Sem infraestrutura**: Não precisa de servidor próprio

---

## 🚀 PRÓXIMOS PASSOS

1. **Criar conta HeyGen** → Obter API Key
2. **Implementar cliente** → `app/lib/heygen/client.ts`
3. **Criar APIs** → `/api/heygen/avatar/*`
4. **Interface de criação** → `/avatar/create`
5. **Integração com roteiros** → Substituir TTS por avatar
6. **Testes** → Validar fluxo completo

---

**Status**: 📋 Planejamento Completo
**Complexidade**: ⭐⭐ (Média - API simples)
**Tempo**: 3-5 dias de desenvolvimento

