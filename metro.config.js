const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// App size optimization configurations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Enable advanced minification
    keep_fnames: false,
    mangle: {
      keep_fnames: false,
    },
    compress: {
      drop_console: true, // Remove console.log in production
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
    },
  },
  // Enable Hermes for better performance and smaller bundle size
  hermesCommand: 'hermes',
  enableHermes: true,
};

// Optimize resolver for smaller bundle
config.resolver = {
  ...config.resolver,
  // Exclude unnecessary files from bundling
  blacklistRE: /node_modules\/.*\/(test|tests|__tests__|\.test\.|\.spec\.|example|examples|demo|docs|documentation|readme|changelog|license|contributing).*$/i,
  // Asset extensions optimization
  assetExts: [...config.resolver.assetExts, 'webp'], // Use WebP for smaller images
};

// Enable tree shaking and dead code elimination
config.serializer = {
  ...config.serializer,
  createModuleIdFactory: () => (path) => {
    // Use shorter module IDs for smaller bundle
    return require('crypto').createHash('md5').update(path).digest('hex').substr(0, 8);
  },
};

module.exports = config;
