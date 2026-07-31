# schedule

Personal schedule and to-do tracker, imported from a OneDrive calendar/notes file, plus a small web app (React + Vite) for managing it going forward.

## App

A browser-based schedule manager with a calendar view and a to-do list.

```
npm install
npm run dev      # start local dev server
npm run build    # production build (type-checked)
```

- **カレンダー** — month grid seeded from `data/2026-08.json` (July has been dropped from the live app; its data files remain in the repo as an archive — see below). Click a day to view, add, or delete notes. Navigate between months with the arrows.
- **To do** — sectioned checklist seeded from `data/todo-2026-08.json` (the current, going-forward list), sorted automatically by due date within each group (undated items last). Check items off, add new ones, edit text/due date inline, or delete them.
- All edits are saved to the browser's `localStorage` (key prefix `schedule-app.`) — nothing is sent to a server, and data does not sync across devices/browsers.

Source: `src/` (components), `index.html`, `vite.config.ts`, `tsconfig.json`.

## Data files

- `data/2026-07-source.txt`, `data/todo-source.txt` — verbatim backups of the original OneDrive-pasted content (archived; July is no longer shown in the app).
- `data/2026-07.json` / `2026-07.md` — July calendar, transcribed from the OneDrive paste (archived, not seeded into the app anymore).
- `data/2026-08.json` — August calendar, pulled directly from Google Calendar (jnnj0225@gmail.com) on 2026-07-22, plus self-scheduled 「作業:」 work-day markers added 2026-07-26 for undated to-dos. Currently the only month seeded into the app.
- `data/todo.json` — July's to-do list (kept as the historical record; includes items later completed).
- `data/todo-2026-08.json` — August's to-do list: unfinished items from `data/todo.json`, reorganized (伊藤先生review等の研究系項目は研究関連へ), with target due dates assigned 2026-07-26 for anything that lacked one.
- `2026-08.md`, `todo.md`, `2026-08-todo.md` — human-readable Markdown views generated from the JSON above.

## Notes

The July calendar transcription (`data/2026-07.json`, `2026-07.md`) is a best-effort reconstruction of a multi-line table pasted from OneDrive; kept as an archive only. August's calendar came straight from the Google Calendar API.
