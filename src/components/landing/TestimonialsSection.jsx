import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Lead Event Organizer",
    content: "EvalTrust completely transformed how we run our hackathons. The automated reveal at the end had everyone cheering. It's not just a tool; it's a professional experience.",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 5
  },
  {
    name: "David Chen",
    role: "Technical Operations Lead",
    content: "The multi-judge consensus and QR check-ins saved us hours of administrative work. Evaluating hundreds of teams has never been this seamless and fair.",
    avatar: "https://i.pravatar.cc/150?img=11",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Senior Product Designer",
    content: "As a judge, the interface is incredibly intuitive. I love the minimal aesthetics, and the clear metrics actually helped me provide more detailed and objective feedback.",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5
  }
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-8">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">User Feedback</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              Trusted by <br className="hidden md:block"/>
              <span className="text-blue-500">Innovation Leaders</span>
            </h2>
            <p className="text-lg font-medium text-gray-500 mb-12 max-w-lg leading-relaxed">
              Thousands of organizers, judges, and developers trust EvalTrust to power their most important hackathons worldwide.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4,5].map((i) => (
                  <img key={i} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" src={`https://i.pravatar.cc/150?img=${i+20}`} alt="User" />
                ))}
              </div>
              <div className="flex flex-col">
                <div className="text-gray-800 font-bold text-sm">Joined by 10k+ users</div>
                <div className="text-gray-400 font-medium text-xs">Innovation enthusiasts</div>
              </div>
            </div>
          </motion.div>

          {/* Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 40 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-[480px] mx-auto"
          >
            <Swiper
              effect={'cards'}
              grabCursor={true}
              modules={[EffectCards, Autoplay, Pagination]}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              className="mySwiper h-[480px]"
            >
              {testimonials.map((test, index) => (
                <SwiperSlide key={index} className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-10 h-full flex flex-col justify-between relative group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div>
                      {/* Rating */}
                      <div className="flex gap-1 mb-8">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-5 h-5 ${i < test.rating ? 'text-blue-500' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-800 text-2xl font-bold tracking-tight leading-relaxed mb-10 italic">"{test.content}"</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <img src={test.avatar} alt={test.name} className="w-16 h-16 rounded-xl border border-gray-100 shadow-sm" />
                      <div>
                        <h4 className="text-gray-800 font-bold text-xl tracking-tight leading-none mb-2">{test.name}</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{test.role}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
