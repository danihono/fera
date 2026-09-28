// Build do site pro Firebase Hosting (app na raiz, em vez de /fera/app do GitHub Pages).
// Uso: npm run build:hosting  →  depois: firebase deploy --only hosting,firestore
const { execSync } = require('node:child_process');
const fs = require('node:fs');

execSync('npx expo export --platform web --clear', { stdio: 'inherit', env: { ...process.env, EXPO_BASE_URL: '' } });

// O modelo da página (public/) aponta ícones e manifest pra /fera/app/: na raiz, vira /.
for (const f of ['dist/index.html', 'dist/manifest.json']) {
  fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replaceAll('/fera/app/', '/'));
}
console.log('\nPronto. Agora: firebase deploy --only hosting,firestore');
