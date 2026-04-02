import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Force light mode and consistent browser theme */}
        <meta name="color-scheme" content="light only" />
        <meta name="theme-color" content="#ffffff" />
        
         <link rel="icon" type="image/png" href="/favcon.png" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />

        {/* ── Google Ads Tag ── */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18025452387"
          strategy="afterInteractive"
        />
        <Script
          id="google-ads"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18025452387');
            `,
          }}
        />
      </body>
    </Html>
  );
}