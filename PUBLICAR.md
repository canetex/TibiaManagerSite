# 🚀 Guia Rápido para Publicar no GitHub

## Opção 1: Usando GitHub CLI (Recomendado)

### Passo 1: Autenticar no GitHub CLI

Execute no terminal:
```powershell
gh auth login
```

Siga as instruções na tela para autenticar.

### Passo 2: Executar Script de Deploy

Após autenticar, execute:
```powershell
.\deploy-to-github.ps1
```

O script irá:
- ✅ Criar o repositório no GitHub
- ✅ Conectar o repositório local
- ✅ Fazer push de todos os arquivos
- ✅ Configurar o remote

### Passo 3: Habilitar GitHub Pages

1. Acesse: https://github.com/SEU_USUARIO/TibiaManagerSite
2. Vá em **Settings** > **Pages**
3. Em **Source**, selecione **GitHub Actions**
4. Aguarde alguns minutos para o deploy

## Opção 2: Manual (Sem GitHub CLI)

### Passo 1: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `TibiaManagerSite`
3. **NÃO** marque "Add a README file"
4. Clique em "Create repository"

### Passo 2: Conectar e Publicar

Execute no terminal:
```powershell
cd "C:\Users\admin\Documents\TibiaManagerSite"

# Adicionar remote (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/TibiaManagerSite.git

# Fazer push
git push -u origin main
```

### Passo 3: Habilitar GitHub Pages

1. No repositório GitHub: **Settings** > **Pages**
2. **Source**: Selecione **GitHub Actions**
3. Aguarde o deploy automático

## ✅ Verificação

Após alguns minutos, o site estará disponível em:
```
https://SEU_USUARIO.github.io/TibiaManagerSite/
```

## 📋 Status Atual

- ✅ Repositório Git inicializado
- ✅ Commits realizados
- ✅ GitHub Actions configurado
- ✅ Arquivos prontos para deploy
