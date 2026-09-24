from pathlib import Path
from PIL import Image

src = Path(
    r"C:\Users\Acer\.cursor\projects\d-do-an-van-moc\assets"
    r"\c__Users_Acer_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"0d762c4e972d27503c0601a56615e89b_images_ChatGPT_Image_01_32_36_25_thg_9__2026-efa7950c-2689-4306-b480-98d0acd8d96c.jpg"
)
out_dir = Path(r"D:\do-an\van-moc\public\assets")

img = Image.open(src).convert("RGBA")
w, h = img.size

# Logo only: cloud + Vân Mộc (stop before vertical divider / tagline)
crop = img.crop((int(w * 0.015), int(h * 0.012), int(w * 0.155), int(h * 0.082)))

pixels = crop.load()
cw, ch = crop.size
for y in range(ch):
    for x in range(cw):
        r, g, b, a = pixels[x, y]
        luminance = 0.299 * r + 0.587 * g + 0.114 * b
        max_c = max(r, g, b)
        min_c = min(r, g, b)
        saturation = 0 if max_c == 0 else (max_c - min_c) / max_c
        if luminance >= 165 and saturation < 0.28:
            fade = min(1.0, (luminance - 150) / 55)
            alpha = int(a * (1 - fade))
            pixels[x, y] = (r, g, b, max(0, alpha))

bbox = crop.getbbox()
if bbox:
    pad = 3
    crop = crop.crop(
        (
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(cw, bbox[2] + pad),
            min(ch, bbox[3] + pad),
        )
    )

up = crop.resize((crop.width * 4, crop.height * 4), Image.Resampling.LANCZOS)
out = out_dir / "van-moc-logo-transparent.png"
up.save(out)
print(f"saved {out} {up.size}")
