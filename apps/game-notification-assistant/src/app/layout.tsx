import type { Metadata } from 'next';

import { SnackbarManager } from '@repo/ui';
import { CustomQueryClientProvider } from '@shared/providers/custom-query-client-provider';
import { Analytics } from '@vercel/analytics/next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: `게임 알림 어시스턴트`,
  description: `게임 이용자가 게임에서 이미지를 캡처해 해당 시간이 도래하면 알림을 받을 수 있도록 하는 AI 어시스턴트`,
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CustomQueryClientProvider>
          {children}
          <SnackbarManager maxSnackbars={5} />
        </CustomQueryClientProvider>
        <Analytics />
        <div id="modal-root" />
      </body>
    </html>
  );
}
