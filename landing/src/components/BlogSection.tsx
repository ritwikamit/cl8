import { motion } from "framer-motion";
import BlurText from "./BlurText";

const posts = [
  {
    title: "Introducing CL8 — AI for your terminal",
    date: "Apr 28, 2026",
    tag: "Announcement",
  },
  {
    title: "Running Ollama locally with CL8",
    date: "Apr 25, 2026",
    tag: "Tutorial",
  },
  {
    title: "Multi-provider AI: why choice matters",
    date: "Apr 20, 2026",
    tag: "Deep Dive",
  },
];

export default function BlogSection() {
  return (
    <section id="blog" className="relative min-h-screen w-screen overflow-hidden bg-black flex items-center justify-center scroll-mt-28">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(147,51,234,0.06),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,rgba(255,107,203,0.04),transparent_60%)]" />
      </div>

      <div className="relative z-10 px-8 md:px-16 lg:px-20 py-24 flex flex-col max-w-5xl w-full">
        <motion.p
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-sm font-medium text-white/70 mb-6 tracking-widest uppercase"
        >
          // Blog
        </motion.p>

        <BlurText
          text="Latest from CL8"
          className="font-heading italic text-white text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-[-3px] justify-start text-glow"
          delay={0.2}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {posts.map((post, i) => (
            <motion.a
              key={post.title}
              href="#"
              initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
              whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 + i * 0.1 }}
              className="liquid-glass rounded-[1.25rem] p-7 flex flex-col gap-3 hover:scale-[1.02] transition-transform cursor-pointer group"
            >
              <span className="text-[11px] font-semibold text-white/60 tracking-wider uppercase">{post.tag}</span>
              <h3 className="font-heading italic text-xl md:text-2xl text-white leading-tight tracking-[-0.5px] group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#00aaff] group-hover:to-[#9333ea] group-hover:bg-clip-text transition-all duration-300">
                {post.title}
              </h3>
              <span className="text-xs text-white/50 mt-auto">{post.date}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
