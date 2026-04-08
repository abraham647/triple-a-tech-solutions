import { Camera, Bell, KeyRound, ShieldCheck, Monitor, Globe, Network, Lock, Cpu, ShieldAlert, Search, Siren, KeySquare, Skull, FlaskConical, Bug } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const physicalServices = [
  { icon: Camera, title: "CCTV Installation & Maintenance", desc: "HD surveillance systems with 24/7 recording and remote viewing." },
  { icon: Bell, title: "Alarm Systems", desc: "Smart intrusion detection with instant alert notifications." },
  { icon: KeyRound, title: "Access Control", desc: "Biometric, card, and smart lock systems for secure entry." },
  { icon: ShieldCheck, title: "Security Consultancy", desc: "Expert risk assessment and security planning for your premises." },
  { icon: Monitor, title: "Remote Monitoring", desc: "Real-time surveillance monitoring from our operations centre." },
];

const cyberServices = [
  { icon: Globe, title: "Cyber Security", desc: "Comprehensive digital defence against online threats." },
  { icon: Network, title: "Network Security", desc: "Firewall, VPN, and network hardening solutions." },
  { icon: Lock, title: "Information Security", desc: "Data protection, encryption, and compliance services." },
  { icon: Cpu, title: "IT Security", desc: "Endpoint protection and secure IT infrastructure." },
  { icon: ShieldAlert, title: "Threat Analysis", desc: "Proactive threat intelligence and monitoring." },
  { icon: Search, title: "Vulnerability Assessment", desc: "Identify and remediate security weaknesses." },
  { icon: Siren, title: "Incident Response", desc: "Rapid response and recovery from security breaches." },
  { icon: KeySquare, title: "Cryptography", desc: "Advanced encryption and secure communications." },
  { icon: Skull, title: "Ethical Hacking", desc: "Authorised simulated attacks to test your defences." },
  { icon: Bug, title: "Penetration Testing", desc: "In-depth testing to uncover exploitable vulnerabilities." },
];

const ServiceCard = ({ icon: Icon, title, desc, index }: { icon: React.ElementType; title: string; desc: string; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-500 glow-card glow-card-hover ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
};

const ServicesSection = () => (
  <section id="services" className="py-20 md:py-28">
    <div className="container px-4">
      <div className="text-center mb-16">
        <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">What We Offer</p>
        <h2 className="text-3xl md:text-5xl font-bold font-display">Our Services</h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">End-to-end security solutions tailored to protect your business and home.</p>
      </div>

      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
          <h3 className="text-lg font-display font-semibold text-muted-foreground whitespace-nowrap">Physical Security</h3>
          <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {physicalServices.map((s, i) => <ServiceCard key={s.title} {...s} index={i} />)}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
          <h3 className="text-lg font-display font-semibold text-muted-foreground whitespace-nowrap">Cyber Security</h3>
          <div className="h-px flex-1 bg-gradient-to-l from-accent/40 to-transparent" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cyberServices.map((s, i) => <ServiceCard key={s.title} {...s} index={i} />)}
        </div>
      </div>
    </div>
  </section>
);

export default ServicesSection;
