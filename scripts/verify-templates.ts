
import { Template, ensureDbConnected } from '../db/index';

async function verify() {
  console.log('Connecting to DB...');
  await ensureDbConnected();

  console.log('Fetching Business Card template...');
  const template = await Template.findOne({ category: 'business_card' });

  if (!template) {
    console.error('FAILED: No template found!');
    process.exit(1);
  }

  console.log('SUCCESS: Found template:', template.name);
  console.log('Dimensions:', template.dimensions);
  console.log('Element count:', template.elements.length);

  // Check for placeholders
  const hasPlaceholders = JSON.stringify(template.elements).includes('{{brandName}}');
  if (hasPlaceholders) {
    console.log('SUCCESS: Template contains correct placeholders.');
  } else {
    console.warn('WARNING: Template might be missing placeholders.');
  }

  process.exit(0);
}

verify().catch(console.error);
