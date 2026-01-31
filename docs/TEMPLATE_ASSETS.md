# Template Image Assets

This doc explains where to get image assets for **default templates** (backgrounds, lifestyle photos, abstract graphics) and how they fit into our single template format.

## Single template format

All templates (default and AI-generated) use the same **scene JSON** format:

- **Scene**: `{ width, height, elements[] }`
- **Elements**: `rect`, `circle`, `text`, `image`
- **Brand placeholders** (replaced at hydration): `{{primaryColor}}`, `{{secondaryColor}}`, `{{brandName}}`, `{{logoUrl}}`, `{{email}}`, `{{phone}}`, `{{website}}`, `{{address}}`
- **Images**: `src` can be a **URL** (https) or a **data URL** (base64). Graphic illustrations that “react” to brand color use `rect`/`circle` with `fill: "{{primaryColor}}"` or `"{{secondaryColor}}"`.

See `lib/templates/template-format.ts` and `lib/templates/brand-kit-templates.ts` for the canonical format.

---

## Where to download images for default templates

Use these for **default template** placeholders (e.g. flyers, social posts, posters) so designs look professional out of the box.

### Free stock photo & illustration sites

| Source | URL | License | Best for |
|--------|-----|--------|-----------|
| **Unsplash** | https://unsplash.com | Free to use (Unsplash License) | High-quality photos: people, food, workspace, nature |
| **Pexels** | https://pexels.com | Free to use (Pexels License) | Photos and videos; good for marketing templates |
| **Pixabay** | https://pixabay.com | Free to use (Pixabay License) | Photos, illustrations, vectors |
| **Freepik** | https://freepik.com | Free with attribution / paid | Icons, vectors, PSD templates |
| **Undraw** | https://undraw.co/illustrations | Free (MIT) | SVG illustrations (can recolor to brand) |
| **Humaaans** | https://humaaans.com | Free (CC0) | Mix-and-match people illustrations |

### Recommended workflow

1. **Download** the asset (PNG, JPG, or SVG).
2. **Host** it in your app:
   - Put under `public/templates/` and reference as `/templates/your-image.jpg`, or
   - Upload to your CDN/S3 and use the full URL in template `src`.
3. **Use in template** in `lib/templates/brand-kit-templates.ts` or DB templates:
   - Add an element: `{ type: 'image', src: 'https://your-cdn.com/flyer-bg.jpg', x, y, width, height, draggable: true }`.
4. For **illustrations that should match brand color**, prefer **shapes** (`rect`/`circle` with `fill: primaryColor`) or **Undraw-style SVGs** converted to inline/canvas-friendly form, or use a single-colored image and overlay with brand-colored shapes.

### Example: flyer with background image

- Get a neutral background from Unsplash (e.g. “texture”, “gradient”, “minimal”).
- Save as `public/templates/flyer-bg-1.jpg`.
- In your flyer template, add:  
  `{ type: 'image', src: '/templates/flyer-bg-1.jpg', x: 0, y: 0, width: 1275, height: 1650, draggable: false }`  
  then layer logo, text, and brand-colored `rect`/`circle` on top.

### Export / print

Templates are rendered to PNG, SVG, and PDF via `lib/render/scene-renderer.ts`. Users can export from the Brand Canvas Editor for social, email, Figma, or print. Ensure images you use are high enough resolution (e.g. 2x canvas size for retina).
