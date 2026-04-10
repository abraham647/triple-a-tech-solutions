import { useState, useEffect } from "react";
import { X, Video, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import workCctv from "@/assets/work-cctv.jpg";
import workCyber from "@/assets/work-cyber.jpg";
import workAccess from "@/assets/work-access.jpg";
import workPentest from "@/assets/work-pentest.jpg";
import workNetwork from "@/assets/work-network.jpg";
import workAlarm from "@/assets/work-alarm.jpg";

const fallbackWorks = [
  { image_url: workCctv, title: "CCTV Installation", description: "HD surveillance system setup for a commercial building in Nairobi.", video_url: null, external_url: null },
  { image_url: workCyber, title: "Cyber Security Operations", description: "24/7 threat monitoring from our security operations centre.", video_url: null, external_url: null },
  { image_url: workAccess, title: "Access Control Setup", description: "Biometric access panel installation for corporate offices.", video_url: null, external_url: null },
  { image_url: workPentest, title: "Penetration Testing", description: "Ethical hacking engagement for a financial services client.", video_url: null, external_url: null },
  { image_url: workNetwork, title: "Network Infrastructure", description: "Enterprise server rack and firewall configuration.", video_url: null, external_url: null },
  { image_url: workAlarm, title: "Alarm System Deployment", description: "Smart intrusion detection system for a retail chain.", video_url: null, external_url: null },
];

const OurWorkSection = () => {
  const [works, setWorks] = useState(fallbackWorks);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("portfolio_works").select("*").order("display_order");
      if (data && data.length > 0) setWorks(data);
    };
    load();
  }, []);

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
              key={w.title + i}
              onClick={() => setSelected(i)}
              className="group relative overflow-hidden rounded-xl aspect-[3/2] cursor-pointer border border-border hover:border-primary/30 transition-all duration-500 glow-card-hover"
            >
              {w.image_url ? (
                <img src={w.image_url} alt={w.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full bg-card flex items-center justify-center"><span className="text-muted-foreground">No image</span></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <div className="text-left">
                  <h3 className="font-display font-semibold text-foreground">{w.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{w.description}</p>
                  <div className="flex gap-2 mt-2">
                    {w.video_url && <span className="text-xs text-primary flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>}
                    {w.external_url && <span className="text-xs text-primary flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Link</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected !== null && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="relative max-w-4xl w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute -top-12 right-0 text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
            {works[selected].video_url ? (
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe src={works[selected].video_url!.replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen />
              </div>
            ) : works[selected].image_url ? (
              <img src={works[selected].image_url!} alt={works[selected].title} className="w-full rounded-xl" />
            ) : null}
            <div className="mt-4 text-center">
              <h3 className="font-display font-semibold text-lg">{works[selected].title}</h3>
              <p className="text-muted-foreground text-sm">{works[selected].description}</p>
              {works[selected].external_url && (
                <a href={works[selected].external_url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-sm mt-2 hover:underline">
                  <ExternalLink className="w-4 h-4" /> View Project
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OurWorkSection;
