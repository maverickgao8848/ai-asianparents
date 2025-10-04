import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 严父 控制台',
  description: 'Monitor digital discipline trends and configure AI personas.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
