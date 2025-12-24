import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiBarChart2,
  FiCompass,
  FiGitBranch,
  FiLink,
  FiRefreshCw,
  FiShield,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';
import { Card } from '../components/ui/card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  Heading,
  Text,
  Kicker,
  Stack,
  Section,
  Tag,
} from '../components/ui/design-system';

const serviceAreas = [
  {
    title: 'Custom Application Development',
    copy: 'We build fast, scalable web and mobile applications tailored to your specific business workflows. No templates, just purpose-built software.',
    bullets: ['React & Node.js Apps', 'Mobile Development', 'SaaS Platforms'],
    icon: FiGitBranch,
  },
  {
    title: 'Legacy System Rescue',
    copy: 'We stabilize and modernize aging software. We reduce technical debt and improve performance without requiring a risky full rewrite.',
    bullets: ['Code Refactoring', 'Performance Tuning', 'Cloud Migration'],
    icon: FiRefreshCw,
  },
  {
    title: 'Infrastructure & DevOps',
    copy: 'We design and manage secure cloud infrastructure that scales automatically and heals itself. We treat operations as a software problem.',
    bullets: ['AWS / Azure / GCP', 'CI/CD Pipelines', 'Automated Testing'],
    icon: FiShield,
  },
  {
    title: 'Integrations & Automation',
    copy: 'We connect your disconnected tools (CRM, ERP, Payments) to eliminate manual data entry and human error.',
    bullets: [
      'Custom API Development',
      'Data Synchronization',
      'Workflow Automation',
    ],
    icon: FiLink,
  },
  {
    title: 'Technical Strategy',
    copy: 'We act as your fractional CTO, helping you make the right technology choices today to support your long-term business goals.',
    bullets: ['Architecture Review', 'Roadmap Planning', 'Vendor Selection'],
    icon: FiCompass,
  },
  {
    title: '24/7 Platform Health',
    copy: 'We provide round-the-clock monitoring and incident response. We catch issues before your customers do.',
    bullets: ['Real-time Monitoring', 'Security Patching', 'Incident Response'],
    icon: FiActivity,
  },
];

const Home: React.FC = () => {
  return (
    <Stack>
      <Helmet>
        <title>
          Gergen Software | Simple software that moves your business
        </title>
        <meta
          name='description'
          content='Bring us a business problem. We build the simplest software that solves it—then keep it healthy as you grow.'
        />
      </Helmet>

      <div className='min-h-screen flex flex-col justify-center relative overflow-hidden'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-40'
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(24,149,255,0.1), transparent 50%), radial-gradient(circle at 80% 20%, rgba(155,139,255,0.15), transparent 30%)',
          }}
        />
        <div className='grid-shell relative z-10'>
          <div className='max-w-4xl mx-auto text-center'>
            <div className='animate-fade-up'>
              <span className='inline-block mb-6 text-sm font-bold tracking-[0.2em] text-brand-strong uppercase'>
                Gergen Software
              </span>
            </div>
            <div className='animate-fade-up delay-100'>
              <Heading
                level='h1'
                variant='display'
                className='tracking-tight text-6xl sm:text-7xl lg:text-8xl mb-8'
              >
                Resilient software. <br />
                <span className='text-text-muted'>By design.</span>
              </Heading>
            </div>
            <div className='animate-fade-up delay-200'>
              <Text
                variant='lead'
                className='max-w-2xl mx-auto text-xl leading-relaxed text-text-muted'
              >
                We are a consultancy dedicated to helping businesses succeed
                through better software. We bring the expertise to solve your
                hardest problems and the integrity to build solutions that last.
              </Text>
            </div>
            <div className='mt-10 flex flex-wrap justify-center gap-4 animate-fade-up delay-300'>
              <Link to='/start' className='btn-primary px-8 py-4 text-base'>
                Start a Project
              </Link>
              <a
                href='#getting-started'
                className='btn-secondary px-8 py-4 text-base'
              >
                How it works
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className='grid-shell py-24 space-y-32'>
        <Section spacing='none' className='space-y-8'>
          <PageHeader
            kicker='CAPABILITIES'
            title='Complete technical ownership'
            description='We handle the hard engineering problems so you can focus on your business. From the first line of code to production monitoring, we have you covered.'
            actions={
              <a
                href='mailto:contact@gergensoftware.com'
                className='btn-primary text-xs px-5 py-2'
                rel='nofollow'
              >
                Talk through your roadmap
              </a>
            }
          />
          <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {serviceAreas.map((service) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.title}
                  className='flex flex-col gap-4 rounded-2xl'
                >
                  <div className='flex items-center gap-3'>
                    <span className='h-11 w-11 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center'>
                      <Icon size={20} />
                    </span>
                    <Heading level='h3' variant='subtitle' className='text-lg'>
                      {service.title}
                    </Heading>
                  </div>
                  <Text variant='small' className='leading-relaxed'>
                    {service.copy}
                  </Text>
                  <ul className='mt-2 space-y-1 text-sm text-text-muted'>
                    {service.bullets.map((bullet) => (
                      <li key={bullet} className='flex gap-2'>
                        <span className='text-brand-strong'>•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </Section>

        <Section spacing='none' className='space-y-8' id='getting-started'>
          <PageHeader
            kicker='GETTING STARTED'
            title='Where we begin'
            description='Whether you are launching a new product or stabilizing an existing one, our goal is the same: to get you to a point where your software is an asset, not a liability.'
          />
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <Card className='p-8 flex flex-col gap-6 border-l-4 border-l-brand-strong'>
              <div>
                <div className='flex items-center gap-3 mb-4'>
                  <span className='h-10 w-10 rounded-lg bg-brand-soft text-brand-strong flex items-center justify-center'>
                    <FiZap size={20} />
                  </span>
                  <Heading level='h3' variant='subtitle' className='text-xl'>
                    New Development
                  </Heading>
                </div>
                <Text variant='lead' className='mb-4'>
                  Build it right the first time.
                </Text>
                <Text variant='small' className='mb-6'>
                  We prioritize the architectural decisions that preserve your
                  ability to move fast indefinitely. By establishing a
                  professional engineering environment immediately, we prevent
                  the accumulation of technical debt that typically paralyzes
                  projects after their first release.
                </Text>
              </div>
              <div className='mt-auto pt-6 border-t border-border-subtle flex flex-col gap-4'>
                <Text variant='small' className='font-medium text-text-primary'>
                  Outcome: A production-ready app. We then transition to our
                  monthly retainer to keep it running smoothly.
                </Text>
                <Link
                  to='/start?type=new'
                  className='btn-secondary w-full justify-center'
                >
                  Discuss your idea
                </Link>
              </div>
            </Card>

            <Card className='p-8 flex flex-col gap-6 border-l-4 border-l-brand-strong'>
              <div>
                <div className='flex items-center gap-3 mb-4'>
                  <span className='h-10 w-10 rounded-lg bg-brand-soft text-brand-strong flex items-center justify-center'>
                    <FiRefreshCw size={20} />
                  </span>
                  <Heading level='h3' variant='subtitle' className='text-xl'>
                    Legacy Onboarding
                  </Heading>
                </div>
                <Text variant='lead' className='mb-4'>
                  Stabilize and modernize.
                </Text>
                <Text variant='small' className='mb-6'>
                  We apply forensic engineering to understand and stabilize your
                  existing system. By making the system's behavior visible and
                  predictable, we remove the risk from updates and allow you to
                  shift focus from fighting fires back to innovation.
                </Text>
              </div>
              <div className='mt-auto pt-6 border-t border-border-subtle flex flex-col gap-4'>
                <Text variant='small' className='font-medium text-text-primary'>
                  Outcome: A stable platform. We then transition to our monthly
                  retainer to maintain that health.
                </Text>
                <Link
                  to='/start?type=audit'
                  className='btn-secondary w-full justify-center'
                >
                  Request an audit
                </Link>
              </div>
            </Card>

            <Card className='p-8 flex flex-col gap-6 border-l-4 border-l-emerald-500'>
              <div>
                <div className='flex items-center gap-3 mb-4'>
                  <span className='h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center'>
                    <FiActivity size={20} />
                  </span>
                  <Heading level='h3' variant='subtitle' className='text-xl'>
                    Core Partnership
                  </Heading>
                </div>
                <Text variant='lead' className='mb-4'>
                  Strategic technical partnership.
                </Text>
                <Text variant='small' className='mb-6'>
                  We don't just maintain code; we partner with your business. We
                  work directly with you to design solutions, weigh trade-offs,
                  and plan for the future. We are also your dedicated support
                  team, ready to troubleshoot issues and answer questions
                  whenever they arise. You get the alignment and responsiveness
                  of an in-house team, focused entirely on execution and
                  stability.
                </Text>
              </div>
              <div className='mt-auto pt-6 border-t border-border-subtle flex flex-col gap-4'>
                <Text variant='small' className='font-medium text-text-primary'>
                  Outcome: Peace of mind. A stable system and a long-term
                  technology partner.
                </Text>
                <Link
                  to='/start'
                  className='btn-secondary w-full justify-center'
                >
                  View Plans
                </Link>
              </div>
            </Card>
          </div>
        </Section>

        <Section spacing='none' className='space-y-6'>
          <PageHeader
            kicker='THE MODEL'
            title='A business model built for trust'
            description='We align our incentives with yours. We profit when your software is stable and efficient, not when it breaks or takes longer to build. You get the capabilities of a full engineering department without the overhead.'
          />
          <Card className='rounded-3xl overflow-hidden'>
            <div className='grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle'>
              <div className='p-8 lg:p-10 flex flex-col gap-6'>
                <div>
                  <Kicker className='mb-2'>
                    New Development & Legacy Onboarding
                  </Kicker>
                  <Heading level='h3' variant='subtitle' className='text-2xl'>
                    Project Work
                  </Heading>
                </div>
                <div className='flex items-baseline gap-2'>
                  <span className='font-display text-4xl text-text-primary'>
                    Fixed Price
                  </span>
                  <span className='text-text-muted'>/ milestone</span>
                </div>
                <Text variant='muted'>
                  For <strong>New Development</strong> and{' '}
                  <strong>Legacy Onboarding</strong>, we work in fixed-price
                  milestones. We agree on scope and cost upfront. You pay for
                  results, not hours. No surprise bills.
                </Text>
              </div>

              <div className='p-8 lg:p-10 flex flex-col gap-6 bg-surface-alt/30'>
                <div>
                  <Kicker className='mb-2'>Ongoing Care</Kicker>
                  <Heading level='h3' variant='subtitle' className='text-2xl'>
                    Core Partnership
                  </Heading>
                </div>
                <div className='flex items-baseline gap-2'>
                  <span className='text-sm text-text-muted'>Starts at</span>
                  <span className='font-display text-4xl text-text-primary'>
                    $1,000
                  </span>
                  <span className='text-text-muted'>/ month</span>
                </div>
                <Text variant='muted'>
                  Once your platform is stable, we transition to our{' '}
                  <strong>Core Partnership</strong> retainer. This covers 24/7
                  monitoring, security, and the strategic advice of a senior
                  partner.
                </Text>
              </div>
            </div>
            <div className='bg-surface-alt border-t border-border-subtle p-6 flex flex-col md:flex-row items-center justify-between gap-4'>
              <Text variant='small' className='text-text-muted'>
                Simple, transparent terms. No long-term lock-in.
              </Text>
              <Link to='/start' className='btn-primary'>
                Start the Conversation
              </Link>
            </div>
          </Card>
        </Section>
      </div>
    </Stack>
  );
};

export default Home;
