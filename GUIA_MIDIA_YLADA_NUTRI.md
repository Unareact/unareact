# 🎬 Guia: Busca de Mídia YLADA Nutri

## ✅ Funcionalidades Implementadas

### 1. **Busca de Mídia da Web**
- ✅ Integração com **Pexels** (imagens e vídeos)
- ✅ Integração com **Unsplash** (imagens)
- ✅ Busca automática baseada no roteiro
- ✅ Filtros por tipo (imagem, vídeo, tudo)

### 2. **Upload de Mídia Própria**
- ✅ Upload de vídeos, imagens e áudios
- ✅ Preview dos arquivos
- ✅ Adição automática à timeline

### 3. **Sugestão Automática**
- ✅ Gera queries de busca baseadas no conteúdo do roteiro
- ✅ Busca automática ao entrar na etapa de mídia
- ✅ Sugestões relevantes para cada segmento

---

## 🔧 Configuração

### 1. Obter API Keys

#### **Pexels** (Recomendado - Gratuito)
1. Acesse: https://www.pexels.com/api/
2. Crie uma conta gratuita
3. Vá em "Your API Key"
4. Copie a API Key
5. **Limite:** 200 requests/hora (gratuito)

#### **Unsplash** (Opcional)
1. Acesse: https://unsplash.com/developers
2. Crie uma conta
3. Crie uma aplicação
4. Copie o Access Key
5. **Limite:** 50 requests/hora (gratuito)

### 2. Configurar Variáveis de Ambiente

Adicione no seu `.env.local`:

```env
NEXT_PUBLIC_PEXELS_API_KEY=sua-chave-pexels-aqui
NEXT_PUBLIC_UNSPLASH_API_KEY=sua-chave-unsplash-aqui
```

---

## 🚀 Como Usar

### Fluxo Completo

1. **Digite o Tópico** → Sistema gera templates
2. **Escolha Template** → Selecione um dos gerados
3. **Edite Roteiro** → Ajuste os segmentos
4. **Adicione Mídia** → **NOVA ETAPA!**
   - Busque imagens/vídeos da web
   - Ou faça upload dos seus arquivos
   - Selecione e adicione à timeline
5. **Vá para Edição** → Continue no editor principal

### Na Etapa de Mídia

#### **Busca Automática**
- Ao entrar na etapa, o sistema já busca automaticamente baseado no roteiro
- Queries geradas: "nutricionista", "saúde", "organização", etc.

#### **Busca Manual**
1. Digite uma palavra-chave (ex: "nutricionista profissional")
2. Escolha o tipo: Tudo, Apenas Imagens, ou Apenas Vídeos
3. Clique em "Buscar"
4. Resultados aparecem em grid

#### **Selecionar Mídia**
- Clique em uma imagem/vídeo para selecionar
- Clique novamente para desmarcar
- Múltiplas seleções permitidas

#### **Adicionar à Timeline**
- Clique em "Adicionar X à Timeline"
- Os itens selecionados são adicionados automaticamente
- Posicionados sequencialmente na timeline

#### **Upload Próprio**
- Clique em "Escolher Arquivos"
- Selecione vídeos, imagens ou áudios
- Arquivos são processados e adicionados automaticamente

---

## 📊 Estrutura Técnica

### Arquivos Criados

- `/app/lib/media-search.ts` - Funções de busca de mídia
- `/app/api/media/search/route.ts` - API route para busca segura
- `/app/components/nutri/NutriMediaSelector.tsx` - Componente de seleção

### Integração

- ✅ Integrado no fluxo `/nutri`
- ✅ Aparece após aprovar o roteiro
- ✅ Adiciona clips automaticamente ao store
- ✅ Redireciona para editor principal após completar

---

## 🎯 Próximas Melhorias Sugeridas

1. **Download de Mídia**
   - Baixar imagens/vídeos selecionados localmente
   - Cache de mídia baixada

2. **Filtros Avançados**
   - Por cor, orientação, tamanho
   - Por licença (gratuita, comercial)

3. **Biblioteca de Mídia**
   - Salvar mídia favorita
   - Histórico de buscas

4. **Sincronização com Roteiro**
   - Sugerir mídia específica para cada segmento
   - Preview de mídia no contexto do roteiro

---

## ⚠️ Notas Importantes

1. **API Keys**: Configure as keys no `.env.local` para funcionar
2. **Limites**: Respeite os limites das APIs (200/hora Pexels, 50/hora Unsplash)
3. **Licenças**: Pexels e Unsplash são gratuitos, mas verifique os termos de uso
4. **Produção**: Para produção, considere usar API routes (já implementado) para esconder keys

---

**🎬 Tudo pronto para buscar e adicionar mídia aos seus vídeos!**

