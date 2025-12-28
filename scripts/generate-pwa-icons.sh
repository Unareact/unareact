#!/bin/bash

# Script para gerar ícones PWA a partir do SVG
# Requer: ImageMagick (brew install imagemagick no macOS)

echo "Gerando ícones PWA..."

# Criar ícone 192x192
convert -background none -resize 192x192 public/icon.svg public/icon-192x192.png

# Criar ícone 512x512
convert -background none -resize 512x512 public/icon.svg public/icon-512x512.png

# Criar apple-touch-icon (180x180)
convert -background none -resize 180x180 public/icon.svg public/apple-touch-icon.png

echo "Ícones gerados com sucesso!"
echo "Arquivos criados:"
echo "  - public/icon-192x192.png"
echo "  - public/icon-512x512.png"
echo "  - public/apple-touch-icon.png"

