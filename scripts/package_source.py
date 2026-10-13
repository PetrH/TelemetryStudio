#!/usr/bin/env python3
"""Build a shareable source archive using an explicit file allowlist."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
FILES = '''README.md LICENSE THIRD_PARTY_NOTICES.md .gitignore
index.html style.css i18n.js app.js core.js route.js server.py fit_import.py
Spustit.command demo.json docs/USER_GUIDE.cs.md docs/PUBLISHING.md
scripts/package_source.py .github/workflows/tests.yml
 tests/test_core.cjs tests/test_i18n.cjs tests/test_fit.py tests/sample.tcx
vendor/__init__.py vendor/leaflet.js vendor/leaflet.css vendor/LEAFLET-LICENSE.txt
vendor/FITDECODE-LICENSE.txt vendor/FFMPEG-LICENSE.txt vendor/IMAGEIO-LICENSE.txt'''.split()
FITDECODE_FILES = ['__init__.py','__meta__.py','exceptions.py','processors.py','profile.py','reader.py','records.py','types.py','utils.py']
FILES += ['vendor/fitdecode/' + name for name in FITDECODE_FILES]

if __name__ == '__main__':
    target = ROOT / 'dist' / 'TelemetryStudio-GitHub.zip'
    target.parent.mkdir(exist_ok=True)
    for name in FILES:
        if not (ROOT/name).is_file():
            raise SystemExit('Missing required source file: ' + name)
    with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
        for name in FILES:
            archive.write(ROOT/name, 'TelemetryStudio/' + name)
    print(target)
