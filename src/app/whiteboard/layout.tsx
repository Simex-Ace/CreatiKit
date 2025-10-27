import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '在线白板 - CreatiKit',
  description: '一个简单易用的在线白板工具，支持画笔、橡皮擦、文本和形状绘制',
};

export default function WhiteboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
}