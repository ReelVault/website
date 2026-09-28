#!/usr/bin/env bash
# ReelVault WEB release builder — packages the built web client for a release.
#
# Builds the website and assembles the web release artifact: the dist contents
# at the zip root (with the generated version.json), a SHA256SUMS.txt and an
# optional release.json compatibility manifest. Upload everything to a GitHub
# release of ReelVault/website — the server's update check reads it from there.
#
# Usage:
#   ./scripts/release-web.sh <version> [options]
#
# Options:
#   --min-server-version <v>   Oldest compatible server version, written into
#                              release.json (the admin panel shows a warning
#                              when the installed server is older). Optional.
#   --out <dir>                Output directory (default: dist/release).
#                              Relative paths are resolved from the current
#                              working directory.
#   -h, --help                 Show this help
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT/dist/release"
MIN_SERVER_VERSION=""

usage() {
	awk 'NR > 1 && !/^#/ { exit } NR > 1 { sub(/^# ?/, ""); print }' "${BASH_SOURCE[0]}"
}

die() {
	echo "error: $*" >&2
	exit 1
}

VERSION=""
while [ $# -gt 0 ]; do
	case "$1" in
		--min-server-version)
			[ $# -ge 2 ] || die "--min-server-version needs a value"
			MIN_SERVER_VERSION="${2#v}"
			shift 2
			;;
		--out)
			[ $# -ge 2 ] || die "--out needs a value"
			OUT_DIR="$2"
			shift 2
			;;
		-h | --help)
			usage
			exit 0
			;;
		-*)
			die "unknown option: $1"
			;;
		*)
			[ -z "$VERSION" ] || die "version already given: $VERSION (got extra '$1')"
			VERSION="$1"
			shift
			;;
	esac
done

[ -n "$VERSION" ] || {
	usage
	die "missing version (e.g. ./scripts/release-web.sh 0.2.0)"
}

# anchored regexes (previously '1.2.3; anything' passed) — these values end
# up in file names and in release.json.
VERSION_NO_V="${VERSION#v}"
[[ "$VERSION_NO_V" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[A-Za-z0-9.]+)?$ ]] || die "version must look like 0.2.3 or v0.2.3 (got '$VERSION')"

# After the argument parsing and version validation:
if [ -z "$MIN_SERVER_VERSION" ]; then
	MIN_SERVER_VERSION="$(jq -r '.reelvault.minServerVersion // empty' "$ROOT/package.json")"
	MIN_SERVER_VERSION="${MIN_SERVER_VERSION#v}"
fi

if [ -n "$MIN_SERVER_VERSION" ]; then
	[[ "$MIN_SERVER_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[A-Za-z0-9.]+)?$ ]] || die "minServerVersion must look like 1.0.0 (got '$MIN_SERVER_VERSION')"
fi

min="$(jq -r '.reelvault.minServerVersion // empty' package.json)"
[ -n "$min" ] || echo "::warning::package.json has no reelvault.minServerVersion; release.json will be skipped"

OUT_DIR="$(mkdir -p "$OUT_DIR" && cd "$OUT_DIR" && pwd)"

# 'unzip' is now actually used (archive integrity check below); jq replaces
# the python3 one-liner for reading version.json.
for tool in bun unzip sha256sum jq; do
	command -v "$tool" >/dev/null || die "missing required tool: $tool"
done

# zip the *contents* of the stage dir so files land at the zip root, as
# documented. $1 = absolute zip path, $2 = directory whose contents to pack.
if command -v zip >/dev/null; then
	ZIP_DIR() { (cd "$2" && zip -qr "$1" .); }
elif command -v 7z >/dev/null; then
	ZIP_DIR() { (cd "$2" && 7z a -tzip -mx=9 "$1" . >/dev/null); }
elif command -v python3 >/dev/null; then
	ZIP_DIR() { (cd "$2" && python3 -m zipfile -c "$1" .); }
else
	die "creating the .zip needs one of: zip, 7z, python3"
fi

# never mix in leftovers from a previous run (stale release.json, old zips
# would otherwise end up in SHA256SUMS.txt and in the release).
rm -f "$OUT_DIR"/reelvault-web-*.zip "$OUT_DIR/release.json" "$OUT_DIR/SHA256SUMS.txt"

WORK="$(mktemp -d "${TMPDIR:-/tmp}/reelvault-web-release.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT

echo "==> ReelVault Web ${VERSION_NO_V}"
echo "    output: ${OUT_DIR}"
if [ -n "$MIN_SERVER_VERSION" ]; then
	echo "    min server: ${MIN_SERVER_VERSION}"
fi

echo "==> Building web client"
( cd "$ROOT" && bun install --frozen-lockfile --no-progress )
( cd "$ROOT" && bun run build )
[ -d "$ROOT/dist" ] || die "website build produced no dist/ directory"

# Guard against a stale build: version.json is generated from package.json by
# the vite build — it must match the release version being packaged.
# a missing version.json is now an error instead of silently passing.
[ -f "$ROOT/dist/version.json" ] || die "dist/version.json missing after build"
BUILT_VERSION="$(jq -r '.version // empty' "$ROOT/dist/version.json")"
[ -n "$BUILT_VERSION" ] || die "dist/version.json has no version field"
if [ "$BUILT_VERSION" != "$VERSION_NO_V" ]; then
	die "dist/version.json says ${BUILT_VERSION} but the release is ${VERSION_NO_V} — bump the website package.json version first"
fi

echo "==> Assembling web release"
STAGE="$WORK/reelvault-web-${VERSION_NO_V}"
mkdir -p "$STAGE"
# exclude a previous release output when OUT_DIR lives inside dist/
# (the default), so the zip never contains older zips.
cp -a "$ROOT/dist/." "$STAGE/"
rm -rf "$STAGE/release"

ASSET="$OUT_DIR/reelvault-web-${VERSION_NO_V}.zip"
ZIP_DIR "$ASSET" "$STAGE"
unzip -tq "$ASSET" >/dev/null || die "created zip failed the integrity check"
echo "    -> $(basename "$ASSET")"

if [ -n "$MIN_SERVER_VERSION" ]; then
	printf '{ "minServerVersion": "%s" }\n' "$MIN_SERVER_VERSION" >"$OUT_DIR/release.json"
	echo "    -> release.json (minServerVersion: ${MIN_SERVER_VERSION})"
fi

echo "==> Checksums"
# no './' prefix in SHA256SUMS.txt
if [ -f "$OUT_DIR/release.json" ]; then
	( cd "$OUT_DIR" && sha256sum reelvault-web-*.zip release.json >SHA256SUMS.txt )
else
	( cd "$OUT_DIR" && sha256sum reelvault-web-*.zip >SHA256SUMS.txt )
fi

echo
echo "Done. Web release assets are in ${OUT_DIR}:"
ls -1 "$OUT_DIR"
echo

EXTRA=""
if [ -f "$OUT_DIR/release.json" ]; then
	EXTRA=" \"$OUT_DIR/release.json\""
fi
echo "Upload the files to a GitHub release of ReelVault/website, e.g.:"
echo "  gh release create v${VERSION_NO_V} --repo ReelVault/website --title \"ReelVault Web v${VERSION_NO_V}\" --generate-notes \"${OUT_DIR}/reelvault-web-${VERSION_NO_V}.zip\" \"${OUT_DIR}/SHA256SUMS.txt\"${EXTRA}"