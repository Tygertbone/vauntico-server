import { motion } from 'framer-motion';

export function FeatureCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      viewport={{ once: true }}
      className="rounded-xl border border-white/10 bg-white/5 p-6 hover:translate-y-[-2px] hover:shadow-lg transition"
    >
      {children}
    </motion.div>
  );
}
