"""Render channel art for Cicak Tahu with the video engine.

Usage:  python make_brand.py
Writes output/brand/avatar.png (800x800), output/brand/banner.jpg (2560x1440) and review copies in
build/brand/: the avatar at the size YouTube shows it, and the banner with its safe areas marked.
Also writes the mascot model sheets (every pose and face) to docs/mascots/<name>.jpg.
Drawing code: brand/brand.js.
"""
import io
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

from build_video import ENGINE, launch_browser

ROOT = Path(__file__).parent
OUT = ROOT / "output" / "brand"
REVIEW = ROOT / "build" / "brand"


def render(p, call, w, h):
    browser = launch_browser(p)
    page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
    page.goto(ENGINE.as_uri())
    page.add_script_tag(path=str(ROOT / "brand" / "brand.js"))
    page.evaluate(call)
    png = page.screenshot(type="png")
    browser.close()
    return Image.open(io.BytesIO(png)).convert("RGB")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    REVIEW.mkdir(parents=True, exist_ok=True)
    sheets = ROOT / "docs" / "mascots"
    sheets.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        avatar = render(p, "renderAvatar()", 800, 800)
        banner = render(p, "renderBanner()", 2560, 1440)
        for name in ("cicak", "tikus", "stickman"):
            render(p, f"renderSheet('{name}')", 2600, 1760).save(sheets / f"{name}.jpg", quality=88)
    avatar.save(OUT / "avatar.png")
    banner.save(OUT / "banner.jpg", quality=92)

    # review: the avatar as a circle at the sizes YouTube uses (98 px in comments/feeds, 36 px next to videos)
    sheet = Image.new("RGB", (400, 200), (255, 255, 255))
    for x, size in ((20, 160), (220, 98), (340, 36)):
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
        sheet.paste(avatar.resize((size, size), Image.LANCZOS), (x, 20), mask)
    sheet.save(REVIEW / "avatar-sizes.png")
    # review: banner safe areas (TV = whole image, desktop = 2560x423 band, all devices = 1546x423 centre)
    marked = banner.copy()
    d = ImageDraw.Draw(marked)
    d.rectangle((0, 508, 2559, 931), outline=(0, 120, 255), width=6)
    d.rectangle((507, 508, 2053, 931), outline=(255, 0, 0), width=8)
    marked.resize((1280, 720), Image.LANCZOS).save(REVIEW / "banner-safe.png")
    print(f"avatar: {OUT / 'avatar.png'}\nbanner: {OUT / 'banner.jpg'} ({(OUT / 'banner.jpg').stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
