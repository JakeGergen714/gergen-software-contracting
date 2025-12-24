import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from '../context/AuthContext';
import {
  Stack,
  Section,
  Container,
  Heading,
  Text,
  Card,
  Button,
} from '../components/ui/design-system';

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
    <Stack className='min-h-[60vh] justify-center'>
      <Helmet>
        <title>Sign in | Gergen Software</title>
      </Helmet>
      <Section>
        <Container size='prose'>
          <Card className='p-8'>
            <Heading level='h1'>Welcome back</Heading>
            <Text variant='muted' className='mt-2'>
              Use your Keycloak credentials to access the client portal.
            </Text>
            <div className='mt-8 grid gap-4'>
              {error && (
                <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
                  {error}
                </div>
              )}
              <Button
                onClick={handleLogin}
                disabled={status === 'loading'}
                className='w-full'
              >
                {status === 'loading' ? 'Redirecting…' : 'Continue with SSO'}
              </Button>
              <Text variant='small' className='text-center text-text-muted'>
                We will send you to Keycloak to finish signing in.
              </Text>
            </div>
          </Card>
        </Container>
      </Section>
    </Stack>
  );
}
