#!/bin/bash
# Opens your Learning Console on this Mac, where the lesson videos play inside the page.
# Double-click this file. Keep the Terminal window open while you study; close it to stop.
cd "$(dirname "$0")/site" || exit 1
PORT=8765
URL="http://localhost:$PORT/index.html"
if curl -s "http://127.0.0.1:$PORT/index.html" 2>/dev/null | grep -q "Learning Console"; then
  open "$URL"; exit 0
fi
if lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Another program is using port $PORT. Close it, then double-click this file again."
  read -r -p "Press Return to close."; exit 1
fi
PY=""
for c in /opt/anaconda3/bin/python3 "$HOME/anaconda3/bin/python3" "$HOME/opt/anaconda3/bin/python3" \
         /opt/miniconda3/bin/python3 "$HOME/miniconda3/bin/python3" /opt/homebrew/bin/python3 /usr/local/bin/python3 \
         /Library/Frameworks/Python.framework/Versions/Current/bin/python3 "$(command -v python3 2>/dev/null)"; do
  if [ -n "$c" ] && [ -x "$c" ] && "$c" -c 'import http.server' >/dev/null 2>&1; then PY="$c"; break; fi
done
echo "Learning Console is running at $URL"
echo "Keep this window open while you study. Close it, or press Ctrl+C, to stop."
(sleep 1; open "$URL") &
if [ -n "$PY" ]; then exec "$PY" -m http.server "$PORT" --bind 127.0.0.1 2>/dev/null
elif command -v ruby >/dev/null 2>&1; then exec ruby -run -e httpd . -p "$PORT" -b 127.0.0.1 2>/dev/null
else
  echo "This needs Python 3. Install it from https://www.python.org/downloads/ and double-click this file again."
  read -r -p "Press Return to close."
fi
