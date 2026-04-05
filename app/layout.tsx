import type { Metadata } from "next";
import "../styles/portfolio-layout.css";

export const metadata: Metadata = {
  title: "Milad Ajaz Bhat | Portfolio",
  description:
    "Personal portfolio of Milad Ajaz Bhat showcasing projects in AI, machine learning, web development, and software engineering.",
  metadataBase: new URL("https://m4milaad.github.io"),
  alternates: { canonical: "/" },
  verification: {
    google: "1qe3cEZmpUpCyhVnz2i2MsffDnyvi18DSo9KUl86Hjk",
  },
  openGraph: {
    title: "Milad Ajaz Bhat | Portfolio",
    description:
      "Portfolio showcasing projects in AI, ML, web development, and software engineering.",
    url: "https://m4milaad.github.io/",
    siteName: "Milad Ajaz Bhat",
    images: [{ url: "https://m4milaad.github.io/Images/logo.png" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Milad Ajaz Bhat | Portfolio",
    description:
      "Portfolio showcasing projects in AI, ML, web development, and software engineering.",
    images: ["https://m4milaad.github.io/Images/logo.png"],
  },
  icons: {
    icon: "/Images/logo.png",
    apple: "/Images/logo.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Milad Ajaz Bhat",
  url: "https://m4milaad.github.io/",
  image: "https://m4milaad.github.io/Images/logo.png",
  sameAs: [
    "https://github.com/m4milaad",
    "https://www.linkedin.com/in/m4milaad/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-terminal-mode="modern">
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
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&family=VT323&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("milad-embed-theme");if(t==="light")document.documentElement.classList.add("embed-site-light");}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
