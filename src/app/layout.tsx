import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ViewportLock } from "@/components/layout/viewport-lock";
import { DESIGN_H, DESIGN_W } from "@/lib/design";
import "./globals.css";
import "./light.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz", "wdth"],
  display: "swap",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TechnoGenesis: The Birth of a New World",
    template: "%s · TechnoGenesis",
  },
  description:
    "An interactive exploration of how AI, biotechnology and robotics are creating new forms of life.",
};

export const viewport: Viewport = {
  themeColor: "#040706",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Runs before the page paints: applies the saved theme (dark by default).
const themeScript = `(function(){try{var t=localStorage.getItem('tg-theme');if(t!=='light'&&t!=='dark'){t='dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;

// Runs before the page paints: sets the scale so the site fills this screen the same way.
const scaleScript = `(function(){try{var w=window.innerWidth,h=window.innerHeight,s=1;if(w>=1024){s=Math.min(w/${DESIGN_W},h/${DESIGN_H});s=Math.max(0.6,Math.min(1.8,s))}document.documentElement.style.fontSize=(16*s)+'px'}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: scaleScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <ViewportLock />
      </body>
    </html>
  );
}