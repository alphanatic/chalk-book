"""Draws site/risk-tiles.svg: the risk scale's seven tiles (site/risk.js), each a square of chalk colour cracked by
the same web in the next tile's colour. The web: one trunk enters from each side and each corner, the trunks meet at
a centre knot, and two rings tie them together. Tapered, jittered polygons, drawn once and reused by every tile.
Usage: python3 -I .claude/skills/chalk-up/risk-tiles.py [seed]    (writes site/risk-tiles.svg; default seed 7)"""
import math
import pathlib
import random
import sys

random.seed(int(sys.argv[1]) if len(sys.argv) > 1 else 7)
S, G = 200, 16          # tile size and the gap between tiles
C = (S / 2 + random.uniform(-6, 6), S / 2 + random.uniform(-6, 6))
paths = []

# Grade 0–6: ground, its palette name, cracks, their palette name, crack strength. Values from chalk-pastel.css;
# rose and mauve are 50/50 sRGB mixes, not palette entries. The last tile is bedrock: asphalt with grain and shading.
TILES = [
    ("#A9D3EE", "--sky",         "#2F6A92", "--sky-ink",                     .42),
    ("#B8E2C8", "--mint",        "#F2A99B", "--coral",                       .5),
    ("#F6E3A1", "--butter",      "#CE9192", "rose: --coral + mauve",          .58),
    ("#F2A99B", "--coral",       "#AA7988", "mauve: --coral-ink + --peri",    .67),
    ("#9A3A28", "--coral-ink",   "#B9B7E8", "--peri",                         .75),
    ("#7A2C1E", "--coral-chip",  "#34373D", "--asphalt",                      .83),
    ("#34373D", "--asphalt",     "#F6E3A1", "gold: --butter",                 1),
]
OUTLINE = "#B8E2C8"     # --mint


def band(points, w0, w1):
    """A polygon around a polyline, its width tapering from w0 to w1 with a little pinch and swell."""
    left, right = [], []
    n = len(points)
    for i, (x, y) in enumerate(points):
        a, b = points[max(i - 1, 0)], points[min(i + 1, n - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        d = math.hypot(dx, dy) or 1
        nx, ny = -dy / d, dx / d
        w = (w0 + (w1 - w0) * i / (n - 1)) * random.uniform(.7, 1.25) / 2
        left.append((x + nx * w, y + ny * w))
        right.append((x - nx * w, y - ny * w))
    pts = left + right[::-1]
    return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + "Z"


def walk(start, end, steps, wobble):
    """Jittered line from start to end."""
    pts = [start]
    for i in range(1, steps):
        t = i / steps
        x = start[0] + (end[0] - start[0]) * t + random.uniform(-wobble, wobble)
        y = start[1] + (end[1] - start[1]) * t + random.uniform(-wobble, wobble)
        pts.append((x, y))
    pts.append(end)
    return pts


def branch(x, y, ang, length, w, depth):
    """A side crack that wanders off and thins to a point, splitting once more if depth allows."""
    pts = [(x, y)]
    for _ in range(6):
        ang += random.uniform(-.35, .35)
        x += math.cos(ang) * length / 6
        y += math.sin(ang) * length / 6
        pts.append((x, y))
    paths.append(band(pts, w, .2))
    if depth:
        k = random.randint(2, 4)
        branch(*pts[k], ang + random.choice((-1, 1)) * random.uniform(.4, .8), length * .55, w * .6, depth - 1)


# One trunk per side, entering near the middle of the side, and one per corner, all running to the centre knot.
# Clockwise from the top, so neighbours in the list are neighbours in the web. Second value: the trunk's width.
side = lambda: S / 2 + random.uniform(-30, 30)
entries = [((side(), -2), 5.4), ((S + 2, -2), 4.5), ((S + 2, side()), 5.4), ((S + 2, S + 2), 4.5),
           ((side(), S + 2), 5.4), ((-2, S + 2), 4.5), ((-2, side()), 5.4), ((-2, -2), 4.5)]
trunks = []
for e, w in entries:
    pts = walk(e, C, 9, 5)
    trunks.append(pts)
    paths.append(band(pts, w, 2.2))
    for k in (2, 5):
        x, y = pts[k]
        ang = math.atan2(C[1] - y, C[0] - x) + random.choice((-1, 1)) * random.uniform(.7, 1.2)
        branch(x, y, ang, random.uniform(28, 45), 2.4, 1)

# Two rings: each joins neighbouring trunks at the same depth, sagging toward the centre like a web
for k in (3, 6):
    for i in range(len(trunks)):
        a, b = trunks[i][k], trunks[(i + 1) % len(trunks)][k]
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        mid = (mx + (C[0] - mx) * .25, my + (C[1] - my) * .25)
        paths.append(band(walk(a, mid, 3, 2.5) + walk(mid, b, 3, 2.5)[1:], 2.1, 1.6))

W = len(TILES) * (S + G) - G
out = [f"<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 {W} {S}'>",
       "<!-- The chalk book's risk scale, grades 0–6 left to right (meanings in site/risk.js).",
       "     One tile alone: risk-tiles.svg#t0 … #t6. Drawn by .claude/skills/chalk-up/risk-tiles.py. -->",
       "<defs>",
       f"<path id='web' d='{''.join(paths)}'/>",
       f"<clipPath id='r'><rect width='{S}' height='{S}' rx='10'/></clipPath>",
       "<filter id='grain'><feTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/>"
       "<feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0'/></filter>",
       "<radialGradient id='glow' cx='.15' cy='.12' r='.75'><stop offset='0' stop-color='#4A4E56' stop-opacity='.65'/>"
       "<stop offset='.65' stop-color='#4A4E56' stop-opacity='0'/></radialGradient>",
       "<linearGradient id='shade' x1='0' y1='0' x2='.6' y2='1'><stop offset='.25' stop-color='#2E2A33' stop-opacity='0'/>"
       "<stop offset='1' stop-color='#2E2A33' stop-opacity='.35'/></linearGradient>",
       "</defs>"]
for i, (ground, gname, crack, cname, strength) in enumerate(TILES):
    x = i * (S + G)
    out.append(f"<view id='t{i}' viewBox='{x} 0 {S} {S}'/>")
    out.append(f"<g transform='translate({x} 0)' clip-path='url(#r)'><title>Risk {i}: ground {gname}, cracks {cname}</title>")
    out.append(f"<rect width='{S}' height='{S}' fill='{ground}'/>")
    if i == len(TILES) - 1:
        out.append(f"<rect width='{S}' height='{S}' filter='url(#grain)'/><rect width='{S}' height='{S}' fill='url(#glow)'/>"
                   f"<rect width='{S}' height='{S}' fill='url(#shade)'/>")
    out.append(f"<use xlink:href='#web' href='#web' fill='{crack}' fill-opacity='{strength:g}'/>")
    out.append(f"<rect x='1.5' y='1.5' width='{S - 3}' height='{S - 3}' rx='9' fill='none' stroke='{OUTLINE}' "
               f"stroke-width='3'/></g>")
out.append("</svg>")

target = pathlib.Path(__file__).resolve().parents[3] / "site" / "risk-tiles.svg"
target.write_text("\n".join(out) + "\n")
print(f"wrote {target} ({target.stat().st_size} bytes)")
