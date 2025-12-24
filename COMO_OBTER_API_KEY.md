# 🔑 Guia Rápido: Obter YouTube API Key

## ⚡ Passo a Passo (5 minutos)

### 1. Acesse Google Cloud Console
👉 https://console.cloud.google.com/

### 2. Crie/Selecione Projeto
- Clique em "Select a project" (canto superior)
- Clique em "New Project"
- Nome: "UNA Video Editor" (ou qualquer nome)
- Clique em "Create"

### 3. Ative YouTube Data API
- No menu lateral: **APIs & Services** → **Library**
- Busque: "YouTube Data API v3"
- Clique no resultado
- Clique em **"ENABLE"** (Ativar)

### 4. Crie API Key
- No menu lateral: **APIs & Services** → **Credentials**
- Clique em **"+ CREATE CREDENTIALS"**
- Selecione **"API Key"**
- ✅ API Key criada! Copie ela

### 5. Adicione no .env.local

Abra o arquivo `.env.local` na raiz do projeto e cole:

```env
YOUTUBE_API_KEY=COLE_SUA_KEY_AQUI
```

### 6. Reinicie o Servidor

```bash
# Pare o servidor (Ctrl+C no terminal)
# Inicie novamente
npm run dev
```

### 7. Teste
- Recarregue a página (F5)
- Vá em "Virais"
- Deve funcionar! ✅

---

## 🎯 Resumo Rápido

1. https://console.cloud.google.com/
2. Criar projeto
3. Ativar "YouTube Data API v3"
4. Criar API Key
5. Colar no `.env.local`
6. Reiniciar servidor

---

## ⚠️ Importante

- A API Key é **GRATUITA** até 10.000 unidades/dia
- Suficiente para ~100 buscas de trending por dia
- Não compartilhe sua key publicamente

---

**Pronto! Depois disso, o app vai funcionar perfeitamente!** 🚀

