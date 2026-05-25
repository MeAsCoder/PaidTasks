import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paid Jobs to Mpesa — Earn Real Money From Your Phone",
  description: "Complete surveys, AI tasks & data annotation jobs. Get paid instantly to your Mpesa. Join 50,000+ Kenyans earning daily.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
