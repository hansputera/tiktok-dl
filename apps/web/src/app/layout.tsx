import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TikTok-DL",
  description: "An Open-Source Project where it could download TikTok's Video without annoying ads!",
  keywords: 'tiktok-downloader, tiktokdl, tiktok, download video tiktok, tiktok no watermark',
  authors: {
    name: 'Hanif Dwy Putra S.',
    url: 'https://hanifu.id',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
