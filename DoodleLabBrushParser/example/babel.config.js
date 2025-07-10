const path = require('path');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
};
