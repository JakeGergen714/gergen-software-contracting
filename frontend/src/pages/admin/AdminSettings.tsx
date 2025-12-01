import { useState, useEffect } from 'react';
import { useServices } from '../../context/ServiceContext';
import { User } from '../../types/domain';

export default function AdminSettings() {
  const { users } = useServices();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await users.getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [users]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updated = await users.updateCurrentUser(user);
      setUser(updated);
      alert('Settings saved');
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className='max-w-2xl mx-auto space-y-8'>
      <div>
        <h1 className='text-3xl font-bold text-slate-900'>Settings</h1>
        <p className='text-slate-500'>Manage your profile and preferences</p>
      </div>

      <form onSubmit={handleSave} className='space-y-6'>
        <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_15px_35px_rgba(15,23,42,0.08)] space-y-4'>
          <h2 className='text-lg font-semibold text-slate-900'>Profile</h2>
          <div className='grid gap-4 md:grid-cols-2'>
            <label className='block text-sm font-medium text-slate-700'>
              First Name
              <input
                type='text'
                value={user.firstName}
                onChange={(e) =>
                  setUser({ ...user, firstName: e.target.value })
                }
                className='mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm'
              />
            </label>
            <label className='block text-sm font-medium text-slate-700'>
              Last Name
              <input
                type='text'
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                className='mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm'
              />
            </label>
            <label className='block text-sm font-medium text-slate-700 md:col-span-2'>
              Email
              <input
                type='email'
                value={user.email}
                disabled
                className='mt-1 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-500 shadow-sm sm:text-sm'
              />
            </label>
          </div>
        </section>

        <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_15px_35px_rgba(15,23,42,0.08)] space-y-4'>
          <h2 className='text-lg font-semibold text-slate-900'>
            Notifications
          </h2>
          <div className='space-y-3'>
            <label className='flex items-center gap-3'>
              <input
                type='checkbox'
                checked={user.preferences?.emailDigest ?? true}
                onChange={(e) =>
                  setUser({
                    ...user,
                    preferences: {
                      ...user.preferences!,
                      emailDigest: e.target.checked,
                    },
                  })
                }
                className='h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500'
              />
              <span className='text-sm text-slate-700'>
                Receive weekly email digest
              </span>
            </label>
            <label className='flex items-center gap-3'>
              <input
                type='checkbox'
                checked={user.preferences?.inAppAlerts ?? true}
                onChange={(e) =>
                  setUser({
                    ...user,
                    preferences: {
                      ...user.preferences!,
                      inAppAlerts: e.target.checked,
                    },
                  })
                }
                className='h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500'
              />
              <span className='text-sm text-slate-700'>Show in-app alerts</span>
            </label>
          </div>
        </section>

        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={saving}
            className='rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50'
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
