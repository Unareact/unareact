# 🎭 PLANEJAMENTO COMPLETO: SISTEMA DE AVATARES E VOZES

## 📋 ENTENDIMENTO DO REQUISITO

### Objetivo
Criar um sistema completo de **clonagem de avatar e voz** a partir de vídeo gravado, com:
- ✅ Alta eficácia e eficiência
- ✅ Suporte a qualquer idioma
- ✅ Integração com Reacts (vídeos virais)
- ✅ Integração com todo o SaaS (ler roteiros, narrar vídeos)
- ✅ Mínimo custo financeiro
- ✅ Botão "Criar Avatar" na primeira tela

### Fluxo Principal
1. **Usuário clica "Criar Avatar"** → Tela de criação
2. **Upload de vídeo** → Processamento (avatar + voz)
3. **Avatar criado** → Disponível para uso
4. **Integração automática** → Avatar lê roteiros em qualquer idioma
5. **Renderização** → Avatar aparece nos Reacts e montagens

---

## 🏗️ ARQUITETURA TÉCNICA

### 1. STACK TECNOLÓGICO (Open-Source, Baixo Custo)

#### 1.1 Geração de Avatar a partir de Vídeo
```
┌─────────────────────────────────────────┐
│  Vídeo Upload (5-10 min)               │
│  ↓                                      │
│  Wav2Lip (Sincronização Labial)        │
│  ↓                                      │
│  First Order Motion Model (Animações)   │
│  ↓                                      │
│  Avatar Modelo 3D/2D Criado            │
└─────────────────────────────────────────┘
```

**Tecnologias:**
- **Wav2Lip**: Sincronização labial perfeita (vídeo + áudio)
- **First Order Motion Model**: Transferência de movimento facial
- **MediaPipe Face Mesh**: Detecção e tracking facial
- **3D Face Reconstruction**: Criar modelo 3D do rosto

#### 1.2 Clonagem de Voz
```
┌─────────────────────────────────────────┐
│  Áudio do Vídeo (10-20 min)            │
│  ↓                                      │
│  Coqui TTS XTTTS (Clonagem)            │
│  ↓                                      │
│  Modelo de Voz Personalizado           │
│  ↓                                      │
│  Suporte Multi-idioma                  │
└─────────────────────────────────────────┘
```

**Tecnologias:**
- **Coqui TTS XTTTS**: Clonagem de voz open-source
- **Whisper**: Transcrição e detecção de idioma
- **Google Translate API** (ou open-source): Tradução de textos

#### 1.3 Infraestrutura
```
┌─────────────────────────────────────────┐
│  Next.js API Routes                     │
│  ↓                                      │
│  FastAPI (Python) - Processamento ML   │
│  ↓                                      │
│  GPU Server (Opcional - CPU funciona)   │
│  ↓                                      │
│  Supabase (Storage de avatares/vozes)   │
└─────────────────────────────────────────┘
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
/Users/air/una-app/
├── app/
│   ├── avatar/                          # NOVO: Módulo de Avatares
│   │   ├── page.tsx                     # Tela principal de criação
│   │   ├── create/
│   │   │   └── page.tsx                 # Fluxo de criação
│   │   └── [id]/
│   │       └── page.tsx                 # Visualizar/editar avatar
│   │
│   ├── api/
│   │   ├── avatar/
│   │   │   ├── create/route.ts          # Criar avatar (upload vídeo)
│   │   │   ├── process/route.ts         # Processar vídeo (ML)
│   │   │   ├── [id]/route.ts            # GET/PUT/DELETE avatar
│   │   │   └── [id]/generate/route.ts   # Gerar vídeo com avatar
│   │   │
│   │   └── voice/
│   │       ├── clone/route.ts           # Clonar voz
│   │       ├── synthesize/route.ts      # Sintetizar voz (TTS)
│   │       └── [id]/route.ts            # GET/PUT/DELETE voz
│   │
│   ├── components/
│   │   ├── avatar/                      # NOVO: Componentes de Avatar
│   │   │   ├── AvatarCreator.tsx        # Wizard de criação
│   │   │   ├── AvatarUpload.tsx         # Upload de vídeo
│   │   │   ├── AvatarPreview.tsx        # Preview do avatar
│   │   │   ├── AvatarPlayer.tsx          # Player do avatar
│   │   │   └── AvatarSelector.tsx        # Seletor de avatar
│   │   │
│   │   └── remotion/
│   │       └── AvatarComposition.tsx    # NOVO: Composição Remotion com Avatar
│   │
│   ├── lib/
│   │   ├── avatar/                      # NOVO: Lógica de Avatar
│   │   │   ├── wav2lip.ts               # Integração Wav2Lip
│   │   │   ├── face-motion.ts           # First Order Motion
│   │   │   ├── face-reconstruction.ts   # 3D Face Reconstruction
│   │   │   └── avatar-generator.ts      # Gerador principal
│   │   │
│   │   ├── voice/                       # NOVO: Lógica de Voz
│   │   │   ├── coqui-tts.ts             # Integração Coqui TTS
│   │   │   ├── voice-cloner.ts          # Clonador de voz
│   │   │   ├── voice-synthesizer.ts    # Sintetizador TTS
│   │   │   └── language-detector.ts     # Detecção de idioma
│   │   │
│   │   └── ai-editing/
│   │       └── text-to-speech.ts        # MODIFICAR: Integrar avatares
│   │
│   └── stores/
│       └── avatar-store.ts              # NOVO: Zustand store para avatares
│
├── services/                            # NOVO: Serviços Python (ML)
│   ├── avatar-service/
│   │   ├── main.py                      # FastAPI para processamento
│   │   ├── wav2lip/
│   │   │   └── process.py               # Processamento Wav2Lip
│   │   ├── face_motion/
│   │   │   └── process.py               # First Order Motion
│   │   └── requirements.txt
│   │
│   └── voice-service/
│       ├── main.py                      # FastAPI para TTS
│       ├── coqui_tts/
│       │   └── process.py               # Coqui TTS
│       └── requirements.txt
│
└── supabase/
    └── migrations/
        └── create_avatars_table.sql     # NOVO: Tabela de avatares
```

---

## 🗄️ BANCO DE DADOS (Supabase)

### Tabela: `avatars`
```sql
CREATE TABLE avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Arquivos
  video_url TEXT,                    -- Vídeo original
  avatar_model_url TEXT,              -- Modelo do avatar (3D/2D)
  avatar_preview_url TEXT,            -- Preview imagem
  
  -- Voz
  voice_model_id TEXT,                -- ID do modelo de voz (Coqui TTS)
  voice_samples_url TEXT[],           -- URLs das amostras de voz
  
  -- Configurações
  language VARCHAR(10) DEFAULT 'pt',  -- Idioma padrão
  settings JSONB,                     -- Configurações extras
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, ready, error
  processing_progress INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_avatars_user_id ON avatars(user_id);
CREATE INDEX idx_avatars_status ON avatars(status);
```

### Tabela: `avatar_generations`
```sql
CREATE TABLE avatar_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  avatar_id UUID REFERENCES avatars(id),
  script_text TEXT NOT NULL,
  language VARCHAR(10) NOT NULL,
  
  -- Resultado
  video_url TEXT,                     -- Vídeo gerado
  audio_url TEXT,                     -- Áudio gerado
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  processing_progress INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_avatar_generations_avatar_id ON avatar_generations(avatar_id);
```

---

## 🔄 FLUXO DE CRIAÇÃO DE AVATAR

### 1. Upload e Processamento
```
Usuário → Upload Vídeo (5-10 min)
  ↓
Next.js API → Salva no Supabase Storage
  ↓
FastAPI Service → Processa vídeo:
  - Extrai frames faciais
  - Cria modelo 3D/2D
  - Extrai áudio para clonagem
  ↓
Coqui TTS → Clona voz
  ↓
Salva modelo no Supabase
  ↓
Avatar pronto para uso
```

### 2. Geração de Vídeo com Avatar
```
Usuário → Seleciona avatar + Digita texto (ou usa roteiro)
  ↓
Sistema → Detecta idioma do texto
  ↓
Coqui TTS → Gera áudio com voz clonada
  ↓
Wav2Lip → Sincroniza avatar com áudio
  ↓
First Order Motion → Anima avatar
  ↓
Renderiza vídeo final
  ↓
Integra com Remotion (React/montagens)
```

---

## 💰 ESTRATÉGIA DE CUSTO MÍNIMO

### Opção 1: CPU Only (Mais Barato)
- **Servidor**: $20-50/mês (CPU apenas)
- **Processamento**: 5-15 min por vídeo
- **Custo por vídeo**: ~$0.01-0.05
- **Ideal para**: Uso baixo/médio

### Opção 2: GPU Compartilhada (Balanço)
- **Servidor**: $100-200/mês (GPU T4 compartilhada)
- **Processamento**: 30s-2min por vídeo
- **Custo por vídeo**: ~$0.01-0.02
- **Ideal para**: Uso médio/alto

### Opção 3: On-Demand GPU (Flexível)
- **Servidor**: $0 base + $0.50-1.00/hora quando usar
- **Processamento**: 30s-2min por vídeo
- **Custo por vídeo**: ~$0.01-0.03
- **Ideal para**: Uso esporádico

### Recomendação Inicial
- **Começar com CPU** ($20-50/mês)
- **Monitorar uso**
- **Escalar para GPU** se necessário

---

## 🔌 INTEGRAÇÕES COM O SAAS

### 1. Integração com Reacts
```typescript
// app/components/viral/ViralVideoWorkflow.tsx
// MODIFICAR: Adicionar opção de avatar

const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

// Ao gerar roteiro, se avatar selecionado:
if (selectedAvatar) {
  const avatarVideo = await generateAvatarVideo({
    avatarId: selectedAvatar.id,
    script: segments,
    language: 'pt'
  });
  // Adicionar avatarVideo aos clips
}
```

### 2. Integração com Editor
```typescript
// app/components/editor/MainEditor.tsx
// MODIFICAR: Adicionar painel de avatar

<AvatarSelector 
  onSelect={(avatar) => {
    // Adicionar avatar à timeline
    addAvatarClip(avatar);
  }}
/>
```

### 3. Integração com Remotion
```typescript
// app/components/remotion/AvatarComposition.tsx
// NOVO: Composição Remotion com Avatar

export const AvatarComposition: React.FC<{
  avatarUrl: string;
  audioUrl: string;
  script: ScriptSegment[];
}> = ({ avatarUrl, audioUrl, script }) => {
  // Renderizar avatar sincronizado com áudio
};
```

### 4. Integração com Narração
```typescript
// app/lib/ai-editing/text-to-speech.ts
// MODIFICAR: Suportar avatares

export async function generateNarrationWithAvatar(
  script: ScriptSegment[],
  avatarId: string,
  language: string = 'pt'
): Promise<{
  videoUrl: string;
  audioUrl: string;
}> {
  // Usar avatar + voz clonada
}
```

---

## 🎨 INTERFACE DO USUÁRIO

### 1. Botão na Primeira Tela
```typescript
// app/page.tsx
// ADICIONAR: Botão "Criar Avatar"

<Link
  href="/avatar/create"
  className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
>
  <User className="w-5 h-5 inline mr-2" />
  Criar Avatar
</Link>
```

### 2. Tela de Criação
```
┌─────────────────────────────────────┐
│  🎭 Criar Seu Avatar                │
├─────────────────────────────────────┤
│                                     │
│  📹 Passo 1: Upload de Vídeo        │
│  [Arraste ou clique para upload]    │
│                                     │
│  ⚙️ Passo 2: Processamento         │
│  [Progresso: 45%]                   │
│                                     │
│  ✅ Passo 3: Avatar Pronto          │
│  [Preview do avatar]                │
│                                     │
└─────────────────────────────────────┘
```

### 3. Seletor de Avatar (no Editor)
```
┌─────────────────────────────────────┐
│  🎭 Escolher Avatar                  │
├─────────────────────────────────────┤
│  [Avatar 1] [Avatar 2] [Avatar 3]   │
│  [Criar novo avatar]                 │
└─────────────────────────────────────┘
```

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### Fase 1: Infraestrutura Base (3-5 dias)
- [ ] Criar estrutura de pastas
- [ ] Setup FastAPI services
- [ ] Configurar Supabase (tabelas)
- [ ] Setup storage (Supabase Storage)

### Fase 2: Processamento de Avatar (5-7 dias)
- [ ] Integrar Wav2Lip
- [ ] Integrar First Order Motion
- [ ] Criar pipeline de processamento
- [ ] API de criação de avatar

### Fase 3: Clonagem de Voz (3-5 dias)
- [ ] Integrar Coqui TTS XTTTS
- [ ] Pipeline de clonagem
- [ ] API de síntese de voz
- [ ] Suporte multi-idioma

### Fase 4: Interface do Usuário (5-7 dias)
- [ ] Tela de criação de avatar
- [ ] Botão na primeira tela
- [ ] Seletor de avatar
- [ ] Preview e player

### Fase 5: Integrações (5-7 dias)
- [ ] Integração com Reacts
- [ ] Integração com Editor
- [ ] Integração com Remotion
- [ ] Integração com narração

### Fase 6: Testes e Otimização (3-5 dias)
- [ ] Testes end-to-end
- [ ] Otimização de performance
- [ ] Redução de custos
- [ ] Documentação

**Total Estimado: 24-36 dias**

---

## 📊 MÉTRICAS DE SUCESSO

- ✅ Avatar criado em < 15 min (CPU) ou < 2 min (GPU)
- ✅ Qualidade de sincronização labial > 90%
- ✅ Qualidade de voz clonada > 85% similaridade
- ✅ Suporte a 10+ idiomas
- ✅ Custo por vídeo gerado < $0.10
- ✅ Integração seamless com Reacts e Editor

---

## 🔒 SEGURANÇA E PRIVACIDADE

- ✅ Vídeos processados apenas no servidor
- ✅ Modelos de avatar/voz armazenados criptografados
- ✅ Usuário pode deletar avatar/voz a qualquer momento
- ✅ Dados não compartilhados entre usuários
- ✅ Conformidade com LGPD/GDPR

---

## 📝 PRÓXIMOS PASSOS

1. **Aprovar arquitetura** ✅
2. **Setup inicial** (estrutura de pastas, Supabase)
3. **Implementar processamento** (Wav2Lip + Coqui TTS)
4. **Interface do usuário**
5. **Integrações**
6. **Deploy e testes**

---

**Status**: 📋 Planejamento Completo
**Próximo**: Aguardando aprovação para iniciar implementação

