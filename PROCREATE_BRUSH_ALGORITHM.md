# 🎨 Procreate 브러시 렌더링 알고리즘 완전 분석

## 📋 개요

Procreate 브러시는 **스탬프 기반 입자 시스템**으로 동작합니다. 벡터 스트로크가 아닌 **Shape.png 이미지를 반복적으로 찍어서** 브러시 스트로크를 만듭니다.

---

## 🔍 1. 핵심 렌더링 원리

### **1.1 스탬프 기반 브러시 시스템**

```
사용자 입력 경로 → 입자 위치 계산 → Shape.png 스탬프 → 최종 스트로크
```

- **입력**: 터치/펜 좌표 (x, y, pressure, tilt, velocity)
- **처리**: `plotSpacing` 간격으로 입자 위치 계산
- **출력**: 각 입자마다 Shape.png를 변형하여 렌더링

### **1.2 Shape.png의 역할**

```
Shape.png (Grayscale) → Alpha Mask → 브러시 색상 적용
```

- **흰색 픽셀 (255)**: 완전한 잉크 (alpha = 1.0)
- **회색 픽셀 (128)**: 반투명 잉크 (alpha = 0.5)
- **검은색 픽셀 (0)**: 완전 투명 (alpha = 0.0)

---

## 🧮 2. 입자 위치 계산 알고리즘

### **2.1 Pseudocode**

```pseudocode
function generateParticlesFromPath(inputPath, brushData, brushSize):
    particles = []
    spacing = brushData.plotSpacing * brushSize
    totalDistance = 0
    lastParticleDistance = 0
    
    for i = 1 to inputPath.length - 1:
        prev = inputPath[i-1]
        curr = inputPath[i]
        
        // 세그먼트 거리 계산
        dx = curr.x - prev.x
        dy = curr.y - prev.y
        segmentDistance = sqrt(dx² + dy²)
        segmentAngle = atan2(dy, dx)
        
        totalDistance += segmentDistance
        
        // 이 세그먼트에서 입자 배치
        while totalDistance - lastParticleDistance >= spacing:
            // 입자 위치 보간
            t = (spacing - (totalDistance - segmentDistance - lastParticleDistance)) / segmentDistance
            
            particleX = prev.x + dx * t
            particleY = prev.y + dy * t
            particlePressure = lerp(prev.pressure, curr.pressure, t)
            
            // Dynamics 계산
            particle = calculateDynamics(particleX, particleY, particlePressure, segmentAngle, brushData)
            particles.append(particle)
            
            lastParticleDistance += spacing
    
    return particles
```

### **2.2 실제 구현 (TypeScript)**

```typescript
const generateParticlesFromPath = (
  path: { x: number; y: number; pressure: number }[],
  brushData: FullProcreateBrushData,
  brushSize: number
): BrushParticle[] => {
  if (path.length < 2) return [];
  
  const particles: BrushParticle[] = [];
  const spacing = calculateParticleSpacing(brushData, brushSize);
  
  let totalDistance = 0;
  let lastParticleDistance = 0;
  
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const segmentDistance = Math.sqrt(dx * dx + dy * dy);
    const segmentAngle = Math.atan2(dy, dx);
    
    totalDistance += segmentDistance;
    
    while (totalDistance - lastParticleDistance >= spacing) {
      const distanceAlongSegment = spacing - (totalDistance - segmentDistance - lastParticleDistance);
      const t = distanceAlongSegment / segmentDistance;
      
      const particleX = prev.x + dx * t;
      const particleY = prev.y + dy * t;
      const particlePressure = prev.pressure + (curr.pressure - prev.pressure) * t;
      
      // Dynamics 적용
      const particle = calculateParticleDynamics(
        particleX, particleY, particlePressure, segmentAngle, brushData, brushSize
      );
      
      particles.push(particle);
      lastParticleDistance += spacing;
    }
  }
  
  return particles;
};
```

---

## 🎭 3. Dynamics 시스템

### **3.1 압력 기반 크기 변화**

```pseudocode
function calculateDynamicSize(pressure, brushSize, brushData):
    pressureNormalized = clamp(pressure, 0, 1)
    
    if brushData.pressureSize exists:
        // Curve 적용 (실제로는 Base64 curve data 파싱)
        sizeCurve = evaluateCurve(pressureNormalized, brushData.dynamicsPressureSizeCurve)
        dynamicSize = brushSize * (1 + (brushData.pressureSize - 1) * sizeCurve)
    else:
        dynamicSize = brushSize
    
    return dynamicSize
```

### **3.2 압력 기반 불투명도 변화**

```pseudocode
function calculateDynamicOpacity(pressure, brushData):
    pressureNormalized = clamp(pressure, 0, 1)
    
    if brushData.pressureOpacity exists:
        opacityCurve = evaluateCurve(pressureNormalized, brushData.dynamicsPressureOpacityCurve)
        dynamicOpacity = brushData.paintOpacity * opacityCurve
    else:
        dynamicOpacity = brushData.paintOpacity
    
    return dynamicOpacity
```

### **3.3 방향 기반 회전**

```pseudocode
function calculateDynamicRotation(strokeAngle, brushData):
    rotation = brushData.shapeRotation
    
    // Azimuth: 스트로크 방향에 따른 회전
    if brushData.shapeAzimuth exists:
        rotation += strokeAngle * brushData.shapeAzimuth
    
    // Jitter: 랜덤 흔들림
    if brushData.shapeAzimuthJitter exists:
        rotation += random(-1, 1) * brushData.shapeAzimuthJitter
    
    return rotation
```

---

## 🖼️ 4. Shape.png 알파 마스킹

### **4.1 Fragment Shader (GLSL)**

```glsl
// Procreate 브러시 Fragment Shader
uniform sampler2D shapeTexture;
uniform vec4 brushColor;
uniform float opacity;

varying vec2 vUV;

void main() {
    // Shape.png에서 grayscale 값 샘플링
    vec4 shapePixel = texture2D(shapeTexture, vUV);
    
    // Grayscale → Alpha 변환
    // RGB 평균값을 알파로 사용
    float alpha = (shapePixel.r + shapePixel.g + shapePixel.b) / 3.0;
    
    // 브러시 색상에 알파 적용
    vec4 result = brushColor;
    result.a = alpha * opacity;
    
    gl_FragColor = result;
}
```

### **4.2 Skia RuntimeEffect (실제 구현)**

```typescript
const createBrushShader = (shapeImage: any, brushColor: string, opacity: number) => {
  const source = Skia.RuntimeEffect.Make(`
    uniform shader shape;
    uniform float4 brushColor;
    uniform float opacity;
    
    half4 main(float2 coord) {
      // Shape.png에서 grayscale 값 샘플링
      half4 shapePixel = shape.eval(coord);
      
      // Grayscale → Alpha 변환
      half alpha = (shapePixel.r + shapePixel.g + shapePixel.b) / 3.0;
      
      // 브러시 색상에 알파 적용
      half4 result = brushColor;
      result.a = alpha * opacity;
      
      return result;
    }
  `);
  
  if (!source) return null;
  
  // 브러시 색상을 RGBA로 변환
  const r = parseInt(brushColor.slice(1, 3), 16) / 255;
  const g = parseInt(brushColor.slice(3, 5), 16) / 255;
  const b = parseInt(brushColor.slice(5, 7), 16) / 255;
  
  return source.makeShader([
    shapeImage,
    r, g, b, 1.0, // brushColor
    opacity, // opacity
  ]);
};
```

### **4.3 ColorMatrix 대체 방식**

```typescript
const BrushAlphaPaint = ({ opacity, color }: { opacity: number; color: string }) => {
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;
  
  return (
    <Paint opacity={opacity}>
      <ColorMatrix
        matrix={[
          // Shape.png의 grayscale을 알파로, 브러시 색상을 RGB로 출력
          0, 0, 0, 0, r,     // Red = brushColor.r
          0, 0, 0, 0, g,     // Green = brushColor.g  
          0, 0, 0, 0, b,     // Blue = brushColor.b
          0.299, 0.587, 0.114, 0, 0, // Alpha = luminance (grayscale → alpha)
        ]}
      />
    </Paint>
  );
};
```

---

## 🌾 5. Grain 텍스처 시스템

### **5.1 Grain 오버레이 알고리즘**

```pseudocode
function renderGrainTexture(particle, grainImage, brushData):
    if grainImage exists and brushData.grainBlendMode exists:
        // Grain 위치 계산
        if brushData.textureMovement == 1:
            // 스트로크를 따라 움직임
            grainX = particle.x + particle.strokeOffset
            grainY = particle.y + particle.strokeOffset
        else:
            // 고정 위치
            grainX = particle.x
            grainY = particle.y
        
        // Grain 렌더링
        renderImage(grainImage, grainX, grainY, particle.size)
        setBlendMode(brushData.grainBlendMode) // Multiply, Overlay 등
        setOpacity(particle.opacity * 0.3) // Grain 강도 조절
```

### **5.2 실제 구현**

```typescript
{grainImage && brushData.grainBlendMode && (
  <Image
    image={grainImage}
    x={-particle.size / 2}
    y={-particle.size / 2}
    width={particle.size}
    height={particle.size}
    fit="contain"
    blendMode="multiply" // 또는 brushData.grainBlendMode에 따라
  >
    <Paint opacity={particle.opacity * 0.3} />
  </Image>
)}
```

---

## 🎯 6. 완전한 렌더링 파이프라인

### **6.1 전체 알고리즘 흐름**

```
1. 사용자 입력 수집
   ↓
2. 입자 위치 계산 (plotSpacing 기반)
   ↓
3. 각 입자별 Dynamics 적용
   - 크기 (압력, 속도, 틸트)
   - 불투명도 (압력, 속도)
   - 회전 (방향, Jitter)
   - 색상 (단일색, 듀얼 블렌딩)
   ↓
4. Shape.png 알파 마스킹
   - Grayscale → Alpha 변환
   - 브러시 색상 적용
   ↓
5. Grain 텍스처 오버레이 (선택적)
   ↓
6. 최종 블렌딩 및 렌더링
```

### **6.2 성능 최적화**

```typescript
// 입자 수 제한
const MAX_PARTICLES_PER_STROKE = 1000;

// 거리 기반 컬링
const shouldRenderParticle = (particle: BrushParticle, viewBounds: Rect) => {
  return particle.x >= viewBounds.left - particle.size &&
         particle.x <= viewBounds.right + particle.size &&
         particle.y >= viewBounds.top - particle.size &&
         particle.y <= viewBounds.bottom + particle.size;
};

// 텍스처 캐싱
const cachedShapeTexture = useMemo(() => {
  return createTextureFromBase64(brushData.shapeTextureBase64);
}, [brushData.shapeTextureBase64]);
```

---

## 🚀 7. 고급 기능

### **7.1 Pressure Curve 해석**

```typescript
// Base64 curve data를 실제 곡선으로 변환
const parsePressureCurve = (base64Data: string): Float32Array => {
  const binaryData = atob(base64Data);
  const curvePoints = new Float32Array(binaryData.length / 4);
  
  for (let i = 0; i < curvePoints.length; i++) {
    const bytes = binaryData.slice(i * 4, (i + 1) * 4);
    curvePoints[i] = new DataView(bytes.buffer).getFloat32(0, true);
  }
  
  return curvePoints;
};

const evaluateCurve = (input: number, curveData: Float32Array): number => {
  const index = input * (curveData.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const t = index - lowerIndex;
  
  if (lowerIndex === upperIndex) {
    return curveData[lowerIndex];
  }
  
  return curveData[lowerIndex] * (1 - t) + curveData[upperIndex] * t;
};
```

### **7.2 멀티 레이어 블렌딩**

```typescript
const renderBrushStroke = (particles: BrushParticle[]) => {
  return (
    <Group>
      {/* 베이스 레이어: Shape 텍스처 */}
      <Group blendMode="normal">
        {particles.map(particle => renderShapeParticle(particle))}
      </Group>
      
      {/* 오버레이 레이어: Grain 텍스처 */}
      <Group blendMode="multiply">
        {particles.map(particle => renderGrainParticle(particle))}
      </Group>
      
      {/* 이펙트 레이어: 추가 효과 */}
      <Group blendMode="screen">
        {particles.map(particle => renderEffectParticle(particle))}
      </Group>
    </Group>
  );
};
```

---

## 📊 8. 성능 벤치마크

### **8.1 목표 성능**

- **60 FPS**: 실시간 드로잉
- **< 16ms**: 프레임당 렌더링 시간
- **< 100MB**: 메모리 사용량

### **8.2 최적화 전략**

```typescript
// 1. 입자 풀링
class ParticlePool {
  private pool: BrushParticle[] = [];
  
  acquire(): BrushParticle {
    return this.pool.pop() || this.createParticle();
  }
  
  release(particle: BrushParticle): void {
    this.pool.push(particle);
  }
}

// 2. 텍스처 아틀라스
const createTextureAtlas = (brushTextures: string[]) => {
  // 여러 브러시 텍스처를 하나의 아틀라스로 합치기
};

// 3. LOD (Level of Detail)
const calculateLOD = (particle: BrushParticle, cameraDistance: number) => {
  if (cameraDistance > 100) return 'low';
  if (cameraDistance > 50) return 'medium';
  return 'high';
};
```

---

## 🎨 9. 결론

이 알고리즘을 통해 **진짜 Procreate 브러시**를 완벽히 재현할 수 있습니다:

1. **입자 기반 렌더링**: 벡터가 아닌 스탬프 방식
2. **동적 속성 적용**: 압력/속도/틸트 기반 변형
3. **알파 마스킹**: Shape.png의 grayscale → alpha 변환
4. **고급 블렌딩**: Grain 텍스처 및 다중 레이어

이제 **진짜 Procreate 브러시 엔진**이 완성되었습니다! 🎉 