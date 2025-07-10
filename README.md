# DoodleLab 브러시 파서

Procreate 브러시 파일(.brush)을 파싱하고 렌더링하는 React Native 라이브러리입니다. 완전한 텍스처 지원과 그리기 기능을 제공합니다.

## 🎨 주요 기능

### ✅ 완전한 브러시 파일 파싱
- **브러시 아카이브 파싱**: Procreate .brush 파일에서 모든 브러시 속성을 추출
- **Shape 텍스처 지원**: 적절한 알파 채널 처리로 Shape.png 텍스처를 처리
- **브러시 속성**: 크기, 불투명도, 간격, 지터, 압력 민감도 등 모든 주요 브러시 속성 지원

### ✅ 고급 텍스처 처리
- **알파 마스크 변환**: CoreImage의 `CIMaskToAlpha`를 사용하여 그레이스케일 Shape.png를 알파 마스크로 변환
- **색상 적용**: ColorMatrix/ColorFilter를 사용하여 브러시 텍스처에 동적 색상 적용
- **텍스처 미리보기**: 처리된 브러시 텍스처를 실시간으로 표시

### ✅ 완전한 그리기 구현
- **파티클 기반 렌더링**: 각 브러시 스트로크는 개별 텍스처 스탬프로 구성
- **브러시 간격**: 브러시 파일의 `plotSpacing` 값을 존중하여 정통한 스트로크 모양 구현
- **압력 민감도**: 압력 기반 크기 및 불투명도 변화 지원
- **지터 효과**: 자연스러운 브러시 동작을 위한 랜덤화 효과 구현
- **성능 최적화**: 완성된 스트로크는 Skia Picture 사용, 현재 스트로크는 실시간 렌더링

### ✅ 인터랙티브 UI
- **파일 선택기**: .brush 파일 선택을 위한 네이티브 문서 선택기
- **색상 선택**: 시각적 선택 피드백이 있는 6가지 사전 정의된 색상
- **브러시 크기 제어**: 브러시 크기 조정을 위한 커스텀 슬라이더 (1-100)
- **캔버스 제어**: 캔버스 지우기 기능 및 그리기 상태 관리

## 🏗️ 아키텍처

### iOS 네이티브 모듈 (`ios/DoodleLabBrushParser.m`)
```objectivec
// 주요 함수들:
- parseBrushFile: 메인 파싱 진입점
- base64StringFromImagePath: Shape.png 텍스처 처리
- extractBrushProperties: 브러시 속성을 TypeScript 인터페이스로 매핑
```

**텍스처 처리 파이프라인:**
1. 브러시 아카이브에서 원본 Shape.png 로드
2. `CIMaskToAlpha` 필터 적용 (그레이스케일 → 알파 변환)
3. `CISourceAtop`을 사용하여 흰색 배경과 합성
4. React Native 사용을 위해 Base64로 변환

### React Native 컴포넌트

#### `BrushRenderer.tsx`
- 처리된 브러시 텍스처 미리보기 표시
- 로딩 상태 및 텍스처 크기 표시
- 텍스처 검증에 집중된 미니멀한 구성

#### `DrawingCanvas.tsx`
- 파티클 기반 브러시 시스템을 가진 **핵심 그리기 엔진**
- 동적 브러시 색상을 위한 **ColorMatrix 적용**
- 브러시 간격 기반 **보간된 스트로크 생성**
- 크기/불투명도 변화를 위한 **압력 민감 렌더링**
- 완성된 스트로크를 위한 Skia Picture로 **성능 최적화**

#### `App.tsx`
- 메인 애플리케이션 오케스트레이션
- 파일 로딩 및 텍스처 처리 조정
- UI 상태 관리 (브러시 크기, 색상, 그리기 상태)

## 🎯 기술적 하이라이트

### Shape.png 처리 문제 & 해결책

**문제**: Procreate Shape.png 파일은 그레이스케일 값을 브러시 불투명도 마스크로 사용하지만, React Native Skia는 적절한 RGBA 텍스처를 기대합니다.

**해결책**:
1. **iOS 처리**: CoreImage를 사용하여 그레이스케일을 알파 채널로 변환한 후 흰색과 합성
2. **React Native 렌더링**: ColorMatrix를 적용하여 흰색 텍스처를 원하는 브러시 색상으로 동적으로 착색

### 브러시 스트로크 렌더링

**파티클 시스템**:
```typescript
interface BrushParticle {
  x: number;           // 위치
  y: number;
  size: number;        // 압력과 브러시 크기에 영향받음
  opacity: number;     // 브러시 paintOpacity 속성에서
  rotation: number;    // 브러시 회전 각도
}
```

**간격 알고리즘**:
- 브러시 파일의 `plotSpacing`을 사용하여 스탬프 간격 결정
- 터치 포인트 간 파티클을 보간하여 부드러운 스트로크 생성
- 그리기 속도에 관계없이 일관된 간격 유지

### 성능 최적화

1. **Skia Picture**: 완성된 스트로크는 최적 렌더링을 위해 Picture로 "구워짐"
2. **실시간 렌더링**: 현재 스트로크만 개별 컴포넌트로 렌더링
3. **효율적 업데이트**: 상태 관리로 불필요한 리렌더링 최소화

## 📱 사용법

### 기본 설정
```tsx
import DoodleLabBrushParser, { ProcreateBrushData } from 'doodlelab-brush-parser';

// 브러시 파일 파싱
const brushData = await DoodleLabBrushParser.parseBrushFile(filePath);

// 그리기 캔버스에서 사용
<DrawingCanvas 
  brushData={brushData}
  brushSize={20}
  brushColor="#FF4081"
  onDrawStart={() => setIsDrawing(true)}
  onDrawEnd={() => setIsDrawing(false)}
/>
```

### 지원하는 브러시 속성
```typescript
interface ProcreateBrushData {
  name: string;
  paintSize: number;           // 기본 브러시 크기
  paintOpacity: number;        // 브러시 불투명도 (0-1)
  plotSpacing: number;         // 브러시 스탬프 간 간격
  pressureSize: number;        // 압력이 크기에 미치는 영향
  pressureOpacity: number;     // 압력이 불투명도에 미치는 영향
  jitter: number;              // 랜덤 위치/크기 변화
  shapeTextureBase64: string;  // 처리된 Shape.png를 Base64로
  // ... 더 많은 속성들
}
```

## 🔧 개발

### 빌드
```bash
# 의존성 설치
cd example && npm install

# iOS
cd ios && pod install
npx react-native run-ios

# Android  
npx react-native run-android
```

### 주요 파일들
- `ios/DoodleLabBrushParser.m` - 네이티브 브러시 파싱
- `src/index.ts` - TypeScript 인터페이스
- `example/src/components/DrawingCanvas.tsx` - 메인 그리기 구현
- `example/src/App.tsx` - 데모 애플리케이션

## 🎨 데모 기능

1. **브러시 파일 로드** - 네이티브 문서 선택기 사용
2. **텍스처 미리보기** - 실시간 처리 피드백과 함께
3. **브러시 색상 선택** - 미리 정의된 팔레트에서
4. **브러시 크기 조정** - 커스텀 슬라이더로
5. **정통한 브러시 동작으로 그리기** - 간격, 압력, 지터 포함
6. **캔버스 지우기** - 새로 시작하기

## 🚀 다음 단계

- [ ] 그레인 텍스처 지원 (Grain.png 처리)
- [ ] 추가 브러시 속성 (습도, 번짐, 플로우)
- [ ] 브러시 내보내기 기능
- [ ] 커스텀 색상 선택기
- [ ] 브러시 라이브러리 관리
- [ ] 고급 블렌딩 모드

---

**React Native, Skia, CoreImage로 제작** 🎨 