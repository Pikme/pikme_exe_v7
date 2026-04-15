import { ReactNode, useState } from "react";
import { Link } from "wouter";
import { Menu, X, LayoutDashboard, Plane, MapPin, Layers, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Breadcrumb, BreadcrumbItem } from "@/components/Breadcrumb";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function AdminLayout({ children, title, description, breadcrumbs }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  const adminNavItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Tours", href: "/admin/tours", icon: Plane },
    { label: "Locations", href: "/admin/locations", icon: MapPin },
    { label: "States", href: "/admin/states", icon: Layers },
    { label: "Cities", href: "/admin/cities", icon: MapPin },
    { label: "Categories", href: "/admin/categories", icon: Layers },
  ];

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/admin" className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:opacity-80 transition-opacity">
              <Plane className="w-6 h-6" />
              <span>Pikme Admin</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side - User Menu */}
            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <span>{user.name || user.email}</span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden md:flex"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-md"
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
            <nav className="md:hidden mt-4 pt-4 border-t border-gray-200 flex flex-col gap-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
          {title && (
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
              {description && (
                <p className="text-gray-600">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 Pikme Admin. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
