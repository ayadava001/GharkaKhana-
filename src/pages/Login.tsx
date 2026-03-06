import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setUser(profile);
        } else {
          // Fallback if profile doesn't exist yet
          setUser({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata.name || 'User',
            diet_preference: 'Both',
            is_premium: false,
            family_size: 2,
            health_goal: 'None'
          });
        }
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/home'
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col px-6 pt-20 pb-10">
      <div className="flex flex-col items-center mb-12">
        <div className="w-20 h-20 rounded-3xl accent-gradient flex items-center justify-center text-4xl shadow-2xl mb-6">
          🥘
        </div>
        <h1 className="text-white text-3xl font-display font-extrabold tracking-tight">GharKaKhana</h1>
        <p className="text-secondary-text text-sm mt-2">Welcome back, Chef! 👨‍🍳</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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

        {error && (
          <p className="text-red-500 text-xs font-medium px-2">{error}</p>
        )}

        <div className="flex justify-end px-1">
          <button type="button" className="text-secondary-text text-xs hover:text-white transition-colors">
            Password bhool gaye?
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="w-full h-14 accent-gradient rounded-2xl text-black font-bold text-base shadow-lg flex items-center justify-center gap-2 mt-4"
        >
          {loading ? "Logging in..." : "Login"}
          {!loading && <ArrowRight size={18} />}
        </motion.button>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex-1 h-[1px] bg-white/5" />
        <span className="text-[#444] text-xs font-bold uppercase tracking-widest">OR</span>
        <div className="flex-1 h-[1px] bg-white/5" />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-3 mt-8 hover:bg-white/10 transition-all"
      >
        <Chrome size={18} />
        Login with Google
      </button>

      <div className="mt-auto text-center space-y-4">
        <button 
          onClick={() => navigate('/home')}
          className="text-white/40 text-xs font-medium hover:text-white transition-colors"
        >
          Skip for now →
        </button>
        <p className="text-secondary-text text-sm">
          Account nahi hai?{' '}
          <Link to="/signup" className="text-white font-bold hover:underline">
            Sign up karo
          </Link>
        </p>
      </div>
    </div>
  );
}
