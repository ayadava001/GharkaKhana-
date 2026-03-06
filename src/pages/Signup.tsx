import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppStore, DietType } from '../store';
import { cn } from '../lib/utils';

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [diet, setDiet] = useState<DietType>('Both');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        // Create profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            name,
            diet_preference: diet,
            is_premium: false,
            family_size: 2,
            health_goal: 'None'
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        setUser({
          id: data.user.id,
          email,
          name,
          diet_preference: diet,
          is_premium: false,
          family_size: 2,
          health_goal: 'None'
        });
        
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col px-6 pt-16 pb-10">
      <div className="mb-10">
        <h1 className="text-white text-3xl font-display font-extrabold tracking-tight">Naya Account ✨</h1>
        <p className="text-secondary-text text-sm mt-2">Join the GharKaKhana family</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" size={18} />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-[#666] outline-none focus:border-white/20 transition-all"
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" size={18} />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-[#666] outline-none focus:border-white/20 transition-all"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" size={18} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-[#666] outline-none focus:border-white/20 transition-all"
          />
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-[#666] text-xs font-bold uppercase tracking-wider px-1">Diet Preference</p>
          <div className="flex gap-2">
            {(['Veg', 'Non-Veg', 'Both'] as DietType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDiet(type)}
                className={cn(
                  "flex-1 h-12 rounded-xl border text-xs font-bold transition-all",
                  diet === type ? "accent-gradient text-black border-transparent" : "bg-white/5 border-white/10 text-white/40"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-xs font-medium px-2">{error}</p>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="w-full h-14 accent-gradient rounded-2xl text-black font-bold text-base shadow-lg flex items-center justify-center gap-2 mt-6"
        >
          {loading ? "Creating Account..." : "Sign Up"}
          {!loading && <ArrowRight size={18} />}
        </motion.button>
      </form>

      <div className="mt-8 flex items-center gap-4 px-2">
        <div className="flex-1 h-[1px] bg-white/5" />
        <span className="text-[#444] text-xs font-bold uppercase tracking-widest">OR</span>
        <div className="flex-1 h-[1px] bg-white/5" />
      </div>

      <button
        onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/home' } })}
        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-3 mt-8 hover:bg-white/10 transition-all"
      >
        <Chrome size={18} />
        Sign up with Google
      </button>

      <div className="mt-auto text-center">
        <p className="text-secondary-text text-sm">
          Already have account?{' '}
          <Link to="/login" className="text-white font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
