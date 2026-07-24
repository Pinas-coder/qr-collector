import { motion } from "framer-motion";

interface AnimatedProgressBarProps {
  current: number;
  total: number;
}

export default function AnimatedProgressBar({ current, total }: AnimatedProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100);
  return (
    <div className="h-3 overflow-hidden rounded-full bg-surface-container-highest">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary-container"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
