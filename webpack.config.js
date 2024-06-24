const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  mode: 'production',
  entry: {
    script: './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/preset-env",
          ],
        },
      }
    ]
  },
  target: 'web',
  resolve: {
    fallback: {
      "util": require.resolve("util/"),
      "assert": require.resolve("assert/"),
      "buffer": require.resolve("buffer/"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "querystring": require.resolve("querystring-es3"),
      "fs": false,
      "os": require.resolve("os-browserify/browser"),
      "path": require.resolve("path-browserify"),
      "https": require.resolve("https-browserify"),
      "http": require.resolve("stream-http"),
      "net": false,
      "tls": false,
      "zlib": require.resolve("browserify-zlib"),
      "vm": require.resolve("vm-browserify"),
      "child_process": false,
      "process": require.resolve("process/browser"),
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.browser': 'true',
      'process.env.FIREBASE_APIKEY': JSON.stringify(process.env.FIREBASE_APIKEY),
      'process.env.FIREBASE_DOMAIN': JSON.stringify(process.env.FIREBASE_DOMAIN),
      'process.env.FIREBASE_DATABASE': JSON.stringify(process.env.FIREBASE_DATABASE),
      'process.env.PROJECT_ID': JSON.stringify(process.env.PROJECT_ID),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
      'process.env.FIREBASE_SENDER_ID': JSON.stringify(process.env.FIREBASE_SENDER_ID),
      'process.env.FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_APP_ID)
    })
  ],
};