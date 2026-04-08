import { Clock, Users, Award, Headphones, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const reasons = [
  { icon: Clock, title: "24/7 Operations", desc: "Round-the-clock monitoring and rapid response across Kenya." },
  { icon: Users, title: "Certified Experts", desc: "Trained professionals with international security certifications." },
  { icon: Award, title: "Trusted by 200+ Clients", desc: "Businesses and homeowners rely on us for their security." },
  { icon: Headphones, title: "Dedicated Support", desc: "Personal account managers and always-on customer support." },
];

const WhyUsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 md:py-28 relative overflow-hidden" ref={ref}>
      {/* Background accent */}
      <div className="absolute inset-0 bg-secondary/30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />

      <div className="container px-4 relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Why Triple A</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display">Your Security, Our Priority</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className={`text-center p-8 rounded-xl bg-card/50 border border-border hover:border-primary/20 transition-all duration-500 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <r.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold mb-2 text-lg">{r.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
