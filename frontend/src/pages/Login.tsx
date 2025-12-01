import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuthContext();
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setStatus('loading');
    setError(null);
    try {
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start sign in');
      setStatus('idle');
    }
  };

  return (
    <div className='bg-slate-50 py-16'>
      <Helmet>
        <title>Sign in | Gergen Software</title>
      </Helmet>
      <div className='max-w-md mx-auto px-4'>
        <div className='rounded-3xl border border-white/70 bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(15,23,42,0.1)] p-8'>
          <h1 className='text-3xl font-semibold text-slate-900'>
            Welcome back
          </h1>
          <p className='text-slate-600 mt-2'>
            Use your Keycloak credentials to access the client portal.
          </p>
          <div className='mt-8 grid gap-4'>
            {error && (
              <div className='rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm'>
                {error}
              </div>
            )}
            <button
              type='button'
              onClick={handleLogin}
              disabled={status === 'loading'}
              className='rounded-full bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {status === 'loading' ? 'Redirecting…' : 'Continue with SSO'}
            </button>
            <p className='text-xs text-slate-500 text-center'>
              We will send you to Keycloak to finish signing in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
