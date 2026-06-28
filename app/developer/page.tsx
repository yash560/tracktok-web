import MarketingPage from '@/components/MarketingPage';
import { getPageData } from '@/lib/content';
import { notFound } from 'next/navigation';

export default function DeveloperPage() {
  const pageData = getPageData('developer');
  if (!pageData) {
    notFound();
  }

  return <MarketingPage pageData={pageData} />;
}
