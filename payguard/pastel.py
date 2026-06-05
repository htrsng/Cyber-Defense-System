import sys

# Replace in index.css
with open('src/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('--pg-primary:   #10b981;', '--pg-primary:   #82ddaf;')
css = css.replace('--pg-primary-glow: rgba(16,185,129,0.35);', '--pg-primary-glow: rgba(130,221,175,0.4);')
css = css.replace('--pg-accent:    #ec4899;', '--pg-accent:    #fbb1c5;')
css = css.replace('--pg-accent2:   #f472b6;', '--pg-accent2:   #fce4ec;')

# Hero gradient
old_hero_bg = 'background:linear-gradient(135deg,rgba(16,185,129,.95) 0%,rgba(52,211,153,.9) 50%,rgba(236,72,153,.85) 100%);'
new_hero_bg = 'background:linear-gradient(135deg,rgba(130,221,175,.95) 0%,rgba(164,232,197,.9) 50%,rgba(251,177,197,.85) 100%);'
css = css.replace(old_hero_bg, new_hero_bg)
# Fix hero text color
css = css.replace('overflow:hidden;color:#fff;', 'overflow:hidden;color:var(--pg-text);')
css = css.replace('.pg-hero-btn{', '.pg-hero-btn{\n  color: var(--pg-text);')

# Login background
old_login_bg = 'background-image:radial-gradient(ellipse 70% 50% at 20% 20%,rgba(16,185,129,.15) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(236,72,153,.1) 0%,transparent 50%);'
new_login_bg = 'background-image:radial-gradient(ellipse 70% 50% at 20% 20%,rgba(130,221,175,.3) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(251,177,197,.3) 0%,transparent 50%);'
css = css.replace(old_login_bg, new_login_bg)

# Body background
old_body_bg = 'background-image:\n    radial-gradient(ellipse 80% 50% at 10% 0%,rgba(16,185,129,0.15) 0%,transparent 60%),\n    radial-gradient(ellipse 60% 40% at 90% 100%,rgba(236,72,153,0.12) 0%,transparent 50%);'
new_body_bg = 'background-image:\n    radial-gradient(ellipse 80% 50% at 10% 0%,rgba(130,221,175,0.25) 0%,transparent 60%),\n    radial-gradient(ellipse 60% 40% at 90% 100%,rgba(251,177,197,0.25) 0%,transparent 50%);'
css = css.replace(old_body_bg, new_body_bg)

# Also the balance trend up/down
css_trend_orig = '.pg-balance-trend { font-size: 14px; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; background: rgba(16,185,129,0.15); color: #10b981; font-weight: 700; margin-left: 12px; }'
css_trend_new = '.pg-balance-trend { font-size: 14px; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; background: #82ddaf; color: #0f172a; font-weight: 700; margin-left: 12px; }'
css = css.replace(css_trend_orig, css_trend_new)

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Replace in App.jsx
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Specifically replace the hardcoded hexes for categories and recipients
app = app.replace('#10b981', '#82ddaf')
app = app.replace('#ec4899', '#fbb1c5')
app = app.replace('#f472b6', '#fce4ec')

# For the 'SAFE' risk trend, contrast is needed:
app = app.replace("style={{ background: 'rgba(16,185,129,0.1)', color: '#82ddaf' }}", "style={{ background: '#82ddaf', color: '#0f172a' }}")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)
