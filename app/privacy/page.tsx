import MarketingPage from '@/components/MarketingPage';
import { getPageData } from '@/lib/content';
import { notFound } from 'next/navigation';

export default function PrivacyPage() {
  const pageData = getPageData('privacy');
  if (!pageData) {
    notFound();
  }

  return <MarketingPage pageData={pageData} />;
}
