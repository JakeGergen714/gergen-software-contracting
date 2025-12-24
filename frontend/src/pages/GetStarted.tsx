import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiRefreshCw, FiZap } from 'react-icons/fi';
import {
  Stack,
  Section,
  Container,
  Heading,
  Text,
  Card,
  Button,
} from '../components/ui/design-system';
import { useAuthContext } from '../context/AuthContext';

type Step = 'GOAL' | 'DETAILS' | 'CONTACT' | 'ACCOUNT';

interface WizardState {
  goal: 'NEW_DEV' | 'LEGACY_AUDIT' | null;
  description: string;
  techStack: string;
  businessName: string;
  name: string;
  email: string;
  phone: string;
}

const GetStarted: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, session } = useAuthContext();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (session) {
      navigate('/business');
    }
  }, [session, navigate]);

  const [step, setStep] = useState<Step>('GOAL');
  const [state, setState] = useState<WizardState>({
    goal: null,
    description: '',
    techStack: '',
    businessName: '',
    name: '',
    email: '',
    phone: '',
  });

  // Initialize from URL param
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'audit') {
      setState((s) => ({ ...s, goal: 'LEGACY_AUDIT' }));
      setStep('DETAILS');
    } else if (type === 'new') {
      setState((s) => ({ ...s, goal: 'NEW_DEV' }));
      setStep('DETAILS');
    }
  }, [searchParams]);

  const handleNext = () => {
    if (step === 'GOAL') setStep('DETAILS');
    else if (step === 'DETAILS') setStep('CONTACT');
    else if (step === 'CONTACT') setStep('ACCOUNT');
  };

  const handleSkip = () => {
    if (step === 'GOAL')
      setStep('DETAILS'); // Should not happen if we don't add skip to GOAL
    else if (step === 'DETAILS') setStep('CONTACT');
    else if (step === 'CONTACT') setStep('ACCOUNT');
  };

  const handleSignup = async () => {
    // Save state to localStorage to retrieve after redirect
    localStorage.setItem('gergen_intake_state', JSON.stringify(state));
    await signup();
  };

  return (
    <Stack>
      <Helmet>
        <title>Get Started | Gergen Software</title>
      </Helmet>

      <Section>
        <Container size='prose'>
          <div className='mb-8 flex items-center justify-between'>
            <Heading level='h1'>Let's build your roadmap</Heading>
            <div className='text-sm font-medium text-text-muted'>
              Step{' '}
              {step === 'GOAL'
                ? 1
                : step === 'DETAILS'
                ? 2
                : step === 'CONTACT'
                ? 3
                : 4}{' '}
              of 4
            </div>
          </div>

          {step === 'GOAL' && (
            <div className='grid gap-6 md:grid-cols-2'>
              <Card
                className={`cursor-pointer transition-all hover:border-brand-strong ${
                  state.goal === 'NEW_DEV'
                    ? 'border-brand-strong ring-1 ring-brand-strong'
                    : ''
                }`}
                onClick={() => setState({ ...state, goal: 'NEW_DEV' })}
              >
                <div className='p-6 flex flex-col gap-4 h-full'>
                  <div className='h-12 w-12 rounded-xl bg-brand-soft text-brand-strong flex items-center justify-center text-xl'>
                    <FiZap />
                  </div>
                  <div>
                    <Heading level='h3' variant='subtitle' className='mb-2'>
                      New Development
                    </Heading>
                    <Text variant='small'>
                      I have an idea or a manual process I want to automate with
                      custom software.
                    </Text>
                  </div>
                </div>
              </Card>

              <Card
                className={`cursor-pointer transition-all hover:border-brand-strong ${
                  state.goal === 'LEGACY_AUDIT'
                    ? 'border-brand-strong ring-1 ring-brand-strong'
                    : ''
                }`}
                onClick={() => setState({ ...state, goal: 'LEGACY_AUDIT' })}
              >
                <div className='p-6 flex flex-col gap-4 h-full'>
                  <div className='h-12 w-12 rounded-xl bg-brand-soft text-brand-strong flex items-center justify-center text-xl'>
                    <FiRefreshCw />
                  </div>
                  <div>
                    <Heading level='h3' variant='subtitle' className='mb-2'>
                      Legacy Onboarding
                    </Heading>
                    <Text variant='small'>
                      I have existing software that needs maintenance, bug
                      fixes, or new features.
                    </Text>
                  </div>
                </div>
              </Card>

              <div className='md:col-span-2 flex justify-between mt-4'>
                <Button variant='ghost' onClick={() => setStep('CONTACT')}>
                  Skip
                </Button>
                <Button onClick={handleNext} disabled={!state.goal}>
                  Next Step <FiArrowRight className='ml-2' />
                </Button>
              </div>
            </div>
          )}

          {step === 'DETAILS' && (
            <Card className='p-8 space-y-6'>
              <div>
                <Heading level='h3' variant='subtitle' className='mb-4'>
                  {state.goal === 'NEW_DEV'
                    ? 'Tell us about your idea'
                    : 'Tell us about your system'}
                </Heading>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-text-primary mb-2'>
                      {state.goal === 'NEW_DEV'
                        ? 'What problem are you trying to solve?'
                        : 'What are the biggest pain points right now?'}
                    </label>
                    <textarea
                      className='w-full rounded-xl border border-border-subtle bg-surface-alt p-4 min-h-[120px] focus:border-brand-strong focus:ring-1 focus:ring-brand-strong outline-none'
                      placeholder={
                        state.goal === 'NEW_DEV'
                          ? 'e.g., We manage inventory in Excel and it’s a nightmare...'
                          : 'e.g., The site is slow, we have bugs in checkout, and deployments take forever...'
                      }
                      value={state.description}
                      onChange={(e) =>
                        setState({ ...state, description: e.target.value })
                      }
                    />
                  </div>

                  {state.goal === 'LEGACY_AUDIT' && (
                    <div>
                      <label className='block text-sm font-medium text-text-primary mb-2'>
                        Do you know your current tech stack?
                      </label>
                      <input
                        type='text'
                        className='w-full rounded-xl border border-border-subtle bg-surface-alt px-4 py-3 focus:border-brand-strong focus:ring-1 focus:ring-brand-strong outline-none'
                        placeholder='e.g., React, Node.js, AWS, PHP, etc.'
                        value={state.techStack}
                        onChange={(e) =>
                          setState({ ...state, techStack: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className='flex justify-between pt-4 border-t border-border-subtle'>
                <Button variant='secondary' onClick={() => setStep('GOAL')}>
                  Back
                </Button>
                <div className='flex gap-3'>
                  <Button variant='ghost' onClick={handleSkip}>
                    Skip
                  </Button>
                  <Button onClick={handleNext} disabled={!state.description}>
                    Next Step <FiArrowRight className='ml-2' />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {step === 'CONTACT' && (
            <Card className='p-8 space-y-6'>
              <div>
                <Heading level='h3' variant='subtitle' className='mb-4'>
                  Contact Info
                </Heading>

                <div className='grid gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-text-primary mb-2'>
                      Full Name
                    </label>
                    <input
                      type='text'
                      className='w-full rounded-xl border border-border-subtle bg-surface-alt px-4 py-3 focus:border-brand-strong focus:ring-1 focus:ring-brand-strong outline-none'
                      value={state.name}
                      onChange={(e) =>
                        setState({ ...state, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-text-primary mb-2'>
                      Email Address
                    </label>
                    <input
                      type='email'
                      className='w-full rounded-xl border border-border-subtle bg-surface-alt px-4 py-3 focus:border-brand-strong focus:ring-1 focus:ring-brand-strong outline-none'
                      value={state.email}
                      onChange={(e) =>
                        setState({ ...state, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-text-primary mb-2'>
                      Phone Number
                    </label>
                    <input
                      type='tel'
                      className='w-full rounded-xl border border-border-subtle bg-surface-alt px-4 py-3 focus:border-brand-strong focus:ring-1 focus:ring-brand-strong outline-none'
                      value={state.phone}
                      onChange={(e) =>
                        setState({ ...state, phone: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-text-primary mb-2'>
                      Business Name
                    </label>
                    <input
                      type='text'
                      className='w-full rounded-xl border border-border-subtle bg-surface-alt px-4 py-3 focus:border-brand-strong focus:ring-1 focus:ring-brand-strong outline-none'
                      value={state.businessName}
                      onChange={(e) =>
                        setState({ ...state, businessName: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className='flex justify-between pt-4 border-t border-border-subtle'>
                <Button variant='secondary' onClick={() => setStep('DETAILS')}>
                  Back
                </Button>
                <div className='flex gap-3'>
                  <Button variant='ghost' onClick={handleSkip}>
                    Skip
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!state.name || !state.email}
                  >
                    Next Step <FiArrowRight className='ml-2' />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {step === 'ACCOUNT' && (
            <Card className='p-8 space-y-6'>
              <div className='text-center space-y-4'>
                <div className='mx-auto h-16 w-16 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center text-2xl'>
                  <FiCheck />
                </div>
                <Heading level='h2'>We'll be in touch soon</Heading>
                <Text variant='muted'>
                  Create your secure workspace to submit your roadmap. If you'd
                  prefer to talk to a human right now, give us a call at{' '}
                  <a
                    href='tel:+15713820818'
                    className='text-brand-strong font-medium hover:underline'
                  >
                    (571) 382-0818
                  </a>
                  .
                </Text>
              </div>

              <div className='bg-surface-alt rounded-xl p-6 border border-border-subtle space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-text-muted'>Project Type</span>
                  <span className='font-medium'>
                    {state.goal === 'NEW_DEV'
                      ? 'New Development'
                      : state.goal === 'LEGACY_AUDIT'
                      ? 'Legacy Onboarding'
                      : 'Not specified'}
                  </span>
                </div>
                {state.businessName && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-text-muted'>Business</span>
                    <span className='font-medium'>{state.businessName}</span>
                  </div>
                )}
                {state.name && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-text-muted'>Contact</span>
                    <span className='font-medium'>{state.name}</span>
                  </div>
                )}
              </div>

              <Button onClick={handleSignup} className='w-full py-4 text-lg'>
                Create Account & Submit
              </Button>

              <Text variant='small' className='text-center text-text-muted'>
                You'll be redirected to our secure identity provider.
              </Text>

              <div className='flex justify-center pt-4'>
                <Button variant='ghost' onClick={() => setStep('CONTACT')}>
                  Back
                </Button>
              </div>
            </Card>
          )}
        </Container>
      </Section>
    </Stack>
  );
};

export default GetStarted;
