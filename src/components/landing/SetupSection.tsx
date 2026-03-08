import { motion } from "framer-motion";

const frameworks = ["React", "Next.js", "WordPress", "Shopify", "Webflow", "+more"];

const SetupSection = () => {
  return (
    <section className="border-t border-border/50 py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-4 text-center"
        >
          <p className="mb-2 text-sm font-medium text-primary">Easy Setup</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            Up and running in 5 minutes
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            No complex setup, no tag managers, no configuration files. Just one script and you're done.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-5xl items-center gap-12 lg:grid-cols-2">
          {/* Steps */}
          <div className="space-y-8">
            {[
            { step: "01", title: "Add one line of code", desc: "Copy our lightweight tracking script to your site's header. That's it." },
            { step: "02", title: "No configuration needed", desc: "Works out of the box with any framework, CMS, or static site." },
            { step: "03", title: "Start seeing data instantly", desc: "Real-time dashboard shows visitors within seconds of setup." }].
            map((item, i) =>
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex gap-5">
              
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Code snippet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            
            <div className="rounded-2xl border border-border bg-card shadow-lg">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="text-xs font-medium text-muted-foreground">index.html</span>
              </div>
              <div className="p-5 font-mono text-sm">
                <p className="text-muted-foreground">&lt;<span className="text-primary">head</span>&gt;</p>
                <p className="ml-4 mt-1">
                  <span className="text-muted-foreground">&lt;</span>
                  <span className="text-primary">script</span>
                  {" "}
                  <span className="text-chart-2">src</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-chart-3 break-all">"https://adnived.com/script.js"</span>
                </p>
                <p className="ml-8">
                  <span className="text-chart-2">data-domain</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-chart-3">"yoursite.com"</span>
                  <span className="text-muted-foreground">&gt;&lt;/</span>
                  <span className="text-primary">script</span>
                  <span className="text-muted-foreground">&gt;</span>
                </p>
                <p className="mt-1 text-muted-foreground">&lt;/<span className="text-primary">head</span>&gt;</p>
              </div>
              <div className="border-t border-border px-5 py-3">
                <p className="text-center text-xs text-muted-foreground">That's all you need!</p>
              </div>
            </div>

            {/* Works with */}
            <div className="mt-6 text-center">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Works with</p>
              <div className="flex flex-wrap justify-center gap-2">
                {frameworks.map((fw) =>
                <span key={fw} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    {fw}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

};

export default SetupSection;