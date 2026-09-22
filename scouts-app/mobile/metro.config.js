const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support .cjs for Firebase SDK
config.resolver.sourceExts.push('cjs');

// Resolve Firebase modules properly in React Native / Expo
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
