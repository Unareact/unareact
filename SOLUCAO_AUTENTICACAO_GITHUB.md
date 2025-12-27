# 🔐 Solução: Autenticação GitHub

## ❌ Problema Encontrado

```
remote: Permission to Unareact/unareact.git denied to Herbalead.
fatal: unable to access 'https://github.com/Unareact/unareact.git/': The requested URL returned error: 403
```

## ✅ Soluções

### Opção 1: Usar Personal Access Token (Recomendado)

**Passo 1:** Criar Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Preencha:
   - **Note**: "UNA App - Local Development"
   - **Expiration**: Escolha (ex: 90 days)
   - **Scopes**: Marque `repo` (acesso completo aos repositórios)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN** (você só verá uma vez!)

**Passo 2:** Usar Token no Git

Quando fizer `git push`, use o token como senha:

```bash
cd /Users/air/una-app
git push -u origin main
# Username: SeuUsernameGitHub
# Password: cole_o_token_aqui (não sua senha!)
```

**Ou configure o Git para usar o token:**

```bash
# Configurar credenciais (macOS)
git config --global credential.helper osxkeychain

# Depois, no primeiro push, ele vai pedir:
# Username: SeuUsernameGitHub
# Password: cole_o_token_aqui
```

### Opção 2: Verificar Permissões do Repositório

1. Acesse: https://github.com/Unareact/unareact/settings/access
2. Verifique se você tem permissão de **Write** ou **Admin**
3. Se não tiver, peça para o dono do repositório adicionar você como colaborador

### Opção 3: Usar GitHub CLI (gh)

```bash
# Instalar GitHub CLI (se não tiver)
brew install gh

# Autenticar
gh auth login

# Depois fazer push normalmente
git push -u origin main
```

### Opção 4: Criar Novo Repositório Próprio

Se você não tem permissão no `Unareact/unareact`, crie seu próprio:

1. Acesse: https://github.com/new
2. Crie: `una-app` (ou outro nome)
3. Execute:

```bash
cd /Users/air/una-app
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/una-app.git
git push -u origin main
```

---

## 🎯 Solução Rápida (Recomendada)

**Use Personal Access Token:**

1. Crie token: https://github.com/settings/tokens
2. Configure credenciais:
```bash
git config --global credential.helper osxkeychain
```
3. Faça push (vai pedir username e token):
```bash
git push -u origin main
```

---

## ✅ Verificar se Funcionou

```bash
git remote -v
# Deve mostrar: origin  https://github.com/Unareact/unareact.git

# Depois do push bem-sucedido:
git log --oneline
# Deve mostrar seus commits
```

Acesse https://github.com/Unareact/unareact e confirme que os arquivos apareceram!



