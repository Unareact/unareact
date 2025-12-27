# 🔑 Como Criar YouTube API Key no Google Cloud Console

## ⚠️ Importante

Você está vendo a tela de **OAuth Client ID**, mas para a YouTube Data API v3 você precisa de uma **API Key** (chave de API).

## 📋 Passo a Passo

### 1. Voltar para a Tela de Credenciais

- **Cancele** a criação do OAuth Client ID (botão "Cancelar" ou feche a janela)
- Você deve estar em: **APIs & Services** → **Credentials**

### 2. Criar API Key

Na tela de **Credentials**, você verá:

1. **No topo da página**, clique em **"+ CREATE CREDENTIALS"** (ou "Criar credenciais")
2. **No menu dropdown**, escolha: **"API Key"** (NÃO escolha "OAuth client ID")
3. Uma API Key será criada automaticamente
4. **Copie a chave** que aparece (começa com `AIzaSy...` e tem ~39 caracteres)

### 3. (Opcional) Restringir a API Key

Por segurança, você pode restringir a chave:

1. Clique na API Key criada para editá-la
2. Em **"API restrictions"**, selecione **"Restrict key"**
3. Escolha **"YouTube Data API v3"**
4. Clique em **"Save"**

### 4. Adicionar no .env.local

Abra o arquivo `.env.local` e atualize:

```env
YOUTUBE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Substitua** `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` pela chave real que você copiou.

### 5. Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

## 🔍 Diferença entre API Key e OAuth Client ID

- **API Key**: Usada para acessar APIs públicas (como YouTube Data API v3) sem autenticação de usuário
- **OAuth Client ID**: Usado para autenticar usuários e acessar dados privados deles

Para buscar vídeos trending do YouTube, você só precisa de uma **API Key**.

## ✅ Verificar se Funcionou

1. Acesse: http://localhost:3000/api/viral/debug
2. Verifique se:
   - `youtube.hasKey: true`
   - `youtube.keyLength: 39` (aproximadamente)

3. Teste a busca:
   - Vá em http://localhost:3000
   - Clique na aba "Virais"
   - Clique em "Buscar"
   - Deve aparecer vídeos do YouTube!

## 🆘 Problemas Comuns

### "API Key inválida"
- Verifique se copiou a chave completa (deve ter ~39 caracteres)
- Verifique se não há espaços extras

### "API não ativada"
- Vá em **APIs & Services** → **Library**
- Procure por **"YouTube Data API v3"**
- Clique em **"Enable"** (Ativar)

### "Quota exceeded"
- Você atingiu o limite diário (10.000 unidades)
- Aguarde 24 horas ou solicite aumento de quota

