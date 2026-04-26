import { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoPrimary from '../assets/logo-primary.webp';
import logoWhite from '../assets/logo-white.webp';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

type Mode = 'signin' | 'signup' | 'forgot';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Account created! Check your email to confirm.' });
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message ?? 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-qs-bg font-sans">
      {/* Left Panel — Branding & Experience */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] relative overflow-hidden flex-col items-center justify-center p-16 text-white">
        {/* Animated Gradient Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(135deg, #1E6BFF 0%, #0B3C8C 100%)',
          }}
        />

        {/* Decorative Circles */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-qs-secondary/20 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <img src={logoWhite} alt="QuoteSuite" className="h-32 object-contain mb-12 drop-shadow-2xl" />

          <h1 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight leading-[1.1]">
            Effortless Quotations <br />
            <span className="text-qs-secondary">for Modern Business.</span>
          </h1>

          <p className="text-xl text-white/80 max-w-md leading-relaxed font-medium">
            Create, manage, and send professional branded PDF quotations in seconds.
          </p>

          <div className="mt-16 grid gap-4 w-full max-w-sm">
            {[
              { label: 'Branded PDF quotations', desc: 'Custom layouts that match your brand.' },
              { label: 'AI Powered Generation', desc: 'Extract items from conversations instantly.' },
              { label: 'Cloud History', desc: 'Securely access your quotes from anywhere.' },
            ].map(({ label, desc }) => (
              <motion.div
                key={label}
                whileHover={{ x: 10 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-left transition-colors hover:bg-white/10"
              >
                <div className="mt-1 flex-shrink-0 h-6 w-6 rounded-full bg-qs-secondary/20 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-qs-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{label}</h3>
                  <p className="text-xs text-white/60">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Interactive Form */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-12 lg:p-20 bg-qs-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="md:hidden flex justify-center mb-10">
            <img src={logoPrimary} alt="QuoteSuite" className="h-20 object-contain" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-qs-text mb-2 tracking-tight">
              {mode === 'signin' && 'Welcome back'}
              {mode === 'signup' && 'Get started today'}
              {mode === 'forgot' && 'Reset your password'}
            </h2>
            <p className="text-qs-text-sec font-medium">
              {mode === 'signin' && "Sign in to manage your professional quotes."}
              {mode === 'signup' && "Create your account to start generating quotes."}
              {mode === 'forgot' && "Enter your email to receive a reset link."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-8 px-5 py-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border ${message.type === 'error'
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : 'bg-green-50 text-green-600 border-green-100'
                  }`}
              >
                <div className={`h-2 w-2 rounded-full ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`} />
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-qs-text-muted ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-qs-text-muted group-focus-within:text-qs-primary transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-qs-border bg-qs-surface text-qs-text text-sm font-medium focus:border-qs-primary focus:outline-none focus:ring-4 focus:ring-qs-primary/10 transition-all placeholder:text-qs-text-muted/50"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.1em] text-qs-text-muted ml-1">Secure Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-qs-text-muted group-focus-within:text-qs-primary transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-qs-border bg-qs-surface text-qs-text text-sm font-medium focus:border-qs-primary focus:outline-none focus:ring-4 focus:ring-qs-primary/10 transition-all placeholder:text-qs-text-muted/50"
                  />
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setMessage(null); }}
                  className="text-xs font-bold text-qs-primary hover:text-qs-primaryHover transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-2xl bg-qs-primary p-4 text-sm font-black text-white shadow-xl shadow-qs-primary/20 transition-all hover:bg-qs-primaryHover hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Account' : mode === 'signup' ? 'Create Free Account' : 'Send Reset Link'}</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-qs-border text-center">
            <p className="text-sm font-medium text-qs-text-sec">
              {mode === 'signin' ? (
                <>Don't have an account yet? <button onClick={() => { setMode('signup'); setMessage(null); }} className="text-qs-primary font-black hover:underline underline-offset-4 decoration-2">Create Account</button></>
              ) : mode === 'signup' ? (
                <>Already a member? <button onClick={() => { setMode('signin'); setMessage(null); }} className="text-qs-primary font-black hover:underline underline-offset-4 decoration-2">Sign In</button></>
              ) : (
                <button onClick={() => { setMode('signin'); setMessage(null); }} className="text-qs-primary font-black hover:underline underline-offset-4 decoration-2 flex items-center justify-center gap-2 mx-auto"><ArrowRight size={16} className="rotate-180" /> Back to Sign In</button>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
