import { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import { useServices } from '../../context/ServiceContext';
import { Notification } from '../../types/domain';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const { notifications } = useServices();
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  const loadNotifications = async () => {
    try {
      const data = await notifications.getNotifications();
      setItems(data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = async () => {
    if (!isOpen) {
      setIsOpen(true);
      if (unreadCount > 0) {
        await notifications.markAsRead();
        // Optimistically update
        setItems(items.map((n) => ({ ...n, read: true })));
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleItemClick = (notification: Notification) => {
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className='relative' ref={wrapperRef}>
      <button
        type='button'
        onClick={handleToggle}
        className='relative flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-text-muted hover:text-text-primary transition-colors'
        aria-label='Notifications'
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className='absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white'>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-80 rounded-xl border border-border-subtle bg-white shadow-xl z-50 overflow-hidden'>
          <div className='bg-slate-50 px-4 py-3 border-b border-slate-100'>
            <h3 className='text-sm font-semibold text-slate-900'>
              Notifications
            </h3>
          </div>
          <div className='max-h-96 overflow-y-auto'>
            {items.length === 0 ? (
              <div className='p-8 text-center text-sm text-slate-500'>
                No notifications yet.
              </div>
            ) : (
              <div className='divide-y divide-slate-100'>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                      !item.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <p className='text-sm font-semibold text-slate-900'>
                      {item.title}
                    </p>
                    <p className='text-xs text-slate-600 mt-1'>
                      {item.message}
                    </p>
                    <p className='text-[10px] text-slate-400 mt-2'>
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
