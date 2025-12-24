# 🔑 Como Configurar a YouTube API Key

## ⚠️ Erro Atual

O app está mostrando o erro porque a `YOUTUBE_API_KEY` não está configurada.

---

## 🚀 Solução Rápida

### Passo 1: Obter API Key do YouTube

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Crie um novo projeto (ou selecione um existente)
4. Vá em **"APIs & Services"** → **"Library"**
5. Procure por **"YouTube Data API v3"**
6. Clique em **"Enable"** (Ativar)
7. Vá em **"APIs & Services"** → **"Credentials"**
8. Clique em **"Create Credentials"** → **"API Key"**
9. Copie a API Key gerada

### Passo 2: Criar arquivo .env.local

No terminal, na pasta do projeto:

```bash
cd /Users/air/una-app
```

Crie o arquivo `.env.local`:

```bash
touch .env.local
```

### Passo 3: Adicionar a API Key

Abra o arquivo `.env.local` e adicione:

```env
YOUTUBE_API_KEY=sua-api-key-aqui
NEXT_PUBLIC_OPENAI_API_KEY=sua-openai-key-aqui
```

**Substitua:**
- `sua-api-key-aqui` pela API Key do YouTube que você copiou
- `sua-openai-key-aqui` pela sua OpenAI API Key (se tiver)

### Passo 4: Reiniciar o servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

---

## 📝 Exemplo de .env.local

```env
# YouTube Data API v3
YOUTUBE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI API (para geração de roteiros)
NEXT_PUBLIC_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Verificar se Funcionou

1. Reinicie o servidor
2. Recarregue a página (F5)
3. Vá para o painel "Virais"
4. O erro deve desaparecer e os vídeos devem aparecer

---

## 🆘 Problemas Comuns

### Erro: "API Key inválida"
- Verifique se copiou a key completa
- Verifique se não há espaços extras
- Certifique-se que a API está ativada no Google Cloud

### Erro: "Quota exceeded"
- Você atingiu o limite diário (10.000 unidades)
- Aguarde 24h ou solicite aumento de quota

### Erro: "API não ativada"
- Vá no Google Cloud Console
- Ative a "YouTube Data API v3"
- Aguarde alguns minutos

---

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- NUNCA commite o arquivo `.env.local` no Git
- Ele já está no `.gitignore`
- Não compartilhe sua API Key publicamente

---

**Depois de configurar, reinicie o servidor e teste novamente!** 🚀

