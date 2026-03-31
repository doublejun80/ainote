# Bookshelf Deployment

`bookshelf.doublejun.digital` 배포를 위한 OrbStack + Portainer + cloudflared 기준 파일입니다.

## 포함 파일

- `portainer-stack.yml`: Portainer에 그대로 넣을 스택
- `nginx.conf`: `dist/web`를 정적으로 서빙하는 nginx 설정
- `cloudflared-ingress-snippet.yml`: 기존 `~/.cloudflared/config.yml`에 추가할 ingress 한 줄

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
5. `brew services restart cloudflared`
6. 브라우저에서 `https://bookshelf.doublejun.digital` 확인

## 참고

- 이 리포지토리에서 확인한 기존 cloudflared 구성은 호스트에서 `localhost` 포트들을 터널로 연결하는 방식입니다.
- 그래서 이번 책방도 같은 패턴으로 `localhost:18081`을 cloudflared ingress에 연결하도록 맞췄습니다.
