const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  mode: 'production', // 開発モード: development 本番モード: production
  entry: {
    index: './main.ts',
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js'
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
  target: 'node',
  externalsType: 'node-commonjs',
  externals: [nodeExternals()],
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new NodePolyfillPlugin({
      excludeAliases: ['console']
    }),
    new webpack.DefinePlugin({
      'process.env.GOOGLE_TYPE': JSON.stringify(process.env.GOOGLE_TYPE),
      'process.env.PROJECT_ID': JSON.stringify(process.env.PROJECT_ID),
      'process.env.GOOGLE_PRIVATE_KEY_ID': JSON.stringify(process.env.GOOGLE_PRIVATE_KEY_ID),
      'process.env.GOOGLE_PRIVATE_KEY': JSON.stringify(process.env.GOOGLE_PRIVATE_KEY),
      'process.env.GOOGLE_CLIENT_EMAIL': JSON.stringify(process.env.GOOGLE_CLIENT_EMAIL),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID),
      'process.env.GOOGLE_AUTH_URI': JSON.stringify(process.env.GOOGLE_AUTH_URI),
      'process.env.GOOGLE_TOKEN_URI': JSON.stringify(process.env.GOOGLE_TOKEN_URI),
      'process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL': JSON.stringify(process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL),
      'process.env.GOOGLE_CLIENT_X509_CERT_URL': JSON.stringify(process.env.GOOGLE_CLIENT_X509_CERT_URL),
      'process.env.GOOGLE_UNIVERSE_DOMAIN': JSON.stringify(process.env.GOOGLE_UNIVERSE_DOMAIN)
    })
  ],
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify')
    }
  }
};