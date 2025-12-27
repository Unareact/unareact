# 🔧 Troubleshooting: Erro 403 Forbidden no TikTok API

## ⚠️ Erro Encontrado

```
403 Forbidden: TikTok API error
```

---

## 🔍 Causas Comuns

### 1. **Não Inscrito no Plano da API** (Mais Comum) ⚠️

**Problema:** Você precisa se inscrever no plano da API no RapidAPI antes de usar.

**Solução:**
1. Acesse: https://rapidapi.com/Lundehund/api/tiktok-api23
2. Clique no botão **"Subscribe to Test"** (azul, no topo)
3. Escolha um plano:
   - **Free** (se disponível) - para testes
   - **Basic** ou **Pro** - para produção
4. Confirme a inscrição
5. Aguarde alguns segundos
6. Tente novamente

---

### 2. **API Key Inválida ou Expirada**

**Problema:** A chave pode ter sido revogada ou está incorreta.

**Solução:**
1. Acesse: https://rapidapi.com/hub
2. Vá em **"My Apps"** → **"default-application_11423630"**
3. Veja se a chave está ativa
4. Se necessário, gere uma nova chave
5. Atualize no `.env.local`

---

### 3. **Plano Não Permite Este Endpoint**

**Problema:** O plano gratuito pode não incluir o endpoint `/api/post/trending`.

**Solução:**
1. Verifique o plano atual no RapidAPI
2. Veja quais endpoints estão disponíveis
3. Se necessário, faça upgrade do plano
4. Ou use outro endpoint disponível

---

### 4. **Headers Incorretos**

**Problema:** Os headers podem estar incorretos.

**Verificar:**
- `x-rapidapi-host` deve ser: `tiktok-api23.p.rapidapi.com`
- `x-rapidapi-key` deve ser sua chave completa

**Solução:**
1. Verifique o `.env.local`:
   ```env
   TIKTOK_RAPIDAPI_KEY=c05a032bc6msh89025088bbd9568p1c6063jsn3102e7b3e496
   TIKTOK_RAPIDAPI_HOST=tiktok-api23.p.rapidapi.com
   ```
2. Reinicie o servidor após alterar

---

## ✅ Passo a Passo para Resolver

### Passo 1: Verificar Inscrição no Plano

1. Acesse: https://rapidapi.com/Lundehund/api/tiktok-api23
2. Veja se há um botão **"Subscribe"** ou **"Subscribe to Test"**
3. Se sim, clique e escolha um plano
4. Aguarde confirmação

### Passo 2: Testar no Playground do RapidAPI

1. Acesse o endpoint no RapidAPI
2. Clique em **"GET Get Trending Posts"**
3. Clique em **"Test Endpoint"** ou **"Run"**
4. Veja se funciona no playground
5. Se funcionar no playground mas não no app, o problema é na configuração

### Passo 3: Verificar Variáveis de Ambiente

1. Abra `.env.local`
2. Verifique se as variáveis estão corretas:
   ```env
   TIKTOK_RAPIDAPI_KEY=c05a032bc6msh89025088bbd9568p1c6063jsn3102e7b3e496
   TIKTOK_RAPIDAPI_HOST=tiktok-api23.p.rapidapi.com
   ```
3. Reinicie o servidor:
   ```bash
   npm run dev
   ```

### Passo 4: Verificar Logs

1. Veja os logs do servidor
2. Procure por mensagens de erro
3. Verifique se a chave está sendo lida corretamente

---

## 🧪 Teste Rápido no Terminal

Teste a API diretamente:

```bash
curl --request GET \
  'https://tiktok-api23.p.rapidapi.com/api/post/trending?count=10' \
  --header 'x-rapidapi-host: tiktok-api23.p.rapidapi.com' \
  --header 'x-rapidapi-key: c05a032bc6msh89025088bbd9568p1c6063jsn3102e7b3e496'
```

**Se retornar 403:** Você precisa se inscrever no plano.

**Se retornar 200:** A API funciona, o problema está no código do app.

---

## 📋 Checklist de Verificação

- [ ] **Inscrito no plano da API?**
  - Acessou a página da API?
  - Clicou em "Subscribe to Test"?
  - Escolheu um plano?

- [ ] **API Key está correta?**
  - Verificou no RapidAPI?
  - Está no `.env.local`?
  - Servidor foi reiniciado?

- [ ] **Headers estão corretos?**
  - `x-rapidapi-host` correto?
  - `x-rapidapi-key` completo?

- [ ] **Testou no playground?**
  - Funciona no RapidAPI?
  - Retorna dados?

---

## 💡 Solução Mais Provável

**99% das vezes é:** Você precisa se inscrever no plano da API.

**Como fazer:**
1. Acesse: https://rapidapi.com/Lundehund/api/tiktok-api23
2. Clique em **"Subscribe to Test"**
3. Escolha um plano (Free se disponível)
4. Tente novamente

---

## 🆘 Se Nada Funcionar

### Alternativa 1: Usar Outro Endpoint

Se o endpoint `/api/post/trending` não funcionar, tente:
- `/api/user/popular-posts` (precisa de username)
- Outros endpoints disponíveis

### Alternativa 2: Usar Outra API

Se esta API não funcionar:
- Tente "Tiktok Scraper (by TIKWM-Default)" no RapidAPI
- Ou considere SocialKit ($30/mês)

---

## 📝 Resumo

**Erro 403 = Não autorizado**

**Causas:**
1. Não inscrito no plano (mais comum)
2. API key inválida
3. Plano não permite endpoint
4. Headers incorretos

**Solução:**
1. Inscreva-se no plano no RapidAPI
2. Verifique a API key
3. Teste no playground
4. Reinicie o servidor

---

**Agora:** Acesse a página da API e clique em "Subscribe to Test"! 🚀

