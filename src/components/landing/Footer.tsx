import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-foreground tracking-tight"><span className="font-bold">adnived</span><span className="font-normal">Analytics</span></span>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
            <Link to="/utm-builder" className="transition-colors hover:text-foreground">UTM Builder</Link>
            <Link to="/docs" className="transition-colors hover:text-foreground">Docs</Link>
            <Link to="/why-no-social" className="transition-colors hover:text-foreground">Why no social?</Link>
            <Link to="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-foreground">Terms</Link>
            <Link to="/login" className="transition-colors hover:text-foreground">Log in</Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} adnivedAnalytics
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
