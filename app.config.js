// O app.json vale pro GitHub Pages (/fera/app). Pro Firebase Hosting o site fica na raiz:
// npm run build:hosting (scripts/build-hosting.js)
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL ?? config.experiments.baseUrl,
  },
});
