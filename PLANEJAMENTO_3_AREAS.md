# 📋 Planejamento Completo das 3 Áreas

## 🎯 Estrutura de Rotas e Fluxos

### **Área 1: React** (`/react`)
**Foco:** Vídeos virais e trending para reação

**Fluxo:**
```
/react (Landing da área)
  ↓
/react/viral (Buscar vídeos virais)
  ↓
/react/viral/[videoId] (Workflow guiado: Download → Roteiro → Timeline)
  ↓
/react/editor (Editor completo)
  ↓
/react/preview (Preview)
  ↓
/react/export (Exportar)
```

**Funcionalidades:**
- ✅ Buscar vídeos virais (YouTube + TikTok)
- ✅ Workflow guiado por vídeo
- ✅ Gerar roteiro baseado em vídeo viral
- ✅ Editor completo
- ✅ Preview e exportação

---

### **Área 2: Portal Magra** (`/portal`)
**Foco:** Vídeos de fitness e bem-estar para conversão

**Fluxo:**
```
/portal (Landing da área)
  ↓
/portal/viral (Buscar vídeos - filtros pré-aplicados)
  ↓
/portal/viral/[videoId] (Gerar roteiro de conversão)
  ↓
/portal/editor (Editor com templates Portal)
  ↓
/portal/preview (Preview)
  ↓
/portal/export (Exportar)
```

**Funcionalidades:**
- ✅ Buscar vídeos com filtros Portal Magra
- ✅ Gerar roteiro de conversão ($10 avaliação)
- ✅ Templates específicos de fitness
- ✅ CTAs otimizados
- ✅ Editor com foco em conversão

---

### **Área 3: YLADA Nutri** (`/nutri`)
**Foco:** Vídeos de marketing para nutricionistas

**Fluxo:**
```
/nutri (Landing da área)
  ↓
/nutri/templates (Escolher template)
  ↓
/nutri/templates/[templateId] (Editar roteiro)
  ↓
/nutri/editor (Editor com mídia)
  ↓
/nutri/preview (Preview)
  ↓
/nutri/export (Exportar)
```

**Funcionalidades:**
- ✅ 5 templates prontos
- ✅ Workflow guiado (4 etapas)
- ✅ Editor integrado
- ✅ CTAs otimizados YLADA
- ✅ Foco em conversão

---

## 🔄 Rotas Unificadas

### **Estrutura de Rotas:**
```
/                          → Landing (escolha de negócio)
/react                     → Área React (editor completo)
/react/viral               → Buscar vídeos virais
/react/viral/[videoId]     → Workflow guiado do vídeo
/portal                    → Área Portal (busca + editor)
/portal/viral              → Buscar vídeos Portal
/portal/viral/[videoId]    → Gerar roteiro Portal
/nutri                     → Área Nutri (templates)
/nutri/templates           → Escolher template
/nutri/templates/[id]      → Editar template
```

---

## 📊 Fluxo Unificado por Área

### **React:**
1. `/react` → Abre direto no editor com aba "Virais"
2. Buscar vídeos → Clicar "Criar Vídeo" → Workflow guiado
3. Workflow completa → Volta para `/react/editor`
4. Editor → Preview → Exportar

### **Portal Magra:**
1. `/portal` → Abre com busca de vídeos (filtros aplicados)
2. Escolher vídeo → Gerar roteiro de conversão
3. Roteiro aprovado → Vai para `/portal/editor`
4. Editor → Preview → Exportar

### **YLADA Nutri:**
1. `/nutri` → Abre com escolha de templates
2. Escolher template → Editar roteiro
3. Roteiro aprovado → Vai para `/nutri/editor`
4. Editor → Preview → Exportar

---

## 🎨 Melhorias de UX

### **1. Breadcrumb Contextual**
Mostrar sempre: `Home > [Negócio] > [Etapa Atual]`

### **2. Indicador de Progresso**
Barra de progresso no topo mostrando:
- Onde está
- O que falta fazer
- Próximo passo sugerido

### **3. Ações Rápidas**
Card destacado com:
- Próxima ação sugerida
- Botão para avançar
- Dica contextual

### **4. Navegação Inteligente**
- Botões "Próximo" e "Anterior" contextuais
- Validação antes de avançar
- Salvar progresso automaticamente

---

## 🔧 Implementação

### **Fase 1: Ajustar Rotas**
- [ ] Criar rotas específicas por área
- [ ] Unificar navegação
- [ ] Adicionar breadcrumbs

### **Fase 2: Melhorar Fluxos**
- [ ] Workflow guiado por área
- [ ] Validação de etapas
- [ ] Ações rápidas contextuais

### **Fase 3: UX Final**
- [ ] Indicadores de progresso
- [ ] Dicas contextuais
- [ ] Navegação fluida

