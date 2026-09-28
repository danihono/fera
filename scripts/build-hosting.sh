#!/usr/bin/env bash
# Build do site pro Firebase Hosting (app na raiz, em vez de /fera/app do GitHub Pages).
set -euo pipefail
EXPO_BASE_URL= npx expo export --platform web --clear
# O modelo da página (public/) aponta ícones e manifest pra /fera/app/: na raiz, vira /.
sed -i 's#/fera/app/#/#g' dist/index.html dist/manifest.json
