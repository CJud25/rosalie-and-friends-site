"""Generate favicon set + og-image from images/mascot.jpg. Run from repo root."""
from PIL import Image, ImageOps

m = ImageOps.exif_transpose(Image.open("images/mascot.jpg")).convert("RGB")
s = min(m.size)
sq = m.crop(((m.width - s) // 2, (m.height - s) // 2, (m.width + s) // 2, (m.height + s) // 2))

sq.resize((32, 32), Image.LANCZOS).save("images/favicon-32.png")
sq.resize((180, 180), Image.LANCZOS).save("images/apple-touch-icon.png")
sq.resize((48, 48), Image.LANCZOS).save("favicon.ico")

# og-image: mascot offset left on the site cream, 1200x630
og = Image.new("RGB", (1200, 630), "#FBF5EE")
og.paste(sq.resize((470, 470), Image.LANCZOS), (80, 80))
og.save("images/og-image.jpg", "JPEG", quality=88, optimize=True)
print("icons + og-image done")
