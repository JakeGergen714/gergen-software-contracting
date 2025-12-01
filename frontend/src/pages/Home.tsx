import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiArrowDown,
  FiBarChart2,
  FiCheckCircle,
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
    <div className='relative space-y-14 lg:space-y-16'>
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
            <span className='tag tag-soft mb-4 inline-flex'>
              Full-service product engineering, without the headcount
            </span>
            <h1 className='font-display text-4xl tracking-tight text-text-primary sm:text-5xl lg:text-6xl'>
              A senior software team for a simple monthly fee.
            </h1>
            <p className='mt-6 text-lg text-text-muted max-w-2xl'>
              We build your core software right once—with clean architecture,
              observability, and automated tests—so it&apos;s cheap to run and
              easy to change. That&apos;s how we offer full-service development,
              maintenance, and small features at a price a single senior hire
              can&apos;t match.
            </p>
            <div className='mt-8 flex flex-wrap gap-3'>
              <Link to='/about' className='btn-primary'>
                About Us
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <section className='space-y-8'>
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
                  <h3 className='text-lg font-semibold text-text-primary'>
                    {service.title}
                  </h3>
                </div>
                <p className='text-sm text-text-muted leading-relaxed'>
                  {service.copy}
                </p>
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
      </section>

      <section>
        <div className='rounded-[2.5rem] bg-surface-alt p-6 md:p-12 space-y-12 border border-border-subtle'>
          <PageHeader
            kicker='OUR APPROACH'
            title='How we offer a full team for the price of a freelancer.'
            description="It's not magic. It's engineering rigor. By building software correctly from the start, we eliminate the bloat, bugs, and meetings that make traditional development expensive."
          />

          <div className='grid gap-6 md:grid-cols-3'>
            <Card className='p-8 flex flex-col gap-6 bg-surface border-border-subtle hover:border-brand-soft/50 transition-colors'>
              <div className='h-12 w-12 rounded-xl bg-brand-soft/50 text-brand-strong flex items-center justify-center text-xl'>
                <FiCompass />
              </div>
              <div>
                <h3 className='text-xl font-display font-semibold text-text-primary mb-3'>
                  Front-Loaded Quality
                </h3>
                <p className='text-text-muted leading-relaxed text-sm'>
                  We invest heavily at the start. By building (or refactoring)
                  with strict architectural standards and clean code, we
                  eliminate the &quot;technical debt&quot; that slows down
                  traditional teams. A healthy codebase is easy to understand
                  and quick to change.
                </p>
              </div>
            </Card>

            <Card className='p-8 flex flex-col gap-6 bg-surface border-border-subtle hover:border-brand-soft/50 transition-colors'>
              <div className='h-12 w-12 rounded-xl bg-brand-soft/50 text-brand-strong flex items-center justify-center text-xl'>
                <FiShield />
              </div>
              <div>
                <h3 className='text-xl font-display font-semibold text-text-primary mb-3'>
                  Automated Confidence
                </h3>
                <p className='text-text-muted leading-relaxed text-sm'>
                  We don&apos;t need a QA department. Our automated test suites
                  and observability pipelines catch issues instantly. This means
                  we spend our time building features, not chasing bugs or
                  manually testing every release.
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
                  Because the system is healthy, maintenance takes hours, not
                  weeks. We pass those savings to you. You get a senior partner
                  on retainer for a fraction of the cost, and we get a stable
                  platform to manage. Everyone wins.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className='space-y-6'>
        <PageHeader
          kicker='PRICING'
          title='Ongoing care for software built to run itself'
          description='After we build or onboard your system and put guardrails in place, ongoing work stays light. You get a stable senior engineering team for less than a single hire, focused on keeping things healthy and shipping the small features that matter.'
        />
        <Card className='rounded-3xl p-8 lg:p-10'>
          <div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='uppercase text-xs font-semibold tracking-[0.2em] text-text-muted'>
                Core partnership
              </p>
              <div className='mt-3 flex items-baseline gap-3'>
                <span className='font-display text-4xl sm:text-5xl text-text-primary'>
                  $1,000
                </span>
                <span className='text-text-muted'>/ month</span>
              </div>
              <p className='mt-3 max-w-2xl text-text-muted'>
                Every month, you get up to 10 hours of senior engineering time.
                In practice, most healthy systems need far less—1-2 hours of
                small fixes and upkeep—which leaves room for the small features
                and improvements that move the needle. We always prioritize the
                highest-leverage work first.
              </p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <a
                href='mailto:contact@gergensoftware.com'
                className='btn-primary'
                rel='nofollow'
              >
                Talk about your numbers
              </a>
              <Link to='/faq' className='btn-secondary'>
                Ask a specific question
              </Link>
            </div>
          </div>

          <div className='mt-8 grid gap-4 md:grid-cols-2'>
            <div className='rounded-2xl border border-border-subtle/70 bg-surface-alt p-5 flex flex-col gap-2'>
              <h3 className='text-sm font-semibold text-text-primary uppercase tracking-[0.16em]'>
                Included feature time
              </h3>
              <p className='text-sm text-text-muted'>
                Your plan includes{' '}
                <span className='font-semibold text-text-primary'>
                  10 hours
                </span>{' '}
                of hands-on engineering time each month. We use it for the mix
                of maintenance, support, and incremental features that will have
                the biggest impact right now.
              </p>
            </div>
            <div className='rounded-2xl border border-border-subtle/70 bg-surface-alt p-5 flex flex-col gap-2'>
              <h3 className='text-sm font-semibold text-text-primary uppercase tracking-[0.16em]'>
                Need more than that?
              </h3>
              <p className='text-sm text-text-muted'>
                When you have a larger push—new modules, major redesigns, big
                integrations—we add time at a straightforward hourly rate and
                agree on scope before we start. No surprise bills, no vague
                "retainers."
              </p>
            </div>
          </div>

          <div className='mt-8 rounded-2xl border border-border-subtle bg-surface p-5 text-sm text-text-muted'>
            No long-term lock-in. If your needs shrink, the baseline plan keeps
            your platform healthy; when they grow, we scale up work with clear
            estimates and pricing first.
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Home;
