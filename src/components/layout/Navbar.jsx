import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

/**
 * Top navigation bar with brand, in-page links and auth actions.
 */
const Navbar = () => {
  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#artisans", label: "Find Artisans" },
    { href: "#how-it-works", label: "How It Works" },
  ];

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" className="flex items-center gap-2" aria-label="Majirani Skills home">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl">
            M
          </div>
          <span className="font-bold text-xl text-foreground">Majirani Skills</span>
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
          <Button variant="outline">Sign In</Button>
          <Button>Join as Artisan</Button>
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
};

export default Navbar;