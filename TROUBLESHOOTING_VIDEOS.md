# 🔧 Troubleshooting: Vídeos Não Aparecem

## Problema: "0 vídeos encontrados"

### Possíveis Causas:

#### 1. **Filtro Muito Restritivo (Mais Comum)**
**Sintoma:** Filtro de 1M+ curtidas mas nenhum vídeo aparece

**Solução:**
- Reduza o filtro para 100.000 ou 500.000 curtidas
- Ou remova o filtro temporariamente para ver todos os vídeos
- Vídeos trending nem sempre têm 1M+ curtidas

**Teste:**
```
Mín. Curtidas: 100000 (100K)
ou
Mín. Curtidas: 500000 (500K)
```

#### 2. **API Key Não Configurada**
**Sintoma:** Erro "YouTube API Key não configurada"

**Solução:**
1. Verifique se `.env.local` existe
2. Adicione: `YOUTUBE_API_KEY=sua-key-aqui`
3. Reinicie o servidor

#### 3. **Quota da API Esgotada**
**Sintoma:** Erro de quota ou timeout

**Solução:**
- Aguarde 24h (quota reseta diariamente)
- Ou solicite aumento no Google Cloud Console

#### 4. **Região Sem Vídeos Trending**
**Sintoma:** Algumas regiões podem não ter vídeos trending

**Solução:**
- Tente "Toda América" (busca em 29 países)
- Ou selecione uma região específica (US, BR, MX)

---

## ✅ Como Testar

### Teste 1: Sem Filtro
```
Região: Toda América
Mín. Curtidas: 0
```
**Esperado:** Deve mostrar vídeos

### Teste 2: Filtro Baixo
```
Região: Toda América
Mín. Curtidas: 100000 (100K)
```
**Esperado:** Deve mostrar mais vídeos

### Teste 3: Filtro Médio
```
Região: Toda América
Mín. Curtidas: 500000 (500K)
```
**Esperado:** Pode mostrar alguns vídeos

### Teste 4: Filtro Alto
```
Região: Toda América
Mín. Curtidas: 1000000 (1M)
```
**Esperado:** Pode não mostrar vídeos (muito restritivo)

---

## 💡 Dicas

1. **Comece sem filtro** para ver quantos vídeos existem
2. **Aumente gradualmente** o filtro de curtidas
3. **Use "Toda América"** para mais opções
4. **Vídeos trending** geralmente têm 10K-500K curtidas, não 1M+

---

## 🎯 Valores Recomendados

| Objetivo | Mín. Curtidas | Resultado Esperado |
|----------|---------------|-------------------|
| Ver todos | 0 | Todos os trending |
| Vídeos populares | 100.000 | Muitos vídeos |
| Vídeos muito populares | 500.000 | Alguns vídeos |
| Vídeos extremamente virais | 1.000.000 | Poucos ou nenhum |

---

## 🔍 Verificar se API Está Funcionando

Teste direto na API:
```bash
curl "http://localhost:3000/api/viral?region=US&maxResults=5&minLikes=0"
```

**Se retornar vídeos:** API está funcionando, problema é o filtro
**Se der erro:** Verifique API Key e reinicie servidor

---

**Resumo:** Se não aparecer vídeos com 1M+ curtidas, reduza o filtro para 100K-500K! 🎯

