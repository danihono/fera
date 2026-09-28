// O app.json vale pro GitHub Pages (/fera/app). Pro Firebase Hosting o site fica na raiz:
// EXPO_BASE_URL= npx expo export --platform web
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL ?? config.experiments.baseUrl,
  },
});
