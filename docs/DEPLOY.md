# 배포 가이드 (GitHub Pages)

## 현재 배포 실패 원인

GitHub Actions 로그에 나오는 오류:

```
Get Pages site failed. Please verify that the repository has Pages 
enabled and configured to build using GitHub Actions.
```

**원인**: 저장소에서 **GitHub Pages**가 켜져 있지 않거나, 배포 소스가 **GitHub Actions**로 설정되어 있지 않음.

---

## 해결 방법 (한 번만 설정하면 됨)

1. **저장소 설정 페이지로 이동**
   - https://github.com/heosanghun/SIMS_Fashion 에서 **Settings** 탭 클릭
   - 왼쪽 메뉴에서 **Pages** 클릭  
   - 또는 직접: https://github.com/heosanghun/SIMS_Fashion/settings/pages

2. **Build and deployment**
   - **Source** 드롭다운에서 **GitHub Actions** 선택 (기본값 "Deploy from a branch"가 아니어야 함)

3. **저장**
   - 별도 저장 버튼이 없으면 선택만 해도 적용됨

4. **다음 푸시부터**
   - `main` 브랜치에 푸시할 때마다 Actions가 실행되고, 성공하면 GitHub Pages에 배포됨
   - 사이트 URL: **https://heosanghun.github.io/SIMS_Fashion/** (또는 사용자/조직에 맞는 GitHub Pages 주소)

---

## 참고: Cloudflare Pages (sims-fashion.pages.dev)

지금 사용 중인 **https://sims-fashion.pages.dev** 는 **Cloudflare Pages**로 배포된 주소입니다.

- **GitHub Pages**를 위처럼 설정하면 → **https://heosanghun.github.io/SIMS_Fashion/** 에도 배포됨 (GitHub 제공)
- **Cloudflare Pages**는 Cloudflare 대시보드에서 GitHub 저장소를 연결해 둔 경우, 푸시 시 Cloudflare가 따로 빌드·배포함

즉, 두 가지를 모두 쓰면:
- GitHub: 푸시 → GitHub Actions → GitHub Pages (설정 후 자동)
- Cloudflare: 푸시 → Cloudflare가 감지 → sims-fashion.pages.dev 업데이트 (이미 연결돼 있다면)

GitHub Actions 오류만 없애려면 위 **Settings → Pages → Source: GitHub Actions** 설정만 하면 됩니다.

---

## ✅ 챗봇(Gemini 2.5 Flash) 활성화 – Cloudflare Pages

**왜 배포 사이트에서만 "API 키가 설정되지 않았습니다"가 뜨나요?**  
`config.js`는 API 키를 담고 있어서 **Git에 올리지 않습니다**(.gitignore). 그래서 Cloudflare가 GitHub에서 가져온 코드에는 `config.js`가 없고, 챗봇이 동작하지 않습니다.

**해결:** Cloudflare Pages **빌드 단계**에서 환경 변수로 API 키를 넣고, `config.js`를 생성하면 됩니다.

### 1. Cloudflare 대시보드에서 설정

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **sims-fashion** (또는 해당 프로젝트) 선택
2. **Settings** 탭 → **Environment variables**
   - **Add variable** (Production)
   - 이름: `GEMINI_API_KEY`
   - 값: [Google AI Studio](https://aistudio.google.com/apikey)에서 발급한 Gemini API 키
   - **Encrypt** 체크 후 저장
3. **Settings** 탭 → **Builds & deployments** → **Build configuration**
   - **Build command**:  
     `node scripts/build-config.js`
   - **Build output directory**:  
     `.` (또는 비워 두고 기본값 사용하는 경우, 정적 사이트면 보통 프로젝트 루트가 배포됨. Cloudflare가 루트를 배포한다면 비워 둬도 됨)
4. **Save** 후 **Retry deployment** 또는 새로 푸시해서 다시 배포

### 2. 동작 방식

- 빌드 시 `node scripts/build-config.js`가 실행됩니다.
- 이 스크립트는 **환경 변수 `GEMINI_API_KEY`**를 읽어 `config.js`를 생성합니다 (로컬에서는 `.env` 사용).
- 생성된 `config.js`가 배포에 포함되므로, **https://sims-fashion.pages.dev** 에서 챗봇(Gemini 1.5 Flash)이 동작합니다.

### 3. 참고

- API 키는 Cloudflare 환경 변수에만 넣고, GitHub에는 올리지 마세요.
- 챗봇 모델은 **Gemini 2.5 Flash**로 설정되어 있습니다 (`main.js`).
