import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartAnimation from '../store/useCartAnimation';

const AddToCartAnimation = () => {
  const { animation, clear } = useCartAnimation();

  return (
    <AnimatePresence>
      {animation && (
        <motion.div
          className="fixed z-[100] pointer-events-none"
          initial={{
            x: animation.startX - 30,
            y: animation.startY - 30,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: animation.endX - 10,
            y: animation.endY - 10,
            scale: 0.2,
            opacity: 0.6,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          onAnimationComplete={() => clear()}
        >
          <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gold-500 shadow-[0_0_20px_rgba(212,175,55,0.6)]">
            <img src={animation.image} alt="" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddToCartAnimation;
