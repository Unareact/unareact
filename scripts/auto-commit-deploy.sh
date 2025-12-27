#!/bin/bash

# Script automático de commit e deploy
# Tenta fazer commit, push e deploy automaticamente

set -e

echo "🚀 Iniciando processo automático de commit e deploy..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se há mudanças
check_changes() {
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  Nenhuma mudança para commitar${NC}"
        return 1
    fi
    return 0
}

# Função para fazer commit
do_commit() {
    echo -e "${GREEN}📦 Adicionando arquivos...${NC}"
    git add .
    
    echo -e "${GREEN}💾 Criando commit...${NC}"
    git commit -m "chore: Auto-deploy $(date +'%Y-%m-%d %H:%M:%S')" || {
        echo -e "${YELLOW}⚠️  Nenhuma mudança para commitar${NC}"
        return 1
    }
    return 0
}

# Função para fazer push
do_push() {
    echo -e "${GREEN}📤 Tentando fazer push...${NC}"
    
    # Tentar push normal
    if git push origin main 2>&1; then
        echo -e "${GREEN}✅ Push realizado com sucesso!${NC}"
        return 0
    fi
    
    # Se falhar, tentar com force (cuidado!)
    echo -e "${YELLOW}⚠️  Push normal falhou, tentando alternativas...${NC}"
    
    # Verificar se há commits locais não enviados
    if [ "$(git rev-list --count HEAD ^origin/main 2>/dev/null || echo 0)" -gt 0 ]; then
        echo -e "${YELLOW}📋 Há commits locais não enviados${NC}"
        echo -e "${YELLOW}💡 Você precisa fazer push manualmente ou configurar autenticação${NC}"
    fi
    
    return 1
}

# Função para fazer deploy no Vercel
do_vercel_deploy() {
    echo -e "${GREEN}🌐 Tentando deploy no Vercel...${NC}"
    
    # Verificar se Vercel CLI está disponível (global ou local)
    VERCEL_CMD=""
    if command -v vercel &> /dev/null; then
        VERCEL_CMD="vercel"
    elif [ -f "node_modules/.bin/vercel" ]; then
        VERCEL_CMD="npx vercel"
    else
        echo -e "${YELLOW}📦 Instalando Vercel CLI localmente...${NC}"
        npm install vercel --save-dev || {
            echo -e "${RED}❌ Falha ao instalar Vercel CLI${NC}"
            return 1
        }
        VERCEL_CMD="npx vercel"
    fi
    
    # Verificar se está logado
    if ! $VERCEL_CMD whoami &> /dev/null; then
        echo -e "${YELLOW}🔐 Você precisa fazer login no Vercel${NC}"
        echo -e "${YELLOW}💡 Execute: $VERCEL_CMD login${NC}"
        return 1
    fi
    
    # Fazer deploy
    echo -e "${GREEN}🚀 Fazendo deploy...${NC}"
    $VERCEL_CMD --prod || {
        echo -e "${RED}❌ Falha no deploy${NC}"
        return 1
    }
    
    echo -e "${GREEN}✅ Deploy realizado com sucesso!${NC}"
    return 0
}

# Função principal
main() {
    # Verificar se estamos em um repositório git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Não é um repositório git${NC}"
        exit 1
    fi
    
    # Verificar mudanças e fazer commit se necessário
    if check_changes; then
        do_commit
    fi
    
    # Tentar fazer push
    if do_push; then
        echo -e "${GREEN}✅ Push realizado!${NC}"
        echo -e "${GREEN}🎉 Se o Vercel estiver conectado ao GitHub, o deploy acontecerá automaticamente${NC}"
    else
        echo -e "${YELLOW}⚠️  Push não foi possível${NC}"
        echo -e "${YELLOW}💡 Tentando deploy direto no Vercel...${NC}"
        
        # Tentar deploy direto
        if do_vercel_deploy; then
            echo -e "${GREEN}✅ Deploy realizado diretamente no Vercel!${NC}"
        else
            echo -e "${RED}❌ Não foi possível fazer deploy${NC}"
            echo -e "${YELLOW}📝 Veja COMO_FAZER_DEPLOY.md para instruções manuais${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}🎉 Processo concluído!${NC}"
}

# Executar
main

