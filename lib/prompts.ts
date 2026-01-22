export const BRAND_SYSTEM_PROMPT = `
You are a world-class Brand Strategist and Identity Designer.
Analyze the following company info and create a deep brand strategy and visual identity.

COMPANY NAME: {{name}}
DESCRIPTION: {{description}}
STYLE PREFERENCE: {{style}}

Return a JSON object with this exact structure:
{
  "strategy": {
    "archetype": "the character of the brand (e.g., The Creator, The Explorer)",
    "brand_voice": "detailed description of how the brand speaks",
    "target_audience": "who this brand is for",
    "mission_statement": "short, powerful mission"
  },
  "identity": {
    "primary_color": "hex code",
    "secondary_color": "hex code",
    "accent_color": "hex code",
    "visual_style": "minimalist, bold, elegant, etc.",
    "visual_style_rules": "3-4 specific rules for designers to follow"
  }
}
`;

// SCENE_DESIGNER_PROMPT removed - using templates now

export const LOGO_CONCEPT_PROMPT = `
You are a world-class Logo Designer creating a cohesive brand identity.

BRAND: {{name}}
INDUSTRY: {{industry}}
STYLE: {{style}}
DESCRIPTION: {{description}}
PRIMARY COLOR: {{primaryColor}}
SECONDARY COLOR: {{secondaryColor}}

Design a SINGLE unified logo concept. Describe in detail:
1. The ICON/SYMBOL: What abstract or literal shape represents this brand? Be specific (e.g., "a stylized falcon silhouette", "interlocking geometric hexagons").
2. The TYPOGRAPHY STYLE: What font style for the company name? (e.g., "bold sans-serif with rounded terminals", "elegant thin serif").
3. The COLOR APPLICATION: How are the primary and secondary colors used?
4. The OVERALL MOOD: Modern? Classic? Playful? Luxurious?

Return JSON:
{
  "iconDescription": "detailed description of the icon/symbol",
  "typographyStyle": "detailed description of the text style",
  "colorApplication": "how colors are applied",
  "overallMood": "the visual mood/feeling"
}
`;

export const LOGO_MULTIPLE_CONCEPTS_PROMPT = `
You are a world-class Logo Designer and Brand Strategist.
Your goal is to generate 4 FUNDAMENTALLY DISTINCT and MEANINGFUL logo concepts for the following brand.

BRAND NAME: {{name}}
INDUSTRY: {{industry}}
STYLE PREFERENCE: {{style}}
DESCRIPTION: {{description}}
PRIMARY COLOR: {{primaryColor}}
SECONDARY COLOR: {{secondaryColor}}

CRITICAL: Each of the 4 concepts MUST explore a different aesthetic direction and COLOR PALETTE:
- Concept 1: Abstract & Geometric (Unique shapes, mathematical clean lines). Use a BOLD, VIBRANT color palette.
- Concept 2: Minimalist & Modern (Simplified forms, whitespace-heavy). Use a SOPHISTICATED, MUTED color palette.
- Concept 3: Symbolic/Metaphorical (Literal or suggestive symbols related to the name/industry). Use a NATURAL, EARTHY or INDUSTRY-SPECIFIC color palette.
- Concept 4: Bold & Typographic-focused (Unique character treatments or lettermarks). Use a HIGH-CONTRAST, MONOCHROMATIC or DUOTONE color palette.

CRITICAL: Do NOT use the same colors across all concepts. Provide a WIDE VARIETY of color options (#hex values) for the user to choose from. Even if the brand has primary colors, explore deviations to offer creative diversity.

For each concept, provide:
1. Concept Name: A short, evocative name.
2. Industry Rationale: Why this works for the industry.
3. Color Palette: 2-3 unique hex values that define this specific concept.
4. Font Family Preference: Suggest a font style (e.g., "Inter", "Playfair Display", "Montserrat").
5. Symbol Description: A detailed description for an AI IMAGE GENERATOR to create the icon ONLY. Must include instructions on how to use the colors in the palette. Do not include text in the symbol.
6. Layout Strategy: Brief note on why this layout works.

Return a JSON object with this exact structure:
{
  "concepts": [
    {
      "name": "string",
      "rationale": "string",
      "colors": ["#hex1", "#hex2"],
      "fontFamily": "string",
      "symbolPrompt": "detailed description for icon generation, NO text in image",
      "layoutStrategy": "string"
    },
    ... (exactly 4 concepts)
  ]
}
`;

export const LOGO_SET_VARIANTS = {
  horizontal: {
    subType: 'logo_horizontal',
    label: 'Horizontal',
    promptSuffix: 'LAYOUT: Horizontal logo. The icon/symbol is positioned on the LEFT, and the company name "{{name}}" is positioned on the RIGHT in a single horizontal line. Clean spacing between icon and text. No slogan or tagline.',
  },
  vertical: {
    subType: 'logo_vertical',
    label: 'Vertical',
    promptSuffix: 'LAYOUT: Vertical/stacked logo. The icon/symbol is positioned on TOP, and the company name "{{name}}" is positioned BELOW the icon, centered. No slogan or tagline.',
  },
  text: {
    subType: 'logo_text',
    label: 'Text Only',
    promptSuffix: 'LAYOUT: Text-only logo (wordmark). The company name "{{name}}" is stylized using the typography style described. NO icon, NO symbol. Just the name as a beautiful typographic lockup. No slogan or tagline.',
  },
  icon: {
    subType: 'logo_icon',
    label: 'Icon Only',
    promptSuffix: 'LAYOUT: Icon-only logo (brandmark). ONLY the icon/symbol, NO text whatsoever. The symbol should be recognizable and work as a standalone mark (like a favicon or app icon).',
  },
};
