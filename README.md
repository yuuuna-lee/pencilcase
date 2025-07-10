# PencilCase – Procreate Brush 시뮬레이터



<img width="491" height="401" alt="Image" src="https://github.com/user-attachments/assets/1cc61470-589e-4573-8bd3-218dee7a2623" />





Procreate의 `.brush` 파일을 분석하고, 실시간으로 시뮬레이션할 수 있는 모바일 기반 브러시 테스트 툴입니다.  
비공식 바이너리 포맷을 직접 리버스 엔지니어링하고, React Native + Skia + Swift 기반의 Turbo Native Module로 구현했습니다.

---

## 1. 프로젝트 개요

- 사용자는 브러시를 구매하기 전에, 실제 질감을 직접 확인해보고 싶어합니다.
- 하지만 Procreate의 `.brush` 파일은 문서화되지 않았고, 미리보기 기능도 부족합니다.
- 이 프로젝트는 **실제 브러시의 텍스처와 동작을 시뮬레이션할 수 있는 환경**을 제공합니다.

---

## 2. 주요 기능

- `.brush` 파일 구조 분석 및 파싱
- Swift 기반 Turbo Native Module로 브러시 데이터 전달
- Skia 기반 실시간 렌더링
- 다양한 브러시 구조(2D/3D 등) 대응
- 브러시 속성별 시각화 테스트

---

## 3. 기술 스택

- React Native (Bare workflow)
- React Native Skia
- Swift (Turbo Native Module)
- Hex Editor 기반 리버스 엔지니어링
- TypeScript + Zustand 상태관리

---

## 유저플로우
<img width="390" height="335" alt="Image" src="https://github.com/user-attachments/assets/6e271571-88da-4c5e-871c-624544ddc4f6" />

## 5. 시연 영상
![Image](https://github.com/user-attachments/assets/e6e94464-636a-41f7-a9fc-813eb26a55ea)

```md

6. 기술적 문제와 해결 과정
(1) TurboModule 연동 실패
자동 연결이 되지 않아 수동 설정 필요

Swift Package Manager와 CocoaPods 충돌 → CocoaPods로 일원화

Apple Silicon에서 아키텍처 충돌 해결 (arch -x86_64)

(2) .brush 파일 구조 불명확
Hex Editor로 구조 분석, .archive, shape.png, grain.png 추출

내부에 3D 브러시 포함 시 별도 분기 처리

(3) 렌더링 정확도 문제
알파 채널이 예상과 다르게 렌더됨

luminance-based alpha로 재해석해 반전 문제 해결

7. 폴더 구조
bash
복사
편집
pencilcase/
├── ios/                    # Swift 기반 BrushParser TurboModule
├── src/
│   ├── components/         # Skia Canvas, 브러시 UI
│   ├── store/              # Zustand 상태관리
│   └── utils/              # 브러시 파라미터 해석 유틸
└── README.md
8. 향후 계획
.brushset 파일 지원

Clip Studio .sut 포맷 대응

웹 기반 버전 병렬 개발 중

9. 개발 배경
이 프로젝트는 “그래픽 엔지니어링” 역량을 입증하기 위한 실전형 포트폴리오로,
단순한 코드 구현이 아닌 문서화되지 않은 포맷의 분석, 네이티브 연동, 렌더링 최적화까지 경험한 과정을 담고 있습니다.
사용자 피드백을 반영하고, 실사용 시나리오에 기반해 반복 개선했습니다.

10. 개발자 정보
GitHub: yuuuna-lee
Contact: iyuna.dev@gmail.com
