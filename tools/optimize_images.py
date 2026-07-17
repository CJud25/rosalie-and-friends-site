"""Resize/compress harvested photos into the repo.

Usage: py tools/optimize_images.py <harvest_dir>
Expects <harvest_dir>/mascot.jpg and <harvest_dir>/photos/*.jpg (dog photos).
Writes images/mascot.jpg and images/dogs/*.jpg, max 900px wide, progressive JPEG.
"""
import sys, pathlib
from PIL import Image, ImageOps

MAX_W = 900

def optimize(src: pathlib.Path, dest: pathlib.Path) -> None:
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if im.width > MAX_W:
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=82, optimize=True, progressive=True)
    print(f"{dest}  {im.size}  {dest.stat().st_size // 1024}KB")

def main() -> None:
    harvest = pathlib.Path(sys.argv[1])
    optimize(harvest / "mascot.jpg", pathlib.Path("images/mascot.jpg"))
    for p in sorted((harvest / "photos").glob("*.jpg")):
        optimize(p, pathlib.Path("images/dogs") / p.name)

if __name__ == "__main__":
    main()
