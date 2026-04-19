# 📱 대경선 APK 만들기 — GitHub 무료 빌드

GitHub에 코드를 올리면 자동으로 APK를 만들어줍니다.
**회원가입 + 파일 올리기 + 버튼 클릭** 3단계로 끝납니다.

---

## STEP 1. GitHub 가입 (이미 있으면 건너뜀)

1. https://github.com 접속
2. Sign up 클릭
3. 이메일 / 비밀번호 입력 후 가입

---

## STEP 2. 새 저장소(Repository) 만들기

1. 로그인 후 우측 상단 **+** → **New repository**
2. 아래처럼 입력:
   - Repository name: `daegyeong-app`
   - Public 선택 (무료 빌드는 Public이어야 함)
   - **Create repository** 클릭

---

## STEP 3. 파일 올리기

저장소 페이지에서 **uploading an existing file** 클릭

아래 파일/폴더를 **모두** 업로드:
```
.github/
  workflows/
    build-apk.yml     ← 이게 핵심!
src/
  App.jsx
  main.jsx
index.html
package.json
vite.config.js
capacitor.config.json
icon.svg
```

> 💡 폴더째로 드래그&드롭 하면 됩니다
> 💡 .github 폴더가 숨김폴더라 안 보이면
>    Windows: 폴더 옵션 → 숨김 파일 표시
>    Mac: Cmd+Shift+. 누르면 보임

파일 다 올린 후 → **Commit changes** 클릭

---

## STEP 4. 빌드 실행 확인

파일 올리면 **자동으로 빌드가 시작**됩니다!

1. 저장소 상단 **Actions** 탭 클릭
2. "대경선 APK 빌드" 워크플로우 클릭
3. 빌드 진행 상황 확인 (약 **10~15분** 소요)
4. ✅ 초록색 체크 = 성공!

---

## STEP 5. APK 다운로드

빌드 성공 후:

1. Actions → 완료된 워크플로우 클릭
2. 하단 **Artifacts** 섹션
3. **대경선-APK** 클릭 → zip 파일 다운로드
4. zip 압축 풀면 **app-debug.apk** 파일 완성! 🎉

---

## STEP 6. 안드로이드폰에 설치

1. 폰에서 **설정 → 보안 → 출처를 알 수 없는 앱 허용**
2. APK 파일을 폰으로 전송 (카톡, 메일, USB 등)
3. APK 파일 탭 → 설치

---

## ❓ 자주 묻는 질문

**Q. 빌드가 실패하면?**
Actions 탭에서 빨간 ✗ 클릭 → 오류 로그 확인
오류 내용 캡처해서 Claude에게 물어보세요.

**Q. 파일 수정 후 다시 빌드하려면?**
GitHub에서 파일 수정 → Commit → 자동으로 다시 빌드됨
또는 Actions → Run workflow 버튼으로 수동 실행

**Q. 매달 빌드 횟수 제한 있나요?**
Public 저장소는 GitHub Actions **무료 무제한**입니다.
