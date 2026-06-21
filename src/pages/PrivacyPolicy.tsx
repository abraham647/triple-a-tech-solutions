import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => (
  <>
    <Navbar />
    <main className="pt-16 min-h-screen">
      <div className="container px-4 py-12 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-4 text-sm">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-sm text-muted-foreground space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect personal information you voluntarily provide, including your name, email address, phone number, and any messages you submit through our contact forms. We also collect usage data such as browser type, pages visited, and time spent on the site.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>We use the information collected to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our website and services</li>
              <li>Send relevant communications about our services</li>
              <li>Process job applications submitted through our careers page</li>
              <li>Verify employee identities through our QR verification system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Our employee verification system uses encrypted QR codes to ensure security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Data Sharing</h2>
            <p>We do not sell, trade, or share your personal information with third parties except as required by law or with your explicit consent. Employee data is used solely for verification and internal management purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Cookies</h2>
            <p>Our website may use cookies to enhance your browsing experience. You can manage cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:info@tripleaatech.com" className="text-primary hover:underline">info@tripleaatech.com</a> or call <a href="tel:+254112860205" className="text-primary hover:underline">+254 112 860 205</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Contact Us</h2>
            <p>For any privacy-related concerns, reach out to Triple A Tech Solutions via phone at +254 112 860 205 or through our website contact form.</p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default PrivacyPolicy;
