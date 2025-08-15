const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Adds support for `.db` files for SQLite databases
  'db'
);

// Add support for TypeScript and JSX files
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

// Add platform-specific extensions for web compatibility
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Add resolver alias for web compatibility
config.resolver.alias = {
  'react-native-maps': 'react-native-web-maps',
};

// Add web-specific module resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
