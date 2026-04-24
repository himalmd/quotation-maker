import { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoUrl from '../assets/images/logo.png';

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
        style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' }}
      >
        <img src={logoUrl} alt="Qualon" className="h-20 object-contain mb-10 brightness-0 invert" />
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Quotation Generator</h1>
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
              <span className="text-[#3498db]">{icon}</span>
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden flex justify-center mb-8">
            <img src={logoUrl} alt="Qualon" className="h-14 object-contain" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {mode === 'signin' && 'Welcome back'}
            {mode === 'signup' && 'Create an account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            {mode === 'signin' && "Sign in to your account to continue."}
            {mode === 'signup' && "Join to start creating professional quotations."}
            {mode === 'forgot' && "We'll send a reset link to your email."}
          </p>

          {message && (
            <div className={`mb-5 px-4 py-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                />
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex justify-end">
                <button type="button" onClick={() => { setMode('forgot'); setMessage(null); }} className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ backgroundColor: '#3498db' }}
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {mode === 'signin' && (
              <>Don't have an account?{' '}<button onClick={() => { setMode('signup'); setMessage(null); }} className="text-blue-600 font-medium hover:underline">Sign up</button></>
            )}
            {mode === 'signup' && (
              <>Already have an account?{' '}<button onClick={() => { setMode('signin'); setMessage(null); }} className="text-blue-600 font-medium hover:underline">Sign in</button></>
            )}
            {mode === 'forgot' && (
              <button onClick={() => { setMode('signin'); setMessage(null); }} className="text-blue-600 font-medium hover:underline">← Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
