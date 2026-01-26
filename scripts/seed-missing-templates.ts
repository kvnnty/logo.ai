
import { Template, ensureDbConnected } from '../db/index';

const COLORS = {
  primary: '{{primaryColor}}',
  secondary: '{{secondaryColor}}',
  white: '#ffffff',
  black: '#000000',
  dark: '#333333',
};

function rect(x: number, y: number, w: number, h: number, fill: string, options: any = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill, draggable: false, ...options };
}

function text(content: string, x: number, y: number, fontSize: number, fill: string, options: any = {}) {
  return { type: 'text', content, x, y, fontSize, fill, draggable: true, ...options };
}

function image(src: string, x: number, y: number, w: number, h: number, options: any = {}) {
  return { type: 'image', src, x, y, width: w, height: h, draggable: true, ...options };
}

async function seedMissing() {
  console.log('Connecting to DB...');
  await ensureDbConnected();

  // Social Story (Vertical 1080x1920)
  const stories = [
    {
      name: 'Story Minimal',
      elements: [
        rect(0, 0, 1080, 1920, COLORS.white),
        image('{{logoUrl}}', 390, 200, 300, 300),
        text('{{brandName}}', 540, 600, 60, COLORS.primary, { align: 'center', offsetX: 200 }),
        rect(100, 800, 880, 2, COLORS.secondary),
        text('NEW POST', 540, 900, 100, COLORS.black, { fontWeight: 'bold', align: 'center', offsetX: 250 }),
        text('Swipe Up', 540, 1700, 40, COLORS.dark, { align: 'center', offsetX: 100 }),
      ]
    },
    {
      name: 'Story Bold',
      elements: [
        rect(0, 0, 1080, 1920, COLORS.primary),
        rect(100, 200, 880, 1520, COLORS.white, { cornerRadius: 50 }),
        image('{{logoUrl}}', 390, 400, 300, 300),
        text('SPECIAL OFFER', 540, 800, 70, COLORS.black, { fontWeight: 'bold', align: 'center', offsetX: 300 }),
        text('{{website}}', 540, 1500, 30, COLORS.secondary, { align: 'center', offsetX: 150 }),
      ]
    }
  ];

  for (const [i, s] of stories.entries()) {
    await Template.create({
      category: 'social_story',
      style: 'modern',
      name: s.name,
      dimensions: { width: 1080, height: 1920 },
      elements: s.elements,
      isPublic: true
    });
    console.log(`Created social_story ${i + 1}`);
  }

  // YouTube Thumbnail (1280x720)
  const thumbnails = [
    {
      name: 'Thumbnail Standard',
      elements: [
        rect(0, 0, 1280, 720, COLORS.dark),
        rect(0, 0, 400, 720, COLORS.primary),
        image('{{logoUrl}}', 50, 50, 200, 200),
        text('VIDEO TITLE', 450, 300, 100, COLORS.white, { fontWeight: 'bold' }),
        text('{{brandName}}', 450, 450, 40, COLORS.secondary),
      ]
    }
  ];

  for (const [i, t] of thumbnails.entries()) {
    await Template.create({
      category: 'youtube_thumbnail',
      style: 'modern',
      name: t.name,
      dimensions: { width: 1280, height: 720 },
      elements: t.elements,
      isPublic: true
    });
    console.log(`Created youtube_thumbnail ${i + 1}`);
  }

  console.log('Done!');
  process.exit(0);
}

seedMissing().catch(console.error);
