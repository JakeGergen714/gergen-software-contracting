import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuthContext();
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setStatus('loading');
    setError(null);
    try {
      await signup();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start signup');
      setStatus('idle');
    }
  };

  return (
    <div className='bg-gradient-to-b from-sky-50 to-white py-16'>
      <Helmet>
        <title>Start your workspace | Gergen Software</title>
      </Helmet>
      <div className='max-w-3xl mx-auto px-4'>
        <div className='rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(15,118,110,0.15)] p-8'>
          <h1 className='text-3xl font-semibold text-slate-900'>
            Create your workspace
          </h1>
          <p className='text-slate-600 mt-2'>
            We use Keycloak for identity. Click below to register or manage your
            account.
          </p>
          <div className='mt-8 grid gap-4'>
            {error && (
              <div className='rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm'>
                {error}
              </div>
            )}
            <button
              type='button'
              onClick={handleSignup}
              disabled={status === 'loading'}
              className='rounded-full bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {status === 'loading' ? 'Redirecting…' : 'Create account'}
            </button>
            <p className='text-xs text-slate-500 text-center'>
              You will be redirected to Keycloak to finish registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
