const path = require('path');

module.exports = {
  entry: {
    index: path.resolve(__dirname, 'static/js/index.js'),
    matchup: path.resolve(__dirname, 'static/js/matchup.js')
  },
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
};
