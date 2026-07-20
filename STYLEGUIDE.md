# SoHo Art-Based Gentrification — Website Style Guide

## 1. Design direction

The site should feel like a contemporary research archive: precise, spacious, typographically confident, and led by evidence. Its visual language combines the restrained editorial layout of [AOI — Art on Internet](https://www.stockholmdesignlab.se/work/aoi) with the large-scale sans-serif statements and systematic pacing of [Sana Labs](https://www.stockholmdesignlab.se/work/sana-labs).

Use a mostly monochrome interface. Let archival photographs, Illustrator work, maps, and D3 visualizations carry most of the color. Large type should introduce arguments rather than decorate the page.

Core principles:

- **Editorial clarity:** every page should have an obvious reading order.
- **Generous space:** separate research chapters with space rather than decoration.
- **Evidence first:** charts, maps, captions, citations, and source notes use consistent styles.
- **Controlled contrast:** black and off-white form the base; color communicates data or status.
- **Quiet interaction:** motion should reveal relationships without competing with the material.

---

## 2. Typeface system

### Primary typeface

Use **Helvetica Neue** for display typography, body copy, navigation, headings, and interface controls. Its neutral shapes support the restrained editorial character of the references while keeping the system simple and widely recognizable.

Use Helvetica and Arial as system fallbacks when Helvetica Neue is not installed on the viewing device.

```css
--font-sans: "Helvetica Neue", Helvetica, Arial, sans-serif;
```

Recommended weights:

- `400` Regular — body copy, navigation, headings, interface text
- `500` Medium — active navigation, small headings, buttons, emphasized data
- Avoid bold or extra-bold body text; hierarchy should come primarily from size and spacing.

### Small text and citations

Use **Space Mono Regular** for the smallest supporting text: captions, citations, source notes, metadata, chart axes, legends, and compact labels. The monospace texture should distinguish documentation and evidence from the main narrative without reducing legibility.

```css
--font-mono: "Space Mono", "SFMono-Regular", Menlo, Consolas, monospace;
```

Rules for Space Mono:

- Use `400` Regular by default and `700` Bold only for short emphasized values.
- Use it at `12–14px`; never reduce citations below `14px`.
- Keep tracking at `0` for 14 px text and `0.02em` for 12 px labels.
- Do not use it for paragraphs, headings, navigation, or oversized display text.
- Preserve the fallback stack so small text remains readable before the webfont loads.

### Display typography

Use **Helvetica Neue Regular** for project titles, decade markers, chapter openings, and archival quotations. Create contrast through scale, spacing, and black/white inversion rather than introducing a second typeface.

```css
--font-display: "Helvetica Neue", Helvetica, Arial, sans-serif;
```

Rules for display typography:

- Limit it to one prominent use per viewport.
- Keep text short: ideally 1–6 words or a year such as `1961`.
- Use Regular weight for large display text; do not simulate bold styling.
- Use Helvetica Neue for navigation and body copy; use Space Mono for captions and chart labels.
- Keep long paragraphs at the body-text size rather than the display scale.

### Numerals and data

Enable tabular numerals wherever values must align: rent tables, census figures, timelines, and chart axes.

```css
.data,
table,
.chart-label {
  font-variant-numeric: tabular-nums lining-nums;
}
```

---

## 3. Type scale and usage

Typography is regular-weight, compact, and responsive. Display sizes use `clamp()` so titles remain proportional rather than jumping abruptly between breakpoints.

| Token | Desktop / fluid size | Line height | Tracking | Use |
|---|---:|---:|---:|---|
| `display-xl` | `clamp(4.5rem, 11vw, 10rem)` | `0.88` | `-0.04em` | Home title, chapter-opening decade |
| `display-lg` | `clamp(3.5rem, 7vw, 6rem)` | `0.94` | `-0.035em` | Major thesis or chapter statement |
| `heading-1` | `clamp(2.625rem, 5vw, 4.125rem)` | `1` | `-0.02em` | Page title, key quotation |
| `heading-2` | `clamp(2rem, 3.5vw, 2.625rem)` | `1.05` | `-0.02em` | Section title |
| `heading-3` | `1.5rem` / `24px` | `1.15` | `-0.01em` | Subsection or chart title |
| `lead` | `1.25rem` / `20px` | `1.2` | `-0.02em` | Introductory paragraph, chart annotation |
| `body` | `1rem` / `16px` | `1.4` | `0` | Main research text |
| `small` | `0.875rem` / `14px` | `1.4` | `0` | Space Mono: captions, citations, source notes |
| `label` | `0.75rem` / `12px` | `1.35` | `0.02em` | Space Mono: eyebrow, metadata, axis label |

Usage rules:

- Use sentence case. Reserve all caps for 12 px labels no longer than four words.
- Keep body paragraphs between **52 and 72 characters** per line; target `max-width: 42rem`.
- Use no more than three type sizes within a single content block.
- Use the large statement scale sparingly: one statement per major section is enough.
- Left-align research copy. Centering is reserved for isolated hero marks or full-screen decade transitions.
- Underline text links by default. Do not rely on color alone to indicate links.
- Use proper punctuation and typographic conventions: `SoHo`, `1950s–1970s`, curly quotation marks, and en dashes for ranges.

---

## 4. Spacing system

Use an 8 px base unit with a 4 px micro-step. All margins, padding, gaps, and component heights should draw from these tokens.

| Token | Value | Typical use |
|---|---:|---|
| `space-0` | `0` | Reset |
| `space-1` | `4px` | Label-to-value gap |
| `space-2` | `8px` | Inline icon gap, compact metadata |
| `space-3` | `16px` | Mobile gutter, paragraph gap |
| `space-4` | `24px` | Caption separation, card padding |
| `space-5` | `32px` | Desktop gutter, related content gap |
| `space-6` | `48px` | Component group separation |
| `space-7` | `64px` | Mobile section padding |
| `space-8` | `80px` | Tablet section padding |
| `space-9` | `128px` | Desktop chapter separation |
| `space-10` | `192px` | Major narrative pause or decade transition |

### Page structure

- Maximum canvas width: `1440px`
- Wide visual/data region: `min(100%, 1376px)`
- Reading column: `max-width: 672px`
- Desktop page gutter: `32px`
- Mobile page gutter: `16px`
- Header height: `68px` desktop, `56px` mobile
- Desktop grid: 12 columns, `24px` gutters
- Tablet grid: 8 columns, `20px` gutters
- Mobile grid: 4 columns, `16px` gutters

### Vertical rhythm

- Paragraph to paragraph: `16px`
- Heading to first paragraph: `24px`
- Figure to caption: `12px`
- Caption to source note: `4px`
- Chart title to chart: `24px`
- Content block to content block: `48–64px`
- Section to section: `80–128px`
- Chapter to chapter: `128–192px`

Do not place content against the viewport edge. Full-bleed images may touch the edge, but their captions and controls must align to the page grid.

---

## 5. Color system

### Interface palette

The interface should remain nearly monochrome. Use warm paper for long reading passages and pure black/white for high-impact openings.

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0A0A0A` | Primary text, dark backgrounds |
| `paper` | `#F4F1EA` | Primary reading background |
| `white` | `#FFFFFF` | Inverse text, image framing |
| `charcoal` | `#181818` | Secondary dark surface |
| `muted` | `#6B6B66` | Secondary text and source notes |
| `rule` | `#D2D2CC` | Dividers, table rules, inactive controls |
| `soft-fill` | `#E8E5DE` | Hover areas and subtle chart scaffolding |

```css
:root {
  --color-ink: #0a0a0a;
  --color-paper: #f4f1ea;
  --color-white: #ffffff;
  --color-charcoal: #181818;
  --color-muted: #6b6b66;
  --color-rule: #d2d2cc;
  --color-soft-fill: #e8e5de;
}
```

### Data visualization palette

Reserve saturated color for data, maps, active filters, and key annotations. The palette assigns a stable color to each recurring research variable.

| Variable | Hex | Meaning |
|---|---|---|
| Artists / artist population | `#0072B2` | Migration, residency, artist density |
| Rent / property cost | `#D55E00` | Rent change, property pressure, displacement risk |
| Galleries / art market | `#009E73` | Gallery openings, sales, commercial art activity |
| Policy / zoning | `#CC79A7` | Legislation, zoning decisions, municipal action |
| Forecast / hypothesis | `#E6AB02` | Projected or uncertain future conditions |

Data-color rules:

- Use the same variable-color mapping across every chart and map.
- Never use these colors decoratively in navigation or large backgrounds.
- Distinguish series with labels, line patterns, or symbols as well as color.
- Use neutral gray for contextual or unselected data.
- Use opacity only for density or uncertainty; do not make essential marks lighter than 60% opacity.
- For sequential maps, use one light-to-dark scale rather than several hues.
- Place the exact value in a tooltip or visible label when precision matters.

### Contrast and states

- Default reading mode: `ink` text on `paper`.
- High-impact section opening: `white` text on `ink`.
- Body and interactive text must meet WCAG AA contrast.
- Muted text is for supporting information only, never primary arguments.
- Hover states may invert foreground and background or add an underline; avoid color-only changes.
- Keyboard focus uses a `2px` solid `#0072B2` outline with a `3px` offset.

---

## 6. Research-content applications

### Chapter opening

- Full viewport or near-full viewport.
- One oversized decade, place name, or thesis fragment.
- Black/white treatment or a single full-bleed archival image.
- Follow with an `80–128px` transition into the reading section.

### Historical narrative

- Use the 672 px reading column for primary prose.
- Place policy dates, zoning changes, and archival excerpts in the adjacent grid columns.
- Use oversized Helvetica Neue decade markers as anchors, not repeated decoration.

### D3 charts and maps

- Chart title: `heading-3`.
- Analytical takeaway: `lead`, placed before the visualization.
- Axis labels and legends: `label` with tabular numerals.
- Source and methodology: `small`, below the chart.
- Minimum interactive target: `44 × 44px`.
- Do not remove axes, units, dates, or source notes for visual simplicity.

### Images and Illustrator graphics

- Prefer full-width or grid-aligned images over floating thumbnails.
- Use consistent aspect ratios within a series.
- Caption format: `Figure number — description, creator/source, year.`
- Keep captions left-aligned and visually attached to their image with a `12px` gap.
- Archival images may remain monochrome; do not tint them with data-series colors.

### Citations and notes

- Use Space Mono Regular at 14 px with 1.4 line height.
- Superscript citation markers should remain keyboard-focusable links.
- Source notes sit immediately below the relevant figure or chart.
- A complete bibliography appears at the end of each chapter or in a dedicated Sources view.

---

## 7. Responsive behavior

At widths below `768px`:

- Reduce page gutters to `16px`.
- Stack all split text/image and text/chart layouts.
- Place the explanation before the visualization.
- Keep body text at `16px`; do not shrink research prose.
- Allow charts to scroll horizontally only when simplifying them would remove meaning.
- Replace persistent navigation with a compact menu while preserving the visible project title.
- Reduce section spacing from `128px` to `64px`.
- Keep captions, legends, and source notes visible rather than hiding them behind interaction.

At widths above `1200px`:

- Use the full 12-column grid.
- Keep prose narrow even when the visual field grows wider.
- Let maps and timelines span 8–12 columns.
- Use empty columns intentionally to create the spacious rhythm seen in the references.

---

## 8. Quick implementation tokens

```css
:root {
  --font-sans: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-display: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-mono: "Space Mono", "SFMono-Regular", Menlo, Consolas, monospace;

  --text-display-xl: clamp(4.5rem, 11vw, 10rem);
  --text-display-lg: clamp(3.5rem, 7vw, 6rem);
  --text-h1: clamp(2.625rem, 5vw, 4.125rem);
  --text-h2: clamp(2rem, 3.5vw, 2.625rem);
  --text-h3: 1.5rem;
  --text-lead: 1.25rem;
  --text-body: 1rem;
  --text-small: 0.875rem;
  --text-label: 0.75rem;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 48px;
  --space-7: 64px;
  --space-8: 80px;
  --space-9: 128px;
  --space-10: 192px;

  --color-ink: #0a0a0a;
  --color-paper: #f4f1ea;
  --color-white: #ffffff;
  --color-charcoal: #181818;
  --color-muted: #6b6b66;
  --color-rule: #d2d2cc;
  --color-soft-fill: #e8e5de;

  --data-artists: #0072b2;
  --data-rent: #d55e00;
  --data-galleries: #009e73;
  --data-policy: #cc79a7;
  --data-forecast: #e6ab02;

  --page-gutter: 32px;
  --content-max: 1440px;
  --reading-max: 672px;
}

.caption,
.citation,
.source-note,
.metadata,
.chart-label {
  font-family: var(--font-mono);
  font-size: var(--text-small);
  font-weight: 400;
  line-height: 1.4;
}

.eyebrow,
.axis-label {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: 0.02em;
}

@media (max-width: 767px) {
  :root {
    --page-gutter: 16px;
  }
}
```

## 9. Final check

Before publishing a page, confirm that:

- The reading order is clear without animation.
- Body copy is 16 px or larger and no wider than 672 px.
- The page uses one dominant typographic moment, not several competing ones.
- Spacing comes from the defined scale.
- Interface elements remain monochrome unless color carries information.
- Every chart includes units, labels, source, and methodology.
- Meaning remains understandable without color.
- Images include alt text; decorative images use empty alt text.
- Links, controls, and chart interactions are reachable by keyboard.
- The mobile layout preserves citations, captions, and data context.
