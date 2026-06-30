import { MarketingNav } from '@/components/MarketingNav';
import { MarketingFooter } from '@/components/MarketingFooter';

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <div className="pt-16">
        {children}
      </div>
      <MarketingFooter />
    </>
  );
}
