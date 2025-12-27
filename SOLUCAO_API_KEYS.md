# 🔧 Solução: APIs Não Estão Funcionando

## ❌ Problema Identificado

As APIs do YouTube e TikTok não estão retornando vídeos porque:

1. **TikTok API Key é um placeholder**: `sua-chave-rapidapi-aqui` (não é uma chave real)
2. **YouTube API Key pode estar incompleta**: Tem apenas 9 caracteres (deveria ter ~39)

## ✅ Solução

### 1. Configurar TikTok API Key Real

1. Acesse: https://rapidapi.com/
2. Faça login ou crie uma conta
3. Procure por "TikTok API" na busca
4. Escolha um provedor (ex: "TikTok API" ou "TikTok Scraper")
5. Clique em **"Subscribe"** → Escolha o plano **"Basic"** (gratuito para testar)
6. Vá na aba **"Code Snippets"** ou **"Headers"**
7. Copie:
   - **X-RapidAPI-Key**: A chave longa (ex: `abc123def456...`)
   - **X-RapidAPI-Host**: O host (ex: `tiktok-api23.p.rapidapi.com`)

8. Edite o arquivo `.env.local`:
```env
TIKTOK_RAPIDAPI_KEY=sua-chave-real-aqui
TIKTOK_RAPIDAPI_HOST=tiktok-api23.p.rapidapi.com
```

### 2. Verificar YouTube API Key

1. Acesse: https://console.cloud.google.com/
2. Vá em **"APIs & Services"** → **"Credentials"**
3. Verifique se sua API Key tem ~39 caracteres (ex: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
4. Se estiver incompleta, crie uma nova:
   - Clique em **"Create Credentials"** → **"API Key"**
   - Copie a nova chave
5. Edite o arquivo `.env.local`:
```env
YOUTUBE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

## 🔍 Verificar se Funcionou

1. Acesse: http://localhost:3000/api/viral/debug
2. Verifique se:
   - ✅ YouTube: `hasKey: true` e `keyLength: 39` (aproximadamente)
   - ✅ TikTok: `hasKey: true` e `keyLength: 30+` (não deve ser "sua-chave-...")

3. Teste a busca:
   - Vá em http://localhost:3000
   - Clique na aba "Virais"
   - Clique em "Buscar"
   - Deve aparecer vídeos!

## 📊 Ver Logs Detalhados

No terminal onde roda `npm run dev`, você verá:

- `🔍 Buscando YouTube: X região(ões)`
- `📡 Chamando YouTube API para região XX...`
- `✅ Região XX: Y vídeos encontrados`
- `🎵 Buscando TikTok: maxResults=X`
- `📊 TikTok: X vídeos recebidos da API`

Se aparecer:
- `❌ YouTube API Key parece ser um placeholder` → Configure uma chave real
- `❌ TikTok API Key parece ser um placeholder` → Configure uma chave real da RapidAPI

## 🆘 Ainda Não Funciona?

1. **Verifique os logs do servidor** - veja se há erros específicos
2. **Teste a API diretamente**:
   ```bash
   curl "http://localhost:3000/api/viral?platform=youtube&region=US&maxResults=5"
   ```
3. **Verifique se as APIs estão ativadas**:
   - YouTube: https://console.cloud.google.com/ → APIs & Services → Library → YouTube Data API v3
   - TikTok: Verifique se está inscrito no plano da RapidAPI

