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

  if (loading) return <div className='text-text-muted'>Loading...</div>;
  if (!user) return <div className='text-text-muted'>User not found</div>;

  return (
    <div className='max-w-2xl mx-auto space-y-8'>
      <div>
        <h1 className='text-3xl font-bold text-text-primary'>Settings</h1>
        <p className='text-text-muted'>Manage your profile and preferences</p>
      </div>

      <form onSubmit={handleSave} className='space-y-6'>
        <section className='rounded-3xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4'>
          <h2 className='text-lg font-semibold text-text-primary'>Profile</h2>
          <div className='grid gap-4 md:grid-cols-2'>
            <label className='block text-sm font-medium text-text-secondary'>
              First Name
              <input
                type='text'
                value={user.firstName}
                onChange={(e) =>
                  setUser({ ...user, firstName: e.target.value })
                }
                className='mt-1 block w-full rounded-md border border-border-subtle bg-surface-alt px-3 py-2 shadow-sm focus:border-brand-solid focus:outline-none focus:ring-1 focus:ring-brand-solid sm:text-sm text-text-primary'
              />
            </label>
            <label className='block text-sm font-medium text-text-secondary'>
              Last Name
              <input
                type='text'
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                className='mt-1 block w-full rounded-md border border-border-subtle bg-surface-alt px-3 py-2 shadow-sm focus:border-brand-solid focus:outline-none focus:ring-1 focus:ring-brand-solid sm:text-sm text-text-primary'
              />
            </label>
            <label className='block text-sm font-medium text-text-secondary md:col-span-2'>
              Email
              <input
                type='email'
                value={user.email}
                disabled
                className='mt-1 block w-full rounded-md border border-border-subtle bg-surface-alt px-3 py-2 text-text-muted shadow-sm sm:text-sm'
              />
            </label>
          </div>
        </section>

        <section className='rounded-3xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4'>
          <h2 className='text-lg font-semibold text-text-primary'>
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
                className='h-4 w-4 rounded border-border-subtle text-brand-solid focus:ring-brand-solid'
              />
              <span className='text-sm text-text-secondary'>
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
                className='h-4 w-4 rounded border-border-subtle text-brand-solid focus:ring-brand-solid'
              />
              <span className='text-sm text-text-secondary'>
                Show in-app alerts
              </span>
            </label>
          </div>
        </section>

        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={saving}
            className='rounded-full bg-brand-solid px-6 py-2 text-sm font-semibold text-white hover:bg-brand-solid/90 disabled:opacity-50'
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
