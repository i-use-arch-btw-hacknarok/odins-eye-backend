#! /usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

source .env

export DATABASE_URL=$TEST_DATABASE_URL
echo "Using test database: $DATABASE_URL"

yarn prisma migrate reset --preview-feature --force
