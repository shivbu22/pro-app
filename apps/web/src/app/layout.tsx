import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniCut Pro | Premiere Pro-Grade Generative AI Video Studio",
  description: "Next-generation multi-track NLE with conversational AI director and 1-prompt video assembly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen w-screen overflow-hidden bg-pro-darkest text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
