# 🎬 Como Testar Download de Vídeos do YouTube

## ✅ Funcionalidade Implementada

Criei um sistema completo de teste para download de vídeos do YouTube usando **yt-dlp**.

---

## 📋 Pré-requisitos

### 1. Instalar yt-dlp

**macOS:**
```bash
brew install yt-dlp
```

**Linux:**
```bash
pip install yt-dlp
# ou
sudo apt install yt-dlp
```

**Windows:**
```bash
pip install yt-dlp
```

### 2. Verificar Instalação
```bash
yt-dlp --version
```

---

## 🚀 Como Usar

### Passo 1: Acessar o Painel
1. Abra o app: http://localhost:3000
2. Clique no botão **"Download"** no header
3. Você verá o painel de teste de download

### Passo 2: Obter Informações do Vídeo (Opcional)
1. Cole a URL do vídeo do YouTube
2. Clique em **"Info"**
3. Veja título, duração, thumbnail e formatos disponíveis

### Passo 3: Fazer Download
1. Escolha o formato (MP4, WebM, MKV)
2. Escolha a qualidade (Melhor, 720p, 480p, etc.)
3. Clique em **"Baixar Vídeo"**
4. Aguarde o download (pode levar alguns minutos)

### Passo 4: Verificar Resultado
- O vídeo será salvo em: `tmp/downloads/`
- Você verá o caminho completo no resultado
- Tamanho do arquivo será exibido

---

## 📁 Onde os Vídeos são Salvos

**Localização:**
```
/Users/air/una-app/tmp/downloads/
```

**Formato do arquivo:**
```
{videoId}-{uuid}.{formato}
```

**Exemplo:**
```
dQw4w9WgXcQ-abc123-def456.mp4
```

---

## ⚙️ Opções Disponíveis

### Formatos:
- **MP4** (recomendado - mais compatível)
- **WebM** (menor tamanho)
- **MKV** (melhor qualidade)

### Qualidades:
- **Melhor** (qualidade máxima disponível)
- **720p** (HD)
- **480p** (SD)
- **360p** (baixa qualidade)
- **Pior** (menor tamanho)

---

## 🔧 Funcionalidades da API

### GET `/api/youtube/download?url={url}`
**O que faz:** Obtém informações do vídeo sem baixar

**Retorna:**
```json
{
  "success": true,
  "videoInfo": {
    "id": "dQw4w9WgXcQ",
    "title": "Título do Vídeo",
    "duration": 212,
    "thumbnail": "https://...",
    "formats": [...]
  }
}
```

### POST `/api/youtube/download`
**O que faz:** Faz download do vídeo

**Body:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=...",
  "format": "mp4",
  "quality": "best"
}
```

**Retorna:**
```json
{
  "success": true,
  "videoId": "dQw4w9WgXcQ",
  "filename": "video.mp4",
  "size": 12345678,
  "path": "/caminho/completo/video.mp4"
}
```

---

## ⚠️ Avisos Importantes

### 1. Termos de Serviço
- Download de vídeos pode violar ToS do YouTube
- Use apenas para fins educacionais/pessoais
- Respeite direitos autorais
- Não redistribua conteúdo sem permissão

### 2. Limitações
- Vídeos muito longos podem demorar
- Requer yt-dlp instalado no servidor
- Arquivos são salvos localmente (não em cloud)
- Em produção, considere upload para S3/Cloudinary

### 3. Performance
- Downloads grandes podem demorar
- Timeout configurado para 5 minutos
- Arquivos são salvos em `tmp/downloads/`

---

## 🐛 Troubleshooting

### Erro: "yt-dlp não está instalado"
**Solução:**
```bash
# macOS
brew install yt-dlp

# Linux
pip install yt-dlp

# Verificar
yt-dlp --version
```

### Erro: "Download falhou"
**Possíveis causas:**
- Vídeo privado ou removido
- Conexão instável
- yt-dlp desatualizado

**Solução:**
```bash
# Atualizar yt-dlp
pip install --upgrade yt-dlp
# ou
brew upgrade yt-dlp
```

### Erro: "Timeout"
**Solução:**
- Vídeo muito grande
- Aumentar timeout na API (atualmente 5 minutos)
- Tentar qualidade menor

### Arquivo não encontrado
**Solução:**
- Verificar permissões da pasta `tmp/downloads/`
- Verificar se há espaço em disco
- Ver logs do servidor

---

## 📊 Exemplo de Uso

### Teste Rápido:
1. URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. Formato: MP4
3. Qualidade: 720p
4. Clique em "Baixar"

### Resultado Esperado:
- Download inicia
- Progresso mostrado
- Arquivo salvo em `tmp/downloads/`
- Mensagem de sucesso com caminho

---

## 🔄 Próximas Melhorias

- [ ] Progresso em tempo real
- [ ] Upload automático para cloud
- [ ] Integração com timeline (adicionar automaticamente)
- [ ] Suporte para playlists
- [ ] Download de apenas áudio
- [ ] Corte de vídeo durante download

---

## 💡 Dicas

1. **Para testes rápidos:** Use vídeos curtos (< 5 minutos)
2. **Para melhor qualidade:** Use formato MP4 + qualidade "Melhor"
3. **Para menor tamanho:** Use WebM + qualidade 480p
4. **Para produção:** Considere upload automático para S3/Cloudinary

---

**Pronto para testar!** 🚀

Acesse o painel "Download" e comece a testar o download de vídeos do YouTube!

