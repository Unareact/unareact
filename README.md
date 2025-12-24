# UNA - Editor de Vídeo & Roteiros

Editor de vídeo profissional com geração de roteiros altamente eficazes usando IA e rastreador de vídeos virais globais.

## 🚀 Tecnologias Modernas

- **Next.js 16** - Framework React com App Router
- **React 19** - Biblioteca UI mais recente
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Estilização moderna
- **Zustand** - Gerenciamento de estado leve e moderno
- **Remotion** - Edição de vídeo programática em React
- **OpenAI GPT-4** - Geração inteligente de roteiros
- **YouTube Data API v3** - Rastreamento de vídeos virais
- **Lucide React** - Ícones modernos

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

1. Copie o arquivo `.env.local.example` para `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Adicione suas API Keys:
```env
# OpenAI API Key (para geração de roteiros)
NEXT_PUBLIC_OPENAI_API_KEY=sk-sua-chave-aqui

# YouTube Data API v3 Key (para vídeos virais)
YOUTUBE_API_KEY=sua-chave-youtube-aqui
```

### Como obter as API Keys:

**OpenAI:**
1. Acesse: https://platform.openai.com/api-keys
2. Crie uma nova API key
3. Cole no `.env.local`

**YouTube Data API:**
1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Ative a "YouTube Data API v3"
4. Crie credenciais (API Key)
5. Cole no `.env.local`

## 🎬 Funcionalidades

### ✨ Geração de Roteiros com IA
- Geração automática de roteiros baseados em tópico
- Configuração de estilo (educacional, entretenimento, promocional, documentário)
- Controle de tom (casual, formal, energético, calmo)
- Duração personalizável

### 🔥 Rastreador de Vídeos Virais
- **Vídeos trending globais** das últimas semanas
- **Métricas detalhadas**: views, likes, comentários
- **Viral Score** calculado automaticamente
- **Filtro por região** (Brasil, EUA, Reino Unido, etc.)
- **Download direto** para edição no app
- **Ranking de trending** em tempo real

### 🎥 Editor de Vídeo
- Timeline visual para organização de clips
- Preview em tempo real
- Controles de reprodução
- Suporte para vídeos, imagens e textos

### 📝 Editor de Roteiro
- Visualização segmentada do roteiro
- Edição inline de segmentos
- Organização por tipo (intro, conteúdo, transição, conclusão)
- Timestamps automáticos

## 🏃 Executar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
app/
├── components/
│   ├── editor/      # Componentes principais do editor
│   ├── script/      # Componentes de roteiro
│   ├── viral/       # Componentes de vídeos virais
│   ├── player/      # Player de vídeo
│   └── timeline/    # Timeline de edição
├── api/
│   └── viral/       # API routes para vídeos virais
├── stores/          # Zustand stores
├── lib/             # Utilitários e integrações
└── types/           # TypeScript types
```

## 🔮 Próximos Passos

- [ ] Integração completa com Remotion para renderização
- [ ] Upload de arquivos de vídeo
- [ ] Exportação de vídeo final
- [ ] Banco de dados para salvar projetos
- [ ] Autenticação de usuários
- [ ] Templates de roteiro
- [ ] Sincronização de áudio com roteiro
- [ ] Suporte para TikTok e Instagram (além do YouTube)

## ⚠️ Avisos Importantes

### Download de Vídeos
- O download de vídeos do YouTube pode violar os Termos de Serviço
- Para produção, considere usar serviços dedicados ou obter permissões adequadas
- A funcionalidade de download atual é uma base - implemente com cuidado legal

### API Keys
- **NUNCA** commite suas API keys no Git
- Use `.env.local` que está no `.gitignore`
- Rotacione suas keys regularmente por segurança

## 📄 Licença

MIT
