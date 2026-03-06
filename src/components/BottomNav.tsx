import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, ChefHat, Plus, Calendar, User } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: ChefHat, label: 'Cook', path: '/cook-now' },
  { icon: Plus, label: 'Add', path: '/add', isAction: true },
  { icon: Calendar, label: 'Plan', path: '/meal-plan' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function BottomNav() {
  const location = useLocation();
  
  // Don't show nav on splash, onboarding, or cook-now
  if (['/', '/splash', '/onboarding', '/cook-now'].includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
      <div className="relative h-16 glass rounded-[28px] flex items-center justify-around px-2 shadow-2xl">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <div key={index} className="relative -top-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    boxShadow: ["0 0 0 0 rgba(255,255,255,0)", "0 0 0 10px rgba(255,255,255,0.1)", "0 0 0 0 rgba(255,255,255,0)"]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-14 h-14 rounded-full accent-gradient flex items-center justify-center text-black shadow-xl"
                >
                  <Icon size={28} />
                </motion.button>
              </div>
            );
          }

          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => 
                cn(
                  "flex flex-col items-center justify-center transition-all duration-300",
                  isActive ? "text-white" : "text-secondary-text"
                )
              }
            >
              <motion.div
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                className="relative"
              >
                <Icon size={24} />
                {isActive && (
                  <motion.div
                    layoutId="active-glow"
                    className="absolute inset-0 bg-white/20 blur-lg rounded-full"
                  />
                )}
              </motion.div>
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="text-[10px] font-medium mt-1"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
