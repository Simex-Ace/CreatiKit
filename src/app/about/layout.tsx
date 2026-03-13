import { AboutFAQPageSchema } from '@/components/FAQPageSchema';

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AboutFAQPageSchema />
      {children}
    </>
  );
}
