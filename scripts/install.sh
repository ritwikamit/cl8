#!/usr/bin/env bash
#
# One-command install of CL8 for macOS / Linux
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/ritwikamit/cl8/main/scripts/install.sh | bash
#
set -euo pipefail

REPO="ritwikamit/cl8"
BRANCH="main"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() { echo -e "  ${CYAN}$1${NC}"; }
ok()   { echo -e "  ${GREEN}✓ $1${NC}"; }
err()  { echo -e "  ${RED}✖ $1${NC}"; }

echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         CL8 Installer (Unix)         ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# --- Check Node.js ---
step "Checking prerequisites..."
if ! command -v node &>/dev/null; then
  err "Node.js not found. Install from https://nodejs.org (v18+) then re-run."
  exit 1
fi

NODE_VER=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  err "Node.js v18+ required, found $(node --version)"
  exit 1
fi
ok "Node.js $(node --version)"

if ! command -v npm &>/dev/null; then
  err "npm not found (should ship with Node.js)"
  exit 1
fi
ok "npm $(npm --version)"

# --- Install ---
step "Installing CL8 globally via npm..."
npm install -g cl8 2>&1
ok "CL8 installed"

# --- Verify ---
step "Verifying installation..."
CL8_VER=$(cl8 --version 2>/dev/null)
ok "CL8 $CL8_VER ready to go!"

echo ""
echo -e "  ${YELLOW}Quick start:   cl8${NC}"
echo -e "  ${YELLOW}Get help:      cl8 --help${NC}"
echo -e "  ${YELLOW}Health check:  cl8 doctor${NC}"
echo ""
echo -e "  ${DARKGRAY}Need an API key? Run: cl8 init${NC}"
echo ""
