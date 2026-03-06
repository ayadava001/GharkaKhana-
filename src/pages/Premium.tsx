import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, X, Star, ChevronDown, 
  ChevronUp, ShieldCheck, Zap, Sparkles 
} from 'lucide-react';
import { cn } from '../lib/utils';

const testimonials = [
  {
    text: "Meri wife roz puchti thi 'kya banau'. Ab app khol ke dekh leti hai. Life sorted!",
    author: "Rahul, Lucknow",
    rating: 5
  },
  {
    text: "Hostel mein rehti hoon. Is app ne meri cooking game hi change kar di. Simple ingredients se itne recipes!",
    author: "Priya, Delhi",
    rating: 5
  },
  {
    text: "Diabetes hai meri. Premium plan se sugar-friendly recipes milti hain. Bohot helpful.",
    author: "Sharma Uncle, Jaipur",
    rating: 5
  }
];

const faqs = [
  {
    q: "Kya sach mein free trial hai?",
    a: "Haan! 7 din free. Agar pasand nahi aaya toh cancel karo, koi paisa nahi katega."
  },
  {
    q: "Payment kaise hoga?",
    a: "UPI, Debit Card, Credit Card, Net Banking — sab Razorpay ke through secure payment."
  },
  {
    q: "Cancel kaise karein?",
    a: "Settings > Premium Plan > Cancel. One tap mein cancel. Koi sawaal nahi puchenge."
  },
  {
    q: "Family share kar sakte hain?",
    a: "Abhi ek account pe ek plan. Family sharing jald aa raha hai!"
  }
];

export default function Premium() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-primary-bg pb-40">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white">
          <ArrowLeft size={24} />
        </button>
      </header>

      {/* Hero Section */}
      <section className="px-5 pt-4 pb-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
        
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative inline-block mb-6"
        >
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full" />
          <span className="text-[64px] relative z-10">👑</span>
        </motion.div>

        <h1 className="text-white text-[28px] font-display font-extrabold mb-2">GharKaKhana Premium</h1>
        <p className="text-[#999] text-[15px] max-w-[280px] mx-auto">
          Unlimited recipes. Smart meal plans. Healthier family.
        </p>
      </section>

      {/* Comparison Section */}
      <section className="px-5 space-y-6 mb-16">
        <div className="grid grid-cols-1 gap-4">
          {/* Free Card */}
          <div className="bg-[#141414] border border-[#333] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-bold flex items-center gap-2">Free Plan 🆓</h3>
                <p className="text-[#666] text-sm mt-1">₹0 / forever</p>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                { text: "3 recipes per day", check: true },
                { text: "Basic ingredient search", check: true },
                { text: "1 meal plan per week", check: true },
                { text: "No nutrition tracking", check: false },
                { text: "No grocery list", check: false },
                { text: "No regional cuisine filter", check: false },
                { text: "Ads shown", check: false },
                { text: "No family meal plans", check: false },
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  {f.check ? (
                    <Check size={16} className="text-success" />
                  ) : (
                    <X size={16} className="text-[#444]" />
                  )}
                  <span className={f.check ? "text-white/80" : "text-[#444]"}>{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Card */}
          <div className="bg-[#1E1E1E] border-2 border-white/20 rounded-2xl p-6 relative overflow-hidden">
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
            />
            
            <div className="absolute top-4 right-4 bg-white text-black text-[10px] font-bold px-2 py-1 rounded-full accent-gradient">
              POPULAR
            </div>

            <div className="mb-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">Premium Plan 👑</h3>
              <div className="mt-2">
                <span className="text-white text-2xl font-bold">₹99 / month</span>
                <p className="text-success text-xs font-medium mt-1">ya ₹799 / year (33% savings!)</p>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                "Unlimited recipes",
                "AI-powered smart search",
                "Unlimited meal plans",
                "Full nutrition tracking",
                "Auto grocery lists",
                "All regional cuisines",
                "No ads",
                "Family meal plans (up to 6 members)",
                "Festive & seasonal recipes",
                "Diet-specific plans",
                "Priority AI responses"
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check size={16} className="text-success" />
                  <span className="text-white">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-16">
        <h2 className="px-5 text-white text-lg font-display font-bold mb-6">Users Kya Keh Rahe Hain 💬</h2>
        <div className="flex gap-4 overflow-x-auto px-5 pb-4 hide-scrollbar">
          {testimonials.map((t, i) => (
            <div key={i} className="flex-shrink-0 w-[280px] bg-[#141414] border border-white/5 rounded-2xl p-5">
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-white/80 text-sm italic leading-relaxed mb-4">"{t.text}"</p>
              <p className="text-[#666] text-xs font-medium">— {t.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-5 mb-16">
        <h2 className="text-white text-lg font-display font-bold mb-6">Plan Choose Karo</h2>
        <div className="space-y-3">
          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={cn(
              "w-full p-5 rounded-2xl border transition-all text-left flex items-center justify-between",
              selectedPlan === 'monthly' ? "bg-white/5 border-white/20" : "bg-[#141414] border-white/5"
            )}
          >
            <div>
              <p className="text-white font-bold text-lg">₹99/month</p>
              <p className="text-[#666] text-sm mt-1">Har mahine cancel kar sakte ho</p>
            </div>
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
              selectedPlan === 'monthly' ? "bg-white border-white" : "border-white/10"
            )}>
              {selectedPlan === 'monthly' && <Check size={14} className="text-black" />}
            </div>
          </button>

          {/* Yearly */}
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={cn(
              "w-full p-5 rounded-2xl border transition-all text-left flex items-center justify-between relative overflow-hidden",
              selectedPlan === 'yearly' ? "bg-white/5 border-white/40" : "bg-[#141414] border-white/5"
            )}
          >
            <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl accent-gradient">
              Best Value 💰
            </div>
            <div>
              <p className="text-white font-bold text-lg">₹799/year</p>
              <p className="text-success text-sm font-medium mt-1">₹66/month — 33% savings!</p>
            </div>
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
              selectedPlan === 'yearly' ? "bg-white border-white" : "border-white/10"
            )}>
              {selectedPlan === 'yearly' && <Check size={14} className="text-black" />}
            </div>
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-5 mb-16">
        <h2 className="text-white text-lg font-display font-bold mb-6">Sawal-Jawaab ❓</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <span className="text-white text-sm font-medium pr-4">{faq.q}</span>
                {expandedFaq === i ? <ChevronUp size={18} className="text-[#666]" /> : <ChevronDown size={18} className="text-[#666]" />}
              </button>
              <AnimatePresence>
                {expandedFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5"
                  >
                    <p className="text-[#888] text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary-bg/95 backdrop-blur-xl border-t border-white/5 p-5 pb-10">
        <div className="max-w-md mx-auto text-center">
          <motion.button
            whileTap={{ scale: 0.97 }}
            animate={{ opacity: [0.95, 1, 0.95] }}
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={() => showToast("Payment integration coming soon! 🎉")}
            className="w-full h-14 accent-gradient rounded-2xl text-black font-display font-bold text-base shadow-[0_8px_32px_rgba(255,255,255,0.15)] mb-3"
          >
            Start Premium — 7 Days Free Trial! 🚀
          </motion.button>
          <p className="text-[#666] text-[11px] mb-2">Cancel anytime. No hidden charges.</p>
          <div className="flex items-center justify-center gap-1.5 text-[#444] text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck size={12} />
            Secured by Razorpay
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full text-sm font-bold z-[60] shadow-2xl whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
