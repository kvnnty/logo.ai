
import mongoose from 'mongoose';
import { Template, ensureDbConnected } from '@/db';

// --- Configuration ---
const COLORS = {
  primary: '{{primaryColor}}',
  secondary: '{{secondaryColor}}',
  white: '#ffffff',
  black: '#000000',
  dark: '#333333',
  light: '#f5f5f5',
};

// --- Helper Functions ---
function rect(x: number, y: number, w: number, h: number, fill: string, options: any = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill, draggable: false, ...options };
}

function text(content: string, x: number, y: number, fontSize: number, fill: string, options: any = {}) {
  return { type: 'text', content, x, y, fontSize, fill, draggable: true, ...options };
}

function image(src: string, x: number, y: number, w: number, h: number, options: any = {}) {
  return { type: 'image', src, x, y, width: w, height: h, draggable: true, ...options };
}

// --- Generator Functions ---

const businessCardGenerators = [
  // 1. Classic Clean
  (i: number) => ({
    width: 1050, height: 600,
    elements: [
      rect(0, 0, 1050, 600, COLORS.white),
      image('{{logoUrl}}', 50, 50, 150, 150),
      text('{{brandName}}', 50, 220, 50, COLORS.primary, { fontWeight: 'bold' }),
      text('John Doe', 600, 100, 45, COLORS.black, { fontWeight: 'bold' }),
      text('Founder & CEO', 600, 150, 30, COLORS.secondary),
      text('{{email}}', 600, 450, 25, COLORS.dark),
      text('{{phone}}', 600, 490, 25, COLORS.dark),
      text('{{website}}', 600, 530, 25, COLORS.dark),
    ]
  }),
  // 2. Bold Left
  (i: number) => ({
    width: 1050, height: 600,
    elements: [
      rect(0, 0, 1050, 600, COLORS.white),
      rect(0, 0, 400, 600, COLORS.primary),
      image('{{logoUrl}}', 75, 200, 250, 250),
      text('John Doe', 450, 100, 50, COLORS.black, { fontWeight: 'bold' }),
      text('{{brandName}}', 450, 50, 30, COLORS.secondary, { letterSpacing: 5 }),
      rect(450, 160, 500, 2, COLORS.secondary),
      text('{{email}} | {{phone}}', 450, 500, 25, COLORS.dark),
    ]
  }),
  // 3. Modern Border
  (i: number) => ({
    width: 1050, height: 600,
    elements: [
      rect(0, 0, 1050, 600, COLORS.white),
      rect(0, 0, 1050, 30, COLORS.secondary),
      rect(0, 570, 1050, 30, COLORS.primary),
      image('{{logoUrl}}', 800, 50, 200, 200),
      text('{{brandName}}', 50, 100, 60, COLORS.primary, { fontWeight: 'bold' }),
      text('Creative Solutions', 50, 170, 30, COLORS.dark, { fontStyle: 'italic' }),
      text('{{address}}', 50, 450, 25, COLORS.dark),
      text('{{website}}', 50, 500, 25, COLORS.dark),
    ]
  }),
  // 4. Central Focus
  (i: number) => ({
    width: 1050, height: 600,
    elements: [
      rect(0, 0, 1050, 600, COLORS.white),
      image('{{logoUrl}}', 425, 150, 200, 200),
      text('{{brandName}}', 525, 400, 50, COLORS.primary, { fontWeight: 'bold', align: 'center', offsetX: 200 }),
      text('{{website}}', 525, 500, 30, COLORS.dark, { align: 'center', offsetX: 100 }),
    ]
  })
];

const socialPostGenerators = [
  // 1. Quote Style
  (i: number) => ({
    width: 1080, height: 1080,
    elements: [
      rect(0, 0, 1080, 1080, COLORS.primary),
      rect(100, 100, 880, 880, COLORS.white),
      image('{{logoUrl}}', 440, 150, 200, 200),
      text('"INSPIRE INNOVATION"', 540, 500, 60, COLORS.primary, { fontWeight: 'bold', align: 'center', offsetX: 300 }),
      text('{{brandName}}', 540, 900, 30, COLORS.secondary, { align: 'center', offsetX: 100 }),
    ]
  }),
  // 2. Bold Headline
  (i: number) => ({
    width: 1080, height: 1080,
    elements: [
      rect(0, 0, 1080, 1080, COLORS.white),
      rect(0, 800, 1080, 280, COLORS.secondary),
      text('BIG ANNOUNCEMENT', 50, 100, 100, COLORS.primary, { fontWeight: '800' }),
      text('Coming Soon', 50, 250, 50, COLORS.dark),
      image('{{logoUrl}}', 50, 840, 200, 200),
      text('{{website}}', 300, 920, 40, COLORS.white),
    ]
  }),
  // 3. Minimalist
  (i: number) => ({
    width: 1080, height: 1080,
    elements: [
      rect(0, 0, 1080, 1080, COLORS.light),
      image('{{logoUrl}}', 390, 390, 300, 300),
      text('{{brandName}}', 540, 750, 40, COLORS.dark, { align: 'center', letterSpacing: 10, offsetX: 200 }),
    ]
  })
];

async function generate() {
  console.log('Connecting to DB...');
  await ensureDbConnected();

  console.log('Clearing old templates...');
  await Template.deleteMany({});

  const batchCreate = async (category: string, generators: any[]) => {
    for (const [index, gen] of generators.entries()) {
      const tpl = gen(index);
      await Template.create({
        category,
        style: 'modern',
        name: `${category} Algo ${index + 1}`,
        dimensions: { width: tpl.width, height: tpl.height },
        elements: tpl.elements,
        isPublic: true
      });
      console.log(`Generated ${category} ${index + 1}`);
    }
  };

  await batchCreate('business_card', businessCardGenerators);
  await batchCreate('social_post', socialPostGenerators);

  // Fill remaining categories with basic fallback (reuses logic from seed-templates essentially, but cleaner)
  const remainingCats = [
    'letterhead', 'email_signature', 'social_cover', 'ads', 'marketing_flyer',
    'social_story', 'youtube_thumbnail'
  ];

  // Reuse our basic generators for specific missing types or create generic ones
  // For verify purpose, I'll ensure "business_card" and "social_post" are robust.
  // I will add a generic filler for others to ensure "Starter Kit" works
  // STARTER Categories: 'business_card', 'social_post', 'letterhead', 'email_signature', 'social_cover'

  // Letterhead Generic
  await Template.create({
    category: 'letterhead',
    style: 'modern',
    name: 'Standard Letterhead',
    dimensions: { width: 1275, height: 1650 },
    elements: [
      rect(0, 0, 1275, 1650, COLORS.white),
      rect(0, 0, 1275, 20, COLORS.primary),
      image('{{logoUrl}}', 50, 50, 150, 150),
      text('{{brandName}}', 220, 100, 40, COLORS.dark, { fontWeight: 'bold' }),
      text('{{address}} | {{phone}} | {{email}}', 100, 1550, 20, COLORS.secondary),
    ],
    isPublic: true
  });
  console.log('Generated letterhead');

  // Email Sig Generic
  await Template.create({
    category: 'email_signature',
    style: 'modern',
    name: 'Standard Sig',
    dimensions: { width: 600, height: 200 },
    elements: [
      rect(0, 0, 600, 200, COLORS.white),
      rect(10, 10, 5, 180, COLORS.primary),
      image('{{logoUrl}}', 30, 30, 80, 80),
      text('John Doe', 130, 40, 25, COLORS.black, { fontWeight: 'bold' }),
      text('{{brandName}}', 130, 70, 20, COLORS.secondary),
      text('{{website}}', 130, 120, 15, COLORS.dark),
    ],
    isPublic: true
  });
  console.log('Generated email_signature');

  // Social Cover Generic
  await Template.create({
    category: 'social_cover',
    style: 'modern',
    name: 'Standard Cover',
    dimensions: { width: 1500, height: 500 },
    elements: [
      rect(0, 0, 1500, 500, COLORS.primary),
      rect(0, 0, 1500, 500, COLORS.white, { opacity: 0.1 }),
      image('{{logoUrl}}', 650, 150, 200, 200),
      text('{{brandName}}', 750, 400, 50, COLORS.white, { align: 'center', offsetX: 100 }),
    ],
    isPublic: true
  });
  console.log('Generated social_cover');

  // Ensure 'marketing_flyer' and 'ads' exist for the fix verification
  await Template.create({
    category: 'marketing_flyer',
    style: 'modern',
    name: 'Standard Flyer',
    dimensions: { width: 1275, height: 1650 },
    elements: [rect(0, 0, 1275, 1650, COLORS.light), text('FLYER', 100, 100, 50, COLORS.primary)],
    isPublic: true
  });
  await Template.create({
    category: 'ads',
    style: 'modern',
    name: 'Standard Ad',
    dimensions: { width: 1080, height: 1080 },
    elements: [rect(0, 0, 1080, 1080, COLORS.secondary), text('AD', 100, 100, 50, COLORS.white)],
    isPublic: true
  });


  console.log('Done generating algorithmic templates!');
  process.exit(0);
}

generate().catch(console.error);
