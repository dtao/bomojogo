const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'static/js/index.js'),
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: 'index.js'
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
