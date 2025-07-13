# PencilCase – Procreate Brush 시뮬레이터



<img width="491" height="401" alt="Image" src="https://github.com/user-attachments/assets/1cc61470-589e-4573-8bd3-218dee7a2623" />





Procreate의 `.brush` 파일을 분석하고, 실시간으로 시뮬레이션할 수 있는 모바일 기반 브러시 테스트 툴입니다.  

비공식 바이너리 포맷을 직접 리버스 엔지니어링하고, React Native + Skia + Swift 기반의 Turbo Native Module로 구현했습니다.

판매자가 브러쉬를 업로드하면 그를 파싱해 프로크리에이트와 같은 환경으로 재현해내도록 만들고자 하였습니다.

이 프로젝트는 그를 위한 초안으로 브러쉬를 파싱하고 프로크리에이트와 같은 환경으로 브러쉬를 재현해내는 것을 성공하였습니다.


---

## 1. 프로젝트 개요

- 사용자는 브러시를 구매하기 전에, 실제 질감을 직접 확인해보고 싶어합니다.
- 하지만 Procreate의 `.brush` 파일은 문서화되지 않았고, 미리보기 기능도 부족합니다.
- 이 프로젝트는 **실제 브러시의 텍스처와 동작을 시뮬레이션할 수 있는 환경**을 제공합니다.
- 판매자가 업로드 한 브러쉬를 제한적 홧수로 체험해 볼 수 있는 공간을 만들고자 합니다.
- 이 프로젝트는 이를 위한 초안으로서 브러쉬 파싱과 프로크리에트에 그리는 것과 같은, 재현을 목표로 했습니다

---

## 2. 주요 기능

- `.brush` 파일 구조 분석 및 파싱
- Swift 기반 Turbo Native Module로 브러시 데이터 전달
- Skia 기반 실시간 렌더링
- 다양한 브러시 구조(2D/3D 등) 대응
- 브러시 속성별 시각화 테스트

---

## 3. 기술 스택

프론트엔드: React Native (Bare workflow), TypeScript

그래픽스: React Native Skia를 활용한 실시간 브러시 렌더링

네이티브 개발: Swift 기반 Turbo Native Module 구현

리버스 엔지니어링: Hex Editor를 활용한 비공식 바이너리 포맷(.brush) 분석

개발 도구: CocoaPods, Gradle

---

## 유저플로우
<img width="390" height="335" alt="Image" src="https://github.com/user-attachments/assets/6e271571-88da-4c5e-871c-624544ddc4f6" />

## 5. 시연 영상
![Image](https://github.com/user-attachments/assets/e6e94464-636a-41f7-a9fc-813eb26a55ea)


## 6. 기술적 문제와 해결 과정

### (1) Turbo Native Module 구현 및 최적화
Swift 기반 네이티브 모듈(DoodleLabBrushParser.h/.m)의 수동 브릿지 구현
iOS 빌드 시스템 통합을 위해 CocoaPods 기반으로 의존성 관리 일원화
Apple Silicon 환경에서의 아키텍처 호환성 문제 해결 (arch -x86_64 활용)

### (2) Procreate 브러시 파일 구조 분석
Hex Editor를 통한 .brush 바이너리 포맷 리버스 엔지니어링
내부 구조 파악: .archive 컨테이너, shape.png, grain.png 에셋 추출
2D/3D 브러시 타입에 따른 분기 처리 로직 구현
브러시 속성 데이터 파싱 및 JavaScript 브릿지 구현

### (3) Skia 기반 렌더링 엔진 최적화
브러시 텍스처의 알파 채널 렌더링 정밀도 개선
luminance-based 알파 채널 계산 방식 적용으로 정확한 브러시 질감 구현
실시간 렌더링 성능 최적화를 위한 캐싱 전략 적용


## 7. 폴더 구조

<img width="344" height="404" alt="Image" src="https://github.com/user-attachments/assets/3d023459-155b-41e7-ac22-7975ffb1e3a1" />

## 8. 향후 계획
.brushset 파일 지원

Clip Studio .sut 포맷 대응

백엔드와의 연동으로 실제 브러쉬 마켓 생성

웹 기반 버전 병렬 개발 중

## 9. 개발 배경
이 프로젝트는 “그래픽 엔지니어링” 역량을 입증하기 위한 실전형 포트폴리오로,
단순한 코드 구현이 아닌 문서화되지 않은 포맷의 분석, 네이티브 연동, 렌더링 최적화까지 경험한 과정을 담고 있습니다.
사용자 피드백을 반영하고, 실사용 시나리오에 기반해 반복 개선했습니다.

## 10. 한계점 
프로크리에이트에 내장된 shape 나 grain은 가져올 수 없어, 내장된 소스를 사용히는 경우는 복원이 불가합니다.
그래서 사용시에는 DoodleLabBrushParser/example/src/assets 파일에 있는 브러쉬를 사용해주시길 바랍니다. 

이 브러쉬들의 경우 커스텀한 shpae.png와 grain을 사용하는 경우로 일반적으로 우리가 구매하게 되는 커스텀 브러쉬들이 이에 속합니다


브러쉬에 색을 입히는 경우 미세한 브러쉬의 질감이 변하게 되는 경우가 많아 관련된 메서드들은 제거해둔 상태입니다. 

## 개발자 정보
GitHub: yuuuna-lee

Contact: yuunalee1050@gmail.com
