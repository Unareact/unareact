# 🔧 Solução: Erro 500 ao Buscar Vídeos

## ✅ Diagnóstico

O endpoint da API está funcionando (testado com sucesso), mas o frontend está mostrando erro porque:

**O servidor Next.js precisa ser reiniciado para carregar as variáveis de ambiente do `.env.local`**

---

## 🚀 Solução Rápida (2 minutos)

### **Passo 1: Parar o Servidor**

No terminal onde o servidor está rodando:

1. Pressione `Ctrl + C` (ou `Cmd + C` no Mac)
2. Aguarde o servidor parar completamente

### **Passo 2: Reiniciar o Servidor**

```bash
cd /Users/air/una-app
npm run dev
```

### **Passo 3: Recarregar a Página**

1. No navegador, pressione `Ctrl + Shift + R` (ou `Cmd + Shift + R` no Mac) para recarregar sem cache
2. Ou feche e abra a aba novamente
3. Acesse: http://localhost:3000

### **Passo 4: Testar**

1. Vá em **"Virais"**
2. Clique em **"Buscar"**
3. Deve funcionar! ✅

---

## ✅ Verificação

Após reiniciar, você pode testar se está funcionando:

```bash
# Teste rápido da API
curl http://localhost:3000/api/test-youtube
```

Se retornar `"success": true`, está tudo certo!

---

## 🎯 Por Que Isso Acontece?

O Next.js carrega as variáveis de ambiente do `.env.local` apenas quando o servidor inicia. Se você:

- Adicionou a API Key depois que o servidor já estava rodando
- Editou o `.env.local` sem reiniciar
- Mudou qualquer variável de ambiente

**Sempre precisa reiniciar o servidor!**

---

## 📝 Checklist

- [ ] Servidor parado (Ctrl+C)
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Página recarregada (Ctrl+Shift+R)
- [ ] Testado buscar vídeos em "Virais"
- [ ] Funcionou! ✅

---

## 🆘 Se Ainda Não Funcionar

1. Verifique se a API Key está no `.env.local`:
   ```bash
   grep YOUTUBE_API_KEY .env.local
   ```

2. Verifique se o arquivo está na raiz do projeto:
   ```bash
   ls -la .env.local
   ```

3. Teste a API diretamente:
   ```bash
   curl http://localhost:3000/api/test-youtube
   ```

4. Se ainda der erro, verifique os logs do servidor no terminal

---

**Depois de reiniciar, deve funcionar perfeitamente!** 🚀

