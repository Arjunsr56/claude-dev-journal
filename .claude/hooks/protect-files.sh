#!/bin/bash
FILE_PATH=$(cat | jq -r '.tool_input.file_path // empty')
for p in ".env" "package-lock.json" ".git/"; do
  if [[ "$FILE_PATH" == *"$p"* ]]; then
    echo "Blocked: $FILE_PATH is protected ($p)" >&2
    exit 2
  fi
done
exit 0