"""Smoke check for engine/props.js: call every prop in CASES in the engine page, in all three themes.

python scripts/check_props.py

A case fails when its SVG is empty, contains NaN / undefined / Infinity / [object, differs between two
calls with the same arguments (frames are rendered out of order), or when the prop's name is defined
anywhere other than engine/props.js (a topic with the same global name would stop loading).
Uses topics/demo-props for the page (its voice cache is reused).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import build_video as bv  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

THEMES = ["paper", "newsprint", "notebook"]

# prop name -> JS expressions that call it; batch C (Si Tikus)
CASES = {
    "savingsBook": ["savingsBook(0, 0, 1)", "savingsBook(0, 0, 0.5, { title: 'DEPOSITO', rot: 0 })"],
    "shieldBadge": ["shieldBadge(0, 0, 1)", "shieldBadge(0, 0, 1, { label: 'DIJAMIN' })"],
    "hangSign": ["hangSign(0, 0, 1)", "hangSign(0, 0, 1, { t: 0.2, t0: 1 })", "hangSign(0, 0, 1, { t: 1000, t0: 1 })"],
    "levelGauge": ["levelGauge(0, 0, 1, { level: 0.6, limit: 0.5, value: '3,75%', id: 'g1' }) + levelGauge(300, 0, 1, { level: 0.3, id: 'g2' })",
                   "levelGauge(0, 0, 1, { level: -0.2 })", "levelGauge(0, 0, 1, { level: 1.4, limit: 0.5 })"],
    "checkBoard": ["checkBoard(0, 0, 1)",
                   "checkBoard(0, 0, 1, { rows: [{ text: 'TERCATAT', sub: 'di bank', check: 1 }, { text: 'BUNGA WAJAR', check: 0.5 }], active: 1 })",
                   "checkBoard(0, 0, 1, { rows: Array.from({ length: 6 }, (_, i) => ({ text: 'BARIS ' + i })) })"],
    "priceLabel": ["priceLabel(0, 0, 1)", "priceLabel(0, 0, 1, { label: 'Rp1.250.000' })"],
    "fuelPump": ["fuelPump(0, 0, 1)", "fuelPump(0, 0, 1, { fuel: 'SOLAR', price: 'Rp6.800/L', t: 3 })"],
    "atmCard": ["atmCard(0, 0, 1)", "atmCard(0, 0, 1, { col: '#8A5A36', digits: '9876', rot: 0 })"],
    "goldBar": ["goldBar(0, 0, 1)", "goldBar(0, 0, 1, { n: 3 })"],
    "safeBox": ["safeBox(0, 0, 1)", "safeBox(0, 0, 1, { open: 0.7, inside: goldBar(0, 0, 0.5) })", "safeBox(0, 0, 1, { open: 2 })"],
    "shoppingBasket": ["shoppingBasket(0, 0, 1)", "shoppingBasket(0, 0, 1, { items: ['sayur', 'xyz'] })", "shoppingBasket(0, 0, 1, { items: [] })"],
    "oilBarrel": ["oilBarrel(0, 0, 1)", "oilBarrel(0, 0, 1, { col: '#3A3F4E', label: '' })"],
    "lpgTank": ["lpgTank(0, 0, 1)", "lpgTank(0, 0, 1, { col: '#3E7FC4', label: '12 kg' })"],
    "house": ["house(0, 0, 1)", "house(0, 0, 1, { label: 'KPR' })"],
}

# extra substrings a case must contain
MUST = {
    CASES["levelGauge"][0]: ['id="g1"', 'id="g2"'],
}

BAD = ("NaN", "undefined", "Infinity", "[object")


def check_names(names):
    """Errors for prop names that are not defined exactly once, in engine/props.js."""
    files = list((ROOT / "topics").rglob("*.js")) + list((ROOT / "engine").glob("*.js")) + list((ROOT / "brand").glob("*.js"))
    texts = {p: p.read_text(encoding="utf-8", errors="replace") for p in files}
    errors = []
    for n in names:
        rx = re.compile(rf"^\s*(const|let|var|function)\s+{re.escape(n)}\b", re.M)
        where = [p.relative_to(ROOT).as_posix() for p, s in texts.items() for _ in rx.finditer(s)]
        if where != ["engine/props.js"]:
            errors.append(f"{n}: defined in {where or 'nowhere'} (expected once, in engine/props.js)")
    return errors


def norm(svg):
    return re.sub(r"vol\d+", "vol#", svg)


def main():
    errors = check_names(CASES)
    topic_dir = ROOT / "topics" / "demo-props"
    bv.BUILD = ROOT / "build" / "demo-props"
    bv.BUILD.mkdir(parents=True, exist_ok=True)
    script = bv.json.loads((topic_dir / "script.json").read_text(encoding="utf-8"))
    data, _ = bv.timeline(script, topic_dir)
    with sync_playwright() as p:
        browser, page, _ = bv.open_page(p, topic_dir, data)
        for theme in THEMES:
            page.evaluate("n => applyTheme(n, 1080, 1920)", theme)
            for name, exprs in CASES.items():
                for expr in exprs:
                    try:
                        a, b = page.evaluate(f"() => [{expr}, {expr}]")
                    except Exception as e:  # noqa: BLE001
                        errors.append(f"{name} [{theme}]: {str(e).splitlines()[0]}")
                        continue
                    if not isinstance(a, str) or len(a) < 200:
                        errors.append(f"{name} [{theme}]: empty output: {expr}")
                        continue
                    errors += [f"{name} [{theme}]: '{w}' in output: {expr}" for w in BAD if w in a]
                    if norm(a) != norm(b):
                        errors.append(f"{name} [{theme}]: not deterministic: {expr}")
                    errors += [f"{name} [{theme}]: missing {m}: {expr}" for m in MUST.get(expr, []) if m not in a]
        browser.close()
    if errors:
        print("\n".join(errors))
        print(f"FAIL: {len(errors)} problem(s)")
        sys.exit(1)
    print(f"ok: {len(CASES)} props x {len(THEMES)} tema")


if __name__ == "__main__":
    main()
