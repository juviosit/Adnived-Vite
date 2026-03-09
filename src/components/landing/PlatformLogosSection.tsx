import { motion } from "framer-motion";

const platforms = [
  "WordPress",
  "Shopify",
  "WooCommerce",
  "Google Tag Manager",
  "Squarespace",
  "Wix",
  "Webflow",
  "Ghost",
  "Hugo",
  "Gatsby",
  "Next.js",
  "Nuxt",
  "Django",
  "Laravel",
  "Joomla",
  "Drupal",
  "Magento",
  "BigCommerce",
  "Weebly",
  "Carrd",
];

const PlatformLogosSection = () => {
  // Double the list for seamless loop
  const doubled = [...platforms, ...platforms];

  return (
    <section className="overflow-hidden border-t border-border/50 py-12">
      <div className="container mb-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Works with every platform you love
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

        <motion.div
          className="flex gap-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {doubled.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 shadow-sm"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                {name.charAt(0)}
              </div>
              <span className="whitespace-nowrap text-sm font-medium text-foreground">
                {name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PlatformLogosSection;
