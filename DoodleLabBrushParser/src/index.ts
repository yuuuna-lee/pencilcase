import { NativeModules, Platform } from 'react-native';
import type { Spec } from './NativeDoodleLabBrushParser';

// 타입 re-export
export interface ProcreateBrushData {
  // Basic Properties
  name?: string;
  paintSize?: number;
  paintOpacity?: number;
  blendMode?: number;
  plotSmoothing?: number;
  
  // Brush Type
  isEraser?: number;
  isSmudge?: number;
  
  // Wet Paint Dynamics
  wetness?: number;
  charge?: number;
  flow?: number;
  jitter?: number;
  grade?: number;
  bleeding?: number;
  
  // Pressure Dynamics
  pressureSize?: number;
  pressureOpacity?: number;
  pressureSaturation?: number;
  pressureBrightness?: number;
  
  // Velocity Dynamics  
  velocitySaturation?: number;
  velocityBrightness?: number;
  
  // Tilt Dynamics
  tilt?: number;
  tiltHardness?: number;
  tiltOpacity?: number;
  tiltAngle?: number;
  tiltSize?: number;
  tiltBleed?: number;
  tiltGradation?: number;
  
  // Shape Dynamics (기존)
  shapeRotation?: number;
  shapeAzimuth?: number;
  shapeAzimuthJitter?: number;
  
  // Advanced Shape Dynamics
  shapeCount?: number;
  shapeFlipX?: number;
  shapeFlipY?: number;
  shapeFlipXJitter?: number;
  shapeFlipYJitter?: number;
  shapeScaleX?: number;
  shapeScaleY?: number;
  shapeScaleJitter?: number;
  
  // Dynamics Curves (핵심!)
  dynamicsPressureSizeCurve?: string; // Base64 encoded curve data
  dynamicsPressureOpacityCurve?: string;
  dynamicsPressureHueCurve?: string;
  dynamicsPressureSaturationCurve?: string;
  dynamicsPressureBrightnessCurve?: string;
  
  // Speed Dynamics
  dynamicsSpeedSize?: number;
  dynamicsSpeedOpacity?: number;
  
  // Tilt Dynamics Extended
  dynamicsTiltSize?: number;
  dynamicsTiltOpacity?: number;
  dynamicsTiltAngle?: number;
  dynamicsTiltBrightness?: number;
  
  // Spacing & Smoothing
  plotSpacing?: number; // 핵심! 입자 간격
  
  // Blend Modes
  dualBlendMode?: number;
  grainBlendMode?: number;
  
  // Texture Properties
  textureMovement?: number; // Grain texture movement
  textureContrast?: number;
  textureOrientation?: number;
  textureDepthTilt?: number;
  
  // Shape Filtering
  shapeFilter?: number;
  shapeFilterMode?: number;
  shapeInverted?: number;
  
  // Color & Opacity
  maxOpacity?: number;
  color?: string;
  
  // Textures (기존 + 추가)
  shapeTextureBase64?: string;
  grainTextureBase64?: string; // 새로 추가!
  
  // Advanced Properties
  taperSize?: number;
  taperPressure?: number;
  taperEndLength?: number;
  taperSizeLinked?: number;
  
  // Jitter Properties
  lightnessJitterTilt?: number;
  saturationJitterTiltAngle?: number;
  dynamicsJitterLightness?: number;
  dynamicsJitterDarkness?: number;
  dynamicsWetnessJitter?: number;
  
  // Mixing & Blending
  dynamicsMix?: number;
  dynamicsPressureMix?: number;
  dynamicsPressureSecondaryColor?: string;
  
  // Extended Blend
  extendedBlend?: number;
  blendGammaCorrect?: number;
  
  // Preview
  previewSize?: number;
  
  // Import Info
  importedFromABR?: number;
}

const LINKING_ERROR =
  `The package 'doodlelab-brush-parser' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const DoodleLabBrushParser: Spec = NativeModules.DoodleLabBrushParser
  ? (NativeModules.DoodleLabBrushParser as Spec)
  : new Proxy({} as Spec, {
        get() {
          throw new Error(LINKING_ERROR);
        },
    });

export default DoodleLabBrushParser;
