#!/usr/bin/env bash
# Install runtime dependencies only. Bundled Python/JS libraries need no pip/npm.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-install}"
case "$MODE" in
  --help|-h)
    cat <<'HELP'
Usage: bash scripts/install-deps.sh [--check | --help]
Installs Python 3.9+ and FFmpeg on macOS or Linux, then checks video encoders.
--check only checks dependencies; it never installs packages.
macOS: Homebrew (offers to install it if missing; do not run as root).
Linux: apt-get, dnf, pacman or zypper; sudo is used when necessary.
Uses configured package repositories; does not enable third-party repositories.
No pip, npm or Node.js is needed to run Telemetry Studio.
HELP
    exit 0 ;;
  install|--check) ;;
  *) echo "Unknown option: $MODE (see --help)" >&2; exit 2 ;;
esac

check_python() {
  command -v python3 >/dev/null 2>&1 && python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3,9) else 1)' >/dev/null 2>&1
}

check_all() {
  local failed=0 encoder encoders ffmpeg_bin=""
  if check_python; then python3 --version; else echo 'Missing Python 3.9+ (python3 on PATH).' >&2; failed=1; fi
  # Match server.py: a bundled encoder takes priority over PATH.
  for ffmpeg_bin in "$ROOT"/vendor/ffmpeg*; do
    [ -f "$ffmpeg_bin" ] && break
    ffmpeg_bin=""
  done
  if [ -z "$ffmpeg_bin" ]; then ffmpeg_bin="$(command -v ffmpeg || true)"; fi
  if [ -z "$ffmpeg_bin" ]; then
    echo 'Missing FFmpeg. PNG export is still available.' >&2
    return 1
  fi
  if ! encoders="$("$ffmpeg_bin" -hide_banner -encoders 2>&1)"; then
    echo "Cannot run FFmpeg: $ffmpeg_bin" >&2
    echo 'If this is an incompatible bundled binary, move it out of vendor/ to use FFmpeg from PATH.' >&2
    return 1
  fi
  echo "FFmpeg: $ffmpeg_bin"
  for encoder in prores_ks libvpx-vp9 libx264 libx265; do
    if printf '%s\n' "$encoders" | awk -v name="$encoder" '$2 == name {found=1} END {exit !found}'; then
      echo "  OK: $encoder"
    else
      echo "  Missing encoder: $encoder" >&2; failed=1
    fi
  done
  if [ "$failed" -ne 0 ]; then
    echo 'Install a full FFmpeg build and Python 3.9+ using your distribution documentation, then rerun --check.' >&2
    return 1
  fi
  echo 'Ready. Start the app with: python3 server.py'
}

if [ "$MODE" = '--check' ]; then check_all; exit; fi
if check_all; then exit 0; fi

case "$(uname -s)" in
  Darwin)
    if [ "$(id -u)" -eq 0 ]; then echo 'Run this script as your regular macOS user, not with sudo.' >&2; exit 1; fi
    # Homebrew may be installed but absent from the current shell's PATH.
    if ! command -v brew >/dev/null 2>&1; then
      for candidate in /opt/homebrew/bin/brew /usr/local/bin/brew; do
        if [ -x "$candidate" ]; then eval "$("$candidate" shellenv)"; break; fi
      done
    fi
    if ! command -v brew >/dev/null 2>&1; then
      echo 'Homebrew is required: https://brew.sh'
      echo 'Install Homebrew using its official installer? It may request your macOS password.'
      if [ ! -t 0 ]; then echo 'Install Homebrew first, then rerun this script.' >&2; exit 1; fi
      read -r -p 'Continue? [y/N] ' answer
      case "$answer" in y|Y|yes|YES) ;; *) exit 1 ;; esac
      installer_file="$(mktemp)"
      trap 'rm -f "$installer_file"' EXIT
      curl --fail --show-error --location https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh -o "$installer_file"
      /bin/bash "$installer_file"
      if [ -x /opt/homebrew/bin/brew ]; then eval "$(/opt/homebrew/bin/brew shellenv)";
      elif [ -x /usr/local/bin/brew ]; then eval "$(/usr/local/bin/brew shellenv)"; fi
    fi
    brew install python ffmpeg
    ;;
  Linux)
    if [ "$(id -u)" -ne 0 ]; then
      if ! command -v sudo >/dev/null 2>&1; then echo 'Install sudo or run this script as root.' >&2; exit 1; fi
    fi
    as_root() { if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo "$@"; fi; }
    if command -v apt-get >/dev/null 2>&1; then
      as_root apt-get update
      as_root apt-get install -y python3 ffmpeg
    elif command -v dnf >/dev/null 2>&1; then
      as_root dnf install -y python3 ffmpeg
    elif command -v pacman >/dev/null 2>&1; then
      # Full sync/upgrade avoids an unsupported partial upgrade on Arch.
      as_root pacman -Syu --needed python ffmpeg
    elif command -v zypper >/dev/null 2>&1; then
      as_root zypper --non-interactive install python3 ffmpeg
    else
      echo 'Unsupported package manager. Install Python 3.9+ and FFmpeg manually.' >&2; exit 1
    fi
    ;;
  *) echo 'This installer supports macOS and Linux only.' >&2; exit 1 ;;
esac
check_all
