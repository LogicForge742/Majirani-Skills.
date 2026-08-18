import { Button } from "@/components/ui/button";
import { Menu, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

/**
 * Top navigation bar with brand, in-page links and auth actions.
 */
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignInPage = location.pathname === "/signin";

  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "ADMIN") return "/admin/verifications"; // Redirect to admin verifications list or admin dashboard
    if (user.role === "ARTISAN") return "/artisan/dashboard";
    return "/client/dashboard";
  };

  const navLinks = [
    { href: "/#services", label: "Services" },
    { href: "/#artisans", label: "Find Artisans" },
    { href: "/#how-it-works", label: "How It Works" },
  ];

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-primary hover:opacity-90 transition-opacity" aria-label="Majirani Skills home">
          <Logo className="w-14 h-14 mix-blend-multiply object-contain contrast-[1.1]" />
          <span className="font-extrabold text-2xl text-foreground">Majirani Skills</span>
        </Link>

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

          {token && user ? (
            <>
              <Button variant="ghost" asChild className="gap-2 font-semibold text-[#206965] hover:text-[#1A5754] hover:bg-[#EAF5F4] rounded-xl">
                <Link to={user.role === "ADMIN" ? "/admin/dashboard" : getDashboardPath()}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              </Button>
              
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-[#EAF5F4] flex items-center justify-center font-bold text-[#206965] text-xs overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.[0] ?? <UserIcon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden lg:inline max-w-[120px] truncate">{user.name}</span>
                <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out" className="rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              {!isSignInPage && (
                <Button variant="outline" asChild className="rounded-xl font-semibold">
                  <Link to="/signin">Sign In</Link>
                </Button>
              )}
              <Button asChild className="bg-[#40807D] hover:bg-[#346966] text-white rounded-xl font-semibold">
                <Link to="/signup">Join as Artisan</Link>
              </Button>
            </>
          )}
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
};

export default Navbar;