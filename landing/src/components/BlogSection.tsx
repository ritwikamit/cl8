import { motion } from "framer-motion";

const posts = [
  { title: "Introducing CL8", tag: "Announcement", date: "Apr 28, 2026" },
  { title: "Running Ollama locally with CL8", tag: "Tutorial", date: "Apr 25, 2026" },
  { title: "Multi-provider AI: why choice matters", tag: "Deep Dive", date: "Apr 20, 2026" },
];

export default function BlogSection() {
  return (
    <section id="blog" className="relative min-h-screen w-screen overflow-hidden bg-black flex items-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_50%,rgba(255,255,255,0.02),transparent_70%)]" />

      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-7xl mx-auto w-full">
          <p className="overline mb-3">Blog</p>
          <h2 className="font-heading italic text-white text-[clamp(2.5rem,8vw,5rem)] leading-[0.85] tracking-[-3px] md:tracking-[-4px]">
            Latest from<br />
            <span className="text-white/50">CL8</span>
          </h2>

          <div className="divider my-16" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.a
                key={post.title}
                href="#"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                className="surface-card rounded-2xl p-8 flex flex-col gap-4 hover:bg-white/[0.06] transition-all group"
              >
                <span className="text-[11px] text-white/20 font-body font-medium tracking-wider">{post.tag}</span>
                <h3 className="font-heading italic text-white text-xl md:text-2xl tracking-[-0.5px] leading-tight group-hover:text-white/90 transition-colors">
                  {post.title}
                </h3>
                <span className="text-xs text-white/20 font-body mt-auto">{post.date}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
