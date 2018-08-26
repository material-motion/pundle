const path = require('path')
const presetDefault = require('pundle-preset-default')

module.exports = {
  entry: ['./src', './index.html'],
  components: presetDefault({
    transform: {
      json5: true,
    },
  }),
  rootDirectory: __dirname,
  output: {
    rootDirectory: path.join(__dirname, 'dist'),
  },
}
