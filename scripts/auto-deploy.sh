#!/bin/bash

# Script de deploy automático
# Uso: ./scripts/auto-deploy.sh

set -e

echo "🚀 Iniciando deploy automático..."

# Verificar se há mudanças
if [ -z "$(git status --porcelain)" ]; then
  echo "✅ Nenhuma mudança para commitar"
  exit 0
fi

# Adicionar todas as mudanças
echo "📦 Adicionando arquivos..."
git add .

# Criar commit
echo "💾 Criando commit..."
git commit -m "chore: Auto-deploy $(date +'%Y-%m-%d %H:%M:%S')" || echo "Nenhuma mudança para commitar"

# Push para o repositório
echo "📤 Fazendo push..."
git push origin main || echo "Push falhou - verifique permissões"

# Build local (opcional)
if [ "$1" == "--build" ]; then
  echo "🔨 Fazendo build..."
  npm run build
fi

echo "✅ Deploy automático concluído!"

