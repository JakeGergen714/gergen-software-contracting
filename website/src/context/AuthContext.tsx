import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { LoginInput, SignupInput, UserSession } from '../types/domain';
import { useServices } from './ServiceContext';

interface AuthContextValue {
  session: UserSession | null;
  loading: boolean;
  login: (input?: LoginInput) => Promise<void>;
  signup: (input?: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth } = useServices();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    auth
      .getSession()
      .then((s) => {
        if (mounted) setSession(s);
      })
      .catch((err) => {
        console.error('Failed to load auth session', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [auth]);

  const login = useCallback(
    async (input?: LoginInput) => {
      await auth.login(input);
      const refreshed = await auth.getSession();
      setSession(refreshed);
    },
    [auth]
  );

  const signup = useCallback(
    async (input?: SignupInput) => {
      await auth.signup(input);
      const refreshed = await auth.getSession();
      setSession(refreshed);
    },
    [auth]
  );

  const logout = useCallback(async () => {
    await auth.logout();
    setSession(null);
  }, [auth]);

  return (
    <AuthContext.Provider value={{ session, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return value;
}
