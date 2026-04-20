import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

/**
 * Top navigation bar with brand, in-page links and auth actions.
 */
const Navbar = () => {
  const location = useLocation();
  const isSignInPage = location.pathname === "/signin";
  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#artisans", label: "Find Artisans" },
    { href: "#how-it-works", label: "How It Works" },
  ];

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" className="flex items-center gap-1 text-primary hover:opacity-90 transition-opacity" aria-label="Majirani Skills home">
          <Logo className="w-14 h-14 mix-blend-multiply object-contain contrast-[1.1]" />
          <span className="font-extrabold text-2xl text-foreground">Majirani Skills</span>
        </a>

        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          {!isSignInPage && (
            <Button variant="outline" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          )}
          <Button asChild>
            <Link to="/signup">Join as Artisan</Link>
          </Button>
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
};

export default Navbar;