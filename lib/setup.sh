#!/usr/bin/env bash
# Downloads TinyXML2 into third_party/tinyxml2/
set -euo pipefail

TINYXML2_TAG="10.0.0"
DEST="$(dirname "$0")/third_party/tinyxml2"
mkdir -p "$DEST"

BASE_URL="https://raw.githubusercontent.com/leethomason/tinyxml2/${TINYXML2_TAG}"

echo "Downloading tinyxml2 ${TINYXML2_TAG}..."
curl -fsSL "${BASE_URL}/tinyxml2.h"   -o "${DEST}/tinyxml2.h"
curl -fsSL "${BASE_URL}/tinyxml2.cpp" -o "${DEST}/tinyxml2.cpp"
echo "Done. Files in ${DEST}/"
