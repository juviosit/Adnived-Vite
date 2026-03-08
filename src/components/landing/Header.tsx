import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg text-foreground tracking-tight"><span className="font-bold">adnived</span><span className="font-normal">Analytics</span></span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
          <a href="#privacy" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
          <Link to="/docs" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Docs</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="rounded-full font-medium" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" className="rounded-full font-medium px-5" asChild>
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
