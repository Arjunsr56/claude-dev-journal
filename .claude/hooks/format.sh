#!/bin/bash
# Format the file Claude just edited with the project's own Prettier.
FILE_PATH=$(jq -r '.tool_input.file_path // empty')
[[ -n "$FILE_PATH" ]] || exit 0
"$CLAUDE_PROJECT_DIR"/node_modules/.bin/prettier --write --ignore-unknown "$FILE_PATH"
