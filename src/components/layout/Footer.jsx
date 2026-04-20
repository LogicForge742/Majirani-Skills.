/**
 * Site footer with brand, navigation columns and copyright.
 */
const footerSections = [
  {
    title: "For Clients",
    links: [
      { label: "Find Artisans", href: "#artisans" },
      { label: "Browse Services", href: "#services" },
      { label: "How It Works", href: "#how-it-works" },
    ],
  },
  {
    title: "For Artisans",
    links: [
      { label: "Join Platform", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Success Stories", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                M
              </div>
              <span className="font-bold text-lg text-foreground">Majirani Skills</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting communities with trusted local artisans
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4 text-foreground">{section.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Majirani Skills. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;