#!/usr/bin/env python3
"""Exporta index.html para PDF (um slide por página, com todos os fragmentos visíveis).

Uso:  python3 export_pdf.py [saida.pdf] [--scale 1.25] [--quality 80]
Precisa de: pip install playwright pillow && playwright install chromium
"""
import argparse
import io
import pathlib

from PIL import Image
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out", nargs="?", default=str(HERE / "vetores-sem-limites.pdf"))
    ap.add_argument("--scale", type=float, default=1.25, help="resolução: 1 = 1920×1080")
    ap.add_argument("--quality", type=int, default=80, help="qualidade JPEG das páginas")
    args = ap.parse_args()

    pages = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=args.scale)
        page.goto((HERE / "index.html").as_uri())
        page.wait_for_timeout(1000)
        n = page.evaluate("document.querySelectorAll('.slide').length")
        for i in range(n):
            # mostra só o slide i, com todos os fragmentos revelados
            page.evaluate("""i => {
                document.querySelectorAll('.slide').forEach((s, j) => s.classList.toggle('active', j === i));
                document.querySelectorAll('.fragment').forEach(f => f.classList.add('visible'));
            }""", i)
            page.wait_for_timeout(150)
            png = page.screenshot(type="png")
            pages.append(Image.open(io.BytesIO(png)).convert("RGB"))
        browser.close()

    pages[0].save(args.out, "PDF", save_all=True, append_images=pages[1:], resolution=72 * args.scale, quality=args.quality)
    size = pathlib.Path(args.out).stat().st_size / 1e6
    print(f"{args.out}: {n} páginas, {size:.1f} MB")


if __name__ == "__main__":
    main()
