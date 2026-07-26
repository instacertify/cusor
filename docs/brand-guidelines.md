# CERTKO Brand Identity Guidelines

Version 1.0 | Final Logo — Option 10

## Brand Overview

**Brand Name:** CERTKO

**Meaning**

- CERT = Certification, Compliance, Standards & Trust
- KO = Knowledge + Operations

CERTKO represents a modern compliance and certification platform that combines deep regulatory expertise with operational excellence to simplify global product compliance.

**Vision:** To become the world's most trusted digital platform for product certification, testing, compliance intelligence, and regulatory operations.

**Mission:** Empowering manufacturers, laboratories, and certification bodies with knowledge-driven compliance solutions that accelerate global market access.

**Values:** Trust · Knowledge · Operational Excellence · Precision · Innovation · Transparency · Global Compliance

## Logo

Clean typographic identity supported by a forward movement symbol — no shields, checkmarks, certificates or globes.

- **CERT** — Deep Navy (`#0D1B3D`): certification, compliance, standards, regulatory expertise, trust
- **KO** — Teal (`#17B3A3`): knowledge + operations — the heart of the company
- **>>>** — three forward arrows: progress, growth, faster compliance, continuous improvement, digital transformation, global expansion

Implementation: `components/Logo.tsx` (primary + reverse variants), favicon `app/icon.svg` (CK monogram + arrows on navy rounded square).

### Logo usage

- Primary logo on white or light gray backgrounds
- Reverse logo (white + teal) on navy or dark teal backgrounds
- Monochrome only for print restrictions, embossing, watermarks, single-color merchandise
- Minimum width: 160 px digital / 30 mm print
- Clear space equal to the height of the lowercase "o" in certko
- Do not: stretch/distort, recolor, rearrange, rotate arrows, add shadows/bevels/glows, place on busy backgrounds, use gradients, or swap the typeface

## Color Palette

| Role | HEX | RGB | Usage |
| --- | --- | --- | --- |
| Primary Navy | `#0D1B3D` | 13, 27, 61 | Logo (CERT), navigation, headlines, documents |
| Primary Teal | `#17B3A3` | 23, 179, 163 | Logo (KO), icons, CTA buttons, highlights, interactive |
| Dark Teal | `#137D8C` | 19, 125, 140 | Secondary graphics, infographics, hover states |
| Accent Orange | `#FF8A00` | 255, 138, 0 | Notification dots, CTA hover, status indicators — max 5% of any layout |
| Neutral Gray | `#6B7280` | 107, 114, 128 | Secondary text, labels, UI borders, form elements |
| Light Gray | `#F5F7FA` | 245, 247, 250 | Backgrounds, cards, forms, tables, sections |

**Ratio:** Navy 55% · Teal 25% · White 15% · Light Gray 3% · Orange 2%

Implementation: CSS design tokens in `app/globals.css` (`@theme` block). The legacy token names `ink-*` (navy/gray scale), `butter-*` (teal scale), `cream-*` (white/light-gray surfaces) and `accent-*` (orange) map onto this palette.

## Typography

- **Primary:** Poppins SemiBold — logo support, headlines, navigation, marketing, buttons (`--font-display`)
- **Secondary:** Inter Regular — body copy, website content, reports, forms, UI text (`--font-body`)

Loaded via `next/font` in `app/layout.tsx`.

## Iconography

Minimal, line-based, rounded, geometric, technical. Recommended stroke width 2 px. See `components/Icon.tsx`.

## Photography

Manufacturing facilities, testing laboratories, engineers, compliance processes, global trade, industrial automation, precision equipment. Avoid generic stock photography, handshakes, exaggerated corporate imagery.

## Website Design Principles

White backgrounds, spacious layouts, rounded cards, minimal shadows, navy headings, teal highlights, orange reserved for primary actions and notifications. The experience should resemble a modern enterprise SaaS platform.

## Brand Voice

Professional, knowledgeable, helpful, accurate, direct, solution-oriented. Avoid exaggerated claims such as "Best", "No.1" or "Guaranteed" — focus on measurable value, technical expertise and operational excellence.

## Brand Personality

Always: professional, technical, reliable, modern, global, intelligent, minimal, efficient.

Avoid: loud graphics, cartoon illustrations, heavy gradients, excessive shadows, traditional certification clichés.
