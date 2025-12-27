# ✅ Como Verificar se Sua API Key Está Funcionando

## 🎯 Situação Atual

Você está logado no Google Cloud Console com:
- **Conta:** `unareact@gmail.com`
- **Projeto:** `integral-hold-482511-c2`
- **API:** YouTube Data API v3 está **ATIVADA** ✅

---

## 📋 Passo 1: Verificar API Key no Google Cloud Console

1. No Google Cloud Console (onde você está agora)
2. No menu lateral esquerdo, clique em **"APIs & Services"** → **"Credentials"** (Credenciais)
3. Você verá uma lista de API Keys
4. **Copie a API Key** que aparece lá (começa com `AIzaSy...`)

---

## 📋 Passo 2: Comparar com a API Key no Projeto

No terminal, execute:

```bash
cd /Users/air/una-app
grep YOUTUBE_API_KEY .env.local
```

**Compare:**
- Se a API Key do Google Cloud Console **é igual** à do `.env.local` = ✅ **Está tudo certo!**
- Se a API Key do Google Cloud Console **é diferente** = ⚠️ **Precisa atualizar!**

---

## 📋 Passo 3: Testar se Está Funcionando

### Opção A: Testar no App

1. Reinicie o servidor (se estiver rodando):
   ```bash
   npm run dev
   ```

2. Acesse: http://localhost:3000

3. Vá para a seção **"Virais"**

4. Tente buscar vídeos do YouTube

5. **Resultado:**
   - ✅ Se funcionar = API Key está OK!
   - ❌ Se der erro = Precisa criar nova API Key

---

## 🔄 Se Precisar Criar Nova API Key

Se a API Key atual não funcionar ou for diferente, siga estes passos:

### 1. No Google Cloud Console (onde você está)

1. Vá em **"APIs & Services"** → **"Credentials"**
2. Clique em **"+ CREATE CREDENTIALS"** (Criar Credenciais)
3. Selecione **"API Key"**
4. Uma janela popup aparecerá com a nova API Key
5. **COPIE A CHAVE** (começa com `AIzaSy...`)

### 2. Atualizar no Projeto

No terminal:

```bash
cd /Users/air/una-app
# Edite o arquivo .env.local
# Substitua a linha YOUTUBE_API_KEY pela nova chave
```

Ou use um editor de texto para editar o arquivo `.env.local` e substituir:
```env
YOUTUBE_API_KEY=nova-chave-aqui
```

### 3. Reiniciar o Servidor

```bash
npm run dev
```

### 4. Testar Novamente

Acesse o app e teste buscar vídeos.

---

## ✅ Resumo

| Situação | Ação |
|----------|------|
| API Key do Google Cloud = API Key do .env.local | ✅ Está OK! |
| API Key do Google Cloud ≠ API Key do .env.local | 🔄 Atualizar .env.local |
| App funciona ao buscar vídeos | ✅ Está OK! |
| App dá erro ao buscar vídeos | 🔄 Criar nova API Key |

---

## 🎯 Próximo Passo

**Agora mesmo:**
1. Vá em **"APIs & Services"** → **"Credentials"** no Google Cloud Console
2. Veja qual API Key está listada
3. Compare com a do `.env.local`
4. Se forem diferentes, copie a do Google Cloud e atualize o `.env.local`

**Depois:**
5. Teste no app se está funcionando

---

**Dúvida?** Se a API Key do Google Cloud Console for diferente da do `.env.local`, você precisa atualizar o `.env.local` com a chave correta!

