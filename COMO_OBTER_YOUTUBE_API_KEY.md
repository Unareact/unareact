# 🎬 Como Obter a API Key do YouTube

Guia completo passo a passo para obter sua API Key do YouTube Data API v3.

---

## 📋 Pré-requisitos

- Conta Google (Gmail)
- Acesso à internet
- 5-10 minutos

---

## 🚀 Passo a Passo Detalhado

### **Passo 1: Acessar Google Cloud Console**

1. Abra seu navegador
2. Acesse: **https://console.cloud.google.com/**
3. Faça login com sua conta Google

![Google Cloud Console](https://console.cloud.google.com/)

---

### **Passo 2: Criar um Novo Projeto**

1. No canto superior direito, clique no seletor de projeto (ao lado do logo do Google Cloud)
2. Clique em **"NEW PROJECT"** (Novo Projeto)
3. Preencha:
   - **Project name**: `UNA Video Editor` (ou qualquer nome)
   - **Organization**: Deixe como está (ou selecione se tiver)
   - **Location**: Deixe como está
4. Clique em **"CREATE"** (Criar)
5. Aguarde alguns segundos até o projeto ser criado
6. Selecione o projeto recém-criado no seletor de projetos

---

### **Passo 3: Ativar YouTube Data API v3**

1. No menu lateral esquerdo, clique em **"APIs & Services"** (APIs e Serviços)
2. Clique em **"Library"** (Biblioteca)
3. Na barra de busca, digite: **"YouTube Data API v3"**
4. Clique no resultado **"YouTube Data API v3"**
5. Clique no botão azul **"ENABLE"** (Ativar)
6. Aguarde alguns segundos até aparecer a mensagem de sucesso

✅ **API ativada com sucesso!**

---

### **Passo 4: Criar Credenciais (API Key)**

1. No menu lateral, clique em **"APIs & Services"** → **"Credentials"** (Credenciais)
2. Clique no botão **"+ CREATE CREDENTIALS"** (Criar Credenciais)
3. Selecione **"API Key"** (Chave de API)
4. Uma janela popup aparecerá com sua API Key
5. **COPIE A CHAVE** (ela começa com `AIzaSy...`)
6. ⚠️ **IMPORTANTE**: Anote ou copie agora, pois você não verá ela completa novamente!

---

### **Passo 5: (Opcional) Restringir a API Key**

Por segurança, é recomendado restringir a API Key:

1. Na janela que apareceu, clique em **"RESTRICT KEY"** (Restringir Chave)
2. Em **"API restrictions"**:
   - Selecione **"Restrict key"**
   - Marque apenas **"YouTube Data API v3"**
3. Em **"Application restrictions"** (opcional):
   - Pode deixar "Don't restrict" para desenvolvimento
   - Ou restringir por IP/HTTP referrer para produção
4. Clique em **"SAVE"** (Salvar)

---

### **Passo 6: Adicionar no Projeto**

1. Abra o arquivo `.env.local` na raiz do projeto
   - Se não existir, crie: `touch .env.local`
2. Adicione a linha:

```env
YOUTUBE_API_KEY=AIzaSy...sua-chave-completa-aqui
```

**Exemplo:**
```env
YOUTUBE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. Salve o arquivo

---

### **Passo 7: Reiniciar o Servidor**

No terminal, pare o servidor (Ctrl+C) e inicie novamente:

```bash
npm run dev
```

---

### **Passo 8: Testar**

1. Recarregue a página do app (F5)
2. Vá para a seção "Virais" ou "YouTube"
3. Tente buscar vídeos
4. Se funcionar, está tudo certo! ✅

---

## 💰 Custos e Limites

### **Gratuito:**
- **10.000 unidades/dia** (quota diária)
- Renovação automática a cada 24h

### **O que consome unidades:**
- Buscar vídeos: ~100 unidades
- Obter detalhes de 1 vídeo: ~1 unidade
- Listar trending: ~100 unidades

### **Exemplo de uso:**
- ~100 buscas de trending por dia = **GRATUITO** ✅
- ~1.000 análises de vídeos por dia = **GRATUITO** ✅

### **Se precisar mais:**
- Pode solicitar aumento de quota no Google Cloud Console
- Geralmente aprovam até 1 milhão/dia para projetos legítimos

---

## ⚠️ Problemas Comuns

### **Erro: "API Key inválida"**

**Solução:**
1. Verifique se copiou a chave completa (começa com `AIzaSy`)
2. Verifique se não há espaços extras no `.env.local`
3. Certifique-se que a API está ativada no Google Cloud Console

---

### **Erro: "Quota exceeded" (Cota excedida)**

**Solução:**
1. Você atingiu o limite de 10.000 unidades/dia
2. Aguarde 24 horas para renovar
3. Ou solicite aumento de quota no Google Cloud Console

---

### **Erro: "API não ativada"**

**Solução:**
1. Vá em **APIs & Services** → **Library**
2. Busque "YouTube Data API v3"
3. Certifique-se que está **"ENABLED"** (Ativada)
4. Se não estiver, clique em **"ENABLE"**

---

### **Erro: "Project not found"**

**Solução:**
1. Verifique se selecionou o projeto correto no Google Cloud Console
2. Certifique-se que o projeto foi criado com sucesso

---

## 🔒 Segurança

### **Nunca faça:**
- ❌ Commitar o `.env.local` no Git
- ❌ Compartilhar sua API Key publicamente
- ❌ Colocar a API Key no código fonte
- ❌ Usar a mesma key em múltiplos projetos públicos

### **Sempre faça:**
- ✅ Manter `.env.local` no `.gitignore`
- ✅ Restringir a API Key por API (só YouTube Data API v3)
- ✅ Usar variáveis de ambiente
- ✅ Rotacionar keys se suspeitar de vazamento

---

## 📚 Recursos Adicionais

- **Documentação oficial**: https://developers.google.com/youtube/v3
- **Console do Google Cloud**: https://console.cloud.google.com/
- **Quotas e limites**: https://developers.google.com/youtube/v3/getting-started#quota

---

## ✅ Checklist Final

- [ ] Projeto criado no Google Cloud Console
- [ ] YouTube Data API v3 ativada
- [ ] API Key criada e copiada
- [ ] API Key adicionada no `.env.local`
- [ ] Servidor reiniciado
- [ ] Teste funcionando

---

## 🎉 Pronto!

Agora você tem sua API Key do YouTube configurada e pode usar todas as funcionalidades do app que dependem dela!

**Dúvidas?** Consulte os outros guias:
- `CONFIGURAR_API_KEY.md` - Configuração rápida
- `COMO_OBTER_API_KEY.md` - Guia resumido
- `TROUBLESHOOTING_VIDEOS.md` - Solução de problemas

