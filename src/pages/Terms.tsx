import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <>
    <Navbar />
    <main className="pt-16 min-h-screen">
      <div className="container px-4 py-12 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-4 text-sm">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-sm text-muted-foreground space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing and using the Triple A Tech Solutions website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Services</h2>
            <p>Triple A Tech Solutions provides security and technology services including but not limited to: physical security, CCTV installation, cybersecurity consulting, network infrastructure, and employee management solutions. All services are subject to separate service agreements.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. User Accounts</h2>
            <p>When you create an account, you are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized access to your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Intellectual Property</h2>
            <p>All content on this website, including text, graphics, logos, and software, is the property of Triple A Tech Solutions and is protected by intellectual property laws. You may not reproduce, distribute, or modify any content without our written consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
            <p>Triple A Tech Solutions shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our services. Our total liability shall not exceed the amount paid for the specific service in question.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Employee Verification</h2>
            <p>Our QR-based employee verification system is provided for security purposes. Verification results are based on current employee records. Triple A Tech Solutions reserves the right to deactivate any employee card at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Governing Law</h2>
            <p>These terms are governed by the laws of the Republic of Kenya. Any disputes shall be resolved in the courts of Nairobi, Kenya.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Contact</h2>
            <p>For questions about these terms, contact us at <a href="tel:+254112860205" className="text-primary hover:underline">+254 112 860 205</a> or visit our contact page.</p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default Terms;
