import { Shield, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Services", scrollId: "services" },
  { label: "Our Work", scrollId: "our-work" },
  { label: "About Us", path: "/about" },
  { label: "Contact", scrollId: "contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => setSession(s)
    );
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const scrollTo = (id: string) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goTo = (path: string) => {
    setOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.path) goTo(item.path);
    else if (item.scrollId) scrollTo(item.scrollId);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg" : "bg-transparent"
    }`}>
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => goTo("/")}>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">Triple A Tech</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/50 transition-all"
            >
              {item.label}
            </button>
          ))}
          <Button size="sm" className="ml-3 glow-primary" onClick={() => scrollTo("contact")}>
            Get a Quote
          </Button>
          {session && (
            <Button size="sm" variant="ghost" onClick={handleSignOut} className="ml-1">
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          )}
        </div>

        <button className="md:hidden text-foreground p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl p-4 space-y-1 animate-slide-up">
          {navItems.map(item => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className="block w-full text-left px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-all"
            >
              {item.label}
            </button>
          ))}
          <Button size="sm" className="w-full mt-2" onClick={() => scrollTo("contact")}>Get a Quote</Button>
          {session && (
            <Button size="sm" variant="ghost" className="w-full" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
