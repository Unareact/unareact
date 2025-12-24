# 🚀 Guia Completo: Configuração GitHub + Supabase + Vercel

Este guia vai te ajudar a configurar seu projeto UNA App no GitHub, Supabase e Vercel do zero.

---

## 📋 Índice

1. [Configuração do GitHub](#1-configuração-do-github)
2. [Configuração do Supabase](#2-configuração-do-supabase)
3. [Configuração do Vercel](#3-configuração-do-vercel)
4. [Variáveis de Ambiente](#4-variáveis-de-ambiente)
5. [Testando a Configuração](#5-testando-a-configuração)

---

## 1. Configuração do GitHub

### Passo 1.1: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `una-app` (ou o nome que preferir)
   - **Description**: "Editor de vídeo profissional com IA"
   - **Visibility**: Escolha **Private** (recomendado) ou **Public**
   - **NÃO marque** "Add a README file" (já temos um)
   - **NÃO marque** "Add .gitignore" (já temos um)
3. Clique em **"Create repository"**

### Passo 1.2: Conectar Repositório Local ao GitHub

No terminal, na pasta do projeto:

```bash
cd /Users/air/una-app

# Verificar se já é um repositório git
git status

# Se não for, inicializar:
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Initial commit: UNA App - Editor de vídeo com IA"

# Adicionar remote do GitHub (substitua SEU_USUARIO pelo seu username)
git remote add origin https://github.com/SEU_USUARIO/una-app.git

# Ou se preferir SSH:
# git remote add origin git@github.com:SEU_USUARIO/una-app.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

### Passo 1.3: Verificar

Acesse seu repositório no GitHub e confirme que todos os arquivos foram enviados.

---

## 2. Configuração do Supabase

### Passo 2.1: Criar Projeto no Supabase

1. Acesse: https://supabase.com/
2. Faça login ou crie uma conta
3. Clique em **"New Project"**
4. Preencha:
   - **Name**: `una-app` (ou o nome que preferir)
   - **Database Password**: Crie uma senha forte (ANOTE ELA!)
   - **Region**: Escolha a mais próxima (ex: `South America (São Paulo)`)
5. Clique em **"Create new project"**
6. Aguarde 2-3 minutos para o projeto ser criado

### Passo 2.2: Obter Credenciais do Supabase

1. No dashboard do Supabase, vá em **Settings** (⚙️) → **API**
2. Você verá:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (chave pública)
   - **service_role key**: `eyJhbGc...` (chave privada - NÃO compartilhe!)

### Passo 2.3: Criar Tabelas no Supabase

No dashboard do Supabase, vá em **SQL Editor** e execute:

```sql
-- Tabela de usuários (se usar autenticação)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de projetos de vídeo
CREATE TABLE IF NOT EXISTS video_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  script JSONB,
  clips JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vídeos virais salvos
CREATE TABLE IF NOT EXISTS saved_viral_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  video_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  title TEXT,
  metadata JSONB,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_viral_videos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajuste conforme necessário)
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own projects" ON video_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own projects" ON video_projects
  FOR SELECT USING (auth.uid() = user_id);
```

### Passo 2.4: Instalar Cliente Supabase no Projeto

No terminal:

```bash
cd /Users/air/una-app
npm install @supabase/supabase-js
```

---

## 3. Configuração do Vercel

### Passo 3.1: Conectar Projeto ao Vercel

1. Acesse: https://vercel.com/
2. Faça login com sua conta GitHub
3. Clique em **"Add New..."** → **"Project"**
4. Selecione o repositório `una-app` do GitHub
5. Clique em **"Import"**

### Passo 3.2: Configurar Build Settings

O Vercel detecta automaticamente Next.js, mas verifique:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (raiz)
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install` (automático)

### Passo 3.3: Adicionar Variáveis de Ambiente no Vercel

**IMPORTANTE**: Antes de fazer deploy, adicione todas as variáveis de ambiente:

1. No Vercel, vá em **Settings** → **Environment Variables**
2. Adicione cada variável (veja seção 4 abaixo)
3. Clique em **"Save"**

### Passo 3.4: Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Quando terminar, você terá uma URL: `https://una-app.vercel.app`

---

## 4. Variáveis de Ambiente

### 4.1: Arquivo Local (.env.local)

Crie o arquivo `.env.local` na raiz do projeto:

```bash
cd /Users/air/una-app
touch .env.local
```

Adicione as seguintes variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI (para geração de roteiros)
NEXT_PUBLIC_OPENAI_API_KEY=sk-...

# YouTube Data API v3
YOUTUBE_API_KEY=AIzaSy...

# Vercel (automático, não precisa adicionar manualmente)
# VERCEL_URL é definido automaticamente
```

### 4.2: Variáveis no Vercel

No Vercel, adicione **TODAS** as variáveis acima em:
- **Settings** → **Environment Variables**

**IMPORTANTE**: 
- Variáveis que começam com `NEXT_PUBLIC_` são expostas ao cliente
- Variáveis sem `NEXT_PUBLIC_` são apenas no servidor
- `SUPABASE_SERVICE_ROLE_KEY` deve ser **SEM** `NEXT_PUBLIC_` (segurança!)

---

## 5. Testando a Configuração

### 5.1: Testar Localmente

```bash
cd /Users/air/una-app
npm run dev
```

Acesse: http://localhost:3000

### 5.2: Testar Supabase

Crie um arquivo de teste: `app/api/test-supabase/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const { data, error } = await supabase
    .from('video_projects')
    .select('*')
    .limit(1)
  
  return Response.json({ data, error: error?.message })
}
```

Acesse: http://localhost:3000/api/test-supabase

### 5.3: Testar Deploy no Vercel

1. Faça um commit e push:
```bash
git add .
git commit -m "Add Supabase integration"
git push
```

2. O Vercel faz deploy automaticamente
3. Acesse sua URL do Vercel
4. Teste todas as funcionalidades

---

## 🔒 Segurança

### ✅ Boas Práticas

1. **NUNCA** commite `.env.local` no Git
2. **NUNCA** compartilhe `SUPABASE_SERVICE_ROLE_KEY`
3. Use `NEXT_PUBLIC_` apenas para variáveis que precisam estar no cliente
4. Configure Row Level Security (RLS) no Supabase
5. Use variáveis de ambiente no Vercel, não hardcode

### ⚠️ Checklist de Segurança

- [ ] `.env.local` está no `.gitignore`
- [ ] Variáveis sensíveis estão no Vercel
- [ ] RLS está habilitado no Supabase
- [ ] Service Role Key não está exposta no cliente
- [ ] API Keys têm restrições de domínio (quando possível)

---

## 🆘 Troubleshooting

### Erro: "Supabase URL not found"
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` está no `.env.local`
- Reinicie o servidor: `npm run dev`

### Erro: "Invalid API key"
- Verifique se copiou a chave completa (sem espaços)
- Confirme que está usando a chave correta (anon vs service_role)

### Erro no Deploy do Vercel
- Verifique se todas as variáveis estão configuradas
- Veja os logs em **Deployments** → **Build Logs**

### Erro: "Row Level Security policy violation"
- Verifique as políticas RLS no Supabase
- Ajuste as políticas conforme necessário

---

## 📚 Próximos Passos

1. ✅ Configurar autenticação com Supabase Auth
2. ✅ Implementar salvamento de projetos no Supabase
3. ✅ Adicionar upload de vídeos (Supabase Storage)
4. ✅ Configurar webhooks do Vercel
5. ✅ Adicionar analytics

---

## 📞 Suporte

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Última atualização**: 2024

