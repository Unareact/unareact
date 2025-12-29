# 🎬 Guia: Criador de Vídeos YLADA Nutri

## 📍 Como Acessar

Acesse a rota `/nutri` no seu navegador:
- **URL Local:** `http://localhost:3000/nutri`
- **URL Produção:** `https://seu-dominio.com/nutri`

Ou clique no botão **"YLADA Nutri"** no header do editor principal.

---

## 🚀 Funcionalidades Implementadas

### ✅ 1. Templates Prontos de Roteiros

5 templates específicos para vídeos de marketing do YLADA Nutri:

1. **Como Encher Sua Agenda Automaticamente** (60s)
   - Foco: Captação de clientes através de quizzes e links inteligentes
   - Público: Nutricionistas que querem aumentar número de clientes

2. **Como Organizar Seus Clientes Profissionalmente** (60s)
   - Foco: Sistema GSAL e organização de clientes
   - Público: Nutricionistas que se sentem desorganizadas

3. **Quizzes que Conscientizam e Geram Leads** (60s)
   - Foco: Usar quizzes para educar e captar clientes
   - Público: Nutricionistas que querem educar e captar ao mesmo tempo

4. **Mentoria LYA: Sua Assistente Estratégica 24/7** (60s)
   - Foco: Mentoria LYA e como ela ajuda nutricionistas
   - Público: Nutricionistas que se sentem sozinhas na jornada

5. **De Nutricionista a Nutri-Empresária** (90s)
   - Foco: Transformação profissional completa
   - Público: Nutricionistas que querem se tornar empresárias

### ✅ 2. Workflow Guiado

O sistema guia você em 4 passos:

1. **Escolher Template** - Selecione o tipo de vídeo que quer criar
2. **Personalizar** - Revise o roteiro e faça ajustes se necessário
3. **Gerar Roteiro** - O sistema aplica o roteiro ao editor automaticamente
4. **Pronto!** - Seu roteiro está no editor, pronto para adicionar vídeos e renderizar

### ✅ 3. Integração Completa

- ✅ Roteiros aplicados automaticamente ao editor
- ✅ Link direto para o editor após gerar
- ✅ CTAs otimizados com link do YLADA Nutri
- ✅ Templates com durações e estilos pré-configurados

---

## 📋 Como Usar

### Passo 1: Acessar a Página

1. Vá para `/nutri` ou clique no botão "YLADA Nutri" no header
2. Você verá a tela de seleção de templates

### Passo 2: Escolher Template

1. Revise os 5 templates disponíveis
2. Cada template mostra:
   - Nome e descrição
   - Duração estimada
   - Estilo e tom
   - Público-alvo
3. Clique no template desejado

### Passo 3: Personalizar

1. Revise o preview do roteiro completo
2. Veja os segmentos com timestamps
3. Confira o CTA (Call to Action) com link do YLADA Nutri
4. Clique em "Gerar Roteiro e Ir para Editor"

### Passo 4: Editar e Renderizar

1. Você será redirecionado para o editor principal
2. O roteiro já estará aplicado na aba "Roteiro"
3. Adicione vídeos, imagens ou áudios na aba "Editor"
4. Use as ferramentas de edição por IA se quiser
5. Clique em "Exportar Vídeo" para renderizar

---

## 🎯 Estrutura dos Templates

Cada template inclui:

- **Hook** (0-5s): Gancho inicial para prender atenção
- **Problema** (5-15s): Identificação da dor do público
- **Solução** (15-30s): Apresentação do YLADA Nutri
- **Benefícios** (30-50s): Destaque dos principais benefícios
- **Resultado** (50-55s): Transformação ou resultado esperado
- **CTA** (55-60s): Call to action com link do YLADA Nutri

---

## 🔧 Personalização

### Adicionar Novos Templates

Edite o arquivo `/app/lib/nutri-templates.ts`:

```typescript
{
  id: 'novo-template',
  name: 'Nome do Template',
  description: 'Descrição do template',
  duration: 60,
  style: 'educational',
  tone: 'casual',
  targetAudience: 'Público-alvo',
  cta: 'CTA personalizado',
  yladaUrl: 'https://ylada.com/pt/nutri',
  segments: [
    // Array de ScriptSegment
  ]
}
```

### Modificar Templates Existentes

1. Abra `/app/lib/nutri-templates.ts`
2. Encontre o template desejado
3. Modifique os segmentos, duração, ou CTA
4. Salve e recarregue a página

---

## 📊 Integração com Sistema Existente

Os templates se integram perfeitamente com:

- ✅ **Sistema de Roteiros:** Roteiros aplicados via `useEditorStore`
- ✅ **Editor Principal:** Redirecionamento automático após gerar
- ✅ **Renderização:** Use o botão "Exportar Vídeo" normalmente
- ✅ **Edição por IA:** Funciona com todos os painéis de IA

---

## 🎨 Customização Visual

As cores e estilos seguem o tema do YLADA Nutri:

- **Azul Principal:** `#0B57FF` (blue-600)
- **Gradientes:** Azul para roxo
- **Ícones:** Lucide React (Sparkles, CheckCircle2, etc.)

---

## 🚀 Próximos Passos Sugeridos

1. **Adicionar mais templates** baseados em feedback
2. **Integrar com IA** para personalização automática de roteiros
3. **Adicionar preview de vídeo** antes de gerar
4. **Criar versões curtas** dos templates (30s, 15s)
5. **Adicionar métricas** de performance dos templates

---

## 📝 Notas Técnicas

- **Rota:** `/app/nutri/page.tsx`
- **Templates:** `/app/lib/nutri-templates.ts`
- **Componentes:** `/app/components/nutri/`
- **Store:** Usa `useEditorStore` existente
- **Tipos:** Compatível com `ScriptSegment` existente

---

## ✅ Checklist de Uso

- [ ] Acessar `/nutri`
- [ ] Escolher template
- [ ] Revisar roteiro
- [ ] Gerar e ir para editor
- [ ] Adicionar material (vídeos/imagens)
- [ ] Editar se necessário
- [ ] Renderizar vídeo final
- [ ] Baixar e publicar

---

**🎬 Tudo pronto para criar vídeos de marketing profissionais para o YLADA Nutri!**

