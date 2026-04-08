import { useState } from "react";
import { X } from "lucide-react";
import workCctv from "@/assets/work-cctv.jpg";
import workCyber from "@/assets/work-cyber.jpg";
import workAccess from "@/assets/work-access.jpg";
import workPentest from "@/assets/work-pentest.jpg";
import workNetwork from "@/assets/work-network.jpg";
import workAlarm from "@/assets/work-alarm.jpg";

const works = [
  { src: workCctv, title: "CCTV Installation", desc: "HD surveillance system setup for a commercial building in Nairobi." },
  { src: workCyber, title: "Cyber Security Operations", desc: "24/7 threat monitoring from our security operations centre." },
  { src: workAccess, title: "Access Control Setup", desc: "Biometric access panel installation for corporate offices." },
  { src: workPentest, title: "Penetration Testing", desc: "Ethical hacking engagement for a financial services client." },
  { src: workNetwork, title: "Network Infrastructure", desc: "Enterprise server rack and firewall configuration." },
  { src: workAlarm, title: "Alarm System Deployment", desc: "Smart intrusion detection system for a retail chain." },
];

const OurWorkSection = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section id="our-work" className="py-20 md:py-28 relative">
      <div className="absolute inset-0 bg-secondary/30" />
      <div className="container px-4 relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Portfolio</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display">Our Work</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">See our team in action — delivering top-tier security and tech solutions across Kenya.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {works.map((w, i) => (
            <button
              key={w.title}
              onClick={() => setSelected(i)}
              className="group relative overflow-hidden rounded-xl aspect-[3/2] cursor-pointer border border-border hover:border-primary/30 transition-all duration-500 glow-card-hover"
            >
              <img
                src={w.src}
                alt={w.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <div className="text-left">
                  <h3 className="font-display font-semibold text-foreground">{w.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{w.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-4xl w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-12 right-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={works[selected].src} alt={works[selected].title} className="w-full rounded-xl" />
            <div className="mt-4 text-center">
              <h3 className="font-display font-semibold text-lg">{works[selected].title}</h3>
              <p className="text-muted-foreground text-sm">{works[selected].desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OurWorkSection;
