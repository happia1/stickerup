import type { Metadata } from "next";
import "./globals.css";
import { AppStoreProvider } from "@/lib/store/provider";
import { ToastProvider } from "@/lib/toast/provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://stickerup.vercel.app"),
  title: "StickerUp",
  icons: {
    icon: [
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/brand/favicon-180x180.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "StickerUp",
    description: "학원 출석·숙제·칭찬 스티커 랭킹 앱",
    images: [{ url: "/brand/bar.png", width: 1731, height: 909, alt: "StickerUp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "StickerUp",
    description: "학원 출석·숙제·칭찬 스티커 랭킹 앱",
    images: ["/brand/bar.png"],
  },
  description: "학원 출석/숙제/칭찬 스티커 랭킹 앱",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AppStoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppStoreProvider>
      </body>
    </html>
  );
}
