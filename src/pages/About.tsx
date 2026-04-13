import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Target, Eye, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import founderImg from "@/assets/founder.jpg";

const About = () => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("team_members").select("*").eq("is_visible", true).order("display_order");
      if (data) setTeamMembers(data);
    };
    fetch();
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="container px-4 text-center relative z-10">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">About Us</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-display mb-6">Who We Are</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Triple A Tech Solutions is a leading security and technology solutions provider in Kenya, delivering comprehensive physical security, cyber security, and IT services nationwide.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-secondary/30" />
          <div className="container px-4 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto relative z-10">
            <div className="p-8 rounded-xl bg-card border border-border glow-card hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Our Mission</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                To provide world-class security and technology solutions that protect lives, assets, and data across Kenya, empowering our clients to operate with confidence.
              </p>
            </div>
            <div className="p-8 rounded-xl bg-card border border-border glow-card hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Our Vision</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                To be East Africa's most trusted and innovative tech and security partner, setting the standard for integrated physical and cyber security services.
              </p>
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="py-20 md:py-28">
          <div className="container px-4 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative group">
                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border glow-primary">
                  <img src={founderImg} alt="Ndanya Abraham - Founder & CEO" className="w-full h-full object-cover object-top" style={{ objectPosition: "50% 15%" }} loading="lazy" />
                </div>
                <div className="absolute -bottom-3 -right-3 w-24 h-24 border-2 border-primary/20 rounded-xl -z-10 group-hover:border-primary/40 transition-colors" />
              </div>
              <div>
                <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Leadership</p>
                <h2 className="text-3xl md:text-4xl font-bold font-display mb-2">Ndanya Abraham</h2>
                <p className="text-muted-foreground text-sm uppercase tracking-wider mb-6">Founder & CEO</p>
                <p className="text-muted-foreground leading-relaxed">
                  With years of experience in the security and technology industry, Ndanya Abraham founded Triple A Tech Solutions with a vision to bridge the gap between physical and cyber security in Kenya. His leadership drives the company's mission to deliver reliable, cutting-edge solutions.
                </p>
                <div className="flex gap-3 mt-6">
                  <a href="https://instagram.com/triple.atechsolutions" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label="Instagram">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Members - dynamic from DB */}
        {teamMembers.length > 0 && (
          <section className="py-16 relative">
            <div className="absolute inset-0 bg-secondary/30" />
            <div className="container px-4 relative z-10">
              <div className="text-center mb-12">
                <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Our People</p>
                <h2 className="text-3xl md:text-4xl font-bold font-display">Meet The Team</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {teamMembers.map(m => (
                  <div key={m.id} className="text-center p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-all">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-primary/20">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center"><User className="w-10 h-10 text-primary" /></div>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-lg">{m.name}</h3>
                    <p className="text-primary text-sm mb-3">{m.role}</p>
                    {m.bio && <p className="text-sm text-muted-foreground leading-relaxed">{m.bio}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Values */}
        <section className="py-16 relative">
          {teamMembers.length === 0 && <div className="absolute inset-0 bg-secondary/30" />}
          <div className="container px-4 relative z-10">
            <div className="text-center mb-12">
              <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">What Drives Us</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display">Our Core Values</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { title: "Integrity", desc: "We uphold the highest ethical standards in everything we do." },
                { title: "Excellence", desc: "We strive for the best outcomes in every engagement." },
                { title: "Innovation", desc: "We embrace modern technology to stay ahead of threats." },
                { title: "Reliability", desc: "Our clients can count on us, 24 hours a day, 7 days a week." },
              ].map(v => (
                <div key={v.title} className="text-center p-6 rounded-xl bg-card/50 border border-border hover:border-primary/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default About;
