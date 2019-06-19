const path = require('path')
const BundleTracker = require('webpack-bundle-tracker')

module.exports = {
  entry: path.join(__dirname, 'assets/src/index'),
  output: {
    path: path.join(__dirname, 'assets/dist'),
    filename: '[name]-[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(bmp|gif|jpeg|png|eot|ttf|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/[name].[ext]'
        }
      },
      {
        test:/\.(woff2|woff)$/,
        loader: 'url-loader',
        options: {
          mimetype: 'application/font-woff',
          name: 'static/[name].[ext]',
          limit: 10000
        },
      }
    ]
  },
  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: 'webpack-stats.json'
    })
  ]
}
