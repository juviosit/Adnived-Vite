import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="border-t border-border/50 bg-muted/30 py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            Ready to get insights without the guilt?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Join privacy-conscious businesses who trust adnived for their analytics.
          </p>

          <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {["No credit card required", "Setup in 5 minutes", "Cancel anytime"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                {item}
              </span>
            ))}
          </div>

          <Button size="lg" className="gap-2 px-8" asChild>
            <Link to="/signup">
              Start for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
