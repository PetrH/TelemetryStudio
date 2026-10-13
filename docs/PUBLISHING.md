# Publish to GitHub

## Working in the existing local repository

The development copy in `TelemetryStudio/` is a Git repository on branch `main`. Work directly in this folder and launch its `Spustit.command` or `python3 server.py`. There is no need to unpack ZIP files for future changes.

One-time connection after creating an empty GitHub repository:

```sh
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

For subsequent changes:

```sh
git status
git add .
git diff --cached --stat
git commit -m "Describe your changes"
git push
```

Private activities, exports and the local FFmpeg binary remain ignored. Language preferences are stored in the browser, not in Git.

## Starting from a source archive


Suggested repository name: `telemetry-studio`

Suggested description:
> Vibecoded local app for cycling telemetry overlays — TCX, FIT, Cadence JSON and transparent video export.

Suggested topics: `vibecoding`, `cycling`, `telemetry`, `fit`, `tcx`, `video-overlay`, `prores`, `python`, `javascript`.

1. Use the contents of `TelemetryStudio-GitHub.zip` or generate a fresh source archive with `python3 scripts/package_source.py`. Do not publish the parent workspace or the macOS app archive: they may contain local activities, exported videos or a binary encoder.
2. Extract the source archive, open a terminal in its root and run the tests documented in README.
3. Create an empty GitHub repository (without an initial README or license). This project already includes those files.
4. In the extracted project:

   ```sh
   git init -b main
   git add .
   git status --short
   git diff --cached --stat
   git commit -m "Initial release: vibecoded telemetry overlay app"
   ```

5. Add your actual repository URL with `git remote add origin YOUR_REPOSITORY_URL`, then `git push -u origin main`.

Review staged files before pushing: no real activity, screenshot of a real route, credential or generated video should be included. `.gitignore` protects common filenames but cannot recognize every possible private JSON file. Prefer the allowlisted source archive.

For a release, attach the generated source archive. Users install FFmpeg separately. Do not enable GitHub Pages as an application deployment; rendering requires the local Python server. This preparation does not itself publish or upload anything to GitHub.
