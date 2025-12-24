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
    title: 'Continuously evolve your product',
    copy: "Software is a living thing. We partner with you to test new ideas, learn what's useful, and adapt the platform so it always serves your changing business needs.",
    bullets: [
      'Rapid idea validation',
      'Data-driven adaptation',
      'Continuous product discovery',
    ],
    icon: FiGitBranch,
  },
  {
    title: 'Prevent costly downtime',
    copy: 'We catch issues before your customers do. Sleep better knowing your critical systems are being watched 24/7.',
    bullets: [
      'Issues fixed before you notice',
      'Real-time health dashboards',
      'Permanent root-cause fixes',
    ],
    icon: FiActivity,
  },
  {
    title: 'Eliminate technical debt',
    copy: 'Software rots if left alone. We handle the unglamorous updates that keep your platform secure and fast.',
    bullets: ['Security patching', 'Dependency upgrades', 'Performance tuning'],
    icon: FiShield,
  },
  {
    title: 'Automate manual work',
    copy: 'Stop copy-pasting data. We connect your CRM, ERP, and accounting tools to create a single source of truth.',
    bullets: [
      'Bidirectional syncs',
      'Custom API integrations',
      'Clean data records',
    ],
    icon: FiLink,
  },
  {
    title: 'Empower your team',
    copy: 'Clunky internal tools kill morale. We streamline workflows so your staff can focus on high-value work.',
    bullets: [
      'Workflow automation',
      'UI simplification',
      'Hours saved per week',
    ],
    icon: FiZap,
  },
  {
    title: 'Decide with data',
    copy: 'Stop guessing. We build custom dashboards that give you the exact metrics you need to run the business.',
    bullets: [
      'Executive summaries',
      'Operational drill-downs',
      'Automated reports',
    ],
    icon: FiBarChart2,
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

      <Card className='relative overflow-hidden bg-surface shadow-elevated border border-border-subtle p-8 sm:p-10 lg:p-12'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-40'
          style={{
            background:
              'radial-gradient(circle at 0% 0%, rgba(24,149,255,0.15), transparent 55%), radial-gradient(circle at 100% 0%, rgba(155,139,255,0.25), transparent 45%)',
          }}
        />
        <div className='relative'>
          <div>
            <Tag variant='soft' className='mb-4'>
              Full-service product engineering, without the headcount
            </Tag>
            <Heading
              level='h1'
              variant='display'
              className='tracking-tight sm:text-5xl lg:text-6xl'
            >
              Senior engineering for the life of your software.
            </Heading>
            <Text variant='lead' className='mt-6 max-w-2xl'>
              We build your core software right once—with clean architecture,
              observability, and automated tests—so it&apos;s cheap to run and
              easy to change. That&apos;s how we offer full-service development,
              maintenance, and small features at a price a single senior hire
              can&apos;t match.
            </Text>
            <div className='mt-8 flex flex-wrap gap-3'>
              <Link to='/start' className='btn-primary'>
                Start a Project
              </Link>
              <a href='#getting-started' className='btn-secondary'>
                How it works
              </a>
            </div>
          </div>
        </div>
      </Card>

      <Section spacing='none' className='space-y-8'>
        <PageHeader
          kicker='WHAT WE HANDLE'
          title='From net-new features to the unglamorous upkeep'
          description='We blend product thinking with platform pragmatism so you get momentum without inheriting technical debt.'
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

      <Section spacing='none'>
        <div className='rounded-[2.5rem] bg-surface-alt p-6 md:p-12 space-y-12 border border-border-subtle'>
          <PageHeader
            kicker='OUR APPROACH'
            title='Resilience through experience.'
            description="Software will never be perfect, but it shouldn't be fragile. We bring the deep expertise required to build systems that are resilient by design. We know that most problems are preventable with the right architecture, and we have the experience to build it right."
          />

          <div className='grid gap-6 md:grid-cols-3'>
            <Card className='p-8 flex flex-col gap-6 bg-surface border-border-subtle hover:border-brand-soft/50 transition-colors'>
              <div className='h-12 w-12 rounded-xl bg-brand-soft/50 text-brand-strong flex items-center justify-center text-xl'>
                <FiCompass />
              </div>
              <div>
                <Heading level='h3' variant='subtitle' className='text-xl mb-3'>
                  Built to Last
                </Heading>
                <Text variant='small' className='leading-relaxed'>
                  We invest heavily at the start. By building (or refactoring)
                  with strict architectural standards and clean code, we
                  eliminate the &quot;technical debt&quot; that slows down
                  traditional teams. A healthy codebase is easy to understand
                  and quick to change.
                </Text>
              </div>
            </Card>

            <Card className='p-8 flex flex-col gap-6 bg-surface border-border-subtle hover:border-brand-soft/50 transition-colors'>
              <div className='h-12 w-12 rounded-xl bg-brand-soft/50 text-brand-strong flex items-center justify-center text-xl'>
                <FiShield />
              </div>
              <div>
                <h3 className='text-xl font-display font-semibold text-text-primary mb-3'>
                  Reliability by Design
                </h3>
                <p className='text-text-muted leading-relaxed text-sm'>
                  We build systems that verify themselves. By automating the
                  testing and deployment process, we ensure that every change is
                  safe. This allows us to ship new features frequently without
                  the fear of breaking what already works.
                </p>
              </div>
            </Card>

            <Card className='p-8 flex flex-col gap-6 bg-surface border-border-subtle hover:border-brand-soft/50 transition-colors'>
              <div className='h-12 w-12 rounded-xl bg-brand-soft/50 text-brand-strong flex items-center justify-center text-xl'>
                <FiTrendingUp />
              </div>
              <div>
                <h3 className='text-xl font-display font-semibold text-text-primary mb-3'>
                  The Efficiency Dividend
                </h3>
                <p className='text-text-muted leading-relaxed text-sm'>
                  A healthy codebase is a competitive advantage. Because we
                  don't waste time fighting fires, we can focus our energy on
                  high-leverage work that grows your business. You get the
                  output of a senior team without the overhead.
                </p>
              </div>
            </Card>
          </div>
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
                professional engineering environment immediately, we prevent the
                accumulation of technical debt that typically paralyzes projects
                after their first release.
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
                team, ready to troubleshoot issues and answer questions whenever
                they arise. You get the alignment and responsiveness of an
                in-house team, focused entirely on execution and stability.
              </Text>
            </div>
            <div className='mt-auto pt-6 border-t border-border-subtle flex flex-col gap-4'>
              <Text variant='small' className='font-medium text-text-primary'>
                Outcome: Peace of mind. A stable system and a long-term
                technology partner.
              </Text>
              <Link to='/start' className='btn-secondary w-full justify-center'>
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
    </Stack>
  );
};

export default Home;
