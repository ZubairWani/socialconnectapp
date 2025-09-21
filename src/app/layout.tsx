// src/app/layout.tsx
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css"; // Global CSS styles
import { Toaster } from "sonner";
// Define fonts
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "SocialConnect - Connect & Share",
    template: "%s | SocialConnect - Social Networking for Everyone",
  },
  description:
    "SocialConnect is a modern social networking app built to help people connect, share, and grow together. Engage with your community through posts, comments, and real-time interactions.",
  keywords: [
    "social networking",
    "community app",
    "friends connect",
    "share posts",
    "social feed",
    "real-time notifications",
    "user profiles",
    "connect online",
    "SocialConnect",
    "social media platform",
  ],
  authors: [{ name: "Zubair", url: "#" }],
  creator: "Zubair",
  publisher: "Zubair",
  category: "Social Networking",
  applicationName: "SocialConnect",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  alternates: {
    canonical: "https://socialconnect.io",
    languages: {
      "en-US": "https://socialconnect.io",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://socialconnect.io",
    title: "SocialConnect - Connect & Share",
    description:
      "A next-gen social networking app to share posts, connect with friends, and stay updated in real time.",
    siteName: "SocialConnect",
    images: [
      {
        url: "https://socialconnect.io/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SocialConnect - Social Networking Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@socialconnect",
    creator: "@zubair",
    title: "SocialConnect - Connect with Your World",
    description:
      "Discover SocialConnect, the social networking app designed to bring people together. Share posts, engage with friends, and grow your network.",
    images: ["https://socialconnect.io/twitter-card.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1D4ED8" }, 
    { media: "(prefers-color-scheme: dark)", color: "#0A192F" }, 
  ],
  verification: {
    google: "your-google-site-verification-code", 
    yandex: "your-yandex-verification-code",
  },
  appleWebApp: {
    title: "SocialConnect",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  manifest: "https://socialconnect.io/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#1D4ED8" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="antialiased text-gray-800 bg-white dark:text-gray-200 dark:bg-gray-900">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
