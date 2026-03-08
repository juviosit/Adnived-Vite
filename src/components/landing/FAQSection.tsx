import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "How is adnived analytics different from other analytics tools?",
    a: "Unlike traditional tools built for advertisers, adnived focuses on privacy-first metrics. We don't use cookies, store IP addresses, or track individuals. You get clean, aggregated insights without the complexity.",
  },
  {
    q: "Do I need to show a cookie banner?",
    a: "No! Since adnived doesn't use cookies or collect personal data, you don't need any cookie consent banners. This keeps your site clean and your visitors happy.",
  },
  {
    q: "How accurate is the data without tracking individuals?",
    a: "Very accurate. We use privacy-friendly techniques like daily-rotating hashed identifiers to measure unique visitors, page views, and engagement without identifying individuals.",
  },
  {
    q: "Is adnived compliant with GDPR and other privacy laws?",
    a: "Yes. adnived is fully compliant with GDPR, CCPA, and PECR out of the box. No extra configuration or legal reviews needed.",
  },
  {
    q: "How do I get started with adnived?",
    a: "Just sign up, add your domain, and paste our one-line tracking script into your site's <head> tag. You'll see data within seconds.",
  },
  {
    q: "What happens to my data?",
    a: "Your data is stored securely and never shared with third parties. You can export or delete your data at any time. Your data, your control.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about privacy-first analytics
          </p>
        </motion.div>

        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <AccordionItem value={`faq-${i}`} className="rounded-2xl bg-card px-5 border-none">
                  <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
