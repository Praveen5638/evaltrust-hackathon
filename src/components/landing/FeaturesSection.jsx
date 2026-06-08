import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Tilt from 'react-parallax-tilt';
import { ShieldCheck, Cpu, BarChart3, Users, Zap, Layers } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  return (
    <Tilt
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      perspective={1000}
      transitionSpeed={1000}
      scale={1.01}
      className="h-full"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: "easeOut" } }
        }}
        className="bg-white p-10 rounded-2xl h-full relative overflow-hidden group border border-gray-200 shadow-sm hover:border-blue-400 transition-all duration-300"
      >
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-8 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">{title}</h3>
          <p className="text-gray-500 font-medium text-sm leading-relaxed">{description}</p>
        </div>
      </motion.div>
    </Tilt>
  );
};

const FeaturesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: Cpu,
      title: "Smart Scoring",
      description: "Automate project analysis and evaluation using advanced logic for fair and consistent results across all teams."
    },
    {
      icon: ShieldCheck,
      title: "Secure Verification",
      description: "Instant check-ins and evaluations using unique QR keys to ensure platform security and data integrity."
    },
    {
      icon: BarChart3,
      title: "Live Leaderboards",
      description: "Real-time, auto-updating dashboards that reveal scores dynamically to keep participants and judges engaged."
    },
    {
      icon: Users,
      title: "Judge Collaboration",
      description: "Aggregate scores seamlessly across multiple judges with automated conflict resolution and weighted metrics."
    },
    {
      icon: Zap,
      title: "Rapid Deployment",
      description: "Set up your complete hackathon environment in minutes with our intuitive, high-performance infrastructure."
    },
    {
      icon: Layers,
      title: "Custom Metrics",
      description: "Tailor evaluation criteria to your specific event needs—from technical complexity to design quality."
    }
  ];

  return (
    <section id="features" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="text-center mb-24"
        >
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-8"
          >
             <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Platform Capabilities</span>
          </motion.div>
          <motion.h2 
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight"
          >
            A Seamless <span className="text-blue-500">Experience</span>
          </motion.h2>
          <motion.p 
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="text-lg font-medium text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            Everything you need to orchestrate a flawless, transparent, and professional hackathon with enterprise-grade tools.
          </motion.p>
        </motion.div>

        <motion.div 
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description} 
              delay={index * 0.1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
