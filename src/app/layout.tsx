import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { UIProvider } from "@/components/providers/UIProvider";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const ibmPlex = IBM_Plex_Sans_Thai({
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  subsets: ["thai", "latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#0D0D0D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  title: "JamDai — จำได้ | AI-Powered Life Organizer",
  description:
    "ผู้ช่วยความจำ AI ส่วนตัว บันทึกโน้ต รูปภาพ ข้อความ แล้วถาม AI ได้ทุกเวลา",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JamDai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} ${ibmPlex.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-[100dvh] bg-base text-text-hi antialiased">
        <ThemeProvider>
          <UIProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="bottom-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "var(--color-elevated)",
                    color: "var(--color-text-hi)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                  },
                }}
              />
            </AuthProvider>
          </UIProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
