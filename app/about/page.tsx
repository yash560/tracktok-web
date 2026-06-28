import MarketingPage from '@/components/MarketingPage';
import { getPageData } from '@/lib/content';
import { notFound } from 'next/navigation';

export default function AboutPage() {
    const pageData = getPageData('about');
    if (!pageData) {
        notFound();
    }

    return <MarketingPage pageData={pageData} />;
}
