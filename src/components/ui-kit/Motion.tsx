import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  },
  viewport: { once: true }
};

export const MotionDiv = motion.div;
export const MotionSection = motion.section;

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
}

export function ScrollReveal({ children, delay = 0, ...props }: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 1, 
        delay,
        ease: [0.16, 1, 0.3, 1] 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
