import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features", isAnchor: true },
    { href: "#pricing", label: "Pricing", isAnchor: true },
    { href: "#privacy", label: "Privacy", isAnchor: true },
    { href: "/utm-builder", label: "UTM Builder", isAnchor: false },
    { href: "/refer", label: "Refer & Earn", isAnchor: false },
    { href: "/docs", label: "Docs", isAnchor: false },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg text-foreground tracking-tight"><span className="font-bold">adnived</span><span className="font-normal">Analytics</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) =>
            link.isAnchor ? (
              <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{link.label}</a>
            ) : (
              <Link key={link.href} to={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{link.label}</Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full font-medium" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" className="hidden sm:inline-flex rounded-full font-medium px-5" asChild>
            <Link to="/signup">Get started</Link>
          </Button>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-background p-6">
              <nav className="mt-6 flex flex-col gap-4">
                {navLinks.map((link) =>
                  link.isAnchor ? (
                    <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-base font-medium text-foreground">{link.label}</a>
                  ) : (
                    <Link key={link.href} to={link.href} onClick={() => setOpen(false)} className="text-base font-medium text-foreground">{link.label}</Link>
                  )
                )}
                <div className="mt-4 border-t border-border pt-4 flex flex-col gap-3">
                  <Button variant="outline" className="w-full rounded-full" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>Log in</Link>
                  </Button>
                  <Button className="w-full rounded-full" asChild>
                    <Link to="/signup" onClick={() => setOpen(false)}>Get started</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
