from PIL import Image
import os

src = Image.open("public/assets/van-moc-logo.png").convert("RGBA")
w, h = src.size
px = src.load()

dark = Image.new("RGBA", (w, h), (0, 0, 0, 0))
light = Image.new("RGBA", (w, h), (0, 0, 0, 0))
dp = dark.load()
lp = light.load()

for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        brightness = (r + g + b) / 3
        is_bg = brightness > 225 or (
            r > 210 and g > 200 and b > 175 and (max(r, g, b) - min(r, g, b)) < 45
        )
        if is_bg:
            continue
        dp[x, y] = (r, g, b, 255)
        ink = max(0, min(1, (210 - brightness) / 160))
        alpha = int(min(255, ink * 280))
        if alpha > 12:
            lp[x, y] = (255, 242, 220, alpha)


def trim(im):
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


dark = trim(dark)
light = trim(light)

dark.save("public/assets/van-moc-logo-dark.png")
light.save("public/assets/van-moc-logo-light.png")
dark.save("public/assets/van-moc-logo-transparent.png")
print("dark", dark.size, os.path.getsize("public/assets/van-moc-logo-dark.png"))
print("light", light.size, os.path.getsize("public/assets/van-moc-logo-light.png"))
