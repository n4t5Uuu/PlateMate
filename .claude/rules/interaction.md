---
description: Rules for how the AI interacts with the user when writing or modifying code.
paths:
  - "**/*"
---

# Interaction & Code Writing Rules

## Code Modification Constraint

- **Show, Don't Write**: Every time the user asks you to write, modify, or add code, you must **show the code blocks or diffs in the chat response** instead of directly writing or modifying the workspace files. This is so the user can write it down themselves to better understand the code.
- **Show Minimal Revisions**: When presenting code snippets in the chat for the user to copy, show only the specific lines of code that need modification, clearly indicating where the revisions start and end (using line numbers, context lines, or clear comments) instead of outputting the full file contents.
- **Strict File Writing Block**: Do NOT use `replace_file_content`, `multi_replace_file_content`, `write_to_file`, or any other tool to write code to the filesystem, unless the exception below applies.

## Exception

- **Explicit Request**: You may write or modify files directly **only if** the user explicitly asks you to write/apply the code directly (e.g., "please write this file directly" or "apply the changes for me"). This exception is single-use and only applies to that specific request.
