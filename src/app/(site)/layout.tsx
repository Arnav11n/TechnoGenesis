import { ChatWidget } from "@/components/layout/chat-widget";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { IntroGate } from "@/components/layout/intro-gate";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SmoothScroll } from "@/components/layout/smooth-scroll";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IntroGate>
      <SmoothScroll />
      <CustomCursor />
      <ScrollProgress />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <ChatWidget />
    </IntroGate>
  );
}