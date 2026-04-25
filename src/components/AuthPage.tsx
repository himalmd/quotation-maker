import { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoPrimary from '../assets/logo-primary.webp';
import logoWhite from '../assets/logo-white.webp';

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
        // AuthContext will detect session change and redirect
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel — Branding */}
      <div
        className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-16 text-white"
        style={{ background: 'linear-gradient(135deg, var(--qs-primary) 0%, var(--qs-secondary) 100%)' }}
      >
        <img src={logoWhite} alt="QuoteSuite" className="h-28 object-contain mb-10" />
        <p className="text-lg text-white/70 text-center max-w-xs leading-relaxed">
          Create beautiful, professional quotations in minutes. Sign in to manage your quotes.
        </p>

        <div className="mt-16 space-y-4 w-full max-w-xs">
          {[
            { icon: '✦', label: 'Branded PDF quotations' },
            { icon: '✦', label: 'Discount & currency support' },
            { icon: '✦', label: 'Cloud-saved quote history' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-white/80">
              <span className="text-white font-bold">{icon}</span>
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-qs-bg">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden flex justify-center mb-8">
            <img src={logoPrimary} alt="QuoteSuite" className="h-20 object-contain" />
          </div>

          <h2 className="text-2xl font-bold text-qs-text mb-1">
            {mode === 'signin' && 'Welcome back'}
            {mode === 'signup' && 'Create an account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="text-sm text-qs-text-sec mb-8">
            {mode === 'signin' && "Sign in to your account to continue."}
            {mode === 'signup' && "Join to start creating professional quotations."}
            {mode === 'forgot' && "We'll send a reset link to your email."}
          </p>

          {message && (
            <div className={`mb-5 px-4 py-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-qs-error/10 text-qs-error border border-qs-error/20' : 'bg-qs-success/10 text-qs-success border border-qs-success/20'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-qs-text-muted">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-qs-border bg-qs-surface text-qs-text px-4 py-2.5 text-sm focus:border-qs-primary focus:outline-none focus:ring-2 focus:ring-qs-primary/20 transition"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-qs-text-muted">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full rounded-lg border border-qs-border bg-qs-surface text-qs-text px-4 py-2.5 text-sm focus:border-qs-primary focus:outline-none focus:ring-2 focus:ring-qs-primary/20 transition"
                />
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex justify-end">
                <button type="button" onClick={() => { setMode('forgot'); setMessage(null); }} className="text-xs text-qs-primary hover:text-qs-hover hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white bg-qs-primary hover:bg-qs-hover transition-all disabled:opacity-60"
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-qs-text-sec">
            {mode === 'signin' && (
              <>Don't have an account?{' '}<button onClick={() => { setMode('signup'); setMessage(null); }} className="text-qs-primary hover:text-qs-hover font-medium hover:underline">Sign up</button></>
            )}
            {mode === 'signup' && (
              <>Already have an account?{' '}<button onClick={() => { setMode('signin'); setMessage(null); }} className="text-qs-primary hover:text-qs-hover font-medium hover:underline">Sign in</button></>
            )}
            {mode === 'forgot' && (
              <button onClick={() => { setMode('signin'); setMessage(null); }} className="text-qs-primary hover:text-qs-hover font-medium hover:underline">← Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
