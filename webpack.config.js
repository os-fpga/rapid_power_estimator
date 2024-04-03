const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { DefinePlugin } = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    module: {
      rules: [
        {
          test: /\.(?:js|mjs|cjs|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        inject: 'body',
        hash: true,
      }),
      new DefinePlugin({
        mode: JSON.stringify(isProduction ? 'production' : 'development'),
      }),
    ],
    mode: 'development',
    output: {
      path: path.resolve(__dirname, 'build'),
      clean: true,
    },
  };
};
