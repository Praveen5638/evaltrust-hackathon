import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CalendarDays, FileCode2, CheckCircle2, Trophy } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "Event Infrastructure",
    description: "Set up your hackathon platform, define evaluation criteria, and invite judges to the platform seamlessly.",
    icon: CalendarDays,
  },
  {
    id: 2,
    title: "Project Submission",
    description: "Participants upload their presentations and repositories via a secure, user-friendly submission portal.",
    icon: FileCode2,
  },
  {
    id: 3,
    title: "Judge Evaluation",
    description: "Judges review and score projects in real-time, using clear metrics to ensure fair and accurate assessment.",
    icon: CheckCircle2,
  },
  {
    id: 4,
    title: "Results Reveal",
    description: "Generate automated rankings and host a stunning, professional awards reveal for all participants.",
    icon: Trophy,
  }
];

const HowItWorksSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="how-it-works" className="py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-8">
             <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Simplified Workflow</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
            How it <span className="text-blue-500">Works</span>
          </h2>
          <p className="text-lg font-medium text-gray-500 max-w-2xl mx-auto leading-relaxed">
            A streamlined process from initial setup to the final winner reveal, designed for clarity and efficiency.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical Connector */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2">
            <motion.div 
              initial={{ height: 0 }}
              animate={inView ? { height: '100%' } : { height: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="w-full bg-blue-500"
            ></motion.div>
          </div>

          <div className="space-y-24">
            {steps.map((step, index) => (
              <div key={step.id} className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Step Indicator */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm z-10 hidden md:flex group cursor-default">
                  <span className="text-xl font-bold text-gray-800 transition-colors group-hover:text-blue-500">{step.id}</span>
                </div>

                {/* Content Block */}
                <motion.div 
                  initial={{ opacity: 0, x: index % 2 === 0 ? 40 : -40 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? 40 : -40 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  className={`w-full md:w-1/2 flex ${index % 2 === 0 ? 'md:justify-start md:pl-20' : 'md:justify-end md:pr-20'}`}
                >
                  <div className="bg-white p-8 rounded-2xl w-full max-w-lg border border-gray-200 shadow-sm hover:border-blue-400 transition-all duration-300 group">
                    <div className="flex items-center mb-6">
                      <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mr-6 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                        <step.icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                        <span className="md:hidden mr-4 text-blue-500">{step.id}.</span>
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
