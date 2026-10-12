#!/usr/bin/env python3
"""Monta index.html autocontido (funciona offline: React, highlight.js, fontes e imagem embutidos).

Uso:  python3 build.py
Edite numbers.js (números) ou slides.js (conteúdo) e rode de novo.
"""
import base64
import hashlib
import pathlib
import re
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
VENDOR = HERE / "vendor"
SKILL = VENDOR / "weaviate-slides"  # template, tema e componentes do skill de slides da Weaviate
TITLE = "Vetores sem Limites"


def fonts_css():
    """Só os subsets latin do Google Fonts, com os woff2 embutidos em base64 (cache em vendor/fonts)."""
    css = (VENDOR / "fonts.css").read_text()
    blocks = re.findall(r"/\* latin \*/\s*(@font-face\s*{.*?})", css, re.S)
    cache = VENDOR / "fonts"
    cache.mkdir(exist_ok=True)
    out = []
    for b in blocks:
        url = re.search(r"url\((https://[^)]+\.woff2)\)", b).group(1)
        f = cache / (hashlib.sha1(url.encode()).hexdigest()[:16] + ".woff2")
        if not f.exists():
            f.write_bytes(urllib.request.urlopen(url, timeout=30).read())
        data = base64.b64encode(f.read_bytes()).decode()
        out.append(b.replace(url, f"data:font/woff2;base64,{data}"))
    return "\n".join(out)


def main():
    html = (SKILL / "template.html").read_text()

    # Troca CDNs por cópias locais embutidas (Wi-Fi de evento...)
    html = re.sub(r'\s*<link rel="preconnect"[^>]*>', "", html)
    html = re.sub(r'\s*<link href="https://fonts.googleapis.com[^>]*>', "", html)
    html = re.sub(r'\s*<link href="https://cdn.jsdelivr.net/npm/hack-font[^>]*>', "", html)
    for name in ["react.min.js", "react-dom.min.js", "highlight.min.js"]:
        pattern = {"react.min.js": r'<script[^>]*react@18/umd/react\.production\.min\.js[^>]*></script>',
                   "react-dom.min.js": r'<script[^>]*react-dom@18/umd/react-dom\.production\.min\.js[^>]*></script>',
                   "highlight.min.js": r'<script[^>]*highlight\.js/[^>]*></script>'}[name]
        code = (VENDOR / name).read_text().replace("</script", "<\\/script")
        html, n = re.subn(pattern, lambda _: f"<script>{code}</script>", html)
        assert n == 1, name

    rgb = base64.b64encode((HERE / "img/01_cell6.png").read_bytes()).decode()
    ltw = base64.b64encode((HERE / "img/latinoware-2026.svg").read_bytes()).decode()
    studio = base64.b64encode((HERE / "img/weaviate-studio.png").read_bytes()).decode()
    theme = fonts_css() + "\n" + (SKILL / "theme.css").read_text() + "\n" + (HERE / "custom.css").read_text()
    slides = (
        f'window.__IMG = {{ rgb: "data:image/png;base64,{rgb}", latinoware: "data:image/svg+xml;base64,{ltw}", studio: "data:image/png;base64,{studio}" }};\n'
        + (HERE / "numbers.js").read_text() + "\n"
        + (HERE / "slides.js").read_text()
    )

    html = html.replace('<html lang="en">', '<html lang="pt-BR">')
    html = html.replace("/* THEME */", theme)
    html = html.replace("/* COMPONENTS */", (SKILL / "components.js").read_text())
    html = html.replace("/* SLIDES */", slides)
    html = html.replace("<!-- TITLE -->", TITLE)
    (HERE / "index.html").write_text(html)
    print(f"index.html: {len(html) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
