# ✅ Verificação da Integração OpenAI

## 🎯 Status: **JÁ ESTÁ INTEGRADA!**

A OpenAI já está integrada no código. Você só precisa configurar a API Key.

---

## 📍 Onde a OpenAI é usada:

### 1. **Geração de Roteiros** (`app/lib/openai.ts`)
- Função: `generateScript()`
- Usado em: Painel "Roteiro" → Gerar roteiro com IA

### 2. **Diagnóstico Viral** (`app/api/diagnosis/route.ts`)
- Função: Análise de vídeos virais
- Usado em: Painel "Virais" → Botão "Diagnóstico"

---

## ⚙️ Configuração Necessária:

### Passo 1: Obter API Key da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Faça login (ou crie conta)
3. Clique em **"Create new secret key"**
4. Dê um nome (ex: "UNA App")
5. Copie a chave (começa com `sk-...`)

⚠️ **IMPORTANTE:** A chave só aparece uma vez! Copie e guarde.

---

### Passo 2: Adicionar no `.env.local`

Abra o arquivo `.env.local` e adicione:

```env
# OpenAI API Key (para geração de roteiros e diagnósticos)
NEXT_PUBLIC_OPENAI_API_KEY=sk-sua-chave-aqui
```

**OU** (se preferir usar variável de servidor):

```env
# OpenAI API Key (apenas no servidor - mais seguro)
OPENAI_API_KEY=sk-sua-chave-aqui
```

---

### Passo 3: Reiniciar o servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

---

## ✅ Como Verificar se Funcionou:

### Teste 1: Gerar Roteiro
1. Vá para o painel **"Roteiro"**
2. Digite um tópico
3. Clique em **"Gerar Roteiro com IA"**
4. Se funcionar, o roteiro será gerado ✅

### Teste 2: Diagnóstico Viral
1. Vá para o painel **"Virais"**
2. Clique em **"Diagnóstico"** em um vídeo
3. Clique em **"Gerar Diagnóstico com IA"**
4. Se funcionar, a análise será gerada ✅

---

## 🆘 Problemas Comuns:

### Erro: "OpenAI API Key não configurada"
- ✅ Verifique se a chave está no `.env.local`
- ✅ Verifique se não há espaços extras
- ✅ Reinicie o servidor após adicionar

### Erro: "Invalid API Key"
- ✅ Verifique se copiou a chave completa
- ✅ Verifique se a chave começa com `sk-`
- ✅ Verifique se não expirou (gere uma nova)

### Erro: "Insufficient quota"
- ✅ Você atingiu o limite de créditos
- ✅ Adicione créditos em: https://platform.openai.com/account/billing

---

## 💰 Custos da OpenAI:

- **GPT-4o**: ~$0.005 por 1K tokens (entrada) / ~$0.015 por 1K tokens (saída)
- **Geração de Roteiro**: ~$0.01-0.05 por roteiro
- **Diagnóstico Viral**: ~$0.05-0.15 por diagnóstico

💡 **Dica:** Comece com $5-10 de créditos para testar.

---

## 🎯 Resumo:

✅ **Integração:** Já está feita no código  
✅ **Configuração:** Só precisa adicionar a API Key no `.env.local`  
✅ **Teste:** Use os painéis "Roteiro" e "Virais"  

**Pronto para usar!** 🚀



