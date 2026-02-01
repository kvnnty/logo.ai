/**
 * Shared industry list used when brands choose industry (generate flow)
 * and for the brand directory sidebar. Keep in sync with both.
 */
export const INDUSTRIES = [
  { id: "travel", name: "Travel" },
  { id: "sports-fitness", name: "Sports Fitness" },
  { id: "retail", name: "Retail" },
  { id: "religious", name: "Religious" },
  { id: "real-estate", name: "Real Estate" },
  { id: "legal", name: "Legal" },
  { id: "internet", name: "Internet" },
  { id: "technology", name: "Technology" },
  { id: "home-family", name: "Home Family" },
  { id: "events", name: "Events" },
  { id: "medical-dental", name: "Medical Dental" },
  { id: "restaurant", name: "Restaurant" },
  { id: "finance", name: "Finance" },
  { id: "nonprofit", name: "Nonprofit" },
  { id: "entertainment", name: "Entertainment" },
  { id: "construction", name: "Construction" },
  { id: "education", name: "Education" },
  { id: "beauty-spa", name: "Beauty Spa" },
  { id: "automotive", name: "Automotive" },
  { id: "animals-pets", name: "Animals Pets" },
  { id: "others", name: "Others" },
] as const;

export type IndustryId = (typeof INDUSTRIES)[number]["id"];
