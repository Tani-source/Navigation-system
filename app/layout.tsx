import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Predictive Routing & Discrete Mathematics | NK Studio Style",
  description: "Next-generation discrete mathematics and predictive routing engine inspired by NK Studio design.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-black font-sans selection:bg-[#00ffc2] selection:text-black">
        {children}
      </body>
    </html>
  );
}

