import { Shield, Cpu, Wifi, Lock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 200, suffix: "+", label: "Clients Protected" },
  { value: 24, suffix: "/7", label: "Monitoring" },
  { value: 15, suffix: "+", label: "Services Offered" },
  { value: 99, suffix: "%", label: "Client Satisfaction" },
];

const AnimatedCounter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = Math.max(1, Math.floor(target / 40));
          const interval = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(start);
            }
          }, 30);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-display font-bold text-gradient">
      {count}{suffix}
    </div>
  );
};

const HeroSection = () => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }} />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Floating icons */}
      <Cpu className="absolute top-1/4 left-[10%] w-8 h-8 text-primary/10 animate-float" />
      <Wifi className="absolute top-1/3 right-[12%] w-10 h-10 text-primary/8 animate-float" style={{ animationDelay: '1s' }} />
      <Lock className="absolute bottom-[40%] left-[15%] w-6 h-6 text-accent/10 animate-float" style={{ animationDelay: '2s' }} />
      <Shield className="absolute bottom-1/3 right-[8%] w-9 h-9 text-primary/10 animate-float" style={{ animationDelay: '0.5s' }} />

      <div className="container relative z-10 text-center px-4 flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8 animate-fade-in-up">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Trusted Tech & Security Partner in Kenya</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-display tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Protecting What
          <br />
          <span className="text-gradient">Matters Most</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
          Comprehensive physical security, cyber security & tech solutions for businesses and homes across Kenya. From CCTV to penetration testing — we've got you covered.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Button size="lg" className="glow-primary text-base px-8 py-6 rounded-xl" onClick={scrollToContact}>
            Get a Free Quote
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-xl border-primary/20 hover:bg-primary/5" onClick={scrollToServices}>
            Our Services
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <AnimatedCounter target={s.value} suffix={s.suffix} />
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToServices}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </section>
  );
};

export default HeroSection;
