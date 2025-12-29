# 📝 Guia: Como Preencher o Formulário de Extensão de Quota do YouTube

Guia passo a passo para preencher o formulário de auditoria e extensão de cotas do YouTube.

---

## 📋 Informações que você precisa ter antes

- Nome completo
- Nome da organização/empresa
- Site da organização (se tiver)
- Endereço completo da organização
- Email de contato
- ID do projeto do Google Cloud (encontre em: https://console.cloud.google.com/)

---

## ✅ Preenchendo o Formulário

### **1. Por que você está preenchendo este formulário?**

**Selecione:**
- ✅ **"Estou fazendo uma auditoria de compliance ou solicitando cota extra de API"**

---

### **2. Informações Gerais**

#### **Seu nome completo ***
```
[Seu nome completo]
```

#### **Nome da sua organização ***
```
[Exemplo: UNA Video Editor] ou [Nome da sua empresa]
```

#### **Site da sua organização ***
```
[Seu site, ex: https://una-app.vercel.app] ou [URL do seu app]
```
Se não tiver site, use o link do seu app no Vercel ou onde estiver hospedado.

#### **Endereço da sua organização ***
```
[Seu endereço completo]
Exemplo: Rua Exemplo, 123, São Paulo, SP, 01234-567, Brasil
```

#### **Endereço de e-mail do contato da organização ***
```
[Seu email profissional]
Exemplo: contato@una-app.com ou seu-email@gmail.com
```

#### **Descreva o trabalho da sua organização em relação ao YouTube ***
```
Estou desenvolvendo uma plataforma SaaS de edição de vídeo que ajuda 
criadores de conteúdo a analisar vídeos virais e criar conteúdo similar.

A plataforma permite:
- Buscar e analisar vídeos trending do YouTube
- Identificar padrões de viralização
- Gerar roteiros baseados em vídeos virais
- Ajudar criadores a entender o que torna um vídeo viral

O uso da API do YouTube é essencial para:
- Buscar vídeos trending por região e categoria
- Analisar metadados de vídeos (títulos, descrições, estatísticas)
- Identificar vídeos relevantes para análise de conteúdo viral
```

#### **Endereço de e-mail do representante do Google**
```
[Deixe em branco se não tiver contato com funcionário do Google]
```

#### **ID do proprietário do conteúdo (se disponível)**
```
[Deixe em branco se não tiver]
```

---

### **3. Informações do Cliente de API**

#### **Você recebeu uma auditoria desde junho de 2019? ***
```
Não
```
(Se você nunca recebeu uma auditoria, selecione "Não")

#### **A forma que a API do YouTube é usada pelo seu cliente mudou desde a última auditoria? ***
```
Não
```
(Se não teve auditoria anterior, selecione "Não")

#### **Informe todos os clientes de API ***
```
UNA Video Editor
```
ou
```
UNA - Editor de Vídeo e Roteiros
```

#### **Liste todos os números de projeto de cada cliente de API ***
```
[ID do seu projeto do Google Cloud]
```
**Como encontrar o ID do projeto:**
1. Acesse: https://console.cloud.google.com/
2. No topo, ao lado do nome do projeto, você verá o ID
3. Ou vá em: **IAM & Admin** → **Settings** → veja o **Project ID**

**Exemplo:** `integral-hold-482511-c2` (baseado na URL que você mostrou)

#### **Se for necessário fazer login para acessar o cliente de API, informe uma conta de demonstração e instruções sobre como acessá-lo**
```
Aplicação web acessível em: [URL do seu app]

Para acessar:
1. Acesse [URL]
2. Navegue até a seção "Virais" ou "Portal Magra"
3. A aplicação busca vídeos do YouTube automaticamente

A aplicação é pública e não requer login para visualizar os vídeos buscados.
Os vídeos são exibidos em uma lista com informações como título, visualizações, 
curtidas e engajamento.
```

#### **Escolha a opção mais próxima ao caso de uso do seu cliente de API ***
```
✅ Ferramentas do Criador
```

#### **Especifique todos os serviços de API do YouTube usados pelo cliente de API ***
```
Data API
```
(Marque apenas "Data API" - é a única que você está usando)

#### **Selecione o público principal do seu cliente de API ***
```
✅ Criadores
```

#### **Quantos usuários usam seu cliente de API, aproximadamente? ***
```
[Digite um número realista]
Exemplos:
- Se está em desenvolvimento/teste: "10-50 usuários"
- Se já está em uso: "50-200 usuários"
- Se tem muitos usuários: "200-1000 usuários"
```

#### **Explique como seu cliente de API é usado pelos usuários ***
```
Os usuários (criadores de conteúdo) usam a aplicação para:

1. Buscar vídeos virais do YouTube por categoria e região
2. Analisar padrões de viralização (engajamento, likes, comentários)
3. Obter insights sobre por que um vídeo viralizou
4. Gerar roteiros baseados em vídeos virais analisados
5. Encontrar inspiração para criar conteúdo similar

O fluxo típico:
- Usuário acessa a aplicação
- Seleciona categoria/nicho de interesse (ex: "Portal Magra" para bem-estar)
- A aplicação busca vídeos trending relevantes
- Usuário visualiza lista de vídeos com métricas (views, likes, viral score)
- Usuário pode analisar vídeos específicos para entender padrões virais
- Usuário usa os insights para criar seu próprio conteúdo
```

#### **Seu cliente de API usa múltiplos projetos para acessar as APIs do YouTube? ***
```
✅ Não
```

#### **O cliente de API cria, acessa ou usa métricas derivadas dos dados do YouTube? ***
```
✅ Sim
```
**Explicação adicional (se houver campo):**
```
Sim, a aplicação calcula métricas derivadas como:
- Viral Score (combinação de views, likes, comentários e engajamento)
- Taxa de engajamento (likes + comentários / views)
- Curtidas por dia (crescimento do vídeo)
- Score de tempo (boost para vídeos recentes)

Essas métricas ajudam a identificar vídeos com maior potencial viral.
```

#### **O cliente de API exibe dados de múltiplas plataformas? ***
```
✅ Sim
```
**Explicação:**
```
Sim, a aplicação exibe dados do YouTube e do TikTok lado a lado, 
permitindo que usuários comparem conteúdo viral entre plataformas.
Os dados são exibidos em conjunto para análise comparativa.
```

#### **Você cria ou fornece qualquer tipo de relatório usando os dados da API do YouTube? ***
```
✅ Não
```
(A menos que você tenha uma funcionalidade de relatórios - se tiver, marque "Sim" e explique)

#### **Por quanto tempo você armazena os dados da API do YouTube? ***
```
✅ De 1 a 7 dias
```
ou
```
✅ Menos de 24 horas
```
**Escolha baseado no seu caso:**
- Se você salva no localStorage: "De 1 a 7 dias"
- Se não salva nada: "Menos de 24 horas"

#### **Com que frequência você atualiza os dados da API do YouTube? ***
```
✅ 24 horas
```
ou
```
✅ 1 semana
```
**Escolha baseado no seu caso:**
- Se busca vídeos toda vez que o usuário acessa: "24 horas"
- Se busca periodicamente: "1 semana"

#### **O cliente de API permite aos usuários fazer autenticação com as credenciais do Google? ***
```
✅ Não
```
(A menos que você tenha login com Google - se tiver, marque "Sim")

#### **Envie documentos relacionados à implementação ***
**O que enviar (escolha 1-2 opções):**

**Opção 1: Screenshot da aplicação** (recomendado)
- Tire screenshots mostrando:
  - A interface de busca de vídeos
  - Lista de vídeos retornados do YouTube
  - Como os dados são exibidos (título, views, likes, etc.)
  - A seção "Portal Magra" funcionando

**Opção 2: Documentação em texto** (crie um arquivo .txt ou .md)
```
UNA Video Editor - Uso da YouTube Data API v3

DESCRIÇÃO DA APLICAÇÃO:
Aplicação web SaaS que ajuda criadores de conteúdo a analisar 
vídeos virais e criar conteúdo similar.

SERVIÇOS DE API USADOS:
1. YouTube Data API v3 - search.list
   - Busca vídeos trending por palavras-chave
   - Busca por categoria e região
   - Consumo: ~100 unidades por busca

2. YouTube Data API v3 - videos.list
   - Obtém estatísticas detalhadas de vídeos
   - Views, likes, comentários, duração
   - Consumo: ~1 unidade por vídeo

CASO DE USO:
- Criadores de conteúdo acessam a aplicação
- Selecionam categoria/nicho de interesse
- Aplicação busca vídeos trending relevantes
- Usuários analisam métricas e padrões virais
- Usuários usam insights para criar conteúdo similar

USO ESTIMADO:
- 50.000 - 100.000 unidades/dia
- Baseado em ~500-1000 buscas diárias
- Cada busca retorna múltiplos vídeos para análise

ARMAZENAMENTO DE DADOS:
- Dados são exibidos em tempo real
- Armazenamento mínimo (apenas cache local do navegador)
- Não armazenamos dados do YouTube permanentemente

COMPLIANCE:
- Aplicação em conformidade com Termos de Serviço do YouTube
- Dados usados apenas para análise e exibição
- Não comercializamos dados do YouTube
```

**Opção 3: Screencast (vídeo)** - Se possível
- Grave um vídeo de 1-2 minutos mostrando:
  - Aplicação funcionando
  - Busca de vídeos do YouTube
  - Exibição dos resultados
  - Funcionalidade "Portal Magra"

**Dica:** Se não tiver vídeo, envie pelo menos 2-3 screenshots + o arquivo de texto.

---

### **4. Confirmação dos Termos de Serviço**

#### **Li e concordo com os Termos de Serviço... ***
```
✅ Sim
```
(Certifique-se de ter lido os termos antes de marcar)

#### **Caso eu informe uma conta de demonstração... ***
```
✅ Concordo
```

#### **Os fatos acima são verdadeiros... ***
```
✅ Concordo
```

---

## 📝 Resumo das Respostas Sugeridas

### **Informações Básicas:**
- **Nome completo:** [Seu nome]
- **Organização:** UNA Video Editor (ou nome da sua empresa)
- **Site:** [URL do seu app]
- **Email:** [Seu email]

### **Caso de Uso:**
- **Tipo:** Ferramentas do Criador / Outro
- **Descrição:** Plataforma SaaS de análise de vídeos virais para criadores de conteúdo

### **Uso da API:**
- Buscar vídeos trending
- Analisar metadados e estatísticas
- Calcular viral score
- Ajudar criadores a criar conteúdo similar

### **Quota Solicitada:**
- **Atual:** 10.000 unidades/dia
- **Solicitada:** 50.000 - 100.000 unidades/dia
- **Justificativa:** Aplicação precisa buscar vídeos trending diariamente para análise de conteúdo viral

---

## ✅ Checklist Antes de Enviar

- [ ] Preenchi todos os campos obrigatórios (*)
- [ ] Informei o ID do projeto corretamente
- [ ] Descrevi claramente o caso de uso
- [ ] Enviei screenshots ou screencast da aplicação
- [ ] Li e concordo com os Termos de Serviço
- [ ] Todas as informações estão corretas e verdadeiras

---

## 🎯 Dicas Importantes

1. **Seja específico**: Explique exatamente como você usa a API
2. **Mostre a aplicação**: Screenshots/vídeos ajudam muito
3. **Justifique o uso**: Explique por que precisa de mais quota
4. **Seja honesto**: Não exagere nos números, seja realista
5. **Use inglês se possível**: Pode aumentar chances de aprovação

---

## 📧 Após Enviar

- Você receberá uma cópia das respostas no email informado
- O YouTube geralmente responde em 24-48 horas
- Pode levar até 7 dias úteis para aprovação

---

Boa sorte! 🍀

