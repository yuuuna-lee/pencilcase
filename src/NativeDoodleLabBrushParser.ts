import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface ParsedBrushResult {
  name: string;
  shapeImageBase64: string; // Shape.png의 base64
  is3DBrush: boolean;
  // 필요시 추가 정보
}

export interface Spec extends TurboModule {
  parseBrushFile(filePath: string): Promise<ParsedBrushResult>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('DoodleLabBrushParser');
