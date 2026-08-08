import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Clock, Users, Award, Headphones, Shield, Star, CheckCircle,
  Camera, Bell, KeyRound, ShieldCheck, Monitor, Globe, Network, Lock,
  Cpu, ShieldAlert, Search, Siren, KeySquare, Skull, Bug, FlaskConical,
  Phone, Mail, Briefcase, Eye, Image, Video, Link, AlertCircle, Settings, Plus, Edit, Save
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Shield, Camera, Bell, KeyRound, ShieldCheck, Monitor, Globe, Network, Lock,
  Cpu, ShieldAlert, Search, Siren, KeySquare, Skull, Bug, FlaskConical,
  Clock, Users, Award, Headphones, Star, CheckCircle, Phone, Mail,
  Briefcase, Eye, Image, Video, Link, AlertCircle, Settings, Plus, Edit, Save
};

const fallbackReasons = [
  { icon: "Clock", title: "24/7 Operations", description: "Round-the-clock monitoring and rapid response across Kenya." },
  { icon: "Users", title: "Certified Experts", description: "Trained professionals with international security certifications." },
  { icon: "Award", title: "Trusted by 200+ Clients", description: "Businesses and homeowners rely on us for their security." },
  { icon: "Headphones", title: "Dedicated Support", description: "Personal account managers and always-on customer support." },
];

const WhyUsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { data } = useWhyUsCards();
  const reasons = data && data.length > 0 ? data : fallbackReasons;

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
      <div className="absolute inset-0 bg-secondary/30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
      <div className="container px-4 relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Why Triple A</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display">Your Security, Our Priority</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r, i) => {
            const Icon = iconMap[r.icon] || Star;
            return (
              <div
                key={r.title + i}
                className={`text-center p-8 rounded-xl bg-card/50 border border-border hover:border-primary/20 transition-all duration-500 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2 text-lg">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
