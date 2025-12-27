# 🚀 Deploy Automático

Este projeto está configurado para fazer deploy automático quando há push na branch `main`.

## 📋 Configuração

### GitHub Actions

O workflow `.github/workflows/deploy.yml` é executado automaticamente quando:
- Há push na branch `main`
- Execução manual via GitHub Actions

### Variáveis de Ambiente Necessárias

Configure no GitHub Secrets (Settings > Secrets and variables > Actions):

- `YOUTUBE_API_KEY` - Chave da API do YouTube
- `TIKTOK_RAPIDAPI_KEY` - Chave da RapidAPI para TikTok
- `TIKTOK_RAPIDAPI_HOST` - Host da RapidAPI para TikTok
- `OPENAI_API_KEY` - Chave da API da OpenAI
- `NEXT_PUBLIC_SUPABASE_URL` - URL do Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `VERCEL_TOKEN` - Token do Vercel (se usar Vercel)
- `VERCEL_ORG_ID` - ID da organização do Vercel
- `VERCEL_PROJECT_ID` - ID do projeto do Vercel

### Vercel (Recomendado)

Se você usa Vercel, o deploy automático já está configurado via GitHub integration:

1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente no dashboard do Vercel
3. Cada push na `main` fará deploy automático

## 🛠️ Scripts Disponíveis

```bash
# Deploy manual (commit + push)
npm run deploy

# Deploy no Vercel
npm run deploy:vercel

# Script de deploy automático
./scripts/auto-deploy.sh

# Script com build
./scripts/auto-deploy.sh --build
```

## 📝 Como Funciona

1. **Commit local**: Você faz commit das mudanças
2. **Push**: Push para `main` no GitHub
3. **GitHub Actions**: Workflow executa automaticamente
4. **Build**: Aplica build e testes
5. **Deploy**: Faz deploy no Vercel (ou outro serviço configurado)

## ⚠️ Notas

- O deploy automático só funciona se você tiver permissões de push no repositório
- Certifique-se de que todas as variáveis de ambiente estão configuradas
- O build pode falhar se faltar alguma dependência ou variável

