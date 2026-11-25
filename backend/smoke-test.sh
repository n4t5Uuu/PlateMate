#!/usr/bin/env bash
# Hits the running API and exits 1 if any endpoint answers wrongly.
# Start the backend first, then: pnpm smoke  (override the target with BASE_URL).
BASE_URL="${BASE_URL:-http://localhost:8787}"
failed=0
total=0

# check <name> <method> <path> <expected status> [expected body]
check() {
  local name=$1 method=$2 path=$3 want_status=$4 want_body=$5 out status body
  total=$((total + 1))
  if ! out=$(curl -s -m 5 -X "$method" -w '\n%{http_code}' "$BASE_URL$path"); then
    failed=$((failed + 1))
    echo "FAIL $name: no response (is the backend running at $BASE_URL?)"
    return
  fi
  status=${out##*$'\n'}
  body=${out%$'\n'*}
  if [ "$status" = "$want_status" ] && { [ -z "$want_body" ] || [ "$body" = "$want_body" ]; }; then
    echo "PASS $name ($status)"
  else
    failed=$((failed + 1))
    echo "FAIL $name: expected $want_status $want_body, got $status ${body:0:120}"
  fi
}

# Add a line here for every new endpoint.
check "health" GET /health 200 '{"ok":true}'
check "database" GET /health/db 200 '{"ok":true}'
check "storage" GET /health/storage 200 '{"ok":true}'
check "unknown route is a 404" GET /does-not-exist 404
check "webhook rejects an unsigned request" POST /webhooks/clerk 400 '{"error":"invalid webhook"}'

echo
if [ "$failed" -gt 0 ]; then
  echo "$failed of $total failed"
  exit 1
fi
echo "All $total passed"
