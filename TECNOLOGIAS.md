# 🛠️ Stack Tecnológica - UNA Editor

## Tecnologias Implementadas

### Frontend Core
- **Next.js 16.1.1** - Framework React com App Router (mais recente)
- **React 19.2.3** - Biblioteca UI mais moderna
- **TypeScript 5** - Type safety completo
- **Tailwind CSS 4** - Framework CSS utility-first mais recente

### Gerenciamento de Estado
- **Zustand** - State management leve, moderno e performático
  - Alternativa moderna ao Redux
  - API simples e direta
  - Sem boilerplate excessivo

### Edição de Vídeo
- **Remotion** - Framework React para criar vídeos programaticamente
  - `@remotion/player` - Player de vídeo React
  - `@remotion/bundler` - Bundler para renderização
  - Permite criar vídeos usando componentes React

### IA e Roteiros
- **OpenAI SDK** - Integração com GPT-4
  - Geração inteligente de roteiros
  - Modelo: GPT-4o (mais recente e eficiente)
  - JSON mode para respostas estruturadas

### UI Components
- **Lucide React** - Ícones modernos e leves
- **Radix UI** - Componentes acessíveis e sem estilo
  - Dialog, Select, Slider, Tabs, Toast
- **clsx** + **tailwind-merge** - Utilitários para classes CSS

## Arquitetura

### Estrutura de Pastas
```
app/
├── components/
│   ├── editor/      # MainEditor - componente principal
│   ├── script/      # ScriptGenerator, ScriptEditor
│   ├── player/      # VideoPlayer
│   └── timeline/    # Timeline
├── stores/          # Zustand stores (editor-store.ts)
├── lib/             # Utilitários (utils.ts, openai.ts)
└── types/           # TypeScript interfaces
```

### Fluxo de Dados
1. **Geração de Roteiro**: Usuário → ScriptGenerator → OpenAI API → Store → ScriptEditor
2. **Edição**: Store (Zustand) → Componentes React → UI
3. **Vídeo**: Clips → Timeline → VideoPlayer → Preview

## Próximas Integrações Sugeridas

### Backend & Database
- **Supabase** ou **PostgreSQL** - Para salvar projetos
- **NextAuth.js** - Autenticação
- **Prisma** - ORM moderno

### Storage
- **Cloudinary** - Para upload e processamento de vídeos
- **AWS S3** - Alternativa para storage

### Processamento de Vídeo
- **ffmpeg.wasm** - Processamento no browser (alternativa ao Remotion)
- **Web Workers** - Para processamento pesado sem travar UI

### Melhorias de UI
- **Framer Motion** - Animações avançadas
- **React DnD** - Drag and drop na timeline
- **Lexical** ou **TipTap** - Editor de texto rico para roteiros

## Manutenção e Atualizações

### Verificar Versões
```bash
npm outdated
```

### Atualizar Dependências
```bash
npm update
```

### Tecnologias Sempre Atualizadas
- Next.js: `npm install next@latest`
- React: `npm install react@latest react-dom@latest`
- Remotion: `npm install remotion@latest`
- OpenAI: `npm install openai@latest`

## Performance

- **Code Splitting**: Automático com Next.js
- **Tree Shaking**: Remoção de código não usado
- **SSR/SSG**: Renderização otimizada
- **Image Optimization**: Next.js Image component

## Segurança

- API Keys no `.env.local` (não versionado)
- Validação de dados com TypeScript
- Sanitização de inputs do usuário

