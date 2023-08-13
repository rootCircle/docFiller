const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
require('dotenv').config({ path: 'develop.env' })
const webpack = require('webpack')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  entry: {
    filler: "./src/filler.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  watch: true,
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/popup", to: "popup" },
        { from: "./manifest.json" },
        { from: "src/filler", to: "filler" },
        { from: "src/icons", to: "icons" },
      ],
    }),
    new NodePolyfillPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        OPENAI_API_KEY: JSON.stringify(process.env.OPENAI_API_KEY)
      }
    }),
  ],
};
