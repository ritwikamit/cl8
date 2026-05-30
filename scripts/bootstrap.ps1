# JarvisCLI Bootstrap Script
# Run this script to set up the project from scratch

Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     JarvisCLI Bootstrap Script            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "✖ Node.js is not installed. Please install Node.js 18+" -ForegroundColor Red
    Write-Host "  https://nodejs.org/"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm v$npmVersion detected" -ForegroundColor Green
} catch {
    Write-Host "✖ npm is not installed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✖ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Create .env if not exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "Creating .env from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env created. Edit it to add your API keys." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "• .env already exists, skipping" -ForegroundColor DarkYellow
}

# Build
Write-Host ""
Write-Host "Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✖ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Setup Complete!                        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Edit .env with your API keys" -ForegroundColor White
Write-Host "  2. Run 'npm run dev' to start" -ForegroundColor White
Write-Host "  3. Or 'npm start' for production build" -ForegroundColor White
Write-Host ""
