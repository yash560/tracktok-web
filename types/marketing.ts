export type ActionVariant = 'primary' | 'secondary' | 'outline';

export interface PageAction {
  label: string;
  href: string;
  variant: ActionVariant;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string;
  accent?: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  bullets: string[];
  featured?: boolean;
}

export interface CardItem {
  title: string;
  description: string;
  icon: string;
}

export interface TextSection {
  id: string;
  type: 'text';
  title: string;
  content: string[];
}

export interface ContactItem {
  title: string;
  value: string;
  subtitle: string;
}

export interface ContactSection {
  id: string;
  type: 'contact';
  title: string;
  subtitle?: string;
  items: ContactItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface APIEndpoint {
  path: string;
  method: string;
  summary: string;
  requestBody: string;
  responseExample: string;
}

export interface APIDocsSection {
  id: string;
  type: 'apiDocs';
  title: string;
  subtitle?: string;
  items: APIEndpoint[];
}

export interface SectionBase {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
}

export interface FeatureGridSection extends SectionBase {
  type: 'featureGrid';
  items: FeatureItem[];
}

export interface PricingGridSection extends SectionBase {
  type: 'pricingGrid';
  items: PricingPlan[];
}

export interface CardsSection extends SectionBase {
  type: 'cards';
  items: CardItem[];
}

export interface PageData {
  slug: string;
  title: string;
  description: string;
  hero: {
    eyebrow: string;
    headline: string;
    text: string;
    actions: PageAction[];
  };
  sections: Array<FeatureGridSection | PricingGridSection | CardsSection | TextSection | ContactSection | APIDocsSection>;
}

export interface PageJson { pages: PageData[]; }
