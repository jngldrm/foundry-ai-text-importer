const typescript = require('rollup-plugin-typescript2');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const pluginJSON = require('@rollup/plugin-json');

module.exports = {
  input: 'src/module/llm-text-content-importer.ts',
  output: {
    dir: 'dist/module',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript({}),
    commonjs({
      include: /node_modules/,
      requireReturnsDefault: 'auto', // <---- this solves default issue
    }),
    pluginJSON(),
  ],
};
