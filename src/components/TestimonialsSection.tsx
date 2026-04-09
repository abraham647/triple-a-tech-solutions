import { Star, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const fallbackTestimonials = [
  {
    name: "James Mwangi",
    role: "CEO, Mwangi Enterprises",
    text: "Triple A Tech Solutions transformed our office security. The CCTV system is top-notch and we can monitor everything from our phones. Highly recommended!",
    rating: 5,
  },
  {
    name: "Sarah Odhiambo",
    role: "IT Director, Savannah Finance",
    text: "Their penetration testing uncovered vulnerabilities we didn't even know existed. Professional, thorough, and the report was incredibly detailed.",
    rating: 5,
  },
  {
    name: "Peter Kamau",
    role: "Operations Manager, KamTech Ltd",
    text: "The access control system they installed has streamlined our building security. The biometric integration works flawlessly. Great team to work with.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);

  useEffect(() => {
    const fetchApproved = async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("name, role, content, rating")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (data && data.length > 0) {
        setTestimonials(data.map(d => ({ name: d.name, role: d.role || "", text: d.content, rating: d.rating || 5 })));
      }
    };
    fetchApproved();
  }, []);

  return (
    <section className="py-20 md:py-28">
      <div className="container px-4">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Testimonials</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display">What Our Clients Say</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-all duration-300 glow-card glow-card-hover relative"
            >
              <Quote className="w-8 h-8 text-primary/10 absolute top-4 right-4" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{t.text}</p>
              <div>
                <p className="font-display font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
