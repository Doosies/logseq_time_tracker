# EC Server Manager

이카운트(ecount.com) 사내 개발 환경 관리를 위한 Chrome 확장프로그램입니다.

## 📋 목차

- [기능 소개](#기능-소개)
- [설치 방법](#설치-방법)
- [사용 방법](#사용-방법)
- [Quick Login 설정](#quick-login-설정)
- [지원 환경](#지원-환경)
- [개발 가이드](#개발-가이드)

## 🚀 기능 소개

### 1. Quick Login
등록된 회사코드/아이디/비밀번호로 빠른 로그인을 수행합니다.

### 2. EC Server Manager
이카운트 서버 환경을 쉽게 전환할 수 있습니다.

- **V5 Server**: lxba1~lxba10 선택 또는 직접 입력 (예: zeus02lxba4)
- **V3 Server**: ba1~ba3 선택 또는 직접 입력 (예: zeus02ba4)
- **Zeus 서버**: zeus01~ 지원
- **Test 서버**: test 서버 지원
- **입력 방식 전환**: 셀렉트 박스와 텍스트 입력 간 전환 가능

### 3. Local Server Buttons
로컬 개발 환경으로 빠르게 전환합니다.

- **5.0 로컬**: `test.ecount.com:5001`로 전환
- **3.0 로컬**: `__v3domains=test` 파라미터 추가
- **devMode**: `__disableMin=Y` 파라미터 추가 또는 `-dev` 서버로 전환

### 4. Stage Server Manager
Stage 서버 간 전환을 지원합니다.

- **stageba ↔ stagelxba2**: Stage 서버 간 원클릭 전환

## 📦 설치 방법

### 1. 프로젝트 다운로드
```bash
# 프로젝트 클론 또는 다운로드
cd packages/ecount-dev-tool
```

### 2. Chrome 확장프로그램 로드

1. Chrome 브라우저를 엽니다
2. 주소창에 `chrome://extensions/` 입력
3. 우측 상단의 **개발자 모드** 토글을 활성화합니다
4. **압축해제된 확장 프로그램을 로드합니다** 버튼 클릭
5. `packages/ecount-dev-tool` 폴더 선택
6. 확장프로그램이 로드되면 Chrome 툴바에 아이콘이 표시됩니다

### 3. 확인
확장프로그램 아이콘을 클릭하여 팝업이 정상적으로 표시되는지 확인합니다.

## 📖 사용 방법

### Quick Login 사용

1. 이카운트 로그인 페이지(`*.ecount.com`)에서 확장프로그램 아이콘 클릭
2. **Quick Login Setting** 섹션에서 원하는 회사코드/아이디 버튼 클릭
3. 자동으로 로그인 정보가 입력됩니다

> **참고**: Quick Login 설정은 `quickLogin.js` 파일의 `loginDict` 객체를 수정해야 합니다. 자세한 내용은 [Quick Login 설정](#quick-login-설정) 섹션을 참고하세요.

### EC Server Manager 사용

#### V5/V3 서버 전환

1. 이카운트 ERP 페이지(`ec5/view/erp` 또는 `ECERP/ECP/ECP050M`)에서 확장프로그램 아이콘 클릭
2. **EC Server Manager** 섹션에서:
   - **V5 Server**: 드롭다운에서 서버 선택 (lxba1~lxba10) 또는 텍스트 입력
   - **V3 Server**: 드롭다운에서 서버 선택 (ba1~ba3) 또는 텍스트 입력
3. **Click** 버튼 클릭하여 서버 전환

#### 입력 방식 전환

- 셀렉트 박스 옆의 **↔ 아이콘**을 클릭하면 텍스트 입력 모드로 전환됩니다
- 텍스트 입력 모드에서 **↔ 아이콘**을 클릭하면 셀렉트 박스 모드로 전환됩니다
- 텍스트 입력 모드에서는 직접 서버명을 입력할 수 있습니다 (예: `zeus02lxba4`, `zeus02ba4`)

### Local Server Buttons 사용

1. 이카운트 페이지에서 확장프로그램 아이콘 클릭
2. 하단의 로컬 버튼 중 하나 클릭:
   - **5.0 로컬**: V5 로컬 서버(`test.ecount.com:5001`)로 전환
   - **3.0 로컬**: V3 로컬 서버(`__v3domains=test`)로 전환
   - **disableMin 활성화 (devMode)**: 개발 모드 활성화 (`__disableMin=Y` 또는 `-dev` 서버)

### Stage Server Manager 사용

1. Stage 서버 페이지에서 확장프로그램 아이콘 클릭
2. **Stage Server Manager** 섹션이 자동으로 표시됩니다
3. 버튼을 클릭하여 `stageba` ↔ `stagelxba2` 간 전환

## ⚙️ Quick Login 설정

`quickLogin.js` 파일의 `loginDict` 객체를 수정하여 Quick Login 정보를 등록합니다.

### 설정 형식

```javascript
const loginDict = {
  "회사코드§아이디": "비밀번호",
  "313786§뚜뚜": "1q2w3e4r",
  "600317§루리": "1q2w3e4r5t",
  // ... 추가 항목
};
```

### 설정 규칙

- **키 형식**: `"회사코드§아이디"` (회사코드와 아이디는 `§`로 구분)
- **값**: 비밀번호 문자열
- **중복 제한**: 회사코드+아이디 조합별로 하나만 등록 가능

### 설정 예시

```javascript
const loginDict = {
  "313786§뚜뚜": "1q2w3e4r",
  "600317§루리": "1q2w3e4r5t",
  "305000§은경": "1q2w3e4r",
  // 새 항목 추가
  "300000§개발자": "your_password",
};
```

### 주의사항

⚠️ **보안 주의**: `loginDict`에 실제 비밀번호가 포함되므로 다음 사항을 주의하세요.

- Git에 커밋하지 않도록 `.gitignore`에 추가하거나 환경 변수로 관리
- 공유 저장소에 업로드하지 않기
- 개인 정보 보호를 위해 예시 데이터만 포함

## 🌐 지원 환경

이 확장프로그램은 다음 환경에서만 동작합니다:

- **도메인**: `*.ecount.com` (manifest.json의 `host_permissions` 설정)
- **페이지**:
  - 로그인 페이지: Quick Login 기능 사용
  - ERP 페이지: `ec5/view/erp` 또는 `ECERP/ECP/ECP050M`
  - Stage 서버: `stage*.ecount.com`
  - Zeus 서버: `zeus*.ecount.com`
  - Test 서버: `test.ecount.com`

지원되지 않는 환경에서는 "지원되지 않는 환경입니다" 알림이 표시됩니다.

## 🛠️ 개발 가이드

### 파일 구조

```
packages/ecount-dev-tool/
├── manifest.json          # Chrome Extension 설정 (Manifest V3)
├── popup.html             # 확장프로그램 팝업 UI
├── style.css              # 스타일시트
├── quickLogin.js          # Quick Login 기능
├── serverChange.js        # 서버 전환 로직
├── toggleInputType.js     # 입력 방식 전환 (셀렉트 ↔ 텍스트)
└── toggleFields.js        # URL에 따른 UI 동적 변경
```

### 주요 파일 설명

#### `manifest.json`
Chrome 확장프로그램의 설정 파일입니다.

- **Manifest V3** 형식 사용
- **권한**: `activeTab`, `scripting`, `storage`, `tabs`
- **호스트 권한**: `*://*.ecount.com/*`
- **팝업**: `popup.html`

#### `popup.html`
확장프로그램 팝업의 HTML 구조입니다.

- Quick Login 버튼 컨테이너
- EC Server Manager UI (V5/V3 서버 선택)
- Local Server Buttons
- Stage Server Manager (조건부 표시)

#### `quickLogin.js`
Quick Login 기능을 구현합니다.

- `loginDict` 객체에서 로그인 정보 읽기
- 버튼 동적 생성
- 페이지에 로그인 정보 자동 입력

#### `serverChange.js`
서버 전환 로직을 처리합니다.

- 현재 URL 분석 (test, zeus, stage 등)
- V5/V3 서버 도메인 추출 및 변경
- Local Server 전환 (`switchV5TestServer`, `switchV3TestServer`)
- devMode 전환 (`debugAndGetPageInfo`, `switchToDevServerForLegacy`)

#### `toggleInputType.js`
서버 입력 방식 전환 기능입니다.

- 셀렉트 박스 ↔ 텍스트 입력 모드 전환
- 현재 서버 정보를 기반으로 초기값 설정

#### `toggleFields.js`
URL에 따른 UI 동적 변경을 처리합니다.

- Stage 서버 감지 시 Stage Server Manager만 표시
- 일반 서버에서는 EC Server Manager 표시
- 탭 변경 시 자동 업데이트

### 개발 시 주의사항

1. **Manifest V3**: Chrome 확장프로그램은 Manifest V3를 사용합니다
2. **Content Scripts**: `chrome.scripting.executeScript`를 사용하여 페이지에 스크립트 주입
3. **권한**: 필요한 권한만 `manifest.json`에 명시
4. **도메인 제한**: `*.ecount.com` 도메인에서만 동작하도록 제한

### 빌드 및 배포

현재는 소스 코드를 직접 로드하는 방식이므로 별도의 빌드 과정이 없습니다.

향후 배포 시:
1. Chrome Web Store에 업로드
2. 내부 배포 시스템 구축
3. 자동 업데이트 메커니즘 추가

## 📝 라이센스

사내 개발자용 도구입니다.

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

---

**버전**: 2.2.0  
**최종 업데이트**: 2026-02-06
