export type TemplateParams = {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type AssetCategory = 'social_post' | 'social_story' | 'youtube_thumbnail' | 'business_card' | 'marketing_flyer' | 'letterhead' | 'email_signature' | 'ads';

export const GET_TEMPLATE = (category: AssetCategory, index: number, params: TemplateParams) => {
  const { brandName, primaryColor, secondaryColor, logoUrl, website, email, phone, address } = params;

  const templates: Record<AssetCategory, (i: number) => any> = {
    business_card: (i) => ({
      width: 1050,
      height: 600,
      elements: [
        { type: 'rect', x: 0, y: 0, width: 1050, height: 600, fill: secondaryColor, draggable: false },
        { type: 'rect', x: 0, y: 0, width: 350, height: 600, fill: primaryColor, draggable: false },
        logoUrl ? { type: 'image', src: logoUrl, x: 50, y: 150, width: 250, height: 250, draggable: true } : null,
        { type: 'text', content: brandName, x: 400, y: 100, fontSize: 60, fontWeight: 'bold', fill: primaryColor, draggable: true },
        { type: 'text', content: 'Contact Information', x: 400, y: 200, fontSize: 30, fill: '#666666', draggable: true },
        { type: 'text', content: email || 'hello@example.com', x: 400, y: 280, fontSize: 25, fill: '#333333', draggable: true },
        { type: 'text', content: phone || '+1 234 567 890', x: 400, y: 340, fontSize: 25, fill: '#333333', draggable: true },
        { type: 'text', content: website || 'www.example.com', x: 400, y: 400, fontSize: 25, fill: '#333333', draggable: true },
      ].filter(Boolean)
    }),
    social_post: (i) => ({
      width: 1080,
      height: 1080,
      elements: [
        { type: 'rect', x: 0, y: 0, width: 1080, height: 1080, fill: secondaryColor, draggable: false },
        { type: 'rect', x: 50, y: 50, width: 980, height: 980, fill: '#ffffff', opacity: 0.8, cornerRadius: 20, draggable: false },
        logoUrl ? { type: 'image', src: logoUrl, x: 390, y: 150, width: 300, height: 300, draggable: true } : null,
        { type: 'text', content: brandName, x: 540, y: 500, fontSize: 80, fontWeight: 'bold', fill: primaryColor, align: 'center', offsetX: 200, draggable: true },
        { type: 'text', content: 'Coming Soon', x: 540, y: 650, fontSize: 40, fill: '#666666', align: 'center', offsetX: 100, draggable: true },
        { type: 'rect', x: 400, y: 800, width: 280, height: 80, fill: primaryColor, cornerRadius: 40, draggable: true },
        { type: 'text', content: website || 'Visit Website', x: 540, y: 825, fontSize: 25, fill: '#ffffff', align: 'center', offsetX: 75, draggable: true },
      ].filter(Boolean)
    }),
    social_story: (i) => ({
      width: 1080,
      height: 1920,
      elements: [
        { type: 'rect', x: 0, y: 0, width: 1080, height: 1920, fill: primaryColor, draggable: false },
        { type: 'rect', x: 100, y: 200, width: 880, height: 1520, fill: '#ffffff', cornerRadius: 30, draggable: false },
        logoUrl ? { type: 'image', src: logoUrl, x: 390, y: 350, width: 300, height: 300, draggable: true } : null,
        { type: 'text', content: brandName, x: 540, y: 750, fontSize: 90, fontWeight: 'bold', fill: primaryColor, align: 'center', offsetX: 200, draggable: true },
        { type: 'text', content: 'Transforming Your Vision', x: 540, y: 900, fontSize: 40, fill: '#333333', align: 'center', offsetX: 200, draggable: true },
        { type: 'text', content: website || 'Swipe up to learn more', x: 540, y: 1600, fontSize: 35, fill: '#ffffff', align: 'center', offsetX: 150, draggable: true },
      ].filter(Boolean)
    }),
    youtube_thumbnail: (i) => ({
      width: 1280,
      height: 720,
      elements: [
        { type: 'rect', x: 0, y: 0, width: 1280, height: 720, fill: secondaryColor, draggable: false },
        { type: 'rect', x: 0, y: 0, width: 400, height: 720, fill: primaryColor, draggable: false },
        logoUrl ? { type: 'image', src: logoUrl, x: 50, y: 210, width: 300, height: 300, draggable: true } : null,
        { type: 'text', content: 'NEW VIDEO', x: 450, y: 150, fontSize: 40, fontWeight: 'bold', fill: primaryColor, draggable: true },
        { type: 'text', content: 'Mastering Brand Identity', x: 450, y: 220, fontSize: 80, fontWeight: 'bold', fill: '#000000', draggable: true, width: 750 },
        { type: 'text', content: brandName, x: 450, y: 550, fontSize: 40, fill: '#666666', draggable: true },
      ].filter(Boolean)
    }),
    marketing_flyer: (i) => ({
      width: 1275,
      height: 1650,
      elements: [
        { type: 'rect', x: 0, y: 0, width: 1275, height: 1650, fill: '#ffffff', draggable: false },
        { type: 'rect', x: 0, y: 0, width: 1275, height: 300, fill: primaryColor, draggable: false },
        logoUrl ? { type: 'image', src: logoUrl, x: 50, y: 50, width: 200, height: 200, draggable: true } : null,
        { type: 'text', content: brandName, x: 300, y: 100, fontSize: 100, fontWeight: 'bold', fill: '#ffffff', draggable: true },
        { type: 'text', content: 'PREMIUM SERVICES', x: 100, y: 400, fontSize: 60, fontWeight: 'bold', fill: primaryColor, draggable: true },
        { type: 'rect', x: 100, y: 500, width: 200, height: 10, fill: primaryColor, draggable: false },
        { type: 'text', content: 'Experience the quality of our professional brand agency services tailored to your needs.', x: 100, y: 550, fontSize: 35, fill: '#333333', draggable: true, width: 1000 },
        { type: 'rect', x: 0, y: 1400, width: 1275, height: 250, fill: '#f8f9fa', draggable: false },
        { type: 'text', content: email || 'contact@example.com', x: 100, y: 1450, fontSize: 30, fill: '#333333', draggable: true },
        { type: 'text', content: phone || '+1 234 567 890', x: 100, y: 1510, fontSize: 30, fill: '#333333', draggable: true },
        { type: 'text', content: website || 'www.example.com', x: 100, y: 1570, fontSize: 30, fill: '#333333', draggable: true },
      ].filter(Boolean)
    }),
    letterhead: (i) => ({
      width: 1275,
      height: 1650,
      elements: [
        { type: 'rect', x: 0, y: 0, width: 1275, height: 1650, fill: '#ffffff', draggable: false },
        logoUrl ? { type: 'image', src: logoUrl, x: 50, y: 50, width: 150, height: 150, draggable: true } : null,
        { type: 'text', content: brandName, x: 220, y: 80, fontSize: 50, fontWeight: 'bold', fill: primaryColor, draggable: true },
        { type: 'rect', x: 50, y: 220, width: 1175, height: 2, fill: '#eeeeee', draggable: false },
        { type: 'rect', x: 50, y: 1550, width: 1175, height: 2, fill: '#eeeeee', draggable: false },
        { type: 'text', content: `${address || 'City, Country'} | ${phone || 'Phone'} | ${email || 'Email'}`, x: 637, y: 1580, fontSize: 20, fill: '#999999', align: 'center', offsetX: 300, draggable: true },
      ].filter(Boolean)
    }),
    email_signature: (i) => ({
      width: 800,
      height: 250,
      elements: [
        { type: 'rect', x: 0, y: 0, width: 800, height: 250, fill: '#ffffff', draggable: false },
        { type: 'rect', x: 200, y: 50, width: 2, height: 150, fill: primaryColor, draggable: false },
        logoUrl ? { type: 'image', src: logoUrl, x: 25, y: 50, width: 150, height: 150, draggable: true } : null,
        { type: 'text', content: 'John Doe', x: 230, y: 50, fontSize: 35, fontWeight: 'bold', fill: '#333333', draggable: true },
        { type: 'text', content: 'Director of Design', x: 230, y: 95, fontSize: 20, fill: primaryColor, draggable: true },
        { type: 'text', content: brandName, x: 230, y: 140, fontSize: 25, fontWeight: 'bold', fill: '#333333', draggable: true },
        { type: 'text', content: `${phone || 'Phone'} | ${website || 'Web'}`, x: 230, y: 180, fontSize: 18, fill: '#666666', draggable: true },
      ].filter(Boolean)
    }),
    ads: (i) => ({
      width: 1080,
      height: 1080,
      elements: [
        { type: 'rect', x: 0, y: 0, width: 1080, height: 1080, fill: primaryColor, draggable: false },
        { type: 'rect', x: 50, y: 50, width: 980, height: 980, border: '10px solid #ffffff', draggable: false },
        logoUrl ? { type: 'image', src: logoUrl, x: 390, y: 100, width: 300, height: 300, draggable: true } : null,
        { type: 'text', content: 'LIMITED OFFER', x: 540, y: 450, fontSize: 100, fontWeight: 'bold', fill: '#ffffff', align: 'center', offsetX: 350, draggable: true },
        { type: 'text', content: '50% OFF SERVICE', x: 540, y: 600, fontSize: 60, fontWeight: 'bold', fill: '#ffffff', align: 'center', offsetX: 250, draggable: true },
        { type: 'rect', x: 340, y: 750, width: 400, height: 100, fill: '#ffffff', cornerRadius: 50, draggable: true },
        { type: 'text', content: 'BOOK NOW', x: 540, y: 780, fontSize: 40, fontWeight: 'bold', fill: primaryColor, align: 'center', offsetX: 100, draggable: true },
      ].filter(Boolean)
    })
  };

  const getTemplate = templates[category as AssetCategory];
  if (!getTemplate) return null;

  const result = getTemplate(index);

  // Add some variety if index > 0 (example: flip colors)
  if (index > 0 && index % 2 === 1) {
    result.elements.forEach((el: any) => {
      if (el.fill === primaryColor) el.fill = secondaryColor;
      else if (el.fill === secondaryColor) el.fill = primaryColor;
    });
  }

  return result;
};
