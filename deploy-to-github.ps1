# Script completo para publicar no GitHub
# Execute este script após autenticar no GitHub CLI

Write-Host "=== Publicando TibiaManagerSite no GitHub ===" -ForegroundColor Green
Write-Host ""

# Verificar se está autenticado
Write-Host "Verificando autenticação GitHub..." -ForegroundColor Cyan
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub CLI não está autenticado." -ForegroundColor Yellow
    Write-Host "Execute: gh auth login" -ForegroundColor Yellow
    Write-Host "Depois execute este script novamente." -ForegroundColor Yellow
    exit 1
}

# Obter usuário GitHub
Write-Host "Obtendo informações do usuário..." -ForegroundColor Cyan
$githubUser = gh api user --jq .login
if (-not $githubUser) {
    Write-Host "Erro ao obter usuário GitHub" -ForegroundColor Red
    exit 1
}

Write-Host "Usuário GitHub: $githubUser" -ForegroundColor Green
Write-Host ""

# Nome do repositório
$repoName = "TibiaManagerSite"

# Verificar se o repositório já existe
Write-Host "Verificando se o repositório já existe..." -ForegroundColor Cyan
$repoExists = gh repo view "$githubUser/$repoName" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Repositório já existe: $githubUser/$repoName" -ForegroundColor Yellow
} else {
    Write-Host "Criando repositório no GitHub..." -ForegroundColor Cyan
    gh repo create $repoName --public --source=. --remote=origin --push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro ao criar repositório" -ForegroundColor Red
        exit 1
    }
    Write-Host "Repositório criado com sucesso!" -ForegroundColor Green
    Write-Host ""
}

# Verificar se já existe remote
Write-Host "Verificando configuração do remote..." -ForegroundColor Cyan
$remoteExists = git remote -v | Select-String "origin"
if (-not $remoteExists) {
    Write-Host "Adicionando remote origin..." -ForegroundColor Cyan
    git remote add origin "https://github.com/$githubUser/$repoName.git"
}

# Fazer push
Write-Host "Fazendo push para GitHub..." -ForegroundColor Cyan
git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao fazer push" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Deploy concluído com sucesso! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://github.com/$githubUser/$repoName" -ForegroundColor White
Write-Host "2. Vá em Settings > Pages" -ForegroundColor White
Write-Host "3. Em Source, selecione: GitHub Actions" -ForegroundColor White
Write-Host "4. O site estará disponível em alguns minutos em:" -ForegroundColor White
Write-Host "   https://$githubUser.github.io/$repoName/" -ForegroundColor Cyan
Write-Host ""
