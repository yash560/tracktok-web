import MarketingPage from '@/components/MarketingPage';
import { getPageData } from '@/lib/content';
import { notFound } from 'next/navigation';

export default function TermsPage() {
    const pageData = getPageData('terms');
    if (!pageData) {
        notFound();
    }

    return <MarketingPage pageData={pageData} />;
}
