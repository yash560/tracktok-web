'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Bell,
    BarChart3,
    Brain,
    Download,
    Lock,
    MessageSquare,
    Shield,
    ShieldCheck,
    Sparkles,
    Tag,
    TrendingDown,
    Users,
    Wallet,
    Zap,
    AlertTriangle,
    CheckCircle,
    MapPin,
} from 'lucide-react';
import { PageData, FeatureItem, PricingPlan, CardItem, APIEndpoint, ContactItem, PageAction } from '@/types/marketing';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Zap,
    BarChart3,
    Tag,
    Users,
    MapPin,
    MessageSquare,
    ShieldCheck,
    Shield,
    TrendingDown,
    Wallet,
    Bell,
    Download,
    Brain,
    Sparkles,
    AlertTriangle,
    CheckCircle,
};

function renderIcon(iconName: string) {
    const Icon = iconMap[iconName] ?? ArrowRight;
    return <Icon className="w-6 h-6 text-primary" />;
}

function ActionButton({ action }: { action: PageAction }) {
    const className = action.variant === 'primary'
        ? 'btn-primary'
        : action.variant === 'secondary'
            ? 'btn-secondary'
            : 'btn-outline';

    return (
        <Link href={action.href} className={`${className} inline-flex items-center justify-center gap-2`}>
            {action.label}
            {action.variant === 'primary' && <ArrowRight className="w-4 h-4" />}
        </Link>
    );
}

function FeatureGrid({ section }: { section: { title: string; subtitle?: string; items: FeatureItem[] } }) {
    return (
        <section className="space-y-6">
            <div className="max-w-3xl">
                <h2 className="section-header">{section.title}</h2>
                {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {section.items.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="card-hover min-h-[220px]"
                    >
                        <div className={`flex items-center justify-center h-14 w-14 rounded-3xl bg-gradient-to-br ${item.accent ?? 'from-primary to-secondary'} text-white mb-5`}>
                            {renderIcon(item.icon)}
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function PricingGrid({ section }: { section: { title: string; subtitle?: string; items: PricingPlan[] } }) {
    return (
        <section className="space-y-6">
            <div className="max-w-3xl">
                <h2 className="section-header">{section.title}</h2>
                {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {section.items.map((plan, idx) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.08 }}
                        className={`rounded-[32px] border p-8 shadow-card transition-all duration-300 ${plan.featured ? 'border-primary/20 bg-white dark:bg-dark-card shadow-primary' : 'border-gray-200 dark:border-gray-800 bg-surface dark:bg-dark-card'}`}
                    >
                        <div className="flex items-center justify-between gap-2 mb-6">
                            <div>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                                <p className="text-sm text-gray-500">{plan.description}</p>
                            </div>
                            {plan.featured && <span className="badge badge-primary">Popular</span>}
                        </div>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{plan.price}</p>
                        <ul className="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
                            {plan.bullets.map((bullet) => (
                                <li key={bullet} className="flex items-start gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register" className={`inline-flex items-center justify-center w-full rounded-2xl px-5 py-3 font-semibold transition ${plan.featured ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-slate-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            Choose {plan.name}
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function CardsSection({ section }: { section: { title: string; subtitle?: string; items: CardItem[] } }) {
    return (
        <section className="space-y-6">
            <div className="max-w-3xl">
                <h2 className="section-header">{section.title}</h2>
                {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {section.items.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="card-hover"
                    >
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-secondary/10 text-secondary">
                            {renderIcon(item.icon)}
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function TextSection({ section }: { section: { title: string; content: string[] } }) {
    return (
        <section className="space-y-6">
            <div className="max-w-3xl">
                <h2 className="section-header">{section.title}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {section.content.map((text, idx) => (
                    <div key={idx} className="rounded-[28px] border border-gray-200 dark:border-gray-800 bg-surface dark:bg-dark-card p-6 shadow-card">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function ContactSection({ section }: { section: { title: string; subtitle?: string; items: ContactItem[] } }) {
    return (
        <section className="space-y-8" id="contact-form">
            <div className="max-w-3xl">
                <h2 className="section-header">{section.title}</h2>
                {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-4">
                    {section.items.map((item) => (
                        <div key={item.title} className="rounded-[28px] border border-gray-200 dark:border-gray-800 bg-surface dark:bg-dark-card p-6 shadow-card">
                            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">{item.title}</p>
                            <p className="text-lg font-semibold mt-2">{item.value}</p>
                            <p className="text-sm text-gray-500 mt-2">{item.subtitle}</p>
                        </div>
                    ))}
                </div>
                <form className="rounded-[32px] border border-gray-200 dark:border-gray-800 bg-elevated dark:bg-dark-card p-8 shadow-card space-y-5">
                    <div>
                        <label className="input-label" htmlFor="name">Name</label>
                        <input id="name" type="text" className="input-field" placeholder="Your name" />
                    </div>
                    <div>
                        <label className="input-label" htmlFor="email">Email</label>
                        <input id="email" type="email" className="input-field" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="input-label" htmlFor="message">Message</label>
                        <textarea id="message" rows={6} className="input-field" placeholder="How can we help?"></textarea>
                    </div>
                    <button type="button" className="btn-primary w-full text-center">Send message</button>
                </form>
            </div>
        </section>
    );
}

function APIDocsSection({ section }: { section: { title: string; subtitle?: string; items: APIEndpoint[] } }) {
    return (
        <section className="space-y-8" id="api-reference">
            <div className="max-w-3xl">
                <h2 className="section-header">{section.title}</h2>
                {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
            </div>
            <div className="grid gap-6">
                {section.items.map((endpoint, idx) => (
                    <motion.div
                        key={endpoint.path}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.07 }}
                        className="rounded-[32px] border border-gray-200 dark:border-gray-800 bg-surface dark:bg-dark-card p-6 shadow-card"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">{endpoint.method}</p>
                                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{endpoint.path}</p>
                            </div>
                            <div className="rounded-full bg-secondary/10 px-3 py-1 text-sm text-secondary">API</div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{endpoint.summary}</p>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Request body</p>
                                <pre className="rounded-3xl bg-slate-950/90 p-4 overflow-x-auto text-sm text-white"><code>{endpoint.requestBody}</code></pre>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Example response</p>
                                <pre className="rounded-3xl bg-slate-950/90 p-4 overflow-x-auto text-sm text-white"><code>{endpoint.responseExample}</code></pre>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

export default function MarketingPage({ pageData }: { pageData: PageData }) {
    return (
        <main className="py-16 sm:py-20 px-4 sm:px-6 md:px-12 bg-skin-base dark:bg-dark-bg">
            <div className="max-w-7xl mx-auto space-y-16">
                <section className="rounded-[46px] border border-gray-200/80 dark:border-gray-800 bg-elevated dark:bg-dark-card p-10 shadow-primary backdrop-blur-xl">
                    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
                        <div className="space-y-6">
                            <p className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-xs uppercase tracking-[0.3em] font-semibold text-secondary w-max">
                                {pageData.hero.eyebrow}
                            </p>
                            <h1 className="section-header max-w-3xl">{pageData.hero.headline}</h1>
                            <p className="section-subtitle max-w-2xl">{pageData.hero.text}</p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                {pageData.hero.actions.map((action) => (
                                    <ActionButton key={action.label} action={action} />
                                ))}
                            </div>
                        </div>
                        <div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-primary/5 via-secondary/10 to-transparent p-6 shadow-2xl">
                            <div className="h-full rounded-[28px] bg-slate-50/80 p-6 text-center text-gray-700 dark:bg-slate-900/80 dark:text-gray-100">
                                <p className="text-sm uppercase tracking-[0.2em] text-secondary">Page snapshot</p>
                                <div className="mt-8 h-48 rounded-[28px] bg-gradient-to-br from-slate-950 to-slate-800 shadow-inner" />
                            </div>
                        </div>
                    </div>
                </section>

                {pageData.sections.map((section) => {
                    switch (section.type) {
                        case 'featureGrid':
                            return <FeatureGrid key={section.id} section={section} />;
                        case 'pricingGrid':
                            return <PricingGrid key={section.id} section={section} />;
                        case 'cards':
                            return <CardsSection key={section.id} section={section} />;
                        case 'text':
                            return <TextSection key={section.id} section={section} />;
                        case 'contact':
                            return <ContactSection key={section.id} section={section} />;
                        case 'apiDocs':
                            return <APIDocsSection key={section.id} section={section} />;
                        default:
                            return null;
                    }
                })}
            </div>
        </main>
    );
}
