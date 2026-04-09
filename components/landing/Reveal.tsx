'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotionPreference();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      viewport={{ amount: 0.22, once: true }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { delay, duration: 0 }
          : { delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
