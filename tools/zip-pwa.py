"""Regenera dist/GestorGastos-PWA-instalable.zip con rutas portables (/) aptas para Win/Mac/Linux."""
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public"
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)
ZIP = DIST / "GestorGastos-PWA-instalable.zip"
EXCLUIR = {"Nuevo Documento de texto.txt", "icon.jpg", "icon.png"}

if ZIP.exists():
    ZIP.unlink()

with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as z:
    for p in sorted(PUB.rglob("*")):
        if p.is_dir():
            continue
        if p.name in EXCLUIR:
            continue
        z.write(p, p.relative_to(PUB).as_posix())

print(f"OK -> {ZIP} ({ZIP.stat().st_size / 1024:.1f} KB)")
