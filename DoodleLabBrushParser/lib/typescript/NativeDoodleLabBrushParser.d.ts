import type { TurboModule } from 'react-native';
export interface ParsedBrushResult {
    name: string;
    shapeImageBase64: string;
    is3DBrush: boolean;
}
export interface Spec extends TurboModule {
    parseBrushFile(filePath: string): Promise<ParsedBrushResult>;
}
declare const _default: Spec;
export default _default;
//# sourceMappingURL=NativeDoodleLabBrushParser.d.ts.map