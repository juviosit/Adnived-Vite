import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Finally, analytics that respect my users. The dashboard is clean, fast, and I get all the insights I need without the privacy guilt.",
    name: "Lahiru D",
    role: "Founder, ClickMart Digital PVT LTD",
  },
  {
    quote: "Switching from Google Analytics was the best decision. No more cookie banners, no more GDPR headaches. Just simple, actionable data.",
    name: "Elsa W",
    role: "Director, Juvios UK Limited",
  },
  {
    quote: "The 1kb script size made a noticeable difference in our Core Web Vitals. Privacy-friendly AND performance-friendly.",
    name: "Dinusha R",
    role: "Lead Developer, Global",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24">
      <div className="container">
        <div className="mx-auto mb-4 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            Loved by privacy-conscious teams
          </h2>
          <p className="text-muted-foreground">
            Join businesses who've made the switch to ethical analytics.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-card p-6"
            >
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground italic">
                "{t.quote}"
              </p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
