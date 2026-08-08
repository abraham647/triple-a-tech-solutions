import { useEffect, useMemo, useRef, useState } from "react";
import { useServices } from "@/hooks/usePublicData";
import {
  Camera, Bell, KeyRound, ShieldCheck, Monitor, Globe, Network, Lock,
  Cpu, ShieldAlert, Search, Siren, KeySquare, Skull, FlaskConical, Bug,
  Shield, Star, Clock, Users, Award, Headphones, CheckCircle, Phone,
  Mail, Briefcase, Eye, Image, Video, Link, AlertCircle, Settings, Plus, Edit, Save
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Shield, Camera, Bell, KeyRound, ShieldCheck, Monitor, Globe, Network, Lock,
  Cpu, ShieldAlert, Search, Siren, KeySquare, Skull, Bug, FlaskConical,
  Clock, Users, Award, Headphones, Star, CheckCircle, Phone, Mail,
  Briefcase, Eye, Image, Video, Link, AlertCircle, Settings, Plus, Edit, Save
};

const fallbackPhysical = [
  { icon: "Camera", title: "CCTV Installation & Maintenance", description: "HD surveillance systems with 24/7 recording and remote viewing.", category: "physical" },
  { icon: "Bell", title: "Alarm Systems", description: "Smart intrusion detection with instant alert notifications.", category: "physical" },
  { icon: "KeyRound", title: "Access Control", description: "Biometric, card, and smart lock systems for secure entry.", category: "physical" },
  { icon: "ShieldCheck", title: "Security Consultancy", description: "Expert risk assessment and security planning for your premises.", category: "physical" },
  { icon: "Monitor", title: "Remote Monitoring", description: "Real-time surveillance monitoring from our operations centre.", category: "physical" },
];

const fallbackCyber = [
  { icon: "Globe", title: "Cyber Security", description: "Comprehensive digital defence against online threats.", category: "cyber" },
  { icon: "Network", title: "Network Security", description: "Firewall, VPN, and network hardening solutions.", category: "cyber" },
  { icon: "Lock", title: "Information Security", description: "Data protection, encryption, and compliance services.", category: "cyber" },
  { icon: "Cpu", title: "IT Security", description: "Endpoint protection and secure IT infrastructure.", category: "cyber" },
  { icon: "ShieldAlert", title: "Threat Analysis", description: "Proactive threat intelligence and monitoring.", category: "cyber" },
  { icon: "Search", title: "Vulnerability Assessment", description: "Identify and remediate security weaknesses.", category: "cyber" },
  { icon: "Siren", title: "Incident Response", description: "Rapid response and recovery from security breaches.", category: "cyber" },
  { icon: "KeySquare", title: "Cryptography", description: "Advanced encryption and secure communications.", category: "cyber" },
  { icon: "Skull", title: "Ethical Hacking", description: "Authorised simulated attacks to test your defences.", category: "cyber" },
  { icon: "Bug", title: "Penetration Testing", description: "In-depth testing to uncover exploitable vulnerabilities.", category: "cyber" },
];

const ServiceCard = ({ icon, title, description, index }: { icon: string; title: string; description: string; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const Icon = iconMap[icon] || Shield;

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
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

const ServicesSection = () => {
  const { data } = useServices();
  const physical = useMemo(
    () => (data && data.length > 0 ? data.filter(s => s.category === "physical") : fallbackPhysical),
    [data]
  );
  const cyber = useMemo(
    () => (data && data.length > 0 ? data.filter(s => s.category === "cyber") : fallbackCyber),
    [data]
  );

  return (
    <section id="services" className="py-20 md:py-28">
      <div className="container px-4">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">What We Offer</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display">Our Services</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">End-to-end security solutions tailored to protect your business and home.</p>
        </div>

        {physical.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
              <h3 className="text-lg font-display font-semibold text-muted-foreground whitespace-nowrap">Physical Security</h3>
              <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {physical.map((s, i) => <ServiceCard key={s.title + i} icon={s.icon} title={s.title} description={s.description} index={i} />)}
            </div>
          </div>
        )}

        {cyber.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
              <h3 className="text-lg font-display font-semibold text-muted-foreground whitespace-nowrap">Cyber Security</h3>
              <div className="h-px flex-1 bg-gradient-to-l from-accent/40 to-transparent" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cyber.map((s, i) => <ServiceCard key={s.title + i} icon={s.icon} title={s.title} description={s.description} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
