# Telemetry Studio

**A vibecoded app for visualizing cycling telemetry and exporting transparent video overlays.** Built iteratively with AI assistance (OpenAI Codex) and real-world user feedback.

Lokální vibecoded aplikace pro zobrazení telemetrických dat z cyklistiky. Načte **TCX, FIT nebo Cadence JSON**, zobrazí trasu a vytvoří průhledný overlay pro video.

## Features

- Czech / English GUI switch, remembered in the browser without resetting your activity or selection.
- Import TCX, FIT and Cadence JSON; synthetic demo included.
- Large route map below the preview; click to choose export start and end.
- Actual date/time, local time or UTC, for synchronization with video.
- Movable telemetry widgets: speed, cadence, power, heart rate, elevation, distance and estimated climb/descent angle.
- Three visual styles, including large icons; 3-second average power by default, optional instantaneous power.
- Route overview and follow modes, rider position, optional planned GPX/TCX route.
- **4K / 30 fps ProRes 4444 + alpha by default**, suitable for compositing in Premiere Pro. Also VP9 + alpha, PNG frames and PNG sequences.
- H.264/H.265 export with a solid background for color keying; these MP4 exports do not contain alpha.
- Local processing with no accounts or cloud upload.

## Run

Requires **Python 3.9+** and a modern browser. All Python and browser dependencies are included as source; no pip or npm install is needed.

```sh
python3 server.py
```

Open <http://127.0.0.1:8765/>. On macOS you can also double-click `Spustit.command`. Leave the terminal running; press Ctrl+C to stop. Do not open `index.html` directly.

**Video export requires FFmpeg on PATH**, with the encoders `prores_ks`, `libvpx-vp9`, `libx264` and `libx265` for the respective formats. Install FFmpeg through your platform's package manager (for example `brew install ffmpeg` on macOS). PNG export works without FFmpeg. The separate macOS application archive includes an Apple Silicon FFmpeg binary; the GitHub source archive intentionally excludes binaries.

The server is intended for your own computer and binds only to localhost. This is not a GitHub Pages application: Python and FFmpeg are needed for rendering.

[Český návod / Czech user guide](docs/USER_GUIDE.cs.md)

## FIT support

FIT is decoded locally with [fitdecode](https://github.com/polyvertex/fitdecode) 0.11.0 (MIT). Standard record fields and enhanced speed/elevation are supported, including compressed timestamps and developer-field records. Cadence's `timestamp_ms` and `total_time` extensions preserve timestamp precision and active time. Unknown proprietary sensor fields are not automatically mapped. Files must contain at least two timestamped activity records and pass CRC checks; the input limit is 60 MB.

## Development and tests

Node.js 20+ is only needed to run the JavaScript model tests; it is not required to run the application.

```sh
node tests/test_core.cjs
node tests/test_i18n.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
```

The tests use synthetic data and cover FIT byte order, compressed timestamps, units, zeros, missing values, CRC/truncation errors, timestamp precision, telemetry interpolation, power averaging and route geometry. GitHub Actions runs these tests on Linux, macOS and Windows. Browser behavior and long video exports should additionally be checked manually.

- `core.js` — telemetry model, TCX/JSON parsing, shared preview/export renderer
- `fit_import.py` — FIT adapter, using `vendor/fitdecode`
- `route.js` — planned routes and map overlay rendering
- `i18n.js` — Czech / English GUI translations
- `app.js`, `index.html`, `style.css` — GUI
- `server.py` — localhost server, FIT decoding and FFmpeg export
- `vendor/` — bundled dependencies and their license notices

This is a **vibecoded project**: AI-assisted implementation does not imply exhaustive validation. Contributions and reproducible bug reports are welcome. Please use synthetic or anonymized activity data in issues.

## Privacy

TCX/JSON parsing runs in the browser; FIT decoding and video encoding run on the local server. Imported files are not saved by the FIT endpoint. Generated exports remain in `exports/`. OpenStreetMap tiles are the only external requests; the tile provider sees your IP and requested map area. Select “Bez podkladu” to use the route without tiles. The included demo is fictional.

User activities, exports, screenshots, local environments and FFmpeg binaries are excluded by `.gitignore`. The source packaging script uses an explicit allowlist rather than copying the entire working folder:

```sh
python3 scripts/package_source.py
```

For ongoing development, work directly in this project folder and commit changes with Git; ZIP archives are optional release artifacts. See [publishing instructions](docs/PUBLISHING.md) for the one-time remote setup and subsequent commit/push workflow.

## License

Original application code is under the [MIT License](LICENSE). Dependencies retain their own licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). FFmpeg is an external executable and is not included in the source repository.
