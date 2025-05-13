//const withCustomBabelConfigFile = require("next-plugin-custom-babel-config");
const withPWA = require("next-pwa")({ dest: "public", reloadOnOnline: false });
//const withPreact = require("next-plugin-preact");
const { i18n } = require("./next-i18next.config");

const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER
} = require("next/constants");

let plugins = [
  //withPreact,
  //  withPWA
  // withCustomBabelConfigFile({
  //   babelConfigFile: path.resolve("./babel.config.js")
  // })
];

if (process.env.ANALYZE) {
  const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: true
  });
  plugins.unshift(withBundleAnalyzer);
}

const nextConfig = {
  experimental: {
    largePageDataBytes: 10 * 1000000
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  i18n,
  // i18n: {
  //   locales: ["fr-FR"],
  //   defaultLocale: "fr-FR"
  // },
  swcMinify: false,
  typescript: {
    ignoreBuildErrors: true
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      loader: "emit-file-loader",
      options: {
        name: "dist/[path][name].[ext]"
      }
    });
    config.module.rules.push({
      test: /\.md$/,
      loader: "raw-loader"
    });
    config.externals.push({
      fs: "fs"
    });
    return config;
  }
};

module.exports = (phase, defaultConfig) => {
  if (phase === PHASE_PRODUCTION_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    plugins.unshift(withPWA);
  }
  const config = plugins.reduce(
    (acc, plugin) => {
      const update = plugin(acc);
      return typeof update === "function"
        ? update(phase, defaultConfig)
        : update;
    },
    { ...nextConfig }
  );

  return config;
};
