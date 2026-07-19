import type { Metadata } from "next";
import "./globals.css";
import { AppStoreProvider } from "@/lib/store/provider";
import { ToastProvider } from "@/lib/toast/provider";

export const metadata: Metadata = {
  title: "StickerUp",
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
