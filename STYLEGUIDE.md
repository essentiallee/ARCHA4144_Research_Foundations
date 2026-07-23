# SoHo Art-Based Gentrification — Website Style Guide

Website Address: https://essentiallee.github.io/ARCHA4144_Research_Foundations/

## 1. Design direction

The site should feel like a contemporary research archive: precise, spacious, typographically confident, and led by evidence. Its visual language combines the restrained editorial layout of [AOI — Art on Internet](https://www.stockholmdesignlab.se/work/aoi), the systematic pacing of [Sana Labs](https://www.stockholmdesignlab.se/work/sana-labs), and the supplied Black Swan DAO / Cygnet actor-network reference.

Use a strictly white interface with black text. Do not introduce warm paper backgrounds, black section backgrounds, tinted cards, or gray panels. Let archival photographs, Illustrator work, maps, and D3 visualizations carry the color. Large type should introduce arguments rather than decorate the page.

Core principles:

- **Editorial clarity:** every page should have an obvious reading order.
- **Generous space:** separate research chapters with space rather than decoration.
- **Evidence first:** charts, maps, captions, citations, and source notes use consistent styles.
- **Controlled contrast:** white and black form the interface; color belongs to data.
- **Unboxed visualizations:** maps, networks, charts, and timelines sit directly in the page flow without visible canvas cards, framed panels, or decorative containers.
- **Word-based navigation:** selectable words can function as the menu and as transitions between research sections.
- **Scroll-led interaction:** motion and state changes respond to reading progress and reveal relationships without competing with the material.

---

## 2. Typeface system

### Primary typeface

Use **Helvetica Neue** as the dominant typeface across the site. It should appear in body copy, navigation, selectable menu words, headings, large statements, archival quotations, and interface controls. Use Helvetica and Arial as system fallbacks when Helvetica Neue is unavailable.

Space Mono is a supporting typeface only.

```css
--font-sans: "Helvetica Neue", Helvetica, Arial, sans-serif;
--font-mono: "Space Mono", "SFMono-Regular", Menlo, Consolas, monospace;
--font-display: "Helvetica Neue", Helvetica, Arial, sans-serif;
```

Recommended weights:

- `400` Regular — body copy, headings, navigation, and large statements
- `500` Medium — active menu words, compact headings, and emphasized data
- Avoid heavy or extra-bold body text; hierarchy should come primarily from scale, spacing, and position.

### Supporting typeface

Use **Space Mono** only for captions, citations, source notes, metadata, chart axes, legends, compact labels, and small diagram annotations. Its purpose is to distinguish documentation and supporting evidence from the main narrative.

Rules for Space Mono:

- Use `400` Regular by default and `700` Bold only for short data values.
- Keep it at `12–14px`; never reduce citations below `14px`.
- Keep tracking at `0` for 14 px text and `0.02em` for 12 px labels.
- Do not use it for body paragraphs, headings, navigation, selectable menu words, buttons, or oversized display text.
- Preserve the fallback stack so small text remains readable before the webfont loads.

### Display typography

Use **Helvetica Neue** for project titles, decade markers, chapter openings, archival quotations, and large selectable words. Create contrast through scale, weight, spacing, and placement rather than through an inverted background.

Rules for display typography:

- Limit it to one prominent use per viewport.
- Keep text short: ideally 1–6 words or a year such as `1961`.
- Use Regular or Medium; avoid heavy display weights.
- Keep menu words visually direct: black text on white, with underline, weight, or positional change for hover and selection.
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
| `small` | `0.875rem` / `14px` | `1.5` | `0` | Captions, citations, source notes |
| `label` | `0.75rem` / `12px` | `1.4` | `0.02em` | Eyebrow, metadata, axis label |

Usage rules:

- Use sentence case for paragraphs. Uppercase may be used for navigation words, short headings, labels, and diagram annotations when it reflects the reference image.
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

- Maximum content width: `1440px`
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

The interface is strictly black and white. White is the only page and section background. Black is the default text color. Grays may be used only for rules, secondary notes, unavailable states, and visualization scaffolding.

| Token | Hex | Use |
|---|---|---|
| `ink` | `#000000` | All primary text and active controls |
| `white` | `#FFFFFF` | All page and section backgrounds |
| `muted` | `#777777` | Secondary notes only |
| `rule` | `#CFCFCF` | Dividers, table rules, and chart scaffolding |
| `disabled` | `#B5B5B5` | Unavailable or inactive information |

```css
:root {
  --color-ink: #000000;
  --color-white: #ffffff;
  --color-muted: #777777;
  --color-rule: #cfcfcf;
  --color-disabled: #b5b5b5;
}
```

### Data visualization palette

Reserve saturated color for data marks, relationships, maps, active filters, and key annotations. The palette is sampled conceptually from the supplied actor-network reference: hot reds and corals for human or social actors; greens, yellow-greens, cyans, and yellows for systems and processes; violet and indigo for institutional or gatekeeping roles.

#### Warm / human and social actors

| Token | Hex | Suggested use |
|---|---|---|
| `red` | `#EE2722` | Pressure, conflict, displacement, founders |
| `red-orange` | `#F04A24` | Administration, mediation, ownership |
| `coral` | `#FF7A59` | Artists, cultural practitioners, contributors |
| `hot-pink` | `#EC3F97` | Working groups, collective activity |
| `pale-pink` | `#E5A4D2` | Publics, audiences, low-intensity social context |
| `violet` | `#6A58B0` | Funders, partners, institutional support |
| `indigo` | `#2B218F` | Curators, gatekeepers, concentrated authority |

#### Cool / systems and non-human actors

| Token | Hex | Suggested use |
|---|---|---|
| `near-black` | `#111510` | Ideology, infrastructure, structural context |
| `forest` | `#20583A` | Interfaces, organizational systems |
| `green` | `#3E8D4C` | Documents, records, voting systems |
| `olive` | `#829A43` | Results, ranking logic, evaluation |
| `lime` | `#9ACB28` | Cycles, feedback, repeated processes |
| `mint` | `#35C98A` | Rights, access, enabling conditions |
| `cyan` | `#39ABC8` | Institutional legacy, communication |
| `light-cyan` | `#91D9E8` | Scarcity, low-intensity system context |
| `yellow` | `#F2D33C` | Discourse, policy attention |
| `bright-yellow` | `#FFE000` | Governance protocols, proposals, active decisions |
| `pale-yellow` | `#FFF0A3` | Proposal form, uncertainty, emerging conditions |
| `cream` | `#FFF6CF` | Resource pools, weak or latent relationships |

Data-color rules:

- Establish a stable meaning for each selected color before implementing a chart, then keep that mapping consistent across the site.
- Never use these colors decoratively in navigation or large backgrounds.
- Distinguish series with labels, line patterns, or symbols as well as color.
- Use neutral gray or black for contextual and unselected data.
- Use opacity and soft blur to show overlap, visibility, density, or uncertainty, as in the reference image. Keep exact quantitative marks crisp enough to read.
- Soft halos and blended gradients are appropriate for flows, networks, and zones of influence; they should not replace precise values where precision matters.
- For sequential maps, use one light-to-dark scale rather than several hues.
- Place the exact value in a tooltip or visible label when precision matters.

### Contrast and states

- Default and only reading mode: black text on white.
- Do not invert entire sections to white text on black.
- Body and interactive text must meet WCAG AA contrast.
- Muted text is for supporting information only, never primary arguments.
- Hover and selected menu states should use an underline, weight change, spacing change, or positional shift; avoid color-only changes.
- Keyboard focus uses a `2px` solid black outline with a `3px` offset.

---

## 6. Research-content applications

### Chapter opening

- Full viewport or near-full viewport.
- One oversized decade, place name, or thesis fragment.
- Black text on white, or a single full-bleed archival image with a white margin for its label.
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
- Place each visualization directly on the white page. Do not wrap it in a card, tinted rectangle, bordered canvas box, rounded panel, or dashboard-style frame.
- SVG or canvas may still be used as the technical rendering surface, but it must remain visually transparent and borderless.
- Use the page grid, typography, rules, and whitespace—not a container—to connect the title, visualization, legend, and source.

### Scroll-sensitive interaction and word menu

- Treat scrolling as a reading mechanism: each step should introduce one new relationship, time period, layer, or argument.
- Keep a meaningful static state before any scroll animation begins.
- Selectable words may function as the primary menu. They should appear as part of the typography rather than as boxed buttons or tabs.
- Menu words must remain keyboard accessible and visibly focused.
- Use active-word changes to move between chapters, filter a visualization, or reveal a research layer.
- Avoid floating dashboard controls unless the research task cannot be completed through the word menu.
- Respect `prefers-reduced-motion`; all content and navigation must remain available without scroll animation.

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

  --color-ink: #000000;
  --color-white: #ffffff;
  --color-muted: #777777;
  --color-rule: #cfcfcf;
  --color-disabled: #b5b5b5;

  --data-red: #ee2722;
  --data-red-orange: #f04a24;
  --data-coral: #ff7a59;
  --data-hot-pink: #ec3f97;
  --data-pale-pink: #e5a4d2;
  --data-violet: #6a58b0;
  --data-indigo: #2b218f;
  --data-near-black: #111510;
  --data-forest: #20583a;
  --data-green: #3e8d4c;
  --data-olive: #829a43;
  --data-lime: #9acb28;
  --data-mint: #35c98a;
  --data-cyan: #39abc8;
  --data-light-cyan: #91d9e8;
  --data-yellow: #f2d33c;
  --data-bright-yellow: #ffe000;
  --data-pale-yellow: #fff0a3;
  --data-cream: #fff6cf;

  --page-gutter: 32px;
  --content-max: 1440px;
  --reading-max: 672px;
}

body,
button,
select,
nav {
  font-family: var(--font-sans);
  font-weight: 400;
}

.caption,
.citation,
.source-note,
.metadata,
.chart-label,
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
- The page background is white and all interface text is black.
- Helvetica Neue is dominant across prose, headings, navigation, selectable words, and controls.
- Space Mono appears only in supporting elements such as captions, citations, metadata, legends, axes, and compact labels.
- The page uses one dominant typographic moment, not several competing ones.
- Spacing comes from the defined scale.
- Interface elements remain monochrome unless color carries information.
- Visualizations sit directly in the page flow without cards, framed canvas boxes, or tinted panels.
- Selectable menu words work with mouse, touch, and keyboard.
- Scroll-sensitive content has an understandable static and reduced-motion state.
- Every chart includes units, labels, source, and methodology.
- Meaning remains understandable without color.
- Images include alt text; decorative images use empty alt text.
- Links, controls, and chart interactions are reachable by keyboard.
- The mobile layout preserves citations, captions, and data context.
