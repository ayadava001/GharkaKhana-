import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Bell, Globe, Ruler, Download, 
  Trash2, RotateCcw, Shield, FileText, Info, Heart 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Settings() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);

  const SettingToggle = ({ icon, label, value, onChange, locked = false }: any) => (
    <div className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <div className="text-white/60">{icon}</div>
        <span className="text-white text-[15px] font-medium">{label}</span>
      </div>
      <button 
        onClick={() => !locked && onChange(!value)}
        className={cn(
          "w-11 h-6 rounded-full p-1 transition-all duration-300 relative",
          value ? "accent-gradient" : "bg-[#333]",
          locked && "opacity-50 cursor-not-allowed"
        )}
      >
        <motion.div 
          animate={{ x: value ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-4 h-4 bg-white rounded-full shadow-md"
        />
      </button>
    </div>
  );

  const SettingLink = ({ icon, label, value, onClick, danger = false }: any) => (
    <button 
      onClick={onClick}
      className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={cn(danger ? "text-red-500" : "text-white/60")}>{icon}</div>
        <span className={cn("text-[15px] font-medium", danger ? "text-red-500" : "text-white")}>{label}</span>
      </div>
      {value && <span className="text-[#666] text-xs font-medium">{value}</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-primary-bg pb-32">
      {/* HEADER */}
      <header className="px-5 pt-8 pb-4 flex items-center gap-4 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white text-[20px] font-display font-bold">Settings</h1>
      </header>

      <main className="px-5 mt-6 space-y-8">
        {/* Section: General */}
        <section className="space-y-3">
          <h3 className="text-[#666] text-[11px] font-bold uppercase tracking-[0.2em] px-1">General</h3>
          <div className="bg-secondary-bg border border-white/5 rounded-2xl overflow-hidden">
            <SettingToggle 
              icon={<Bell size={20} />} 
              label="Notifications" 
              value={notifications} 
              onChange={setNotifications} 
            />
            <SettingToggle 
              icon={<motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>🌙</motion.div>} 
              label="Dark Mode" 
              value={true} 
              locked={true} 
            />
            <SettingLink 
              icon={<Globe size={20} />} 
              label="Language" 
              value="English" 
            />
            <SettingLink 
              icon={<Ruler size={20} />} 
              label="Measurement Units" 
              value="Metric (Grams)" 
            />
          </div>
        </section>

        {/* Section: Data */}
        <section className="space-y-3">
          <h3 className="text-[#666] text-[11px] font-bold uppercase tracking-[0.2em] px-1">Data & Privacy</h3>
          <div className="bg-secondary-bg border border-white/5 rounded-2xl overflow-hidden">
            <SettingLink 
              icon={<Download size={20} />} 
              label="Download My Data" 
            />
            <SettingLink 
              icon={<Trash2 size={20} />} 
              label="Clear Cache" 
            />
            <SettingLink 
              icon={<RotateCcw size={20} />} 
              label="Reset Preferences" 
              danger={true}
            />
          </div>
        </section>

        {/* Section: About */}
        <section className="space-y-3">
          <h3 className="text-[#666] text-[11px] font-bold uppercase tracking-[0.2em] px-1">About</h3>
          <div className="bg-secondary-bg border border-white/5 rounded-2xl overflow-hidden">
            <SettingLink 
              icon={<Shield size={20} />} 
              label="Privacy Policy" 
            />
            <SettingLink 
              icon={<FileText size={20} />} 
              label="Terms of Service" 
            />
            <SettingLink 
              icon={<Info size={20} />} 
              label="App Version" 
              value="v1.0.0" 
            />
          </div>
        </section>

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex items-center gap-2 text-white/20 text-xs font-bold uppercase tracking-widest mb-2">
            Made with <Heart size={12} className="fill-red-500/20 text-red-500/20" /> in India 🇮🇳
          </div>
          <p className="text-[#333] text-[10px] font-medium">© 2026 GharKaKhana AI</p>
        </div>
      </main>
    </div>
  );
}
