# Script para configurar o repositório GitHub
# Execute este script após criar o repositório no GitHub

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$RepositoryName = "TibiaManagerSite"
)

Write-Host "Configurando repositório GitHub..." -ForegroundColor Green

# Verificar se já existe remote
$remoteExists = git remote -v | Select-String "origin"
if ($remoteExists) {
    Write-Host "Remote 'origin' já existe. Removendo..." -ForegroundColor Yellow
    git remote remove origin
}

# Adicionar remote
$remoteUrl = "https://github.com/$GitHubUsername/$RepositoryName.git"
Write-Host "Adicionando remote: $remoteUrl" -ForegroundColor Cyan
git remote add origin $remoteUrl

# Verificar conexão
Write-Host "`nVerificando conexão..." -ForegroundColor Green
git remote -v

Write-Host "`nPróximos passos:" -ForegroundColor Yellow
Write-Host "1. Certifique-se de que o repositório '$RepositoryName' existe no GitHub" -ForegroundColor White
Write-Host "2. Execute: git push -u origin main" -ForegroundColor White
Write-Host "3. Habilite GitHub Pages em Settings > Pages > Source: GitHub Actions" -ForegroundColor White
