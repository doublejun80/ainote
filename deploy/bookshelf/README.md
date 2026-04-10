# Bookshelf Deployment

`bookshelf.doublejun.digital` 배포를 위한 OrbStack + Portainer + cloudflared 기준 파일입니다.

## 포함 파일

- `portainer-stack.yml`: Portainer에 그대로 넣을 스택
- `nginx.conf`: `dist/web`를 정적으로 서빙하는 nginx 설정
- `cloudflared-ingress-snippet.yml`: 기존 `~/.cloudflared/config.yml`에 추가할 ingress 한 줄
- `../../tools/install-cloudflared-agent.sh`: `affine` 터널을 macOS LaunchAgent로 고정 실행하는 스크립트

## 기준 경로와 포트

- 리포지토리 경로: `/Volumes/mac_dock/github/ainote`
- 외부 공개 도메인: `https://bookshelf.doublejun.digital`
- 내부 서비스 포트: `18081`

## 배포 순서

### 한 번에 실행

```bash
/Volumes/mac_dock/github/ainote/tools/deploy-bookshelf-host.sh
```

### 수동 실행

1. `node tools/build-reader-site.mjs`
2. Portainer에서 `deploy/bookshelf/portainer-stack.yml` 내용을 스택으로 배포
3. `node tools/add-bookshelf-cloudflared-ingress.mjs`
4. `cloudflared tunnel route dns affine bookshelf.doublejun.digital`
5. `bash tools/install-cloudflared-agent.sh`
6. 브라우저에서 `https://bookshelf.doublejun.digital` 확인

## 참고

- 이 리포지토리에서 확인한 기존 cloudflared 구성은 호스트의 루프백 포트들을 터널로 연결하는 방식입니다.
- `localhost`는 일부 환경에서 `::1`로 먼저 풀리며 502를 만들 수 있어서, 이번 책방은 `127.0.0.1:18081`로 고정합니다.
- `brew services cloudflared`는 이 환경에서 `cloudflared`만 단독 실행하고 종료되어 `error 1` 상태가 될 수 있습니다.
- 안정적인 운영 기준은 `tools/install-cloudflared-agent.sh`가 생성하는 `com.doublejun.cloudflared.affine` LaunchAgent입니다.
