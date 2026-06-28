import MarketingPage from '@/components/MarketingPage';
import { getPageData } from '@/lib/content';
import { notFound } from 'next/navigation';

export default function PricingPage() {
    const pageData = getPageData('pricing');
    if (!pageData) {
        notFound();
    }

    return <MarketingPage pageData={pageData} />;
}
