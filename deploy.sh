#!/bin/bash
set -e

# Załaduj dane dostępowe z .env.deploy jeśli plik istnieje
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/.env.deploy" ]; then
  source "$SCRIPT_DIR/.env.deploy"
fi

FTP_HOST="${FTP_HOST:-serwer2644365.hosting-home.pl}"
FTP_USER="${FTP_USER:-serwer2644365}"
FTP_PASS="${FTP_PASS:-}"
REMOTE_DIR="${REMOTE_DIR:-/public_html/checkyourself/kierunekkariera-deploy}"

if [ -z "$FTP_PASS" ]; then
  echo "❌ BŁĄD: Brak hasła FTP!"
  echo "Utwórz plik .env.deploy z zawartością:"
  echo "FTP_PASS=\"twoje_haslo\""
  exit 1
fi

echo "🚀 Rozpoczynam automatyczną synchronizację z home.pl..."
/opt/homebrew/bin/lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" <<EOF
set ssl:verify-certificate no
set ftp:ssl-allow yes
set net:timeout 15
set net:max-retries 3

mirror -R --delete --verbose \
  --exclude-glob ".git*" \
  --exclude-glob ".github*" \
  --exclude-glob ".claude*" \
  --exclude-glob ".env*" \
  --exclude-glob "deploy.sh" \
  --exclude-glob "README.md" \
  --exclude-glob ".DS_Store" \
  --exclude-glob "docs/*.md" \
  "$SCRIPT_DIR/" "$REMOTE_DIR"

quit
EOF

echo "✅ Wdrożenie na checkyourself.pl zakończone sukcesem!"

