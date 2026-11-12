"""Flazly Indigo theme generator: the source of truth for src/theme/flazly-theme.css.

OKLCH scales -> hex, semantic tokens for light and dark, WCAG AA contrast checks
for every text/background pair, then CSS (+ W3C design-token JSON) output.
Run from frontend/:  python scripts/theme/gen.py
Change colours here, never by hand in the generated CSS."""
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'src', 'theme')


# --- OKLCH -> sRGB -------------------------------------------------------------
def oklch_to_hex(L, C, H):
    a = C * math.cos(math.radians(H))
    b = C * math.sin(math.radians(H))
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

    def enc(x):
        x = max(0.0, min(1.0, x))
        return 12.92 * x if x <= 0.0031308 else 1.055 * x ** (1 / 2.4) - 0.055
    return '#%02x%02x%02x' % tuple(round(enc(v) * 255) for v in (r, g, bb))


def lum(hexc):
    c = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
# Even lightness ramp; chroma eases off at both ends.
L_RAMP = [0.975, 0.945, 0.885, 0.80, 0.70, 0.585, 0.505, 0.43, 0.355, 0.285]
C_SHAPE = [0.10, 0.22, 0.45, 0.70, 0.90, 1.00, 0.95, 0.85, 0.72, 0.58]


def scale(hue, cmax, l_ramp=L_RAMP):
    return {s: oklch_to_hex(l, cmax * c, hue) for s, l, c in zip(STEPS, l_ramp, C_SHAPE)}


# Brand: the blue end of the logo gradient. Hue 264 sits between the landing's
# #1463FF and the app's #2563EB; 500 is the action colour.
brand = scale(264, 0.235)
# Violet: the middle of the logo gradient, for AI moments and gradients only.
violet = scale(292, 0.24)
# Neutrals: indigo-tinted (the landing's navy family), never pure grey.
neutral = {s: oklch_to_hex(l, c, 272) for s, l, c in zip(
    STEPS + [950],
    [0.985, 0.965, 0.925, 0.86, 0.72, 0.56, 0.45, 0.37, 0.28, 0.215, 0.165],
    [0.004, 0.006, 0.010, 0.014, 0.022, 0.030, 0.038, 0.045, 0.055, 0.060, 0.055])}
# Status: four hues kept well apart (green 150, amber 75, red 25, sky 230).
green = scale(152, 0.17)
amber = scale(70, 0.17)
red = scale(25, 0.21)
sky = scale(232, 0.14)

primitives = {'brand': brand, 'violet': violet, 'neutral': neutral, 'green': green, 'amber': amber, 'red': red, 'sky': sky}

# --- Semantic tokens -------------------------------------------------------------
light = {
    'color-bg-page': neutral[50],
    'color-bg-surface': '#ffffff',
    'color-bg-subtle': neutral[100],
    'color-bg-muted': neutral[200],
    'color-border': neutral[200],
    'color-border-strong': neutral[300],
    'color-text-primary': neutral[900],
    'color-text-secondary': neutral[600],
    # Darker than neutral-500 so 12-13px meta text clears 4.5:1 on every light surface.
    'color-text-muted': oklch_to_hex(0.51, 0.032, 272),
    'color-text-on-action': '#ffffff',
    'color-action-primary': brand[600],
    'color-action-primary-hover': brand[700],
    'color-action-primary-subtle': brand[50],
    'color-link': brand[600],
    'color-text-brand': brand[600],
    'color-accent-ai': violet[600],
    'color-accent-ai-subtle': violet[50],
    'color-success': green[700], 'color-success-subtle': green[50],
    'color-warning': amber[800], 'color-warning-subtle': amber[50],
    'color-danger': red[600], 'color-danger-subtle': red[50],
    'color-info': sky[700], 'color-info-subtle': sky[50],
    'color-focus-ring': brand[500],
}
dark = {
    'color-bg-page': neutral[950],
    'color-bg-surface': oklch_to_hex(0.205, 0.028, 272),
    'color-bg-subtle': oklch_to_hex(0.24, 0.032, 272),
    'color-bg-muted': oklch_to_hex(0.29, 0.036, 272),
    'color-border': oklch_to_hex(0.31, 0.034, 272),
    'color-border-strong': oklch_to_hex(0.40, 0.036, 272),
    'color-text-primary': neutral[50],
    'color-text-secondary': oklch_to_hex(0.80, 0.022, 272),
    'color-text-muted': oklch_to_hex(0.68, 0.026, 272),
    'color-text-on-action': '#ffffff',
    # Accents step up in lightness and lose a little chroma on dark.
    # White text needs >= 4.5:1, so the dark button stays fairly deep and its
    # hover goes deeper still rather than lighter.
    'color-action-primary': oklch_to_hex(0.53, 0.20, 264),
    'color-action-primary-hover': oklch_to_hex(0.48, 0.19, 264),
    'color-action-primary-subtle': oklch_to_hex(0.28, 0.07, 264),
    'color-link': oklch_to_hex(0.74, 0.13, 264),
    'color-text-brand': oklch_to_hex(0.74, 0.13, 264),
    'color-accent-ai': oklch_to_hex(0.74, 0.15, 292),
    'color-accent-ai-subtle': oklch_to_hex(0.28, 0.07, 292),
    'color-success': oklch_to_hex(0.78, 0.14, 152), 'color-success-subtle': oklch_to_hex(0.27, 0.05, 152),
    'color-warning': oklch_to_hex(0.82, 0.14, 75), 'color-warning-subtle': oklch_to_hex(0.28, 0.05, 75),
    'color-danger': oklch_to_hex(0.74, 0.15, 25), 'color-danger-subtle': oklch_to_hex(0.28, 0.06, 25),
    'color-info': oklch_to_hex(0.78, 0.11, 232), 'color-info-subtle': oklch_to_hex(0.28, 0.05, 232),
    'color-focus-ring': oklch_to_hex(0.70, 0.15, 264),
}

# --- Contrast checks ----------------------------------------------------------------
PAIRS = [
    ('text-primary on surface', 'color-text-primary', 'color-bg-surface', 4.5),
    ('text-primary on page', 'color-text-primary', 'color-bg-page', 4.5),
    ('text-secondary on surface', 'color-text-secondary', 'color-bg-surface', 4.5),
    ('text-secondary on page', 'color-text-secondary', 'color-bg-page', 4.5),
    ('text-muted on surface', 'color-text-muted', 'color-bg-surface', 4.5),
    ('text-muted on subtle', 'color-text-muted', 'color-bg-subtle', 4.5),
    ('text-muted on muted', 'color-text-muted', 'color-bg-muted', 4.5),
    ('link on surface', 'color-link', 'color-bg-surface', 4.5),
    ('button text on primary', 'color-text-on-action', 'color-action-primary', 4.5),
    ('button text on primary hover', 'color-text-on-action', 'color-action-primary-hover', 4.5),
    ('brand text on primary-subtle (chip)', 'color-text-brand', 'color-action-primary-subtle', 4.5),
    ('brand text on page', 'color-text-brand', 'color-bg-page', 4.5),
    ('AI accent on AI subtle', 'color-accent-ai', 'color-accent-ai-subtle', 4.5),
    ('success on success-subtle', 'color-success', 'color-success-subtle', 4.5),
    ('warning on warning-subtle', 'color-warning', 'color-warning-subtle', 4.5),
    ('danger on danger-subtle', 'color-danger', 'color-danger-subtle', 4.5),
    ('info on info-subtle', 'color-info', 'color-info-subtle', 4.5),
    ('border-strong on surface (UI)', 'color-border-strong', 'color-bg-surface', 1.5),
    ('focus ring on surface (UI)', 'color-focus-ring', 'color-bg-surface', 3.0),
]

report = []
for mode, t in (('light', light), ('dark', dark)):
    for label, fg, bg, need in PAIRS:
        r = contrast(t[fg], t[bg])
        report.append((mode, label, t[fg], t[bg], r, need))

# --- Output -----------------------------------------------------------------------------
type_scale = {  # ratio 1.25 from 16px
    'font-size-xs': '0.75rem', 'font-size-sm': '0.875rem', 'font-size-base': '1rem', 'font-size-md': '1.25rem',
    'font-size-lg': '1.563rem', 'font-size-xl': '1.953rem', 'font-size-2xl': '2.441rem', 'font-size-3xl': '3.052rem', 'font-size-4xl': '3.815rem',
}

css = ['/* Flazly Indigo theme tokens. Generated by gen.py (OKLCH scales, WCAG AA checked);', '   every token is namespaced fz- so none collides with Tailwind or legacy names.', '   The app and landing tokens in index.css alias these. */', ':root {', '  /* Primitives */']
for name, sc in primitives.items():
    for step, hexv in sc.items():
        css.append(f'  --{name}-{step}: {hexv};')
css.append('')
css.append('  /* Semantic (light) */')
for k, v in light.items():
    prim = next((f'var(--{n}-{s})' for n, sc in primitives.items() for s, h in sc.items() if h == v), v)
    css.append(f'  --{k}: {prim};')
css += [
    '',
    '  /* Typography */',
    "  --font-display: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;",
    "  --font-body: 'Inter', system-ui, -apple-system, sans-serif;",
    *[f'  --{k}: {v};' for k, v in type_scale.items()],
    '  --line-height-body: 1.55;',
    '  --line-height-heading: 1.15;',
    '  --letter-spacing-heading: -0.025em;',
    '',
    '  /* Space (4px base), radius, shadow (tinted toward the brand hue) */',
    *[f'  --space-{n}: {n * 4}px;' for n in (1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24)],
    '  --radius-sm: 8px;',
    '  --radius-md: 12px;',
    '  --radius-lg: 16px;',
    '  --radius-xl: 24px;',
    '  --radius-full: 999px;',
    '  --shadow-sm: 0 1px 2px rgb(30 27 75 / 0.06);',
    '  --shadow-md: 0 1px 2px rgb(30 27 75 / 0.06), 0 8px 20px -8px rgb(30 27 75 / 0.12);',
    '  --shadow-lg: 0 2px 4px rgb(30 27 75 / 0.06), 0 24px 48px -16px rgb(30 27 75 / 0.18);',
    '  --shadow-primary: 0 10px 24px -10px rgb(37 87 255 / 0.55);',
    '',
    '  /* Component (semantic references only) */',
    '  --button-primary-bg: var(--color-action-primary);',
    '  --button-primary-bg-hover: var(--color-action-primary-hover);',
    '  --button-primary-text: var(--color-text-on-action);',
    '  --button-secondary-bg: var(--color-bg-surface);',
    '  --button-secondary-border: var(--color-border-strong);',
    '  --button-secondary-text: var(--color-text-primary);',
    '  --card-bg: var(--color-bg-surface);',
    '  --card-border: var(--color-border);',
    '  --input-bg: var(--color-bg-surface);',
    '  --input-border: var(--color-border-strong);',
    '  --input-border-focus: var(--color-focus-ring);',
    '  --focus-ring: 0 0 0 3px color-mix(in oklab, var(--color-focus-ring) 35%, transparent);',
    '  --chip-brand-bg: var(--color-action-primary-subtle);',
    '  --chip-brand-text: var(--color-text-brand);',
    '}',
    '',
    ':root.dark {',
    '  /* Dedicated dark values: own surface steps, lighter and calmer accents. */',
]
css += [f'  --{k}: {v};' for k, v in dark.items()]
css += [
    '  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.4);',
    '  --shadow-md: 0 1px 2px rgb(0 0 0 / 0.4), 0 8px 20px -8px rgb(0 0 0 / 0.5);',
    '  --shadow-lg: 0 2px 4px rgb(0 0 0 / 0.4), 0 24px 48px -16px rgb(0 0 0 / 0.6);',
    '}',
]
# Namespace every token with fz- so nothing collides with Tailwind's own
# --shadow-*, --radius-* or the app's existing --color-border / --font-display.
import re as _re
_text = '\n'.join(css) + '\n'
_text = _text.replace('--font-display', '--font-heading')
_text = _re.sub(r'--(?!fz-)([a-z])', r'--fz-\1', _text)
open(os.path.join(OUT, 'flazly-theme.css'), 'w', encoding='utf-8', newline='').write(_text)

# W3C design token JSON (colour only, primitives + semantic).
tokens = {'color': {n: {str(s): {'$type': 'color', '$value': h} for s, h in sc.items()} for n, sc in primitives.items()},
          'semantic': {'light': {k: {'$type': 'color', '$value': v} for k, v in light.items()},
                       'dark': {k: {'$type': 'color', '$value': v} for k, v in dark.items()}}}
json.dump(tokens, open(os.path.join(HERE, 'flazly-theme.tokens.json'), 'w'), indent=2)

json.dump({'primitives': primitives, 'light': light, 'dark': dark,
           'report': [dict(mode=m, pair=l, fg=f, bg=b, ratio=round(r, 2), need=n) for m, l, f, b, r, n in report]},
          open(os.path.join(HERE, 'contrast-report.json'), 'w'), indent=2)

fails = [r for r in report if r[4] < r[5]]
for m, l, f, b, r, n in report:
    print(f'{m:5} {l:36} {f} on {b}  {r:5.2f}:1  need {n}  {"OK" if r >= n else "FAIL"}')
print('brand scale:', brand)
print('neutral scale:', neutral)
print('FAILS:', len(fails))
