# Script PowerShell para copiar os assets do projeto legado para o Angular

Write-Host "🔧 Copiando assets do projeto legado..." -ForegroundColor Cyan

# Criar diretórios se não existirem
$assetsPages = "src\assets\pages"
$assetsStatic = "src\assets\static"

if (-not (Test-Path $assetsPages)) {
    New-Item -ItemType Directory -Path $assetsPages -Force | Out-Null
    Write-Host "✅ Criado: $assetsPages" -ForegroundColor Green
}

if (-not (Test-Path $assetsStatic)) {
    New-Item -ItemType Directory -Path $assetsStatic -Force | Out-Null
    Write-Host "✅ Criado: $assetsStatic" -ForegroundColor Green
}

# Copiar dados_escolas.json
$jsonSource = "Analise-REGINA-main\dados_escolas.json"
if (Test-Path $jsonSource) {
    Copy-Item $jsonSource "$assetsStatic\dados_escolas.json" -Force
    Write-Host "✅ Copiado: dados_escolas.json" -ForegroundColor Green
} else {
    Write-Host "⚠️  Não encontrado: $jsonSource" -ForegroundColor Yellow
}

# Listar HTMLs para copiar (opcional - você pode descomentar se quiser copiar os HTMLs legados)
# $htmlFiles = @(
#     "index.html",
#     "visao-geral.html",
#     "simulador.html",
#     "gemini.html"
# )

# foreach ($file in $htmlFiles) {
#     $source = "Analise-REGINA-main\$file"
#     if (Test-Path $source) {
#         Copy-Item $source "$assetsPages\$file" -Force
#         Write-Host "✅ Copiado: $file" -ForegroundColor Green
#     } else {
#         Write-Host "⚠️  Não encontrado: $file" -ForegroundColor Yellow
#     }
# }

Write-Host ""
Write-Host "✨ Assets copiados com sucesso!" -ForegroundColor Green
Write-Host "📝 Próximo passo: Execute 'npm install' para instalar as dependências" -ForegroundColor Cyan
