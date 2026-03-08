import { Shield, Check } from "lucide-react";
import { motion } from "framer-motion";

const badges = ["GDPR compliant", "CCPA compliant", "PECR compliant", "No consent banners needed"];
const points = ["IPs are hashed, never stored", "No cookies or sessions", "No cross-site tracking"];

const PrivacySection = () => {
  return (
    <section id="privacy" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-4 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            Built for a privacy-first world
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            We don't collect personal data, period. IP addresses are hashed and discarded daily, with no cookies, no device fingerprinting, and no cross-site tracking.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-12 max-w-2xl"
        >
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {badges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-foreground font-medium">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                {badge}
              </span>
            ))}
          </div>

          <div className="rounded-2xl bg-card p-8 text-center">
            <h3 className="mb-6 text-lg font-semibold text-foreground">Zero personal data</h3>
            <div className="flex flex-col items-center gap-3">
              {points.map((point) => (
                <div key={point} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-600" />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PrivacySection;
