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
              Kuunganisha jamii na mafundi wa kuaminika
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Kwa Wateja</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Tafuta Fundi</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Angalia Huduma</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Jinsi Inavyofanya Kazi</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">For Artisans</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Join Platform</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Success Stories</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Majirani Skills. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
