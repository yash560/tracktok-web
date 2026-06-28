import MarketingPage from '@/components/MarketingPage';
import { getPageData } from '@/lib/content';
import { notFound } from 'next/navigation';

export default function ContactPage() {
  const pageData = getPageData('contact');
  if (!pageData) {
    notFound();
  }

  return <MarketingPage pageData={pageData} />;
}
