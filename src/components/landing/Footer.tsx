import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">adnived</span>
            <span className="text-muted-foreground">analytics</span>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
            <a href="#privacy" className="transition-colors hover:text-foreground">Privacy</a>
            <Link to="/login" className="transition-colors hover:text-foreground">Log in</Link>
            <Link to="/signup" className="transition-colors hover:text-foreground">Sign up</Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} adnived analytics
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
