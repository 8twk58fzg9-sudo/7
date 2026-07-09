# Computrax — Working Rules

Static site (HTML/CSS/JS) for a PC e-commerce business, Slovak-language, deployed via Supabase backend. No build step — pages are hand-authored HTML files.

## Before making changes
- Inspect the existing code in the relevant file(s) first. Do not assume structure — this repo has many near-duplicate HTML pages (product categories, legal pages, etc.), so check the actual file, not a sibling.
- Do not re-inspect the whole site for a small, well-scoped fix. One precise task in, one precise diff out.

## While making changes
- Preserve working features. Don't refactor, restructure, or "clean up" code that isn't part of the requested change.
- Mobile-first responsive design — verify layouts at mobile widths, not just desktop.
- No placeholders, TODOs, or half-finished implementations. Ship complete, working code.
- No unnecessary rewrites — prefer the smallest correct diff.

## After making changes
- Test links, buttons, and forms actually work (click through in the browser, not just visual inspection).
- Run any available test/validation scripts in the repo after changes (check for `FINAL_*_VALIDATION` scripts/JSON, deploy checks) before considering work done.

## Planning
- For large or multi-file changes, propose a plan before implementing.
- For small fixes, just do the one precise task — don't pad it with a planning cycle.
