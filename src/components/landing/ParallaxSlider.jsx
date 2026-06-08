import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { Play } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import img1 from '../../1.png';
import img2 from '../../2.png';
import imgC from '../../c.png';

const ParallaxSlider = () => {
  const [progress, setProgress] = useState(0);

  const slides = [
    {
      title: "Evaluate with Smart Precision",
      subtitle: "Hackathon Assessment Tools",
      image: img1,
      cta: "Access Platform"
    },
    {
      title: "Global Scalability Built-in",
      subtitle: "Professional Infrastructure",
      image: img2,
      cta: "Platform Status"
    },
    {
      title: "Professional Reveal Screens",
      subtitle: "Experience Real-time Results",
      image: imgC,
      cta: "Observe Event"
    }
  ];

  const handleAutoplayTimeLeft = (s, time, progressValue) => {
    setProgress(1 - progressValue);
  };

  return (
    <section className="relative w-full h-[85vh] bg-white overflow-hidden flex items-center justify-center py-20">
      {/* Subtle Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/20 rounded-full blur-[120px] pointer-events-none"></div>

      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={800}
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        onAutoplayTimeLeft={handleAutoplayTimeLeft}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="relative w-full h-full flex items-center">
            {({ isActive }) => (
              <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center h-full py-12">
                
                {/* LEFT: CONTENT */}
                <div className="relative z-20 order-2 lg:order-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-8">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      <span className="text-blue-600 font-bold uppercase text-[10px] tracking-widest">
                        {slide.subtitle}
                      </span>
                    </div>
                    
                    <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
                      {slide.title}
                    </h2>
                    
                    <p className="text-gray-500 text-lg font-medium mb-10 leading-relaxed max-w-md">
                      Experience the next generation of hackathon evaluation with our professional, automated infrastructure.
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <button className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-sm active:scale-95 border border-blue-600">
                        {slide.cta}
                      </button>
                      <button className="px-8 py-3 bg-white text-gray-600 border border-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                        Platform Status
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* RIGHT: IMAGE SHOWCASE */}
                <div className="relative order-1 lg:order-2 h-[40vh] lg:h-[65vh]">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    className="relative w-full h-full bg-white rounded-2xl p-2 border border-gray-200 shadow-lg overflow-hidden group"
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-full object-cover lg:object-contain transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Custom Pagination */}
                <div className="absolute bottom-12 left-6 hidden lg:flex gap-4">
                   {slides.map((_, i) => (
                     <div key={i} className={`h-1 rounded-full transition-all duration-500 ${index === i ? 'w-16 bg-blue-500' : 'w-4 bg-gray-200'}`}></div>
                   ))}
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}

        {/* Progress Bar Container */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 z-20 overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </Swiper>
    </section>
  );
};

export default ParallaxSlider;
