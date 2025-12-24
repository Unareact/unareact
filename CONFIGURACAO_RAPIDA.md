# ⚡ Configuração Rápida - GitHub + Supabase + Vercel

## 🎯 Resumo dos Passos

### 1️⃣ GitHub (5 minutos)

```bash
# No terminal, na pasta do projeto:
cd /Users/air/una-app

# Se ainda não inicializou git:
git init
git add .
git commit -m "Initial commit"

# Conecte ao seu repositório GitHub:
git remote add origin https://github.com/SEU_USUARIO/una-app.git
git branch -M main
git push -u origin main
```

**O que fazer no GitHub:**
1. Criar repositório em: https://github.com/new
2. Nome: `una-app`
3. Escolher Private ou Public
4. **NÃO** marcar "Add README" (já temos)

---

### 2️⃣ Supabase (10 minutos)

**Passo 1:** Criar projeto
- Acesse: https://supabase.com/
- Clique em "New Project"
- Nome: `una-app`
- Escolha região (ex: São Paulo)
- **ANOTE A SENHA DO BANCO!**

**Passo 2:** Obter credenciais
- Vá em **Settings** → **API**
- Copie:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

**Passo 3:** Criar tabelas
- Vá em **SQL Editor**
- Cole o SQL do arquivo `GUIA_CONFIGURACAO_GITHUB_SUPABASE_VERCEL.md`
- Execute

---

### 3️⃣ Vercel (5 minutos)

**Passo 1:** Conectar repositório
- Acesse: https://vercel.com/
- Login com GitHub
- Clique em "Add New Project"
- Selecione `una-app`
- Clique em "Import"

**Passo 2:** Adicionar variáveis
- Vá em **Settings** → **Environment Variables**
- Adicione TODAS as variáveis do arquivo `env.example`
- **IMPORTANTE**: `SUPABASE_SERVICE_ROLE_KEY` SEM `NEXT_PUBLIC_`

**Passo 3:** Deploy
- Clique em "Deploy"
- Aguarde 2-3 minutos
- Pronto! URL: `https://una-app.vercel.app`

---

### 4️⃣ Configurar Localmente

```bash
# Copiar arquivo de exemplo
cp env.example .env.local

# Editar .env.local e preencher com suas credenciais
nano .env.local
# ou
code .env.local
```

**Variáveis necessárias:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
YOUTUBE_API_KEY=AIzaSy...
```

---

### 5️⃣ Testar

```bash
# Iniciar servidor local
npm run dev

# Testar Supabase
# Acesse: http://localhost:3000/api/test-supabase
```

---

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código enviado para GitHub
- [ ] Projeto criado no Supabase
- [ ] Tabelas criadas no Supabase
- [ ] Credenciais do Supabase copiadas
- [ ] Projeto conectado no Vercel
- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] Deploy feito no Vercel
- [ ] `.env.local` criado localmente
- [ ] Teste local funcionando

---

## 📚 Documentação Completa

Veja o arquivo `GUIA_CONFIGURACAO_GITHUB_SUPABASE_VERCEL.md` para instruções detalhadas.

---

## 🆘 Problemas?

**Erro: "Supabase URL not found"**
→ Verifique `.env.local` e reinicie o servidor

**Erro no Deploy do Vercel**
→ Verifique se todas as variáveis estão configuradas

**Erro: "Row Level Security policy violation"**
→ Verifique as políticas RLS no Supabase

