# 📋 Rotas Completas - Todas as Áreas

## 🏠 Landing Page
- `/` → Página inicial com escolha de negócio

---

## ⚡ React (`/react`)
- `/react` → Editor completo (abre em "Virais")
- `/react/viral` → Buscar vídeos virais (dedicado)
- `/react/editor` → Editor completo

**Fluxo:**
1. `/react` → Abre editor com aba "Virais"
2. Buscar vídeos → Clicar "Criar Vídeo" → Workflow guiado
3. Workflow completa → Volta para editor
4. Editor → Preview → Exportar

---

## 💪 Portal Magra (`/portal`)
- `/portal` → Landing da área (quick actions)
- `/portal/viral` → Buscar vídeos Portal (filtros aplicados)
- `/portal/editor` → Editor completo
- `/portal/editor?panel=script` → Editor com painel específico

**Fluxo:**
1. `/portal` → Landing com 3 quick actions
2. Escolher ação → Vai para página específica
3. `/portal/viral` → Busca com filtros aplicados
4. Escolher vídeo → Gerar roteiro → Editor
5. Editor → Preview → Exportar

---

## 🍎 YLADA Nutri (`/nutri`)
- `/nutri` → Workflow guiado (templates)
- `/nutri/editor` → Editor completo

**Fluxo:**
1. `/nutri` → Workflow guiado de templates
2. Escolher template → Editar → Aprovar
3. Clica "Ir para o Editor" → Vai para `/nutri/editor`
4. Editor → Preview → Exportar

---

## 📹 Vídeos Virais (`/viral`)
- `/viral` → Buscar vídeos virais (geral)

---

## ✅ Verificações Implementadas

### Breadcrumb
- Funciona em todas as rotas
- Mostra: `Home > [Negócio] > [Etapa]`
- Links clicáveis para voltar

### Detecção de Fluxo
- MainEditor detecta: `/react`, `/portal`, `/nutri`, `/viral`
- Usa `pathname?.startsWith()` para sub-rotas
- Mostra indicador de área ativa

### Navegação
- AreaNavigation aparece em rotas de área
- WorkflowGuide aparece apenas quando relevante
- QuickActions sugere próximos passos

---

## 🔧 Correções Aplicadas

1. ✅ NutriVideoCreator redireciona para `/nutri/editor` (não mais `/`)
2. ✅ MainEditor detecta `/nutri/editor` corretamente
3. ✅ Breadcrumb funciona em todas as rotas
4. ✅ Detecção de fluxo usa `startsWith()` para sub-rotas

