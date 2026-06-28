import MarketingPage from '@/components/MarketingPage';
import { getPageData } from '@/lib/content';
import { notFound } from 'next/navigation';

export default function SecurityPage() {
    const pageData = getPageData('security');
    if (!pageData) {
        notFound();
    }

    return <MarketingPage pageData={pageData} />;
}
