const commonConfig = require('./webpack.common.conf');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const helper = require('./helper');
const HashOutput = require('webpack-plugin-hash-output');

const os = require('os');
/**
 * Webpack Plugins
 */
const UglifyJsparallelPlugin = require('webpack-uglify-parallel');

const CleanWebpackPlugin = require('clean-webpack-plugin');

/**
 * Webpack configuration for weex.
 */

const weexConfig = webpackMerge(commonConfig[1], {
  /*
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [
    new CleanWebpackPlugin('dist-prod/**/*.js', {
      root: process.cwd(),
      verbose: true,
      dry: false,
    }),
    /*
     * Plugin: UglifyJsparallelPlugin
     * Description: Identical to standard uglify webpack plugin
     * with an option to build multiple files in parallel
     *
     * See: https://www.npmjs.com/package/webpack-uglify-parallel
     */
    new UglifyJsparallelPlugin({
      workers: os.cpus().length,
      mangle: true,
      compressor: {
        warnings: false,
        drop_console: true,
        drop_debugger: true
      }
    }),
    // Need to run uglify first, then pipe other webpack plugins
    ...commonConfig[1].plugins,

    // use file md5 as chunkhash
    new HashOutput({
      validateOutputRegex: /.*\.js$/,
    })
  ],
  
  output: {
    path: helper.rootNode('dist-prod'),
    filename: '[name]-[chunkhash].bundle.js',
  },
})

module.exports = weexConfig
