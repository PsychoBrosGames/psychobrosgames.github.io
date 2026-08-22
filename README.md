# PsychoBros

The official PsychoBros site: independent game reviews, commentary, streams, and event
coverage from three longtime friends with very different player perspectives.

## Local preview

The site has no build step. Serve the repository root with any static file server:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

GitHub Pages publishes the root of `main` to
[psychobrosgames.github.io](https://psychobrosgames.github.io/). Merging a change to `main`
triggers a new Pages build automatically.
