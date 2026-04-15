import { ReactNode } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { label: t("nav.tours"), href: "/tours" },
    { label: t("nav.destinations"), href: "/countries" },
    { label: t("nav.states"), href: "/states" },
    { label: t("nav.categories"), href: "/categories" },
    { label: "Activities", href: "/activities" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="https://pikme.in/cdn/logo-banner/pikme-logo-800-400.png" alt="Pikme Logo" className="h-10" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <nav className="flex items-center gap-4">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} asChild>
                    <Button variant="ghost" size="sm" className="rounded-full text-gray-900 hover:text-red-600 hover:bg-gray-100 transition-colors">
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>

              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* Admin Button */}
              {isAuthenticated && user?.role === "admin" && (
                <Link href="/admin" asChild>
                  <Button variant="ghost" size="sm" className="rounded-full text-gray-900 hover:text-red-600 hover:bg-gray-100 transition-colors">
                    {t("nav.admin")}
                  </Button>
                </Link>
              )}

              {/* Login Button */}
              {!isAuthenticated && (
                <a href={getLoginUrl()}>
                  <Button variant="ghost" size="sm" className="rounded-full text-gray-900 hover:text-red-600 hover:bg-gray-100 transition-colors">
                    {t("nav.login")}
                  </Button>
                </a>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher />
              {isAuthenticated && user?.role === "admin" && (
                <Link href="/admin" asChild>
                  <Button variant="ghost" size="sm" className="rounded-full text-gray-900 hover:text-red-600 hover:bg-gray-100 transition-colors">
                    {t("nav.admin")}
                  </Button>
                </Link>
              )}
              <button
                className="p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-border flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Single Line Footer */}
          <div className="flex flex-wrap items-start justify-between gap-6">
            {/* Brand */}
            <div className="flex-shrink-0">
              <h3 className="font-bold text-sm mb-2">{t("footer.brand")}</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                {t("footer.description")}
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex-shrink-0">
              <h4 className="font-semibold text-sm mb-2">{t("footer.quickLinks")}</h4>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="flex-shrink-0">
              <h4 className="font-semibold text-sm mb-2">{t("footer.company")}</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/about-us" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {t("footer.about")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {t("footer.contact")}
                  </Link>
                </li>
                <li>
                  <Link href="/additional-info" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Additional Info
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="flex-shrink-0">
              <h4 className="font-semibold text-sm mb-2">Resources</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/seo-enhancement-guide" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    SEO Enhancement Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* Policies */}
            <div className="flex-shrink-0">
              <h4 className="font-semibold text-sm mb-2">Policies</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Terms & Condition
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cancellation-policy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Cancellation Policy
                  </Link>
                </li>
                <li>
                  <Link href="/additional-info" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Additional Info
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="flex-shrink-0">
              <h4 className="font-semibold text-sm mb-2">{t("footer.contact")}</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Email: tours@pikme.org</li>
                <li>Phone: +91 80883 79983</li>
                <li>Phone: +91 98459 91455</li>
                <li className="max-w-xs">Address: 740, 5th Block, 20th Cross, Bashyam Circle, Rajajinagar, Bangalore – 560010</li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Pikme. {t("footer.allRights")}
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/terms-and-conditions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.terms")}
              </Link>
              <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.privacy")}
              </Link>
              <Link href="/additional-info" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.cookies")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
