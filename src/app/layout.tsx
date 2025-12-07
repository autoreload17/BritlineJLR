import type { Metadata } from "next";
import Link from "next/link";
import MobileMenu from "@/components/MobileMenu";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NavLinks from "@/components/NavLinks";
import Footer from "@/components/Footer";
import { TelegramIcon, InstagramIcon, WhatsAppIcon } from "@/components/SocialIcons";
import Logo from "@/components/Logo";
import AnimatedFavicon from "@/components/AnimatedFavicon";
import "./globals.css";

export const metadata: Metadata = {
  title: "Britline JLR",
  description:
    "Britline JLR — премиальный сервис чип-тюнинга, ретрофитинга и ремонта для Land Rover и Jaguar. Специализируемся на установке заводских систем, активации скрытых функций, индивидуальном чип-тюнинге, оригинальных аксессуарах и профессиональном ремонте. Раскройте истинный потенциал вашего премиального автомобиля.",
  metadataBase: new URL("https://www.britline-jlr.com"),
  icons: { 
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon.ico", sizes: "32x32" }
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml", sizes: "180x180" }
    ],
    shortcut: [
      { url: "/apple-icon.svg", type: "image/svg+xml" }
    ]
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "https://www.britline-jlr.com",
  },
  openGraph: {
    title: "Britline JLR",
    description:
      "Britline JLR — премиальный сервис чип-тюнинга, ретрофитинга и ремонта для Land Rover и Jaguar. Специализируемся на установке заводских систем, активации скрытых функций, индивидуальном чип-тюнинге, оригинальных аксессуарах и профессиональном ремонте. Раскройте истинный потенциал вашего премиального автомобиля.",
    url: "https://www.britline-jlr.com",
    siteName: "Britline JLR",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "https://www.britline-jlr.com/logos/land-rover.png",
        width: 1200,
        height: 630,
        alt: "Britline JLR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Britline JLR",
    description:
      "Britline JLR — премиальный сервис чип-тюнинга, ретрофитинга и ремонта для Land Rover и Jaguar. Специализируемся на установке заводских систем, активации скрытых функций, индивидуальном чип-тюнинге, оригинальных аксессуарах и профессиональном ремонте.",
    images: ["https://www.britline-jlr.com/logos/land-rover.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)]">
        <AnimatedFavicon />
        <LanguageProvider>
          <header className="sticky top-0 z-50 glass">
            <nav className="container-padded mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="shrink-0 flex flex-col items-center logo-wrapper">
                <Logo />
                {/* Зеленая декоративная полоска с свечением - адаптирована под ширину логотипа */}
                <div 
                  className="mt-1 mx-auto flex-shrink-0 logo-stripe"
                  style={{
                    width: '100%',
                    height: 'clamp(2px, 0.6vw, 3px)',
                    background: 'linear-gradient(to right, rgba(0, 66, 37, 0.2) 0%, rgba(0, 66, 37, 0.7) 15%, #004225 35%, #004225 65%, rgba(0, 66, 37, 0.7) 85%, rgba(0, 66, 37, 0.2) 100%)',
                    borderRadius: '2px',
                    boxShadow: '0 0 15px rgba(0, 66, 37, 0.9), 0 0 8px rgba(0, 66, 37, 0.5)',
                    display: 'block',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
              </div>
              
              {/* Desktop Navigation - показывается на lg и выше (1024px+) */}
              <div className="hidden lg:flex items-center gap-1.5 lg:gap-2 xl:gap-3 2xl:gap-4 text-xs lg:text-sm xl:text-base">
                <NavLinksClient />
              </div>
              
              {/* Desktop Right Side - показывается на lg и выше (1024px+) */}
              <div className="hidden lg:flex items-center gap-1.5 lg:gap-2 xl:gap-3 2xl:gap-4 shrink-0">
                <LanguageSwitcher />
                <div className="flex items-center gap-1 lg:gap-1.5 xl:gap-2">
                  <a
                    href="https://t.me/lr_chip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    aria-label="Telegram"
                  >
                    <TelegramIcon size={16} className="lg:w-[18px] lg:h-[18px]" />
                  </a>
                  <a
                    href="https://instagram.com/ir_chip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    aria-label="Instagram"
                  >
                    <InstagramIcon size={16} className="lg:w-[18px] lg:h-[18px]" />
                  </a>
                  <a
                    href="https://wa.me/447840000321"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon size={16} className="lg:w-[18px] lg:h-[18px]" />
                  </a>
                </div>
                {/* Телефоны - показываются только на xl и выше (1280px+) */}
                <div className="hidden xl:flex items-center gap-2 2xl:gap-3 text-xs xl:text-sm font-medium">
                  <a href="tel:+447840000321" className="hover:opacity-80 transition-opacity whitespace-nowrap">0784 0000 321</a>
                  <a href="tel:+441622801501" className="hover:opacity-80 transition-opacity whitespace-nowrap">01622 801 501</a>
                </div>
              </div>
              
              {/* Mobile Menu Button - показывается только на мобильных */}
              <MobileMenu />
            </nav>
          </header>
          <main className="min-h-[calc(100dvh-56px)] sm:min-h-[calc(100dvh-64px)]">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}

function NavLinksClient() {
  return <NavLinks />;
}
