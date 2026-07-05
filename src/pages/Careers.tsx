import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Briefcase, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

const openings = [
  { title: "Security Guard", location: "Nairobi, Kenya", type: "Full-time", description: "Join our professional security team to provide top-tier protection for our clients' premises." },
  { title: "CCTV Technician", location: "Nairobi, Kenya", type: "Full-time", description: "Install, maintain, and troubleshoot CCTV systems for residential and commercial clients." },
  { title: "Cyber Security Analyst", location: "Remote / Nairobi", type: "Full-time", description: "Monitor, detect, and respond to security threats across our clients' digital infrastructure." },
  { title: "Sales Representative", location: "Nairobi, Kenya", type: "Full-time", description: "Drive business growth by connecting potential clients with our security and technology solutions." },
];

const Careers = () => (
  <>
    <Navbar />
    <main className="pt-16 min-h-screen">
      <div className="container px-4 py-12 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl font-bold mb-3">Join Our Team</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Build your career with Kenya's trusted security and technology partner. We're always looking for talented individuals who are passionate about making a difference.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {openings.map((job, i) => (
            <div key={i} className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-semibold text-lg">{job.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{job.description}</p>
                </div>
                <a href={`mailto:careers@tripleaatech.com?subject=Application: ${job.title}`}>
                  <Button size="sm" className="shrink-0">
                    <Send className="w-3.5 h-3.5 mr-1" /> Apply
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center p-8 rounded-xl border border-border bg-card">
          <Briefcase className="w-10 h-10 text-primary mx-auto mb-3" />
          <h2 className="font-display font-semibold text-xl mb-2">Don't See Your Role?</h2>
          <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
            We're always interested in hearing from talented people. Send your CV and cover letter to us and we'll keep you in mind for future openings.
          </p>
          <a href="mailto:careers@tripleaatech.com?subject=General Application">
            <Button><Send className="w-4 h-4 mr-1" /> Send Your CV</Button>
          </a>
          <p className="text-xs text-muted-foreground mt-3">Or call us at <a href="tel:+254112860205" className="text-primary hover:underline">+254 112 860 205</a> · <a href="https://wa.me/254732695197" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WhatsApp +254 732 695 197</a></p>
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default Careers;
