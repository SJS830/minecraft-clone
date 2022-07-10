/*
Sets up webpack to watch the source files and starts serving the client at port 80
*/

const OptimizeThreePlugin = require("@vxna/optimize-three-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const express = require("express");
const webpack = require("webpack");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "./dist")));
app.listen(80, "0.0.0.0");

const compiler = webpack({
  context: path.resolve(__dirname, "client"),

  entry: "./Minecraft.js",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },

  mode: "development",

  optimization: {
    usedExports: true,
  },

  plugins: [
    new OptimizeThreePlugin(),
    /*new HtmlWebpackPlugin({
      title: "Minecraft"
    }),*/
    new CopyPlugin({
      patterns: [
        "assets"
      ]
    })
  ]
});

const watching = compiler.watch({
  aggregateTimeout: 300,
  poll: undefined
}, (err, stats) => {
  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.error(info.errors);
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings);
  }
});
