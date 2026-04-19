const appJson = require('./app.json');

const isProductionBuild =
  process.env.NODE_ENV === 'production' || process.env.EAS_BUILD_PROFILE === 'production';

module.exports = () => {
  const expoConfig = appJson.expo || {};

  return {
    ...expoConfig,
    android: {
      ...(expoConfig.android || {}),
      usesCleartextTraffic: !isProductionBuild,
    },
  };
};
