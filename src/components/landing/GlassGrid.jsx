import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation, scrollVariants } from '../../hooks/useScrollAnimation';
import { Sparkles, Shield, Cpu, Zap, Activity, ShieldAlert } from 'lucide-react';

const gridItems = [
  {
    title: "Project Analysis",
    description: "Our platform evaluates project quality, technical depth, and innovation impact using standardized metrics.",
    icon: Cpu,
    color: "text-blue-500"
  },
  {
    title: "Platform Security",
    description: "Advanced anti-plagiarism checks and behavioral analysis ensure a 100% fair competition for all participants.",
    icon: Shield,
    color: "text-gray-800"
  },
  {
    title: "Robust API",
    description: "Integrate with our high-performance API endpoints for seamless data streaming and platform extensions.",
    icon: Zap,
    color: "text-blue-500"
  },
  {
    title: "Live Dashboards",
    description: "Professional, auto-updating dashboards that keep judges and participants informed of event progress.",
    icon: Activity,
    color: "text-gray-400"
  },
  {
    title: "Security Audits",
    description: "Automatically scan submitted repositories for security flaws and common vulnerabilities during the evaluation.",
    icon: ShieldAlert,
    color: "text-blue-400"
  },
  {
    title: "Instant Feedback",
    description: "Participants receive actionable, professional feedback immediately after judge evaluation.",
    icon: Sparkles,
    color: "text-gray-800"
  }
];

const GlassGrid = () => {
  const [ref, controls] = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={scrollVariants.staggerContainer(0.1)}
        >
          <motion.div variants={scrollVariants.fadeUp} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-8">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Platform Infrastructure</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-10 tracking-tight">
              Built for <span className="text-blue-500">Scale & Trust</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridItems.map((item, index) => (
              <motion.div
                key={index}
                variants={scrollVariants.fadeUp}
                whileHover={{ y: -5 }}
                className="bg-white border border-gray-200 rounded-2xl p-10 relative overflow-hidden group cursor-pointer transition-all duration-300 shadow-sm hover:border-blue-400"
              >
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-8 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 ${item.color}`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight group-hover:text-blue-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GlassGrid;
