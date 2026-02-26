import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Insight</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
          <a href="#privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5" asChild>
            <Link to="/login">
              Access Platform
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup">Sign Up Free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
