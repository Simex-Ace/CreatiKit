'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, ChevronRight, Flame, ChevronDown, ChevronUp, ImageIcon, Box, Palette } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { LocalizedLink } from '@/components/LocalizedLink';
import { getOrderedArticles, type Article, getAuthorAvatarUrl, getCoverImageUrl } from '@/content/articles';

const FEATURED_COUNT = 3;
const orderedArticles = getOrderedArticles();
const featuredArticles = orderedArticles.slice(0, FEATURED_COUNT);
const restArticles = orderedArticles.slice(FEATURED_COUNT);

function formatDate(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale.startsWith('zh') ? 'zh-CN' : locale.startsWith('ja') ? 'ja-JP' : locale.startsWith('ko') ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const FEATURED_PLACEHOLDER_ICONS = [ImageIcon, Box, Palette];

function FeaturedCard({ article, index, locale }: { article: Article; index: number; locale: string }) {
  const { t } = useI18n();
  const gradients = [
    'from-rose-500/20 via-pink-500/10 to-transparent dark:from-rose-500/30 dark:via-pink-500/15',
    'from-violet-500/20 via-purple-500/10 to-transparent dark:from-violet-500/30 dark:via-purple-500/15',
    'from-amber-500/20 via-orange-500/10 to-transparent dark:from-amber-500/30 dark:via-orange-500/15',
  ];
  const PlaceholderIcon = FEATURED_PLACEHOLDER_ICONS[index] ?? BookOpen;
  return (
    <LocalizedLink href={`/blog/${article.slug}`} className="block h-full">
      <Card
        className={`relative h-full overflow-hidden border-2 border-transparent bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group flex flex-col`}
      >
        {/* 封面图区域：稳定图床 Picsum，避免失效 */}
        <div className="relative w-full aspect-[16/10] bg-muted overflow-hidden shrink-0">
          <Image
            src={article.coverImage || getCoverImageUrl(article.slug)}
            alt=""
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {!article.coverImage && (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} flex items-center justify-center pointer-events-none`}
            >
              <PlaceholderIcon className="h-12 w-12 sm:h-14 sm:w-14 text-primary/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-rose-500/90 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
            <Flame className="h-3 w-3" />
            {index === 0 ? t('blogPage.featuredBadge') : `#${index + 1}`}
          </div>
        </div>
        <div className="p-4 sm:p-5 flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={getAuthorAvatarUrl(article.author.id, 32)}
              alt=""
              className="h-8 w-8 rounded-full border border-border object-cover"
            />
            <span className="text-xs text-muted-foreground">{article.author.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wide">
              {article.locale === 'zh-CN' ? '中文' : article.locale === 'ja-JP' ? '日本語' : article.locale === 'ko-KR' ? '한국어' : 'EN'}
            </span>
          </div>
          <h3 className="font-bold text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 flex-1">
            {article.description}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(article.date, locale)}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              {t('blogPage.readMore')}
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </Card>
    </LocalizedLink>
  );
}

function ExpandableArticleCard({
  article,
  expanded,
  onToggle,
  dateLabel,
}: {
  article: Article;
  expanded: boolean;
  onToggle: () => void;
  dateLabel: string;
}) {
  const { t } = useI18n();
  return (
    <Card className="overflow-hidden border transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <img
              src={getAuthorAvatarUrl(article.author.id, 24)}
              alt=""
              className="h-6 w-6 rounded-full border border-border object-cover shrink-0"
            />
            <span className="text-xs text-muted-foreground">{article.author.name}</span>
            <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground uppercase">
              {article.locale === 'zh-CN' ? '中文' : article.locale === 'ja-JP' ? 'JA' : article.locale === 'ko-KR' ? 'KO' : 'EN'}
            </span>
          </div>
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2 pr-8">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{dateLabel}</span>
          </div>
        </div>
        <span className="shrink-0 rounded-md bg-muted/80 p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t bg-muted/30 px-4 sm:px-5 pb-4 sm:pb-5 pt-3">
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {article.description}
            </p>
            <LocalizedLink href={`/blog/${article.slug}`}>
              <Button variant="default" size="sm" className="gap-1.5">
                {t('blogPage.readMore')}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </LocalizedLink>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function BlogPage() {
  const { t, locale } = useI18n();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const localeStr = locale === 'en' ? 'en-US' : locale;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="relative border-b bg-gradient-to-br from-primary/5 via-background to-primary/10 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary shadow-sm mb-5">
              <BookOpen className="h-7 w-7" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              {t('blogPage.title')}
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              {t('blogPage.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-5xl">
        {/* 热门文章 */}
        <section className="mb-12 sm:mb-14">
          <div className="flex items-baseline gap-2 mb-6">
            <Flame className="h-5 w-5 text-rose-500" />
            <h2 className="text-xl sm:text-2xl font-bold">
              {t('blogPage.featuredArticles')}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            {t('blogPage.featuredArticlesDesc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredArticles.map((article, i) => (
              <FeaturedCard key={article.slug} article={article} index={i} locale={localeStr} />
            ))}
          </div>
        </section>

        {/* 全部文章（可展开） */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            {t('blogPage.allArticles')}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            {t('blogPage.articleList')}
          </p>
          <div className="space-y-3">
            {restArticles.map((article, i) => (
              <ExpandableArticleCard
                key={article.slug}
                article={article}
                expanded={expandedIndex === i}
                onToggle={() => setExpandedIndex((prev) => (prev === i ? null : i))}
                dateLabel={`${t('blogPage.publishedOn')} ${formatDate(article.date, localeStr)}`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
