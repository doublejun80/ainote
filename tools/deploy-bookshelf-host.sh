#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/Volumes/mac_dock/github/ainote"
STACK_FILE="$REPO_ROOT/deploy/bookshelf/portainer-stack.yml"
CONFIG_FILE="$HOME/.cloudflared/config.yml"
HOSTNAME="bookshelf.doublejun.digital"
TUNNEL_NAME="affine"
LOCAL_URL="http://127.0.0.1:18081"
REMOTE_URL="https://bookshelf.doublejun.digital"

log() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "missing command: $1" >&2
    exit 1
  fi
}

require_cmd node
require_cmd docker
require_cmd cloudflared
require_cmd curl

cd "$REPO_ROOT"

log "1/6 dist/web 빌드"
node tools/build-reader-site.mjs

log "2/6 OrbStack Docker 접근 확인"
docker info >/dev/null

log "3/6 정적 사이트 컨테이너 배포"
docker compose -f "$STACK_FILE" up -d

log "4/6 로컬 응답 확인"
curl -I "$LOCAL_URL" >/dev/null

if [[ -f "$CONFIG_FILE" ]]; then
  log "5/6 cloudflared ingress 추가"
  node tools/add-bookshelf-cloudflared-ingress.mjs
else
  echo "cloudflared config not found: $CONFIG_FILE" >&2
  exit 1
fi

log "5.5/6 DNS route 생성 시도"
if cloudflared tunnel route dns "$TUNNEL_NAME" "$HOSTNAME"; then
  echo "DNS route created or already present for $HOSTNAME"
else
  echo "DNS route command failed. DNS 레코드가 이미 있거나 계정 권한 문제일 수 있습니다." >&2
fi

log "6/6 cloudflared 재시작"
if command -v brew >/dev/null 2>&1; then
  brew services restart cloudflared || true
fi

log "최종 확인"
echo "local:  $LOCAL_URL"
echo "remote: $REMOTE_URL"
echo
echo "원격 확인은 DNS 전파와 cloudflared 재연결 후 몇 초에서 몇 분 걸릴 수 있습니다."
