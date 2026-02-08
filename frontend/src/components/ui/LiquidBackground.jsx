import { motion } from 'framer-motion';

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="liquid-flow"
          style={{
            left: `${20 + i * 30}%`,
            top: `${10 + i * 25}%`,
            width: `${300 + i * 100}px`,
            height: `${300 + i * 100}px`,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        />
      ))}
    </div>
  );
}
