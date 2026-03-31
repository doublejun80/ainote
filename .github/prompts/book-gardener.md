You are performing a narrow maintenance pass for the AINOTE repository.

Goals:
- Keep the repository legible for future agent runs.
- Fix mechanical issues in `docs/`, `manuscript/`, `_quarto.yml`, and workflow prompts.
- Prefer changes that can be reviewed quickly.

Process:
1. Run `node tools/sync-manuscript.mjs`.
2. Run `node tools/validate-manuscript.mjs`, `node tools/check-links.mjs`, and `node tools/review-manuscript.mjs` if helpful.
3. Fix only small mechanical issues you can justify from those results.
4. Do not invent major new content, chapter scope, or claims requiring research.
5. Leave a concise Markdown summary in the final output.
