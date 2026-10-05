# Writing slides

This page covers the Markdown syntax that inria-slides understands. [`slides/guide.md`](../slides/guide.md) uses every feature, so you can compare its source with the published deck.

## Front matter

```yaml
---
title: My talk                    # required for the generated title slide
subtitle: Optional subtitle
author: Jane Doe                  # or a list: [Jane Doe, John Roe]
affiliation: Inria — Team NAME
date: 5 October 2026
event: Conference 2026            # shown above the title and in the footer
lang: fr                          # en (default) | fr — localises Sommaire/Merci/Théorème…
shortTitle: …                     # shorter title for the footer
footer: "custom footer text"      # or false to hide footers
pageTotal: false                  # show "12" instead of "12 / 30"
logos: [img/cnrs.svg, img/uga.png]  # partner logos on the title slide
url: inria.fr                     # shown on the end slide
titleSlide: false                 # don't generate the title slide
css: custom.css                   # extra stylesheet
notes: Speaker notes for the title slide
---
```

### Site-only fields

- `draft: true` keeps a deck off the published site. It still appears, with a *Draft* badge, in `npm run dev`.
- `slides/site.yml` sets the gallery page's `title` and `description`.

## Slides

| Syntax | Effect |
|---|---|
| `---` on its own line | new slide |
| `## Title` | slide title, with the red bar above it |
| `# Title` (plus at most a short paragraph) | **section** slide, numbered 01, 02… automatically |
| a slide containing only `> quote` and `— Author` | **quote** slide |
| `**bold**` | bold, in Inria red |
| `==text==` | red highlight |
| `$…$`, `$$…$$` | KaTeX math |
| ```` ```lang ```` | syntax-highlighted code (` ```mermaid ` renders a diagram, which needs internet access) |
| `\|\|\|` on its own line | column break |
| `<!-- pause -->` | reveal what follows on the next step |
| `Note:` on its own line | everything below it is a speaker note |

### Directives (HTML comments on their own line)

```md
<!-- layout: toc -->          table of contents built from the sections (`toc progress` marks done/current)
<!-- layout: statement -->    one big idea on a red background
<!-- layout: end -->          closing slide (default text: "Thank you / Questions?")
<!-- layout: title -->        an extra title-style slide built from its own "# Title" and text
<!-- layout: section -->      force a section slide
<!-- layout: default -->      force a normal slide (e.g. a lone "# Title" you don't want as a section)
<!-- bg: red | dark | #hex --> colour variant
<!-- cols: 60/40 -->          column ratio (any number of columns: 1/1/1)
<!-- kicker: Results -->      small red label above the title
<!-- incremental -->          reveal top-level list items one by one
<!-- center -->               vertically centre the body
<!-- nofooter -->             hide the footer
<!-- fit: false -->           disable auto-shrinking of overflowing content
<!-- notes: … -->             speaker notes (alternative to "Note:")
<!-- .slide: layout=section bg=dark class="my-class" -->   several at once
```

### Boxes

```md
::: block Main result
Content **in markdown**.
:::
```

The available kinds are `block` (red), `alert` (black), `example` (dark red), `grey`, `note` (no title unless you give one), `plain`, `theorem`, `lemma`, `proposition`, `corollary`, `definition`, `proof` (adds ∎) and `stat` (a big red key figure, with the figure as its title). For `::: theorem (Name)`, the text in parentheses goes after the localised default title. The kinds `center`, `small`, `muted`, `big`, `red` and `fragment` wrap content in a plain styled `div`. To nest a container, give the outer fence more colons (`::::`).

### Columns inside a slide

A `|||` line directly in a slide splits the **whole** slide into columns. To put a row of columns among other content, for example with a sentence below it, use a `cols` container. Give the outer fence more colons than the boxes inside it:

```md
:::: cols 1/1/1 stretch chain
::: grey Step 1
…
:::
|||
::: block Step 2
…
:::
::::

A sentence below the row.
```

The options after `cols` can be combined:

- a ratio such as `2/1` or `1/1/1` sets the column widths (equal by default)
- `stretch` gives boxes in the same row equal heights
- `chain` draws red arrows between columns, for processes and value chains
- `center` vertically centres the columns
- any other word is added as a CSS class, which you can style with `style:` in the front matter

### Images

```md
![](figure.png)                       inline image
![w:500](figure.png)  ![h:300](…)     sized image
![alt](figure.png "Caption *here*")   figure with a caption
![bg](photo.jpg)                      full-bleed background (combine with <!-- bg: dark --> for white text)
![bg right](photo.jpg)                image on the right half; ![bg left:40%](…) to change side and width
![bg right contain](diagram.png)      fit the image instead of cropping it
```

## Presenting

| Key | Action |
|---|---|
| → ↓ Space PgDn / ← ↑ PgUp | next / previous step |
| `12` then ⏎ | go to slide 12 |
| F | fullscreen |
| O / Esc | overview grid |
| S | presenter window with current and next slide, notes and timer. It stays in sync with the main window. |
| B or `.` | black screen |
| P | print to PDF (one slide per page; incremental steps are shown in full) |
| ? | help |

Slides are authored on a 1280×720 canvas and scaled to the window. If a slide's text overflows, it is shrunk automatically, down to 55%.
