# Learning Mode

This folder stores your personal paper collection and reading notes.

## Quick Start

1. **Fork** this repository
2. Go to the **main page** → select papers → click **Download JSON**
3. Save the file as `learning/papers.json` in your fork
4. Create reading notes as Markdown files: `learning/{paper-id}.md`
5. Commit & push — your Learning page will auto-load everything

## File Structure

```
learning/
├── papers.json          ← your paper collection (from Download)
├── feng-2026.md         ← reading note for paper "feng-2026"
├── cook-2021.md         ← reading note for paper "cook-2021"
└── ...
```

## Paper IDs

Each paper has a short ID like `feng-2026` (first-author-year). You can see the ID on each card in Learning Mode. Use this ID as the filename for your notes.

## Note Format

Notes are plain Markdown. Example `feng-2026.md`:

```markdown
# Key Findings

- dv/v is a proxy for groundwater level
- Soil moisture alone doesn't explain total water storage

## Methods
- Single-station cross-correlation
- 10-year continuous seismic data

## Questions
- How does this apply to tropical regions?
```

## No `papers.json` yet?

If you haven't added a `papers.json`, the Learning page will show an upload zone where you can drag & drop a JSON/CSV file for a quick preview.
