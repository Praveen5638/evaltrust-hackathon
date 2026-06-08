import { useEffect } from 'react';
import { useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * Custom hook for triggering framer-motion animations when elements scroll into view.
 * 
 * @param {Object} options - Intersection observer options
 * @param {number} options.threshold - Viewport threshold (0 to 1)
 * @param {boolean} options.triggerOnce - Whether to trigger only once
 * @param {Object} options.rootMargin - Margin around the root
 * @returns {Array} [ref, controls, inView]
 */
export const useScrollAnimation = ({ threshold = 0.1, triggerOnce = true, rootMargin = '0px' } = {}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold, triggerOnce, rootMargin });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!triggerOnce) {
      controls.start('hidden');
    }
  }, [controls, inView, triggerOnce]);

  return [ref, controls, inView];
};

// Common animation variants that can be used with the hook
export const scrollVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } 
    }
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.6, type: 'spring', bounce: 0.4 } 
    }
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.6, ease: 'easeOut' } 
    }
  },
  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.6, ease: 'easeOut' } 
    }
  },
  staggerContainer: (staggerChildren = 0.1, delayChildren = 0) => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren
      }
    }
  })
};
