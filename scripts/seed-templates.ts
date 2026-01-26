
import mongoose from 'mongoose';
import { Template, ensureDbConnected } from '@/db';
import { GET_TEMPLATE, AssetCategory } from '@/lib/templates/brand-kit-templates';

// Mock params to generate the "Skeleton" of the template
// We use placeholders that the Engine will replace later
const SKELETON_PARAMS = {
  brandName: '{{brandName}}',
  primaryColor: '{{primaryColor}}',
  secondaryColor: '{{secondaryColor}}',
  logoUrl: '{{logoUrl}}',
  website: '{{website}}',
  email: '{{email}}',
  phone: '{{phone}}',
  address: '{{address}}',
};

const CATEGORIES: AssetCategory[] = [
  'business_card', 'social_post', 'social_story', 'youtube_thumbnail',
  'marketing_flyer', 'letterhead', 'email_signature', 'ads',
  'favicon', 'brand_book', 'branding_license', 'social_cover',
  'social_profile', 'marketing_poster', 'id_card'
];

async function seed() {
  console.log('Connecting to DB...');
  await ensureDbConnected();

  console.log('Clearing old templates...');
  await Template.deleteMany({});

  console.log('Seeding templates...');

  for (const category of CATEGORIES) {
    // Generate 3 variations per category (mocking the index loop)
    for (let i = 0; i < 3; i++) {
      // Generating the template using the existing function
      // but passing "Placeholders" instead of real data
      const templateData = GET_TEMPLATE(category, i, SKELETON_PARAMS);

      if (!templateData) continue;

      await Template.create({
        category,
        style: 'modern', // Default style for now
        name: `${category} Template ${i + 1}`,
        dimensions: {
          width: templateData.width,
          height: templateData.height
        },
        elements: templateData.elements,
        isPublic: true
      });
      console.log(`Created ${category} - Variation ${i + 1}`);
    }
  }

  console.log('Done!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
