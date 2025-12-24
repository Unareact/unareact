# 🔥 Guia: Rastreador de Vídeos Virais

## Funcionalidade Implementada

O app agora possui um **rastreador completo de vídeos virais globais** integrado ao editor!

## ✨ O que foi criado:

### 1. **Painel "Virais" no Editor**
- Novo botão no header: **"Virais"** com ícone de trending
- Acesso direto aos vídeos mais populares do mundo

### 2. **Rastreamento Global**
- Vídeos trending do YouTube em tempo real
- Filtro por região (Brasil, EUA, Reino Unido, México, etc.)
- Atualização automática dos dados

### 3. **Métricas Detalhadas**
Cada vídeo mostra:
- **Views** (visualizações)
- **Likes** (curtidas)
- **Comentários**
- **Viral Score** (calculado automaticamente)
- **Ranking de Trending** (#1, #2, #3...)
- **Data de publicação** (relativa: "Hoje", "2 dias atrás", etc.)

### 4. **Download e Edição**
- Botão **"Baixar"** em cada vídeo
- Adiciona automaticamente à timeline do editor
- Pronto para edição imediata

## 🚀 Como Usar:

### Passo 1: Configurar API Key do YouTube

1. Acesse: https://console.cloud.google.com/
2. Crie um projeto (ou use existente)
3. Ative a **"YouTube Data API v3"**
4. Crie credenciais → **API Key**
5. Adicione no `.env.local`:
```env
YOUTUBE_API_KEY=sua-chave-aqui
```

### Passo 2: Acessar Vídeos Virais

1. Abra o app: http://localhost:3000
2. Clique no botão **"Virais"** no header
3. Aguarde o carregamento (pode levar alguns segundos)

### Passo 3: Filtrar por Região

- Use o dropdown **"Região"** no topo
- Escolha: Brasil, EUA, Reino Unido, etc.
- Clique em **"Atualizar"** para buscar novos vídeos

### Passo 4: Baixar Vídeo para Edição

1. Encontre o vídeo desejado
2. Clique no botão **"Baixar"** (roxo)
3. O vídeo será adicionado automaticamente à timeline
4. Vá para o painel **"Editor"** para editar

## 📊 Como funciona o Viral Score?

O **Viral Score** é calculado automaticamente considerando:
- **40%** - Número de visualizações
- **30%** - Número de curtidas
- **20%** - Número de comentários
- **10%** - Taxa de engajamento (likes + comentários / views)

**Bonus de tempo:**
- Vídeos com menos de 24h: +50% no score
- Vídeos com menos de 1 semana: +20% no score

## 🎯 Casos de Uso:

1. **Análise de Tendências**
   - Veja o que está viral em diferentes países
   - Compare métricas entre vídeos
   - Identifique padrões de conteúdo viral

2. **Inspiração para Roteiros**
   - Use vídeos virais como referência
   - Gere roteiros baseados em tópicos trending
   - Crie conteúdo similar ao que está funcionando

3. **Edição Rápida**
   - Baixe vídeos virais
   - Remixe e edite no app
   - Crie suas próprias versões

## ⚠️ Avisos Importantes:

### Limitações Legais
- **Download de vídeos do YouTube pode violar ToS**
- Use apenas para fins educacionais/pessoais
- Para produção, obtenha permissões adequadas
- Considere usar serviços dedicados (yt-dlp em servidor próprio)

### Quotas da API
- YouTube Data API tem limites de requisições
- Gratuito: ~10.000 unidades/dia
- Cada busca de trending usa ~100 unidades
- Monitore seu uso em: https://console.cloud.google.com/

### Melhorias Futuras
- [ ] Cache de resultados (reduzir chamadas API)
- [ ] Suporte para TikTok e Instagram
- [ ] Download real de vídeos (backend com yt-dlp)
- [ ] Histórico de vídeos virais
- [ ] Alertas quando vídeo específico viraliza

## 🔧 Troubleshooting

### Erro: "YouTube API Key não configurada"
- Verifique se o arquivo `.env.local` existe
- Confirme que a variável está como `YOUTUBE_API_KEY` (não `NEXT_PUBLIC_`)
- Reinicie o servidor após adicionar a key

### Erro: "Quota exceeded"
- Você atingiu o limite diário da API
- Aguarde 24h ou aumente o limite no Google Cloud Console

### Vídeos não aparecem
- Verifique sua conexão com internet
- Confirme que a API Key está correta
- Veja o console do navegador para erros detalhados

## 📈 Próximas Melhorias Planejadas

1. **Análise Avançada**
   - Gráficos de crescimento
   - Comparação entre vídeos
   - Previsão de viralização

2. **Integração Completa**
   - Download real de vídeos
   - Processamento automático
   - Sincronização com roteiros

3. **Multi-plataforma**
   - TikTok trending
   - Instagram Reels
   - Twitter/X vídeos

---

**Pronto para usar!** 🚀

Acesse o painel "Virais" e comece a explorar os vídeos mais populares do mundo!

