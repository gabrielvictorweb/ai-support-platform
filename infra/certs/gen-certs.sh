#!/usr/bin/env bash
set -euo pipefail

CERTS_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Generating CA..."
openssl req -x509 -newkey rsa:4096 \
  -keyout "$CERTS_DIR/ca.key" \
  -out "$CERTS_DIR/ca.crt" \
  -days 3650 -nodes \
  -subj "/CN=ai-support-ca"

for svc in bff-client user-server conversation-server agent-server; do
  echo "Generating cert for $svc..."
  openssl req -newkey rsa:4096 \
    -keyout "$CERTS_DIR/$svc.key" \
    -out "$CERTS_DIR/$svc.csr" \
    -nodes \
    -subj "/CN=$svc"
  openssl x509 -req \
    -in "$CERTS_DIR/$svc.csr" \
    -CA "$CERTS_DIR/ca.crt" \
    -CAkey "$CERTS_DIR/ca.key" \
    -CAcreateserial \
    -out "$CERTS_DIR/$svc.crt" \
    -days 365
  rm "$CERTS_DIR/$svc.csr"
done

echo "Done. Certificates in $CERTS_DIR"
