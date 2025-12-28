# Configuração PWA - UNA Editor

A aplicação está configurada como Progressive Web App (PWA) e pode ser instalada em dispositivos móveis e desktop.

## ✅ Funcionalidades PWA Implementadas

- ✅ Manifest.json configurado
- ✅ Service Worker para cache offline
- ✅ Meta tags para instalação
- ✅ Banner de instalação automático
- ✅ Suporte para iOS (Apple)
- ✅ Ícones PWA

## 📱 Como Instalar

### No Mobile (Android/Chrome):
1. Abra o site no navegador Chrome
2. Um banner aparecerá oferecendo para instalar
3. Ou clique no menu (3 pontos) > "Adicionar à tela inicial"

### No Desktop (Chrome/Edge):
1. Abra o site no navegador
2. Clique no ícone de instalação na barra de endereços
3. Ou vá em Menu > "Instalar UNA Editor"

### No iOS (Safari):
1. Abra o site no Safari
2. Toque no botão de compartilhar
3. Selecione "Adicionar à Tela de Início"

## 🎨 Gerar Ícones PWA

Os ícones são necessários para a instalação. Você pode gerá-los de duas formas:

### Opção 1: Usando o Script (requer ImageMagick)
```bash
# Instalar ImageMagick (macOS)
brew install imagemagick

# Gerar ícones
./scripts/generate-pwa-icons.sh
```

### Opção 2: Gerar Manualmente
1. Use um gerador online como: https://realfavicongenerator.net/
2. Ou crie ícones 192x192 e 512x512 pixels
3. Salve como:
   - `public/icon-192x192.png`
   - `public/icon-512x512.png`
   - `public/apple-touch-icon.png` (180x180)

### Opção 3: Usar o SVG fornecido
O arquivo `public/icon.svg` pode ser convertido usando ferramentas online ou editores de imagem.

## 🔧 Arquivos PWA

- `public/manifest.json` - Configurações do PWA
- `public/sw.js` - Service Worker para cache
- `app/components/PWAInstaller.tsx` - Componente de instalação
- `app/layout.tsx` - Meta tags e configurações

## 🚀 Funcionalidades Offline

O Service Worker implementa cache básico que permite:
- Carregar a aplicação mesmo sem internet
- Cache de recursos estáticos
- Estratégia: Network First, fallback para Cache

## 📝 Personalização

Para personalizar o PWA, edite:
- `public/manifest.json` - Nome, cores, ícones
- `public/sw.js` - Estratégia de cache
- `app/components/PWAInstaller.tsx` - Banner de instalação

## ⚠️ Notas Importantes

1. **HTTPS obrigatório**: PWAs só funcionam em HTTPS (ou localhost)
2. **Ícones necessários**: Sem os ícones PNG, a instalação pode não funcionar corretamente
3. **Service Worker**: Deve ser servido na raiz do domínio

## 🧪 Testar PWA

1. Abra o DevTools (F12)
2. Vá em "Application" > "Service Workers"
3. Verifique se o service worker está registrado
4. Vá em "Application" > "Manifest" para ver as configurações
5. Use Lighthouse para auditar o PWA

