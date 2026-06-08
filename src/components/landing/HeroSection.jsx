import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Hero3DBackground from './Hero3DBackground';

const HeroSection = () => {
  const navigate = useNavigate();

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-32 pb-20 bg-white">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-40"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-10 shadow-sm"
        >
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-3"></span>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">v3.0 Platform Live</span>
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1] text-gray-900"
        >
          The Future of <br />
          <span className="text-blue-500">Hackathon Trust</span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="max-w-2xl text-lg md:text-xl font-medium text-gray-500 mb-12 leading-relaxed"
        >
          A professional evaluation platform designed to eliminate bias, 
          streamline scoring, and deliver verified excellence for modern innovation.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="flex flex-wrap justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="px-10 py-4 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center justify-center group shadow-sm border border-blue-600"
          >
            Get Started
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/submit')}
            className="px-10 py-4 bg-white text-gray-600 rounded-xl font-bold text-sm transition-all border border-gray-300 shadow-sm hover:bg-gray-50"
          >
            Submit Project
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/status')}
            className="px-10 py-4 bg-gray-50 text-gray-500 rounded-xl font-bold text-sm transition-all border border-gray-200 shadow-sm hover:bg-gray-100 flex items-center justify-center gap-2"
          >
            🔍 Track Submission
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/demo-result')}
            className="px-10 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 border border-white/20"
          >
            🍭 Demo Result Reveal
          </motion.button>
        </motion.div>
      </div>

      {/* Subtle Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <div className="w-[1px] h-12 bg-gray-200 rounded-full relative overflow-hidden">
           <motion.div 
            animate={{ y: [0, 48, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-4 bg-blue-500"
          ></motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
