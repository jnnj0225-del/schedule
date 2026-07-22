# schedule

Personal schedule and to-do tracker, imported from a OneDrive calendar/notes file, plus a small web app (React + Vite) for managing it going forward.

## App

A browser-based schedule manager with a calendar view and a to-do list.

```
npm install
npm run dev      # start local dev server
npm run build    # production build (type-checked)
```

- **カレンダー** — month grid seeded from `data/2026-07.json`. Click a day to view, add, or delete notes. Navigate between months with the arrows.
- **To do** — sectioned checklist seeded from `data/todo.json`. Check items off, add new ones, or delete them.
- All edits are saved to the browser's `localStorage` (key prefix `schedule-app.`) — nothing is sent to a server, and data does not sync across devices/browsers.

Source: `src/` (components), `index.html`, `vite.config.ts`, `tsconfig.json`.

## Data files

- `data/2026-07-source.txt`, `data/todo-source.txt` — verbatim backups of the original pasted content (source of truth; use these to verify anything time-critical).
- `data/2026-07.json`, `data/todo.json` — structured data derived from the source files; used as the app's seed data.
- `2026-07.md`, `todo.md` — human-readable Markdown views generated from the JSON.

## Notes

The calendar transcription (`data/2026-07.json`, `2026-07.md`) is a best-effort reconstruction of a multi-line table pasted from OneDrive. If a date matters for a clinical or scheduling decision, cross-check it against `data/2026-07-source.txt`.
