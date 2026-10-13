# Third-party components

The MIT license at the project root covers original application code only.

| Component | Version | License | Source / notice |
| --- | --- | --- | --- |
| fitdecode | 0.11.0 | MIT | https://github.com/polyvertex/fitdecode · `vendor/FITDECODE-LICENSE.txt` |
| Leaflet | 1.9.4 | BSD-2-Clause | https://github.com/Leaflet/Leaflet/tree/v1.9.4 · `vendor/LEAFLET-LICENSE.txt` |

fitdecode Python sources are vendored unchanged from the PyPI wheel, with no additional dependencies. Wheel SHA-256: `a1bdb9b4d1e9ebac0001fc58c22fe07a3f9967ca4e13258c6ef99cdb8d697a78`.

FFmpeg is invoked as a separate executable. It is not included in the GitHub source archive. The macOS application archive includes FFmpeg 7.1 from imageio-ffmpeg 0.6.0; that build is GPL-licensed. Its license text is in `vendor/FFMPEG-LICENSE.txt`, and the imageio notice is in `vendor/IMAGEIO-LICENSE.txt`. Upstream build information and dependencies: https://github.com/imageio/imageio-ffmpeg/tree/v0.6.0 and https://github.com/FFmpeg/FFmpeg/tree/n7.1. Redistributors of a binary build must comply with its applicable source-distribution obligations; copying license notices alone is not a substitute.

Map tiles are served by OpenStreetMap, with attribution shown on the map: https://www.openstreetmap.org/copyright. Tiles are not included in video exports or the source repository.
