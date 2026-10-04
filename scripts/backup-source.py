#!/usr/bin/env python3
"""Archive the committed working tree plus all available Git refs; no cloud data."""
import argparse
import hashlib
import json
import os
import re
from pathlib import Path
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def git(*args):
    return subprocess.check_output(["git", "-C", str(ROOT), *args])


def verify(path):
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)) or any(name.startswith("/") or ".." in Path(name).parts or "\\" in name for name in names):
            raise ValueError("Nombres de archivo inválidos o duplicados")
        bad = archive.testzip()
        if bad:
            raise ValueError("CRC inválido: " + bad)
        manifest = json.loads(archive.read("manifest.json"))
        if manifest.get("format") != "postispop-source-backup-v1" or not re.fullmatch(r"[a-f0-9]{40}", manifest.get("commit", "")) or not isinstance(manifest.get("files"), list):
            raise ValueError("Formato de manifiesto inválido")
        listed = {entry["path"] for entry in manifest["files"]}
        if len(listed) != len(manifest["files"]) or listed | {"manifest.json"} != set(archive.namelist()):
            raise ValueError("Inventario del ZIP no coincide")
        for entry in manifest["files"]:
            data = archive.read(entry["path"])
            if len(data) != entry["bytes"] or hashlib.sha256(data).hexdigest() != entry["sha256"]:
                raise ValueError("Integridad inválida: " + entry["path"])
            if (archive.getinfo(entry["path"]).external_attr >> 16) & 0o777 != entry["mode"]:
                raise ValueError("Permisos inválidos: " + entry["path"])
        # Restore in an isolated repository and compare every source blob to the
        # exact commit, rather than trusting only the manifest's own hashes.
        with tempfile.TemporaryDirectory(prefix="postispop-verify-", dir=path.resolve().parent) as temp:
            restored = Path(temp) / "repo.git"
            bundle = Path(temp) / "history.bundle"
            bundle.write_bytes(archive.read("historial.git.bundle"))
            subprocess.run(["git", "init", "--bare", "--quiet", str(restored)], check=True)
            subprocess.run(["git", "-C", str(restored), "fetch", "--quiet", str(bundle), "+refs/*:refs/*", manifest["commit"]], check=True)
            def recovered(*args):
                return subprocess.check_output(["git", "-C", str(restored), *args])
            expected = set()
            for raw in recovered("ls-tree", "-rz", "--full-tree", manifest["commit"]).split(b"\0"):
                if not raw:
                    continue
                metadata, raw_name = raw.split(b"\t", 1)
                mode, kind, object_id = metadata.split(b" ")
                name = "postispop/" + raw_name.decode("utf-8")
                expected.add(name)
                if kind != b"blob" or mode not in (b"100644", b"100755") or archive.read(name) != recovered("cat-file", "blob", object_id.decode()):
                    raise ValueError("La copia difiere del commit: " + name)
                if (archive.getinfo(name).external_attr >> 16) & 0o777 != int(mode, 8) & 0o777:
                    raise ValueError("Los permisos difieren del commit: " + name)
            if expected != {name for name in names if name.startswith("postispop/")}:
                raise ValueError("El árbol de código no coincide con el commit")
            if sorted(recovered("show-ref").decode().splitlines()) != sorted(manifest["refs"]):
                raise ValueError("Las referencias restauradas no coinciden")
        return manifest


def create(output):
    output = output.resolve()
    if output.exists() or output.is_relative_to(ROOT):
        raise ValueError("El destino debe ser nuevo y estar fuera del repositorio")
    if git("status", "--porcelain").strip():
        raise ValueError("Guarda los cambios en un commit antes de crear el respaldo reproducible")
    commit = git("rev-parse", "HEAD").decode().strip()
    branch = git("branch", "--show-current").decode().strip()
    refs = git("show-ref").decode().splitlines()
    entries = []
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="postispop-source-", dir=output.parent) as temp:
        bundle = Path(temp) / "historial.git.bundle"
        git("bundle", "create", str(bundle), "--all")
        if git("rev-parse", "HEAD").decode().strip() != commit or git("show-ref").decode().splitlines() != refs:
            raise ValueError("Cambió el historial durante la copia; vuelve a ejecutar cuando esté estable")
        subprocess.run(["git", "-C", str(ROOT), "bundle", "verify", str(bundle)], check=True, stdout=subprocess.DEVNULL)
        partial = Path(temp) / "source.zip"
        with zipfile.ZipFile(partial, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
            def add(name, data, mode=0o644):
                info = zipfile.ZipInfo(name)
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = (0o100000 | mode) << 16
                archive.writestr(info, data)
                entries.append({"path": name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "mode": mode})

            for raw in git("ls-tree", "-rz", "--full-tree", commit).split(b"\0"):
                if not raw:
                    continue
                metadata, raw_name = raw.split(b"\t", 1)
                mode, kind, object_id = metadata.split(b" ")
                name = raw_name.decode("utf-8")
                if kind != b"blob" or mode not in (b"100644", b"100755"):
                    raise ValueError("Tipo de archivo no admitido en copia: " + name)
                if "node_modules" in Path(name).parts or Path(name).suffix.lower() in {".jks", ".keystore", ".p12", ".key"} or (Path(name).name.startswith(".env") and Path(name).name != ".env.example"):
                    raise ValueError("Revisar archivo privado versionado: " + name)
                add("postispop/" + name, git("cat-file", "blob", object_id.decode()), int(mode, 8) & 0o777)
            add("historial.git.bundle", bundle.read_bytes())
            instructions = f"""POSTISPOP — CÓDIGO E HISTORIAL DISPONIBLE
Commit: {commit}
Rama: {branch}

Verificar: python3 postispop/scripts/backup-source.py --verify RUTA_DEL_ZIP
Restaurar todas las referencias: git clone --mirror historial.git.bundle postispop-historial.git
Abrir la versión exacta: git -C postispop-historial.git worktree add --detach ../postispop-restaurado {commit}
Para editar: git -C postispop-restaurado switch -c mi-continuacion
El directorio postispop/ contiene exactamente los archivos de ese commit.
El bundle conserva las ramas/referencias disponibles al hacer la copia.

NO es una exportación de Supabase, Storage, configuración de servicios,
issues/PR ni una APK final. No se añaden claves privadas de firma.
El historial conserva los objetos recuperados de GitHub; no se reescribe
ni se certifica mediante una auditoría exhaustiva de secretos históricos.
La pizarra heredada contiene chunks compilados; no es su fuente React original.
Lee docs/ESTADO_ENTREGA.md y docs/RESPALDO_Y_RESTAURACION.md antes de desplegar.
"""
            add("LEEME_RESTAURACION.txt", instructions.encode())
            manifest = {"format": "postispop-source-backup-v1", "commit": commit, "branch": branch,
                        "refs": refs, "scope": "source-and-available-git-history-only",
                        "supabaseExportIncluded": False, "signingKeyIncluded": False, "files": entries}
            archive.writestr("manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
        verify(partial)
        os.rename(partial, output)
    print(f"Copia de código verificada: {output} ({len(entries)} archivos)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    choice = parser.add_mutually_exclusive_group(required=True)
    choice.add_argument("--output", type=Path)
    choice.add_argument("--verify", type=Path)
    args = parser.parse_args()
    if args.verify:
        result = verify(args.verify)
        print("Integridad del código verificada:", result["commit"])
    else:
        create(args.output)
