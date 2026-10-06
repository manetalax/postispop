#!/usr/bin/env python3
"""Verify the actual APK/AAB payload against the audited mobile manifest.

This checks resource completeness and hashes, not signing or installation.
Android's default asset exclusions can otherwise remove _next and _astro even
after a successful pre-build audit and a successful Gradle build.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import sys
import zipfile


def verify_archive(archive_path, expected_bytes):
    expected = json.loads(expected_bytes)
    entries = expected.get('entries', [])
    if expected.get('schema') != 1 or expected.get('files') != len(entries) or not entries:
        raise ValueError('Invalid expected bundle manifest')
    serialized = json.dumps(entries, ensure_ascii=False, separators=(',', ':')).encode()
    if hashlib.sha256(serialized).hexdigest() != expected.get('contentHash'):
        raise ValueError('Expected bundle manifest hash is invalid')
    with zipfile.ZipFile(archive_path) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)):
            raise ValueError('Archive contains duplicate ZIP entries')
        prefixes = [prefix for prefix in ('assets/www/', 'base/assets/www/') if prefix + 'bundle-manifest.json' in names]
        if len(prefixes) != 1:
            raise ValueError('Exactly one Android web bundle is required')
        prefix = prefixes[0]
        if archive.read(prefix + 'bundle-manifest.json') != expected_bytes:
            raise ValueError('Embedded manifest differs from the audited mobile bundle')
        expected_names = {prefix + 'bundle-manifest.json'}
        total = 0
        for entry in entries:
            relative = entry.get('path')
            if not isinstance(relative, str) or '\\' in relative or relative.startswith('/') or '..' in PurePosixPath(relative).parts:
                raise ValueError('Invalid bundle resource path')
            name = prefix + relative
            if name in expected_names:
                raise ValueError('Duplicate path in bundle manifest: ' + relative)
            expected_names.add(name)
            if name not in names:
                raise ValueError('Bundled resource missing from archive: ' + relative)
            data = archive.read(name)
            if len(data) != entry.get('bytes') or hashlib.sha256(data).hexdigest() != entry.get('sha256'):
                raise ValueError('Bundled resource changed inside archive: ' + relative)
            total += len(data)
        if total != expected.get('bytes'):
            raise ValueError('Bundle total byte count differs from its manifest')
        actual_names = {name for name in names if name.startswith(prefix) and not name.endswith('/')}
        if actual_names != expected_names:
            raise ValueError('Archive contains web resources absent from the audited manifest')
    data = Path(archive_path).read_bytes()
    return {
        'archive': str(archive_path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
        'bundledFiles': len(entries), 'contentHash': expected['contentHash'], 'signatureChecked': False,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archives', type=Path, nargs='+', help='APK and/or AAB files to verify')
    parser.add_argument('--manifest', type=Path, default=Path(__file__).parent / 'app/src/main/assets/www/bundle-manifest.json')
    args = parser.parse_args()
    expected_bytes = args.manifest.read_bytes()
    for archive in args.archives:
        print(json.dumps(verify_archive(archive, expected_bytes), ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, KeyError, zipfile.BadZipFile) as error:
        print('Android payload verification failed: ' + str(error), file=sys.stderr)
        sys.exit(1)
