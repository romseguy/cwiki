module.exports = function (api) {
  const isServer = api.caller((caller) => caller?.isServer);
  const isCallerDevelopment = api.caller((caller) => caller?.isDev);

  const presets = [
    [
      "next/babel",
      {
        "preset-react": {
          runtime: "automatic",
          importSource: "@emotion/react"
        }
      }
    ]
  ];

  const env = {
    production: {
      plugins: []
    },
    development: {
      compact: false
    }
  };

  const plugins = [
    [
      "@emotion",
      {
        // sourceMap is on by default but source maps are dead code eliminated in production
        sourceMap: false,
        cssPropOptimization: false
      }
    ]
  ];

  return { presets, env, plugins };
};
