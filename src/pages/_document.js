// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Favicon link */}
        <link rel="icon" href="/favicon.png" />
        {/* Optional: Default page title */}
        <title>Red Pepe Pixies</title>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}