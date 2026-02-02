# Template Image Assets

This doc explains **what template assets are**, **where to get them**, and **how you can help** add images and graphics so default templates (and AI-generated ones) look great out of the box.

---

## Why template assets matter

- **Default templates** (business cards, flyers, social posts, etc.) are built from **scene JSON**: shapes, text, and **images**. Right now many templates use only shapes + logo + text. Adding **background photos**, **lifestyle images**, or **illustrations** makes previews and generated designs feel more polished.
- **Preview thumbnails**: If we store a `previewImageUrl` per template (e.g. in the DB), that image is shown on category pages. You can create or source those previews.
- **Export quality**: Anything the user exports (PNG/SVG/PDF) is rendered from the same scene; good source images mean good exports.

---

## Single template format (quick reference)

All templates use the same **scene JSON**:

- **Scene**: `{ width, height, elements[] }`
- **Elements**: `rect`, `circle`, `text`, `image`
- **Brand placeholders** (replaced when the user picks a brand):  
  `{{primaryColor}}`, `{{secondaryColor}}`, `{{brandName}}`, `{{logoUrl}}`, `{{email}}`, `{{phone}}`, `{{website}}`, `{{address}}`
- **Images**: `src` can be:
  - A **URL** (e.g. `https://...` or `/templates/photo.jpg` from `public/`)
  - A **data URL** (base64) for inline images
- **Graphics that “react” to brand**: use `rect` or `circle` with `fill: "{{primaryColor}}"` or `"{{secondaryColor}}"` (no image needed).

Code reference: `lib/templates/template-format.ts`, `lib/templates/brand-kit-templates.ts`.

---

## Obtaining a template dataset (Canva-like)

There is **no public, free dataset** of marketing/social templates in a ready-to-use JSON format like Canva’s library. Here are practical options:

| Option | What it is | Pros / cons |
|--------|------------|-------------|
| **Canva Connect API** | Canva’s API for brand templates (get dataset definition, autofill, export). | **Enterprise only.** You work with templates *inside* a Canva account (your brand templates), not a downloadable dump of Canva’s public library. Good if you’re already Canva Enterprise. [Docs](https://www.canva.dev/docs/connect/api-reference/brand-templates/get-brand-template-dataset/). |
| **Figma Community + conversion** | Use free templates from [Figma Community](https://www.figma.com/community), get file JSON via [Figma REST API](https://developers.figma.com/docs/rest-api/files/) (`GET /v1/files/:key`), then convert Figma nodes → our scene format. | **Best “dataset-like” source.** Lots of free social/marketing templates. Requires a **Figma → scene converter** (map RECTANGLE → `rect`, TEXT → `text`, etc.) and handling of images (export from Figma or replace with URLs). |
| **Rico / Enrico** | Open datasets of **mobile app UI** screens (view hierarchies, screenshots). [Rico](https://huggingface.co/datasets/creative-graphic-design/Rico), [Enrico](https://userinterfaces.aalto.fi/enrico/). | **Wrong domain.** Useful for app UI research, not flyers/social/posters. |
| **DocLayNet / VRDU** | Document-layout datasets (PDFs, forms, bounding boxes). | **Wrong domain.** For document understanding / ML, not marketing design templates. |
| **Curate your own** | Add templates in-code (`lib/templates/brand-kit-templates.ts`) or in the DB, plus images under `public/templates/` (see rest of this doc). | Full control, matches your format. No third-party dependency; more manual work. |
| **AI-generated** | Use your app’s “Generate new design” flow to create many templates, then save the resulting scene JSON as default or seed templates. | Grows a dataset that matches your format; quality depends on prompts and categories. |

**Recommendation:** For a “template dataset” feel without Canva Enterprise:

1. **Short term:** Curate 1–2 templates per category in your scene format and use the **image checklist** in this doc so they look good.
2. **Medium term:** Add a **Figma → scene** converter and pull in templates from Figma Community (or a curated Figma file) to bulk-import layouts; replace or keep image refs as needed.
3. **Ongoing:** Use **AI generation** to create more templates and persist the best ones as defaults or suggestions.

---

## Where you can help

Below are **concrete ways you can contribute** without needing to change app logic—just assets and (optionally) a few lines of template config.

### 1. Add images under `public/templates/`

**What to do**

1. Create the folder if it doesn’t exist:  
   `public/templates/`
2. Download or export images (see “Where to download” and “Licenses” below).
3. Save them with clear names, e.g.:
   - `public/templates/flyer-bg-1.jpg`
   - `public/templates/social-post-hero.jpg`
   - `public/templates/business-card-pattern.png`

**Why this helps**

- Templates can reference them as `src: '/templates/flyer-bg-1.jpg'`.
- No backend or DB change needed for **in-code templates**; only the template definition (e.g. in `lib/templates/brand-kit-templates.ts`) needs to add an `image` element with that `src`.
- Served directly by Next.js from `public/`, so no GridFS or S3 required for these defaults.

**You don’t need to** edit TypeScript yourself if you prefer not to—you can just provide the files and tell the dev “add flyer-bg-1.jpg as background for the flyer template” and they can add the element.

---

### 2. Suggest or provide “preview” images for template cards

**What to do**

- For each template (or template category), we can show a **preview thumbnail** on the dashboard (e.g. Business Cards, Social Posts).
- You can:
  - **Suggest**: “Use this Unsplash link for the business card preview.”
  - **Provide**: Export a 400×300 (or similar) PNG that represents that template and put it in `public/templates/previews/` (e.g. `business-card-1-preview.png`).

**Why this helps**

- Right now, when the DB has no `previewImageUrl`, the app draws a live canvas preview. Storing or using a real preview image (from DB or from a fixed path) can make the template picker look more consistent and professional.
- If we add a script or admin flow that “generates previews” from the scene, you can still help by choosing which templates get custom previews and what they should look like.

---

### 3. Choose and document image sources (licenses + resolution)

**What to do**

- When you pick an image from Unsplash, Pexels, etc., note:
  - **Source** (site name + link or search query).
  - **License** (e.g. Unsplash License, Pexels License, CC0).
  - **Suggested use** (e.g. “flyer background”, “social post hero”).
- You can add a small **attribution** in the repo (e.g. a `public/templates/ATTRIBUTION.md` or a table in this doc) so we stay license-compliant.

**Why this helps**

- Keeps default templates safe to ship and export.
- Gives future contributors a clear list of “blessed” sources and how we use them.

---

### 4. Create or curate “placeholder” sets per category

**What to do**

- For each template category (e.g. **Flyers**, **Social posts**, **Posters**), define a small set of **default images** (2–5 per category):
  - e.g. “Flyer: 1 neutral texture, 1 food, 1 event.”
  - Put them in `public/templates/flyers/`, `public/templates/social/`, etc., with clear names.
- Optionally, write a short table (in this doc or a CSV) like:

  - **Category** | **Filename**        | **Suggested use**      | **Source**
  - Flyers      | flyer-bg-1.jpg     | General background     | Unsplash “minimal texture”
  - Social      | social-hero-1.jpg   | Post hero image        | Pexels “lifestyle”

**Why this helps**

- Developers (or scripts) can then add these into `brand-kit-templates.ts` or DB templates in a consistent way.
- You’re deciding **what** the defaults look like; someone else can wire the `image` elements.

---

## Where to download images

Use these for **default template** assets (backgrounds, heroes, illustrations). Prefer **free, commercial-use** licenses.

| Source | URL | License | Best for |
|--------|-----|--------|----------|
| **Unsplash** | https://unsplash.com | Unsplash License (free commercial use) | Photos: people, food, workspace, nature, textures |
| **Pexels** | https://pexels.com | Pexels License (free commercial use) | Photos and videos; marketing-style imagery |
| **Pixabay** | https://pixabay.com | Pixabay License (free commercial use) | Photos, illustrations, vectors |
| **Freepik** | https://freepik.com | Free with attribution or paid | Icons, vectors, PSDs |
| **Undraw** | https://undraw.co/illustrations | MIT | SVG illustrations (recolor to brand) |
| **Humaaans** | https://humaaans.com | CC0 | Mix-and-match people illustrations |

---

## What to search and download (by category)

Use the **sites** in the table above (Unsplash, Pexels, Pixabay). Below: **exact search terms** and **suggested filenames** so the same images can be reused across categories where it makes sense.

### Universal set (use in many categories)

These work as backgrounds or accents across **branding, social, and marketing**. Download once and reuse.

| Search term (Unsplash / Pexels) | Save as | Use in |
|---------------------------------|---------|--------|
| **abstract gradient** | `bg-gradient-1.jpg` | Any template needing a soft, non-distracting background |
| **paper texture** or **subtle texture** | `bg-paper-1.jpg` | Business cards, letterheads, email signature, certificates |
| **minimal geometric** or **abstract shapes** | `bg-geometric-1.jpg` | Social posts, ads, covers when you want a modern look |
| **neutral gradient** (white/gray/beige) | `bg-neutral-1.jpg` | Flyers, posters, social when content is on top |
| **blur bokeh** or **soft blur background** | `bg-bokeh-1.jpg` | Hero area behind text (social post, story, thumbnail) |

**Where to use the universal set**

- **Branding**: business cards, letterheads, email signature, brand book, license → `bg-paper-1.jpg` or `bg-neutral-1.jpg`.
- **Social**: social post, story, cover, YouTube thumbnail → `bg-gradient-1.jpg`, `bg-geometric-1.jpg`, or `bg-bokeh-1.jpg`.
- **Marketing**: ads, flyers, posters → `bg-neutral-1.jpg`, `bg-gradient-1.jpg`, or `bg-geometric-1.jpg`.

---

### By category: what to search and save

**Branding**

| Category | Search for | Save as | Notes |
|----------|------------|---------|--------|
| Business cards | paper texture, subtle pattern, marble texture | `business-card-bg-1.jpg` | Neutral so logo and text stand out |
| Letterheads | white paper texture, minimal line pattern | `letterhead-bg-1.jpg` | Very subtle; often white/off-white |
| Email signature | (optional) thin divider line or none | — | Usually shapes only; image optional |
| Brand book | abstract gradient, soft gradient | `brand-book-bg-1.jpg` | Full-page or hero area |
| License / certificate | paper texture, certificate border (or use shapes only) | `certificate-bg-1.jpg` | Formal, light |

**Social**

| Category | Search for | Save as | Notes |
|----------|------------|---------|--------|
| Social post (square) | lifestyle workspace, coffee flat lay, abstract color | `social-hero-1.jpg`, `social-hero-2.jpg` | 1080×1080 or larger; can reuse for ads |
| Social story (vertical) | vertical gradient, mobile background, lifestyle vertical | `story-bg-1.jpg`, `story-bg-2.jpg` | 1080×1920 or larger |
| Social cover | wide abstract, banner gradient, landscape minimal | `cover-bg-1.jpg` | 1500×500 or larger |
| YouTube thumbnail | bold gradient, person talking, product close up | `thumbnail-hero-1.jpg`, `thumbnail-hero-2.jpg` | 1280×720 or larger |

**Marketing**

| Category | Search for | Save as | Notes |
|----------|------------|---------|--------|
| Flyers | event crowd, food spread, workshop, promo background | `flyer-bg-1.jpg`, `flyer-bg-2.jpg`, `flyer-food-1.jpg` | 1275×1650 or larger |
| Posters | concert poster style, minimal poster background, event | `poster-bg-1.jpg`, `poster-event-1.jpg` | 1650×2338 or larger |
| Ads (square) | product flat lay, lifestyle, abstract bold | `ads-hero-1.jpg`, `ads-hero-2.jpg` | Same as social post size; can reuse `social-hero-*.jpg` |
| ID cards | (optional) subtle pattern or none | `id-card-bg-1.jpg` | Often white + shapes; image optional |

---

### Quick checklist: minimum set

If you want a **small set that benefits all categories**, download at least these and put them in `public/templates/`:

1. **bg-neutral-1.jpg** — search: `neutral gradient` or `minimal gray background` (Unsplash/Pexels)  
   → Use in: business card, letterhead, flyer, poster, social when you need a calm background.

2. **bg-paper-1.jpg** — search: `paper texture` or `white paper`  
   → Use in: business card, letterhead, email signature, certificate.

3. **social-hero-1.jpg** — search: `lifestyle workspace` or `minimal office` (square crop)  
   → Use in: social post, ads, optional YouTube thumbnail.

4. **flyer-bg-1.jpg** — search: `event background` or `promo gradient`  
   → Use in: flyer, poster (crop if needed).

5. **story-bg-1.jpg** — search: `vertical gradient` or `mobile background` (vertical)  
   → Use in: social story, vertical ads.

6. **cover-bg-1.jpg** — search: `wide gradient` or `banner abstract` (wide crop)  
   → Use in: social cover.

**Optional but useful**

- **thumbnail-hero-1.jpg** — search: `youtube thumbnail` or `bold gradient 16:9` (YouTube).
- **bg-bokeh-1.jpg** — search: `bokeh blur` (hero behind text in any category).

Use **high resolution** (at least the canvas size; 2× for retina). Prefer **landscape or square** for universal use; crop in the template or editor if needed.

---

## Recommended workflow (technical)

1. **Download** the asset (PNG, JPG, or SVG).
2. **Host** in the app:
   - **Preferred for default templates**: Put under `public/templates/` (or `public/templates/<category>/`) and reference as `src: '/templates/...'`.
   - **Alternative**: If you later use a CDN, you can use a full URL in `src`; no S3 required (app uses MongoDB GridFS for user uploads only).
3. **Use in template**:
   - **In-code**: In `lib/templates/brand-kit-templates.ts`, add an element, e.g.  
     `{ type: 'image', src: '/templates/flyer-bg-1.jpg', x: 0, y: 0, width: 1275, height: 1650, draggable: false }`  
     then add logo, text, and shapes on top.
   - **DB templates**: If templates are stored in MongoDB, add the same `image` element to the template’s `elements` array and set `src` to the same path or URL.
4. **Illustrations that match brand color**: Prefer **shapes** (`rect`/`circle` with `fill: primaryColor`) or recolorable SVGs (e.g. Undraw) rather than hard-coded colored images, so they “react” to the brand.

**Resolution**: Templates are rendered at 1x or 2x for export. Use images at least as large as the canvas (e.g. 1275×1650 for a flyer); 2× that for retina is safer.

---

## Example: flyer with background image

1. Get a neutral background from Unsplash (e.g. search “texture” or “gradient”).
2. Save as `public/templates/flyer-bg-1.jpg`.
3. In the flyer template (in code or DB), add as the **first** element (so it’s behind everything):  
   `{ type: 'image', src: '/templates/flyer-bg-1.jpg', x: 0, y: 0, width: 1275, height: 1650, draggable: false }`.
4. Keep existing logo, text, and brand-colored shapes on top.

---

## Export / print

Templates are rendered to PNG, SVG, and PDF via `lib/render/scene-renderer.ts`. Users export from the Brand Canvas Editor. Good source images (resolution and license) = good, safe exports for social, email, Figma, or print.

---

## Summary: what you can do

| You can… | How |
|----------|-----|
| **Add default images** | Download from the sites above, put files in `public/templates/` (or subfolders), name them clearly. |
| **Suggest previews** | Provide URLs or files for template card thumbnails and where they should be used. |
| **Document sources** | Keep a short list or table of source + license + suggested use (e.g. in this doc or `public/templates/ATTRIBUTION.md`). |
| **Curate per category** | Pick 2–5 images per category (flyers, social, etc.) and list filenames + suggested use so devs can wire them into templates. |
| **Leave code to devs** | You supply assets and a short spec (“use flyer-bg-1.jpg as background for the main flyer”); someone else adds the `image` element in code or DB. |

If you tell us “I’ve added these files under `public/templates/` and here’s the list,” we can wire them into the right templates next.
