import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

const StatsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const stats = [
    { label: "Projects Evaluated", value: 12500, suffix: "+", color: "text-gray-800" },
    { label: "Active Events", value: 3400, suffix: "+", color: "text-blue-500" },
    { label: "Platform Experts", value: 450, suffix: "", color: "text-gray-800" },
    { label: "Data Accuracy", value: 99.9, suffix: "%", color: "text-blue-500" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gray-50 rounded-2xl p-12 md:p-20 relative overflow-hidden border border-gray-200 shadow-sm">
          
          <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-block mb-4">
                  <div className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none ${stat.color}`}>
                    {inView ? (
                      <CountUp 
                        end={stat.value} 
                        duration={3} 
                        separator="," 
                        decimals={stat.value % 1 !== 0 ? 1 : 0}
                      />
                    ) : "0"}
                    <span className="text-blue-500 ml-1">{stat.suffix}</span>
                  </div>
                </div>
                <div className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
