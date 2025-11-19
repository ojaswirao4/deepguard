import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-primary/20 glow-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary animate-glow-pulse" />
            <span className="text-xl font-bold gradient-text bg-200 animate-gradient-shift">DeepGuard</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("home")}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              About
            </button>
            <Button onClick={() => scrollToSection("home")} size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => scrollToSection("home")}
          >
            Menu
          </Button>
        </div>
      </div>
    </nav>
  );
};
