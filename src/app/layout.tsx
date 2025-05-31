import "./globals.css";
import { Providers } from "./providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AttendTrack - Система учёта посещаемости",
  description: "Современная система учёта посещаемости студентов",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
