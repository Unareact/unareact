# 🚀 Comandos para Conectar ao GitHub

## Opção 1: Criar Novo Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `una-app`
   - **Description**: "Editor de vídeo profissional com IA"
   - **Visibility**: Private (recomendado) ou Public
   - **NÃO marque** "Add a README file"
   - **NÃO marque** "Add .gitignore"
   - **NÃO marque** "Choose a license"
3. Clique em **"Create repository"**

## Opção 2: Usar Repositório Existente

Se você já tem um repositório (ex: `Unareact/unareact`), você pode:
- Renomear o repositório no GitHub para `una-app`
- Ou usar o repositório existente

---

## 🔗 Conectar Repositório Local ao GitHub

**Substitua `SEU_USUARIO` pelo seu username do GitHub:**

### Usando HTTPS:
```bash
cd /Users/air/una-app
git remote add origin https://github.com/SEU_USUARIO/una-app.git
git branch -M main
git push -u origin main
```

### Usando SSH (se você configurou SSH keys):
```bash
cd /Users/air/una-app
git remote add origin git@github.com:SEU_USUARIO/una-app.git
git branch -M main
git push -u origin main
```

---

## ✅ Verificar se Funcionou

```bash
git remote -v
# Deve mostrar:
# origin  https://github.com/SEU_USUARIO/una-app.git (fetch)
# origin  https://github.com/SEU_USUARIO/una-app.git (push)
```

Depois, acesse seu repositório no GitHub e confirme que todos os arquivos estão lá!

---

## 📝 Próximos Commits

Sempre que fizer alterações:

```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

