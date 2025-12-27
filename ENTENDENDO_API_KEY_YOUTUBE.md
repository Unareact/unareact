# 🔑 Entendendo a API Key do YouTube

## ❓ Pergunta Comum: "Troquei a conta do YouTube, preciso trocar a API Key?"

**Resposta curta:** Depende de qual conta você trocou!

---

## 🎯 Como Funciona a API Key do YouTube

### **A API Key NÃO está vinculada à sua conta do YouTube**

A API Key do YouTube Data API v3 é vinculada ao:
- ✅ **Projeto do Google Cloud Console** (onde você criou a API Key)
- ✅ **Conta Google que criou o projeto no Google Cloud**

A API Key **NÃO** está vinculada a:
- ❌ Conta do YouTube que você usa para assistir vídeos
- ❌ Canal do YouTube específico
- ❌ Login no YouTube

---

## 📊 Cenários: Quando Precisa Trocar a API Key?

### **Cenário 1: Você trocou a conta do YouTube (para assistir vídeos)**

**Exemplo:** Você estava logado no YouTube com `conta1@gmail.com` e agora está com `conta2@gmail.com`

**Resposta:** ❌ **NÃO precisa trocar!**

A API Key continua funcionando normalmente. Ela busca dados **públicos** do YouTube, não precisa estar logado em nenhuma conta específica.

---

### **Cenário 2: Você trocou a conta do Google Cloud Console**

**Exemplo:** Você criou a API Key com `conta1@gmail.com` no Google Cloud, mas agora quer usar `conta2@gmail.com`

**Resposta:** ✅ **SIM, precisa criar uma nova API Key!**

Você precisa:
1. Fazer login no Google Cloud Console com a nova conta
2. Criar um novo projeto (ou usar um existente)
3. Ativar a YouTube Data API v3
4. Criar uma nova API Key
5. Atualizar no `.env.local`

---

### **Cenário 3: Você quer usar um projeto diferente no Google Cloud**

**Exemplo:** Você tem múltiplos projetos no Google Cloud e quer trocar de projeto

**Resposta:** ✅ **SIM, precisa usar a API Key do projeto correto!**

Cada projeto tem sua própria API Key. Se você quer usar outro projeto:
1. Vá no Google Cloud Console
2. Selecione o projeto desejado
3. Vá em **APIs & Services** → **Credentials**
4. Copie a API Key desse projeto
5. Atualize no `.env.local`

---

## 🔍 Como Verificar Qual Conta/Projeto Está Sendo Usada?

### **Passo 1: Verificar qual API Key está configurada**

No terminal:
```bash
cd /Users/air/una-app
grep YOUTUBE_API_KEY .env.local
```

### **Passo 2: Verificar no Google Cloud Console**

1. Acesse: https://console.cloud.google.com/
2. Verifique qual conta está logada (canto superior direito)
3. Verifique qual projeto está selecionado (canto superior, ao lado do logo)
4. Vá em **APIs & Services** → **Credentials**
5. Veja se a API Key listada corresponde à que está no `.env.local`

---

## ✅ Teste Rápido: A API Key Está Funcionando?

Para testar se sua API Key atual está funcionando:

1. Reinicie o servidor:
   ```bash
   npm run dev
   ```

2. No app, vá para a seção "Virais" ou "YouTube"

3. Tente buscar vídeos

4. Se funcionar = ✅ API Key está OK!
5. Se der erro = ❌ Precisa verificar/atualizar

---

## 🔄 Como Atualizar a API Key (Se Precisar)

### **Se você trocou a conta do Google Cloud:**

1. Acesse: https://console.cloud.google.com/
2. Faça login com a **nova conta**
3. Crie um novo projeto (ou selecione existente)
4. Ative a **YouTube Data API v3**
5. Crie uma nova **API Key**
6. Copie a nova chave
7. Atualize o `.env.local`:
   ```bash
   # Edite o arquivo .env.local
   # Substitua a linha:
   YOUTUBE_API_KEY=nova-chave-aqui
   ```
8. Reinicie o servidor

---

## 💡 Dica Importante

**Uma API Key pode ser usada em múltiplos projetos/apps!**

Você não precisa criar uma API Key nova para cada app. A mesma API Key pode ser usada em:
- ✅ Múltiplos projetos Next.js
- ✅ Múltiplos apps
- ✅ Desenvolvimento e produção

**Mas cuidado:** Se você compartilhar a API Key, outras pessoas poderão usar sua quota diária!

---

## 🎯 Resumo

| Situação | Precisa Trocar? |
|----------|----------------|
| Troquei conta do YouTube (assistir vídeos) | ❌ Não |
| Troquei conta do Google Cloud Console | ✅ Sim |
| Quero usar outro projeto no Google Cloud | ✅ Sim |
| API Key parou de funcionar | ✅ Sim (criar nova) |

---

## 🆘 Ainda com Dúvidas?

Se não tiver certeza, teste primeiro:
1. Tente usar o app
2. Se funcionar = está tudo OK! ✅
3. Se não funcionar = precisa atualizar a API Key

**Dúvida sobre qual conta usar?**
- Use a conta do Google Cloud Console onde você criou o projeto
- Não importa qual conta do YouTube você usa para assistir vídeos

