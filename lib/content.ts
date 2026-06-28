import pagesJson from '@/data/pages.json';
import { PageData, PageJson } from '@/types/marketing';

const pages = (pagesJson as PageJson).pages;

export function getPageData(slug: string): PageData | undefined {
  return pages.find((page) => page.slug === slug);
}

export function getAllPageSlugs(): string[] {
  return pages.map((page) => page.slug);
}
