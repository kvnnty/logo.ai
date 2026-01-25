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
      "symbolPrompt": "detailed description for a COMPLETE LOGO DESIGN including the icon and clearly legible text of the brand name",
      "layoutStrategy": "string"
    },
    ... (exactly 4 concepts)
  ]
}
`;

export const LOGO_SET_VARIANTS = {
  icon: { label: 'Icon Only', subType: 'logo_icon' },
  text: { label: 'Wordmark', subType: 'logo_text' },
  horizontal: { label: 'Horizontal', subType: 'logo_horizontal' },
  vertical: { label: 'Vertical', subType: 'logo_vertical' },
};
