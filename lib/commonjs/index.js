"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
// 타입 re-export

const LINKING_ERROR = `The package 'doodlelab-brush-parser' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const DoodleLabBrushParser = _reactNative.NativeModules.DoodleLabBrushParser ? _reactNative.NativeModules.DoodleLabBrushParser : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
var _default = exports.default = DoodleLabBrushParser;
//# sourceMappingURL=index.js.map