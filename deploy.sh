#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/.env.deploy" ]; then
  source "$SCRIPT_DIR/.env.deploy"
fi

FTP_HOST="${FTP_HOST:-serwer2644365.hosting-home.pl}"
FTP_USER="${FTP_USER:-antygrav@checkyourself.pl}"
FTP_PASS="${FTP_PASS:-}"
REMOTE_DIR="${REMOTE_DIR:-checkyourself/kierunekkariera-deploy}"

if [ -z "$FTP_PASS" ]; then
  echo "❌ BŁĄD: Brak hasła FTP w .env.deploy!"
  exit 1
fi

echo "🚀 Rozpoczynam automatyczną synchronizację z home.pl ($FTP_USER)..."
/opt/homebrew/bin/lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" <<EOF
set ssl:verify-certificate no
set ftp:ssl-allow yes
set net:timeout 15
set net:max-retries 3

mirror -R --delete --verbose \
  -x "^\.git(/|$)" \
  -x "^\.github(/|$)" \
  -x "^\.claude(/|$)" \
  -x "^\.env" \
  -x "^deploy\.sh" \
  -x "README\.md" \
  -x "\.DS_Store" \
  -x "^docs/.*\.md$" \
  -x "^scripts(/|$)" \
  -x "^api/data/.*\.db$" \
  -x "^api/data/reports(/|$)" \
  -x "^api/data/cache(/|$)" \
  "$SCRIPT_DIR/" "$REMOTE_DIR"

quit
EOF

echo "✅ Wdrożenie na checkyourself.pl zakończone sukcesem!"
