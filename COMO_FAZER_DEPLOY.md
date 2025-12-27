# 🚀 Como Fazer Deploy

## ⚠️ Situação Atual

Você tem **3 commits locais** que precisam ser enviados para o GitHub:

1. `ef8e1e6` - Integração completa do TikTok
2. `720ff85` - Upload de arquivos e timeline
3. `26939cd` - Configuração de deploy automático

## 📤 Opção 1: Push Manual (Recomendado)

### Passo 1: Fazer Push dos Commits

```bash
# Tentar push novamente
git push origin main
```

Se der erro de permissão, você precisa:

1. **Configurar autenticação GitHub:**
   ```bash
   # Usar token pessoal
   git remote set-url origin https://SEU_TOKEN@github.com/Unareact/unareact.git
   
   # OU configurar SSH
   git remote set-url origin git@github.com:Unareact/unareact.git
   ```

2. **Ou fazer push via interface do GitHub:**
   - Vá em: https://github.com/Unareact/unareact
   - Use a interface web para fazer upload dos arquivos

### Passo 2: Deploy Automático

Após o push, se você tiver Vercel conectado ao GitHub:
- O deploy acontece automaticamente
- Verifique em: https://vercel.com/dashboard

## 🔧 Opção 2: Deploy Direto no Vercel (Sem GitHub)

### Instalar Vercel CLI

```bash
npm i -g vercel
```

### Fazer Login

```bash
vercel login
```

### Deploy

```bash
# Deploy de produção
vercel --prod

# Ou usar o script
npm run deploy:vercel
```

## 🌐 Opção 3: Deploy Manual no Vercel

1. Acesse: https://vercel.com
2. Faça login
3. Clique em "Add New Project"
4. Conecte o repositório GitHub
5. Configure as variáveis de ambiente:
   - `YOUTUBE_API_KEY`
   - `TIKTOK_RAPIDAPI_KEY`
   - `TIKTOK_RAPIDAPI_HOST`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Clique em "Deploy"

## ✅ Verificar Deploy

Após o deploy, verifique:
- URL de produção no Vercel
- Logs de build no dashboard
- Variáveis de ambiente configuradas

## 🔑 Configurar Secrets no GitHub (Para Deploy Automático)

Se quiser que o GitHub Actions faça deploy automaticamente:

1. Vá em: https://github.com/Unareact/unareact/settings/secrets/actions
2. Adicione os secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - E todas as variáveis de ambiente

## 📝 Comandos Úteis

```bash
# Ver commits não enviados
git log origin/main..HEAD --oneline

# Ver status
git status

# Tentar push novamente
git push origin main

# Deploy direto Vercel
vercel --prod
```

