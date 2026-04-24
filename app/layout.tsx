import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Yadav Narayan — Video Editor & Motion Designer",
  description:
    "Video editor and motion designer crafting cinematic stories for brands. Specializing in high-energy promos, podcasts, and branded content with sharp attention to detail and purposeful editing.",
  keywords: [
    "video editing",
    "freelance video editor",
    "adobe premiere",
    "adobe premiere rush",
    "youtube editor",
    "ae video editor",
    "editing studio",
    "youtube studio editor",
    "film and video editor",
    "best editing",
    "video editing service",
    "fiverr video editing",
    "video editing company",
    "video editing agency",
    "video editing services",
    "youtube video editing",
    "remote video editing",
    "video editing prices",
    "editing subtitles",
    "online youtube video editing",
    "videography podcast",
  ],
  verification: {
    google: "_9knsxL2pOkLm4PIib7Wx8PCbMovdeEyBZ3DdD7jHjY",
  },
  openGraph: {
    title: "Yadav Narayan — Video Editor & Motion Designer",
    description:
      "A living showreel — cinematic portfolio showcasing high-end video editing and motion design work.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yadav Narayan — Video Editor & Motion Designer",
    description:
      "A living showreel — cinematic portfolio showcasing high-end video editing and motion design work.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="dns-prefetch" href="https://www.youtube-nocookie.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://s.ytimg.com" />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K5DQEXMX86"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-K5DQEXMX86');
            `,
          }}
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Yadav Narayan",
              url: "https://www.yadavnarayan.in",
              image: "https://www.yadavnarayan.in/images/creator-portrait.jpg",
              jobTitle: "Video Editor & Motion Designer",
              description:
                "Video editor and motion designer based in Hyderabad, India. Specializing in motion graphics, brand animation, and video storytelling.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Hyderabad",
                addressCountry: "India",
              },
              worksFor: {
                "@type": "Organization",
                name: "Happening Design Studio Pvt Ltd",
              },
              sameAs: [
                "https://www.instagram.com/bhukamendak",
                "https://youtube.com/@bhukamendak",
                "https://www.linkedin.com/in/yadavnarayan",
                "https://x.com/bhukamendak",
                "https://www.facebook.com/yadav.narayan.18",
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
