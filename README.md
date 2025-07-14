# PencilCase – Procreate Brush 시뮬레이터

<img width="491" height="401" alt="Image" src="https://github.com/user-attachments/assets/1cc61470-589e-4573-8bd3-218dee7a2623" />


Procreate의 .brush 파일을 분석하고, 실시간으로 시뮬레이션할 수 있는 모바일 기반 브러시 테스트 툴입니다.
비공식 바이너리 포맷을 직접 리버스 엔지니어링하고, React Native + Skia + Objective-C 기반의 Turbo Native Module로 구현했습니다.

판매자가 브러쉬를 업로드하면 그를 파싱해 프로크리에이트와 같은 환경으로 재현해내도록 만들고자 하였습니다.
이 프로젝트는 그를 위한 초안으로 브러쉬를 파싱하고 프로크리에이트와 같은 환경으로 브러쉬를 재현해내는 것을 성공하였습니다.

⚠️ 중요: 테스트 방법 ⚠️
현재 버전은 프로크리에이트에 내장된 shape나 grain은 저작권 이슈로 가져올 수 없어, 내장된 소스를 사용하는 경우는 복원이 불가합니다.
사용시에는 DoodleLabBrushParser/example/src/assets 폴더 안에 있는 .brush 파일들을 사용해주세요.
이 브러쉬들의 경우 커스텀한 shape.png와 grain을 사용하는 경우로 일반적으로 우리가 구매하게 되는 커스텀 브러쉬들이 이에 속합니다.

## 0. 시연 영상
https://github.com/user-attachments/assets/a991ccf6-7585-4af4-a32c-d0d907856927


## 1. 프로젝트 개요

사용자는 브러시를 구매하기 전에, 실제 질감을 직접 확인해보고 싶어합니다.
하지만 Procreate의 .brush 파일은 문서화되지 않았고, 미리보기 기능도 부족합니다.
이 프로젝트는 실제 브러시의 텍스처와 동작을 시뮬레이션할 수 있는 환경을 제공합니다.
판매자가 업로드 한 브러쉬를 제한적 횟수로 체험해 볼 수 있는 공간을 만들고자 합니다.

## 2. 주요 기능

### 브러시 파일 분석 및 파싱
- .brush 파일 압축 해제 및 구조 분석 (SSZipArchive 활용)
- shape.png, grain.png 에셋 추출
- 3D 브러시 메타데이터 분석 (metallicScale, roughnessScale 등)
- UTF-8 인코딩 정규화를 통한 한글 파일명 지원

### 네이티브 모듈 구현
- Objective-C 기반 Turbo Native Module
- CoreImage를 활용한 이미지 처리
- Base64 인코딩을 통한 효율적인 데이터 전달
- 임시 파일 자동 정리 및 메모리 관리

### Skia 기반 실시간 렌더링
- 부드러운 브러시 스트로크 보간
- 브러시 크기, 불투명도, 간격 실시간 조정
- 3D 브러시 특수 효과 지원
- 실시간 디버깅 정보 표시

## 3. 기술 스택

### 프론트엔드
- React Native (Bare workflow)
- TypeScript
- React Native Skia

### 네이티브 개발
- Objective-C 기반 Turbo Native Module
- CoreImage 프레임워크
- SSZipArchive

### 리버스 엔지니어링
- Hex Editor를 활용한 바이너리 포맷 분석

### 개발 도구
- CocoaPods

## 4. 기술적 문제와 해결 과정

### (1) 브러시 파일 구조 분석
- Hex Editor로 .brush 바이너리 포맷 분석
- 파일 구조:
  - .archive: 브러시 메타데이터 (JSON 형식)
  - shape.png: 브러시 모양 텍스처
  - grain.png: 브러시 입자 텍스처
- 3D 브러시 감지:
  - metallicScale, roughnessScale 등 키워드 검사
  - 특수 렌더링 파라미터 조정

### (2) 이미지 처리 파이프라인
- CoreImage 필터 체인 구현:
  - CIMaskToAlpha: 알파 채널 정확도 향상
  - 이미지 정규화 및 최적화
- Base64 인코딩으로 네이티브-JS 브릿지 구현
- 임시 파일 자동 정리로 메모리 누수 방지

### (3) 렌더링 엔진 최적화
- 스트로크 보간 알고리즘 구현:
  - 최소 거리 기반 포인트 생성
  - 부드러운 곡선 생성을 위한 보간
- 3D 브러시 특수 처리:
  - 불투명도 자동 조정
  - 간격 최적화
  - 스트로크 진행에 따른 효과 변화

## 5. 프로젝트 구조

```typescript
// 주요 인터페이스
interface ProcreateBrushData {
  name?: string;
  shapeTextureBase64?: string;
  grainTextureBase64?: string;
  is3DBrush?: boolean;
  
  // 브러시 동작 파라미터
  paintSize?: number;
  paintOpacity?: number;
  plotSpacing?: number;
  
  // 다이나믹스
  pressureSize?: number;
  pressureOpacity?: number;
  velocitySaturation?: number;
  
  // 3D 브러시 속성
  metallicScale?: number;
  roughnessScale?: number;
  heightScale?: number;
}
```

## 6. 한계점

1. 프로크리에이트 내장 브러시 제한
   - 내장된 shape나 grain 텍스처는 저작권 문제로 사용 불가
   - 커스텀 브러시만 지원

2. 렌더링 제한
   - 브러시 색상 적용 시 미세 질감 변화 발생
   - 관련 메서드 일시 제거 상태
  

## 7. 향후 계획

- .brushset 파일 지원
- Clip Studio .sut 포맷 대응
- 백엔드 연동 및 브러시 마켓 구현
- 웹 기반 버전 개발

## 8. 개발 배경

이 프로젝트는 "그래픽 엔지니어링" 역량을 입증하기 위한 실전형 포트폴리오입니다.
단순한 코드 구현을 넘어 비공식 포맷 분석, 네이티브 브릿지 구현, 그래픽스 최적화까지
전반적인 기술 스택을 다루는 과정을 담았습니다.

## 개발자 정보

GitHub: yuuuna-lee
Contact: yuunalee1050@gmail.com
