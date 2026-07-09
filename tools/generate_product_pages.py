#!/usr/bin/env python3
"""
Generuje SEO produktové stránky pre Computrax.

Použitie:
    python3 tools/generate_product_pages.py

Číta tools/products.json a pre každý produkt vytvorí:
    produkt/<slug>/index.html   (canonical, OG, Product + BreadcrumbList schema, CTA)

Keď pridáte nový produkt, doplňte ho do tools/products.json a spustite skript znova.
Skript vypíše aj riadky pre sitemap.xml a pre staticProductSlugs v site-deploy-fix.js.
"""
import json
import os
import html
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WHATSAPP = "421949835923"
SITE = "https://computrax.sk"

CATEGORY_LABEL = {"gaming": "Herný PC", "office": "Kancelársky PC", "retro": "Retro PC"}


def esc(s):
    return html.escape(str(s), quote=True)


def wa_link(text):
    return f"https://wa.me/{WHATSAPP}?text={quote(text)}"


def render(product, others):
    slug = product["slug"]
    name = product["name"]
    price = product["price"]
    cat = product.get("category", "office")
    cat_label = CATEGORY_LABEL.get(cat, "Repasovaný PC")
    specs_line = f'{product["cpu"]} · {product["gpu"]} · {product["ram"]} · {product["disk"]} · {product["os"]}'
    desc = f'{name} za {price} €. {specs_line}. Repasovaný počítač so zárukou, faktúrou a doručením.'
    url = f"{SITE}/produkt/{slug}/"

    reserve_text = (f"Dobrý deň, chcel/-a by som si rezervovať {name} "
                    f"(cena {price} €). Prosím potvrďte dostupnosť a ďalší postup.")
    ask_text = f"Dobrý deň, mám otázku k počítaču {name} (cena {price} €)."

    product_ld = json.dumps({
        "@context": "https://schema.org", "@type": "Product", "name": name,
        "description": desc, "brand": {"@type": "Brand", "name": "Computrax"},
        "category": cat_label,
        "offers": {"@type": "Offer", "priceCurrency": "EUR", "price": str(price),
                   "availability": "https://schema.org/InStock" if product.get("stock", 0) > 0 else "https://schema.org/OutOfStock",
                   "itemCondition": "https://schema.org/RefurbishedCondition", "url": url}
    }, ensure_ascii=True)

    breadcrumb_ld = json.dumps({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Domov", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "Počítače", "item": f"{SITE}/index.html#ponuka"},
            {"@type": "ListItem", "position": 3, "name": name, "item": url},
        ]
    }, ensure_ascii=True)

    specs_items = "".join(
        f'<span class="spec">{esc(label)}: {esc(val)}</span>'
        for label, val in [
            ("CPU", product["cpu"]), ("GPU", product["gpu"]), ("RAM", product["ram"]),
            ("Disk", product["disk"]), ("OS", product["os"]), ("Sklad", f'{product.get("stock", 0)} ks'),
        ]
    )

    related_cards = ""
    for o in others:
        o_specs = "".join(f'<span class="spec">{esc(v)}</span>' for v in [o["cpu"], o["gpu"], o["ram"], o["disk"]])
        related_cards += (
            f'<article class="card"><span class="pill">{esc(CATEGORY_LABEL.get(o.get("category","office"),"Repasovaný PC"))}</span>'
            f'<h3>{esc(o["name"])}</h3><div class="specs">{o_specs}</div>'
            f'<div class="price">{o["price"]} €</div>'
            f'<div class="cta"><a class="btn primary" href="../../produkt/{o["slug"]}/index.html">Detail produktu</a>'
            f'<a class="btn secondary" href="../../index.html#ponuka">Všetky PC</a></div></article>'
        )

    return (
        '<!DOCTYPE html>\n'
        f'<html lang="sk"><head><meta charset="utf-8"/><meta content="width=device-width,initial-scale=1" name="viewport"/>'
        f'<meta content="index,follow,max-image-preview:large" name="robots"/>'
        f'<title>{esc(name)} | Repasovaný PC so zárukou | Computrax</title>'
        f'<meta content="{esc(desc)}" name="description"/>'
        f'<link href="{url}" rel="canonical"/>'
        f'<meta content="{esc(name)} | Repasovaný PC so zárukou | Computrax" property="og:title"/>'
        f'<meta content="{esc(desc)}" property="og:description"/>'
        f'<meta content="product" property="og:type"/>'
        f'<meta content="{url}" property="og:url"/>'
        f'<meta content="{SITE}/og-image.png" property="og:image"/>'
        f'<link href="../../favicon-32.png" rel="icon" type="image/png"/>'
        f'<link href="../../apple-touch-icon.png" rel="apple-touch-icon"/>'
        f'<link href="../../assets/css/produkt.css?v=20260709a" rel="stylesheet"/>'
        f'<script type="application/ld+json">{product_ld}</script>'
        f'<script type="application/ld+json">{breadcrumb_ld}</script></head>'
        '<body><nav class="nav"><div class="wrap">'
        '<a class="logo" href="../../index.html"><img alt="Computrax" src="../../computrax-logo.png"/><span>Computrax</span></a>'
        '<div class="cta" style="margin:0"><a class="btn secondary" href="../../index.html#ponuka">Ponuka PC</a>'
        '<a class="btn primary" href="../../index.html#kontakt">Kontakt</a></div></div></nav>'
        '<main>'
        '<div class="wrap"><nav aria-label="Omrvinky" class="small" style="padding-top:14px">'
        '<a href="../../index.html">Domov</a> › <a href="../../index.html#ponuka">Počítače</a> › '
        f'<span>{esc(name)}</span></nav></div>'
        '<section class="hero"><div class="wrap hero-grid"><div>'
        f'<span class="pill">{esc(product.get("badge", cat_label))}</span>'
        f'<h1>{esc(name)}</h1>'
        f'<p>{esc(specs_line)}. Repasovaný počítač pripravený na objednávku so zárukou a faktúrou.</p>'
        f'<div class="price">{price} €</div>'
        '<div class="cta">'
        f'<a class="btn primary" href="../../index.html?pc={quote(name)}#ponuka">Kúpiť</a>'
        f'<a class="btn secondary" href="{esc(wa_link(reserve_text))}" target="_blank" rel="noopener noreferrer">Rezervovať</a>'
        f'<a class="btn secondary" href="{esc(wa_link(ask_text))}" target="_blank" rel="noopener noreferrer">Opýtať sa na tento PC</a>'
        '</div></div>'
        '<div class="panel"><h2>Parametre</h2>'
        f'<div class="specs">{specs_items}</div>'
        '<p class="small">Dostupnosť sa môže zmeniť. Finálne potvrdenie je v objednávke.</p></div>'
        '</div></section>'
        '<section class="section"><div class="wrap"><h2>Pre koho je vhodný</h2><div class="trust">'
        f'<div><b>{esc(cat_label)}</b><p>{esc(product.get("forWho",""))}</p></div>'
        '<div><b>Computrax Protect</b><p>Záruka, faktúra, testovanie a možnosť vrátenia podľa obchodných podmienok.</p></div>'
        '<div><b>Testovanie</b><p>Pred odoslaním kontrola bootu, RAM, disku, portov, teplôt a Windows.</p></div>'
        '</div></div></section>'
        '<section class="section"><div class="wrap"><h2>Ďalšie počítače</h2>'
        f'<div class="cards">{related_cards}</div></div></section>'
        '</main>'
        '<footer class="footer"><div class="wrap">© 2026 NANOERA s.r.o. · Repasované PC so zárukou, faktúrou a testovaním.</div></footer>'
        '</body></html>\n'
    )


def main():
    products = json.load(open(os.path.join(ROOT, "tools", "products.json"), encoding="utf-8"))
    for p in products:
        others = [o for o in products if o["slug"] != p["slug"]][:3]
        out_dir = os.path.join(ROOT, "produkt", p["slug"])
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f:
            f.write(render(p, others))
        print("napísané:", f"produkt/{p['slug']}/index.html")

    print("\n--- sitemap.xml riadky ---")
    for p in products:
        print(f'  <url><loc>{SITE}/produkt/{p["slug"]}/</loc><lastmod>2026-07-09</lastmod><changefreq>weekly</changefreq><priority>0.75</priority></url>')
    print("\n--- staticProductSlugs pre site-deploy-fix.js ---")
    print("  " + json.dumps([p["slug"] for p in products], ensure_ascii=False))


if __name__ == "__main__":
    main()
