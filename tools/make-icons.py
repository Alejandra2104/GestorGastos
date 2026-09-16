"""Genera el icono GG dorado sobre verde billete en todos los tamaños PWA/iOS/favicon."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

PUB = Path(__file__).resolve().parent.parent / "public"
ICONS = PUB / "icons"
GEORGIA = Path("C:/Windows/Fonts/georgiab.ttf")

# Verde billete (degradado vertical) y dorado
VERDE_ARRIBA = (11, 61, 32)
VERDE_ABAJO = (6, 38, 20)
LUZ_CENTRO = (27, 122, 67)
DORADO = (240, 206, 115)
DORADO_OSCURO = (122, 92, 20)
LINEA_DORADA = (212, 175, 55)

BASE = 1024


def fondo(size, redondear=True, margen_contenido=1.0):
    """Degradado verde vertical + luz central. Si redondear, esquinas transparentes."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    # degradado por franjas
    grad = Image.new("RGB", (1, size))
    for y in range(size):
        t = y / max(size - 1, 1)
        r = int(VERDE_ARRIBA[0] + (VERDE_ABAJO[0] - VERDE_ARRIBA[0]) * t)
        g = int(VERDE_ARRIBA[1] + (VERDE_ABAJO[1] - VERDE_ARRIBA[1]) * t)
        b = int(VERDE_ARRIBA[2] + (VERDE_ABAJO[2] - VERDE_ARRIBA[2]) * t)
        grad.putpixel((0, y), (r, g, b))
    grad = grad.resize((size, size))
    # luz radial central
    luz = Image.new("L", (size, size), 0)
    dl = ImageDraw.Draw(luz)
    cx = cy = size // 2
    for i in range(size // 2, 0, -1):
        a = int(90 * (1 - i / (size // 2)))
        dl.ellipse([cx - i, cy - i, cx + i, cy + i], fill=a)
    ver = Image.new("RGB", (size, size), LUZ_CENTRO)
    grad = Image.composite(ver, grad, luz)
    img.paste(grad, (0, 0))

    d = ImageDraw.Draw(img)
    m = int(size * 0.045)
    # doble marco dorado estilo billete
    d.rounded_rectangle([m, m, size - m, size - m], radius=int(size * 0.19), outline=LINEA_DORADA, width=max(2, size // 170))
    m2 = int(size * 0.085)
    d.rounded_rectangle([m2, m2, size - m2, size - m2], radius=int(size * 0.15), outline=LINEA_DORADA + (170,) if len(LINEA_DORADA) == 3 else LINEA_DORADA, width=max(1, size // 340))
    if redondear:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, size, size], radius=int(size * 0.225), fill=255)
        img.putalpha(mask)
    else:
        img.putalpha(Image.new("L", (size, size), 255))
    return img


def texto_gg(img, escala=0.46):
    size = img.size[0]
    d = ImageDraw.Draw(img)
    fs = int(size * escala)
    try:
        font = ImageFont.truetype(str(GEORGIA), fs)
    except OSError:
        font = ImageFont.load_default()
    txt = "GG"
    bb = d.textbbox((0, 0), txt, font=font)
    w, h = bb[2] - bb[0], bb[3] - bb[1]
    x, y = (size - w) / 2 - bb[0], (size - h) / 2 - bb[1]
    off = max(1, size // 300)
    d.text((x + off, y + off), txt, font=font, fill=DORADO_OSCURO)
    d.text((x, y), txt, font=font, fill=DORADO)
    return img


def guardar(img, ruta, sizes=None):
    ruta.parent.mkdir(parents=True, exist_ok=True)
    if sizes:  # .ico multi-tamaño
        img.save(ruta, sizes=sizes)
    else:
        img.save(ruta, optimize=True)
    print(f"OK {ruta} ({ruta.stat().st_size // 1024} KB)")


def main():
    base = texto_gg(fondo(BASE, redondear=True))
    plano = texto_gg(fondo(BASE, redondear=False), escala=0.42)          # apple-touch / favicon.png
    mask = texto_gg(fondo(BASE, redondear=False), escala=0.34)           # maskable: contenido en zona segura
    for s in (16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512):
        guardar(base.resize((s, s), Image.LANCZOS), ICONS / f"icon-{s}.png")
    guardar(mask.resize((512, 512), Image.LANCZOS), ICONS / "maskable-512.png")
    guardar(base.resize((192, 192), Image.LANCZOS), PUB / "icon-192.png")
    guardar(base.resize((512, 512), Image.LANCZOS), PUB / "icon-512.png")
    guardar(base.resize((512, 512), Image.LANCZOS), PUB / "icon.png")
    guardar(plano.resize((180, 180), Image.LANCZOS), PUB / "apple-touch-icon.png")
    guardar(plano.resize((64, 64), Image.LANCZOS), PUB / "favicon.ico.png")
    guardar(plano.resize((48, 48), Image.LANCZOS), PUB / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])


if __name__ == "__main__":
    main()
