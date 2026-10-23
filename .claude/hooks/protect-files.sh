#!/bin/bash
# Fail closed: if the input can't be read, block rather than allow.
if ! command -v jq >/dev/null 2>&1; then
  echo "Blocked: jq is not installed, so protect-files.sh can't check the path" >&2
  exit 2
fi
FILE_PATH=$(jq -r '.tool_input.file_path // empty')
if [[ -z "$FILE_PATH" ]]; then
  echo "Blocked: no file_path in hook input" >&2
  exit 2
fi

if [[ "$FILE_PATH" == */.git/* || "$FILE_PATH" == .git/* ]]; then
  echo "Blocked: $FILE_PATH is protected (.git/)" >&2
  exit 2
fi
case "$(basename "$FILE_PATH")" in
  .env.example) ;;
  .env | .env.* | package-lock.json)
    echo "Blocked: $FILE_PATH is protected" >&2
    exit 2
    ;;
esac
exit 0
