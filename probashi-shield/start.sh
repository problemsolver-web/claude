#!/usr/bin/env bash
# Probashi Shield - zero-dependency dev runner.
# Starts the backend (port 4000) and frontend (port 3000) together.
# Use this if you don't want to install the root "concurrently" dependency.
#
# Usage:  bash start.sh        (assumes deps already installed + db seeded)
#         bash start.sh setup  (installs deps + seeds DB first, then runs)

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$1" = "setup" ]; then
  echo "==> Installing backend deps..."
  (cd "$ROOT/backend" && npm install && cp -n .env.example .env 2>/dev/null || true)
  echo "==> Creating + seeding database..."
  (cd "$ROOT/backend" && npm run db:push && npm run db:seed)
  echo "==> Installing frontend deps..."
  (cd "$ROOT/frontend" && npm install)
fi

echo "==> Starting backend (http://localhost:4000) and frontend (http://localhost:3000)"
(cd "$ROOT/backend" && npm run dev) &
BACKEND_PID=$!
(cd "$ROOT/frontend" && npm run dev) &
FRONTEND_PID=$!

# Stop both processes on Ctrl+C
trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" INT TERM
wait
