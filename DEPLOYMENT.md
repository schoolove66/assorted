# Vercel 배포 가이드 (Vercel Deployment Guide)

본 프로젝트를 Vercel에 배포할 때 필요한 설정 및 환경 변수 목록입니다.

## 1. Vercel 애플리케이션 프리셋 (Application Preset)

Vercel 프로젝트 생성 단계에서 빌드 및 출력 설정을 다음과 같이 구성합니다. (Vite 프로젝트이므로 대부분 Vercel에서 자동으로 감지합니다.)

* **Framework Preset**: `Vite`
* **Build Command**: `npm run build` (또는 `vite build`)
* **Output Directory**: `dist`
* **Install Command**: `npm install` (또는 기본값 사용)

---

## 2. 필수 환경 변수 (Environment Variables)

Vercel 프로젝트 설정의 **Environment Variables** 탭에서 아래의 환경 변수들을 정의해야 합니다.

### 관리자 설정
* **`VITE_ADMIN_PASSWORD`**
  - **설명**: 생각을 키우는 과학 수업 포털의 우측 하단 관리자 로그인 시 필요한 비밀번호입니다.
  - **기본값**: 설정하지 않을 경우 기본 비밀번호인 `1234`로 동작합니다. 보안을 위해 운영 서버에서는 복잡한 비밀번호로 설정하는 것을 권장합니다.

### Firebase 연동 설정 (선택 사항)
> [!NOTE]
> 아래 변수들을 입력하지 않고 배포하면, 웹앱은 Firebase 연동 대신 브라우저의 **LocalStorage 모드**로 동작하여 로컬 브라우저 상에서 개별적으로 카테고리와 웹앱 리스트를 관리하게 됩니다. 공동 관리 및 안정적인 데이터 보존을 위해서는 Firebase 연결을 권장합니다.

* **`VITE_FIREBASE_API_KEY`**: Firebase 프로젝트의 API Key
* **`VITE_FIREBASE_AUTH_DOMAIN`**: Firebase 프로젝트의 Auth Domain (예: `project-id.firebaseapp.com`)
* **`VITE_FIREBASE_PROJECT_ID`**: Firebase 프로젝트 ID
* **`VITE_FIREBASE_STORAGE_BUCKET`**: Firebase Storage 버킷 이름 (예: `project-id.appspot.com` 또는 `project-id.firebasestorage.app`)
* **`VITE_FIREBASE_MESSAGING_SENDER_ID`**: Firebase Messaging Sender ID
* **`VITE_FIREBASE_APP_ID`**: Firebase App ID
