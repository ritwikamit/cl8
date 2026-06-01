#!/usr/bin/env pwsh
<#
.SYNOPSIS
  One-command install of CL8 for Windows
.DESCRIPTION
  Installs CL8 globally via npm. Requires Node.js >= 18.
  Run: irm https://raw.githubusercontent.com/ritwikamit/cl8/main/scripts/install.ps1 | iex
#>

$ErrorActionPreference = "Stop"
$Repo = "ritwikamit/cl8"
$Branch = "main"

function Write-Step($msg) { Write-Host "  $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "  ✖ $msg" -ForegroundColor Red }

Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║        CL8 Installer (Windows)       ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# --- Check Node.js ---
Write-Step "Checking prerequisites..."
$node = Get-Command "node" -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Err "Node.js not found. Install from https://nodejs.org (v18+) then re-run."
  exit 1
}

$nodeVer = node --version
if ($nodeVer -match 'v(\d+)') {
  $major = [int]$Matches[1]
  if ($major -lt 18) {
    Write-Err "Node.js v18+ required, found $nodeVer"
    exit 1
  }
}
Write-OK "Node.js $nodeVer"

$npm = Get-Command "npm" -ErrorAction SilentlyContinue
if (-not $npm) {
  Write-Err "npm not found (should ship with Node.js)"
  exit 1
}
Write-OK "npm $($npm.Source)"

# --- Install ---
Write-Step "Installing CL8 globally via npm..."
npm install -g cl8 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Err "npm install failed. Check your network connection."
  exit 1
}
Write-OK "CL8 installed"

# --- Verify ---
Write-Step "Verifying installation..."
$ver = cl8 --version 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-OK "CL8 $ver ready to go!"
} else {
  Write-Err "Installation verification failed"
  exit 1
}

Write-Host ""
Write-Host "  Quick start:   cl8" -ForegroundColor Yellow
Write-Host "  Get help:      cl8 --help" -ForegroundColor Yellow
Write-Host "  Health check:  cl8 doctor" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Need an API key? Set up your .env or run: cl8 init" -ForegroundColor DarkGray
Write-Host ""
