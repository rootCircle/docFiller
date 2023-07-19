const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    filler: "./src/filler.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/popup", to: "popup" },
        { from: "./manifest.json" },
        { from: "src/filler", to: "filler" },
        { from: "src/icons", to: "icons" },
      ],
    }),
  ],
};
