import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check } from 'lucide-react';

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for university groups and small hackathon events.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["Up to 20 Teams", "QR Code Scanning", "Live Leaderboard", "Standard Support", "Basic Analytics"],
    popular: false,
    cta: "Start for Free"
  },
  {
    name: "Professional",
    description: "Ideal for regional events and professional organizers.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: ["Up to 100 Teams", "Advanced Analytics", "Custom Criteria", "Priority Support", "Custom Branding", "Export Data"],
    popular: true,
    cta: "Start Free Trial"
  },
  {
    name: "Enterprise",
    description: "For large global events requiring ultimate scalability.",
    monthlyPrice: 199,
    yearlyPrice: 159,
    features: ["Unlimited Teams", "Advanced Security", "Multi-Stage Evaluation", "Dedicated Account Manager", "API Access", "SLA Guarantee"],
    popular: false,
    cta: "Contact Sales"
  }
];

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="pricing" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-8"
          >
             <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Pricing Plans</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight"
          >
            Flexible <span className="text-blue-500">Pricing</span>
          </motion.h2>
          
          {/* Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center mt-12 bg-gray-50 inline-flex mx-auto p-1.5 rounded-xl border border-gray-200"
          >
            <button 
              onClick={() => setIsYearly(false)}
              className={`px-8 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${!isYearly ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              className={`px-8 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-3 ${isYearly ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
            >
              Yearly <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${isYearly ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>-20%</span>
            </button>
          </motion.div>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 transition-all duration-300 border ${
                plan.popular 
                ? 'bg-white border-blue-500 shadow-lg md:-translate-y-4' 
                : 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-6 rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-tight">{plan.name}</h3>
              <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">{plan.description}</p>
              
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900 tracking-tight">
                  ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                {plan.monthlyPrice > 0 && <span className="text-gray-400 font-bold text-sm">/mo</span>}
              </div>

              <button className={`w-full py-3 px-6 rounded-xl font-bold text-sm mb-10 transition-all duration-300 border ${
                plan.popular 
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm border-blue-600' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
              }`}>
                {plan.cta}
              </button>

              <div className="space-y-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
