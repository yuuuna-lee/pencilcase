import { NativeModules, Platform } from 'react-native';

// 타입 re-export

const LINKING_ERROR = `The package 'doodlelab-brush-parser' doesn't seem to be linked. Make sure: \n\n` + Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const DoodleLabBrushParser = NativeModules.DoodleLabBrushParser ? NativeModules.DoodleLabBrushParser : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
export default DoodleLabBrushParser;
//# sourceMappingURL=index.js.map