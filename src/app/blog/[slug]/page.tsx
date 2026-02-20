import Image from 'next/image';
import { notFound } from 'next/navigation';
import { articles, getAuthorAvatarUrl } from '@/content/articles';
import type { Metadata } from 'next';

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) return { title: 'Blog | CreatiKit' };
  return {
    title: `${article.title} | CreatiKit Blog`,
    description: article.description,
  };
}

function getDateLocale(locale: string): string {
  if (locale === 'zh-CN') return 'zh-CN';
  if (locale === 'ja-JP') return 'ja-JP';
  if (locale === 'ko-KR') return 'ko-KR';
  return 'en-US';
}

export default async function BlogArticlePage({ params }: Props) {
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) notFound();

  const dateLocale = getDateLocale(article.locale);
  const inlineMap = new Map<number, { src: string; alt?: string }[]>();
  if (article.inlineImages?.length) {
    for (const img of article.inlineImages) {
      const list = inlineMap.get(img.afterParagraph) ?? [];
      list.push({ src: img.src, alt: img.alt });
      inlineMap.set(img.afterParagraph, list);
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <img
              src={getAuthorAvatarUrl(article.author.id, 40)}
              alt=""
              className="h-10 w-10 rounded-full border border-border object-cover"
            />
            <span className="font-medium text-foreground">{article.author.name}</span>
            <span>·</span>
            <time dateTime={article.date}>
              {new Date(article.date).toLocaleDateString(dateLocale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span className="px-2 py-0.5 rounded bg-muted text-xs uppercase tracking-wide">
              {article.locale === 'zh-CN' ? '中文' : article.locale === 'ja-JP' ? '日本語' : article.locale === 'ko-KR' ? '한국어' : 'EN'}
            </span>
          </div>
        </header>
        <div className="space-y-4">
          {article.body.map((paragraph, i) => (
            <div key={i}>
              <p className="leading-relaxed">{paragraph}</p>
              {inlineMap.get(i)?.map((img, j) => (
                <figure key={j} className="my-6 rounded-lg overflow-hidden border border-border">
                  <div className="relative aspect-video w-full">
                    <Image
                      src={img.src}
                      alt={img.alt ?? ''}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 720px"
                    />
                  </div>
                  {img.alt ? (
                    <figcaption className="text-center text-sm text-muted-foreground mt-2 px-2">
                      {img.alt}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
