import type { Metadata } from "next";
import "../styles/portfolio-layout.css";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "Milad Ajaz Bhat | Portfolio",
  description:
    "Personal portfolio of Milad Ajaz Bhat showcasing projects in AI, machine learning, web development, and software engineering.",
  metadataBase: new URL("https://m4milaad.tech"),
  authors: [{ name: "Milad Ajaz Bhat", url: "https://m4milaad.tech/" }],
  creator: "Milad Ajaz Bhat",
  // Let search and answer engines quote freely and show large previews
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 } },
  alternates: { canonical: "/" },
  verification: {
    google: "1qe3cEZmpUpCyhVnz2i2MsffDnyvi18DSo9KUl86Hjk",
  },
  openGraph: {
    title: "Milad Ajaz Bhat | Portfolio",
    description:
      "Portfolio showcasing projects in AI, ML, web development, and software engineering.",
    url: "/",
    siteName: "Milad Ajaz Bhat",
    images: [{ url: "/Images/logo.png" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Milad Ajaz Bhat | Portfolio",
    description:
      "Portfolio showcasing projects in AI, ML, web development, and software engineering.",
    images: ["/Images/logo.png"],
  },
  icons: {
    icon: [
      {
        url: "/Images/logo-light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/Images/logo-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/Images/logo-light.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-terminal-mode="modern" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* App Router: link tag fonts are fine for a single layout (legacy parity with index.html) */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("milad-embed-theme");if(t!=="dark")document.documentElement.classList.add("embed-site-light");}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
