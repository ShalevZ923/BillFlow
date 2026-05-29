#!/usr/bin/env bash
set -euo pipefail

echo "=== Typecheck ==="
pnpm run typecheck

echo ""
echo "=== Unit & Integration Tests ==="
pnpm run test

echo ""
echo "=== Production Build ==="
pnpm run build

echo ""
echo "=== All checks passed ==="
