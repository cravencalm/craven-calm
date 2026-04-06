import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Craven Calm | Gothic Music, Ethereal Art & Dark Academia Relaxation",
  description: "Immerse yourself in hauntingly beautiful gothic ambient music and ethereal wall art. Perfect for deep focus, dark academia study, and soulful relaxation.",
  keywords: ["gothic music", "dark academia art", "ethereal artwork", "metal framed posters", "relaxation music", "study music", "atmospheric art", "craven calm"],
  openGraph: {
    title: "Craven Calm | Gothic Music & Ethereal Art",
    description: "Immerse yourself in hauntingly beautiful gothic ambient music and ethereal dark academia art.",
    url: "https://www.cravencalm.com",
    siteName: "Craven Calm",
    images: [
      {
        url: "/assets/hero_background_1775220241660.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Craven Calm | Gothic Ambient Music",
    description: "Hauntingly beautiful ambient music for the soul.",
    images: ["/assets/hero_background_1775220241660.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=IM+Fell+English:ital@0;1&family=Almendra:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
