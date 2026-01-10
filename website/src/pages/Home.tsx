import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiArrowRight,
  FiCheck,
  FiCompass,
  FiGitBranch,
  FiLink,
  FiRefreshCw,
  FiShield,
  FiZap,
} from 'react-icons/fi';
import { Card } from '../components/ui/card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  Heading,
  Text,
  Stack,
  Section,
  Kicker,
} from '../components/ui/design-system';

const serviceAreas = [
  {
    title: 'Eliminate Manual Work',
    copy: 'Stop copy-pasting data between spreadsheets and disconnected systems. We automate your workflows so your team can focus on high-value tasks.',
    bullets: ['Workflow Automation', 'System Integration', 'Error Reduction'],
    icon: FiZap,
  },
  {
    title: 'Modernize Aging Systems',
    copy: 'Don’t let old software hold you back. We stabilize and upgrade your critical legacy systems to support modern business needs without a total rewrite.',
    bullets: ['Risk Mitigation', 'Performance Boost', 'Tech Debt Removal'],
    icon: FiRefreshCw,
  },
  {
    title: 'Build Exact-Fit Tools',
    copy: 'Off-the-shelf software rarely fits perfectly. We build custom solutions tailored exactly to your unique operational advantages.',
    bullets: [
      'Tailored Workflows',
      'Competitive Advantage',
      'User-Centric Design',
    ],
    icon: FiCheck,
  },
];

const Home: React.FC = () => {
  const [activePhase, setActivePhase] = React.useState<1 | 2>(1);
  const [activePhaseNew, setActivePhaseNew] = React.useState<1 | 2>(1);

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

        <Section spacing='none' className='space-y-16' id='engagement-model'>
          <PageHeader
            kicker='THE ENGAGEMENT MODEL'
            title='One partner. Two phases. Total ownership.'
            description="We don't just write code; we take responsibility for the outcome. Our engagement model is designed to align our incentives with your long-term success from day one."
          />

          <div className='grid lg:grid-cols-12 gap-12 lg:gap-24 items-start'>
            {/* Navigation / Timeline */}
            <div className='lg:col-span-4 flex lg:flex-col gap-4 relative'>
              {/* Vertical Line (Desktop) */}
              <div className='absolute left-[23px] top-6 bottom-6 w-0.5 bg-border-subtle hidden lg:block' />

              {/* Phase 1 Nav Item */}
              <button
                onClick={() => setActivePhase(1)}
                className={`group flex items-center gap-6 relative text-left flex-1 lg:flex-none p-4 rounded-xl transition-all duration-300 ${
                  activePhase === 1
                    ? 'bg-brand-soft/30 border border-brand-strong/20 shadow-sm'
                    : 'hover:bg-surface-alt'
                }`}
              >
                <div
                  className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                    activePhase === 1
                      ? 'border-brand-strong bg-brand-strong text-white shadow-md'
                      : 'border-border-subtle bg-surface text-text-muted group-hover:border-brand-strong/50'
                  }`}
                >
                  <span className='font-bold text-lg'>1</span>
                </div>
                <div>
                  <Heading
                    level='h4'
                    className={`text-lg font-bold ${
                      activePhase === 1
                        ? 'text-brand-strong'
                        : 'text-text-muted'
                    }`}
                  >
                    Build & Stabilize
                  </Heading>
                </div>
              </button>

              {/* Phase 2 Nav Item */}
              <button
                onClick={() => setActivePhase(2)}
                className={`group flex items-center gap-6 relative text-left flex-1 lg:flex-none p-4 rounded-xl transition-all duration-300 ${
                  activePhase === 2
                    ? 'bg-emerald-50 border border-emerald-200 shadow-sm'
                    : 'hover:bg-surface-alt'
                }`}
              >
                <div
                  className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                    activePhase === 2
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                      : 'border-border-subtle bg-surface text-text-muted group-hover:border-emerald-500/50'
                  }`}
                >
                  <span className='font-bold text-lg'>2</span>
                </div>
                <div>
                  <Heading
                    level='h4'
                    className={`text-lg font-bold ${
                      activePhase === 2 ? 'text-emerald-600' : 'text-text-muted'
                    }`}
                  >
                    Run & Evolve
                  </Heading>
                </div>
              </button>
            </div>

            {/* Content Area */}
            <div className='lg:col-span-8 min-h-[500px]'>
              {activePhase === 1 ? (
                <div className='animate-fade-up h-full flex flex-col justify-center'>
                  <div className='mb-8'>
                    <Heading level='h3' className='mb-3'>
                      Start with a solid foundation
                    </Heading>
                    <Text variant='lead'>
                      We execute the heavy lifting in defined milestones with
                      clear costs.
                    </Text>
                  </div>

                  {/* Phase 1 Unified Card */}
                  <div className='rounded-3xl overflow-hidden border border-border-subtle shadow-2xl shadow-brand-strong/5 bg-white'>
                    <div className='bg-brand-strong p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6'>
                      <div className='flex items-center gap-5'>
                        <div className='h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0'>
                          <FiCompass size={28} className='text-white' />
                        </div>
                        <div>
                          <Heading
                            level='h3'
                            className='text-2xl text-white mb-1'
                          >
                            Project Execution
                          </Heading>
                          <Text className='text-brand-soft font-medium'>
                            Milestone-based delivery
                          </Text>
                        </div>
                      </div>
                      <div className='bg-white text-brand-strong px-6 py-3 rounded-xl shadow-lg text-center min-w-[140px]'>
                        <div className='text-xs font-bold uppercase tracking-wider mb-1 opacity-70'>
                          Model
                        </div>
                        <div className='text-xl font-display font-bold'>
                          Fixed Price
                        </div>
                      </div>
                    </div>

                    <div className='p-8 grid md:grid-cols-2 gap-8 relative'>
                      {/* Vertical Divider for Desktop */}
                      <div className='hidden md:block absolute top-8 bottom-8 left-1/2 w-px bg-border-subtle' />

                      {/* Option 1 */}
                      <div className='flex flex-col gap-4'>
                        <div className='h-12 w-12 rounded-xl bg-brand-soft text-brand-strong flex items-center justify-center mb-2'>
                          <FiZap size={24} />
                        </div>
                        <Heading level='h4' className='text-xl'>
                          New Development
                        </Heading>
                        <Text variant='small' className='leading-relaxed'>
                          Build it right the first time. We prioritize
                          architecture that preserves your ability to move fast
                          indefinitely.
                        </Text>
                        <Link
                          to='/start?type=new'
                          className='mt-auto inline-flex items-center gap-2 text-sm font-bold text-brand-strong hover:gap-3 transition-all'
                        >
                          Start a new project <FiArrowRight />
                        </Link>
                      </div>

                      {/* Option 2 */}
                      <div className='flex flex-col gap-4'>
                        <div className='h-12 w-12 rounded-xl bg-brand-soft text-brand-strong flex items-center justify-center mb-2'>
                          <FiRefreshCw size={24} />
                        </div>
                        <Heading level='h4' className='text-xl'>
                          Legacy Rescue
                        </Heading>
                        <Text variant='small' className='leading-relaxed'>
                          Stabilize and modernize. We apply forensic engineering
                          to remove risk and restore predictability.
                        </Text>
                        <Link
                          to='/start?type=audit'
                          className='mt-auto inline-flex items-center gap-2 text-sm font-bold text-brand-strong hover:gap-3 transition-all'
                        >
                          Request an audit <FiArrowRight />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='animate-fade-up h-full flex flex-col justify-center'>
                  <div className='mb-8'>
                    <Heading level='h3' className='mb-3 text-emerald-950'>
                      Your long-term engineering partner
                    </Heading>
                    <Text variant='lead'>
                      We take full responsibility for the software's health and
                      future growth.
                    </Text>
                  </div>

                  {/* Phase 2 Unified Card */}
                  <div className='rounded-3xl overflow-hidden border border-emerald-100 shadow-2xl shadow-emerald-900/10 bg-white'>
                    <div className='bg-emerald-600 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6'>
                      <div className='flex items-center gap-5'>
                        <div className='h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0'>
                          <FiActivity size={28} className='text-white' />
                        </div>
                        <div>
                          <Heading
                            level='h3'
                            className='text-2xl text-white mb-1'
                          >
                            Core Partnership
                          </Heading>
                          <Text className='text-emerald-100 font-medium'>
                            Your dedicated engineering department
                          </Text>
                        </div>
                      </div>
                      <div className='bg-white text-emerald-900 px-6 py-3 rounded-xl shadow-lg text-center min-w-[140px]'>
                        <div className='text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1'>
                          Starting at
                        </div>
                        <div className='text-3xl font-display font-bold'>
                          $1k
                          <span className='text-sm text-emerald-600 font-sans font-normal ml-1'>
                            /mo
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='p-8'>
                      <div className='grid sm:grid-cols-2 gap-y-4 gap-x-8 mb-8'>
                        {[
                          '24/7 Uptime Monitoring',
                          'Security Patching',
                          'Strategic Roadmap',
                          'Priority Support',
                          'Bug Fixes & Minor Updates',
                          'Monthly Health Reports',
                        ].map((item) => (
                          <div
                            key={item}
                            className='flex items-center gap-3 font-medium text-text-primary'
                          >
                            <div className='h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0'>
                              <FiCheck size={14} />
                            </div>
                            {item}
                          </div>
                        ))}
                      </div>

                      <div className='flex justify-end'>
                        <Link
                          to='/start'
                          className='btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white shadow-lg shadow-emerald-900/20 px-8 py-3'
                        >
                          View Partnership Plans
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Section>

        <Section spacing='none' className='space-y-16' id='combined-model'>
          <PageHeader
            kicker='COMBINED MODEL'
            title='Where we begin (Combined)'
            description='Whether you are launching a new product or stabilizing an existing one, our goal is the same: to get you to a point where your software is an asset, not a liability.'
          />

          <div className='space-y-12'>
            {/* Card 1: Project Work */}
            <Card className='overflow-hidden border-l-4 border-l-brand-strong p-0'>
              <div className='grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-subtle'>
                {/* New Development */}
                <div className='p-8 flex flex-col gap-6'>
                  <div>
                    <div className='flex items-center gap-3 mb-4'>
                      <span className='h-10 w-10 rounded-lg bg-brand-soft text-brand-strong flex items-center justify-center'>
                        <FiZap size={20} />
                      </span>
                      <Heading
                        level='h3'
                        variant='subtitle'
                        className='text-xl'
                      >
                        New Development
                      </Heading>
                    </div>
                    <Text variant='lead' className='mb-4'>
                      Build it right the first time.
                    </Text>
                    <Text variant='small' className='mb-6'>
                      We prioritize the architectural decisions that preserve
                      your ability to move fast indefinitely. By establishing a
                      professional engineering environment immediately, we
                      prevent the accumulation of technical debt that typically
                      paralyzes projects after their first release.
                    </Text>
                  </div>
                  <div className='mt-auto pt-6 border-t border-border-subtle flex flex-col gap-4'>
                    <Text
                      variant='small'
                      className='font-medium text-text-primary'
                    >
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
                </div>

                {/* Legacy Onboarding */}
                <div className='p-8 flex flex-col gap-6'>
                  <div>
                    <div className='flex items-center gap-3 mb-4'>
                      <span className='h-10 w-10 rounded-lg bg-brand-soft text-brand-strong flex items-center justify-center'>
                        <FiRefreshCw size={20} />
                      </span>
                      <Heading
                        level='h3'
                        variant='subtitle'
                        className='text-xl'
                      >
                        Legacy Onboarding
                      </Heading>
                    </div>
                    <Text variant='lead' className='mb-4'>
                      Stabilize and modernize.
                    </Text>
                    <Text variant='small' className='mb-6'>
                      We apply forensic engineering to understand and stabilize
                      your existing system. By making the system's behavior
                      visible and predictable, we remove the risk from updates
                      and allow you to shift focus from fighting fires back to
                      innovation.
                    </Text>
                  </div>
                  <div className='mt-auto pt-6 border-t border-border-subtle flex flex-col gap-4'>
                    <Text
                      variant='small'
                      className='font-medium text-text-primary'
                    >
                      Outcome: A stable platform. We then transition to our
                      monthly retainer to maintain that health.
                    </Text>
                    <Link
                      to='/start?type=audit'
                      className='btn-secondary w-full justify-center'
                    >
                      Request an audit
                    </Link>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className='bg-surface-alt border-t border-border-subtle p-8'>
                <div className='flex flex-col gap-6'>
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
                  <div className='flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-border-subtle/50'>
                    <Text variant='small' className='text-text-muted'>
                      Simple, transparent terms. No long-term lock-in.
                    </Text>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 2: Core Partnership */}
            <Card className='overflow-hidden border-l-4 border-l-emerald-500 p-0'>
              <div className='p-8 flex flex-col gap-6'>
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
                    We don't just maintain code; we partner with your business.
                    We work directly with you to design solutions, weigh
                    trade-offs, and plan for the future. We are also your
                    dedicated support team, ready to troubleshoot issues and
                    answer questions whenever they arise. You get the alignment
                    and responsiveness of an in-house team, focused entirely on
                    execution and stability.
                  </Text>
                </div>
                <div className='mt-auto pt-6 border-t border-border-subtle flex flex-col gap-4'>
                  <Text
                    variant='small'
                    className='font-medium text-text-primary'
                  >
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
              </div>

              {/* Pricing Section */}
              <div className='bg-emerald-50/50 border-t border-emerald-100 p-8'>
                <div className='flex flex-col gap-6'>
                  <div>
                    <Kicker className='mb-2 text-emerald-700'>
                      Ongoing Care
                    </Kicker>
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
                  <div className='flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-200/50'>
                    <Text variant='small' className='text-text-muted'>
                      Simple, transparent terms. No long-term lock-in.
                    </Text>
                    <Link to='/start' className='btn-primary'>
                      Start the Conversation
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        <Section spacing='none' className='space-y-16' id='integrated-model'>
          <PageHeader
            kicker='THE MODEL'
            title='A business model built for trust'
            description="We don't just write code; we take responsibility for the outcome. We align our incentives with yours. We profit when your software is stable and efficient, not when it breaks or takes longer to build"
          />

          <div className='grid lg:grid-cols-12 gap-12 lg:gap-24 items-start'>
            {/* Navigation / Timeline */}
            <div className='lg:col-span-4 flex lg:flex-col gap-4 relative'>
              {/* Vertical Line (Desktop) */}
              <div className='absolute left-[23px] top-6 bottom-6 w-0.5 bg-border-subtle hidden lg:block' />

              {/* Phase 1 Nav Item */}
              <button
                onClick={() => setActivePhaseNew(1)}
                className={`group flex items-center gap-6 relative text-left flex-1 lg:flex-none p-4 rounded-xl transition-all duration-300 ${
                  activePhaseNew === 1
                    ? 'bg-brand-soft/30 border border-brand-strong/20 shadow-sm'
                    : 'hover:bg-surface-alt'
                }`}
              >
                <div
                  className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                    activePhaseNew === 1
                      ? 'border-brand-strong bg-brand-strong text-white shadow-md'
                      : 'border-border-subtle bg-surface text-text-muted group-hover:border-brand-strong/50'
                  }`}
                >
                  <span className='font-bold text-lg'>1</span>
                </div>
                <div>
                  <div className='flex items-center gap-2 mb-1'>
                    <Heading
                      level='h4'
                      className={`text-lg font-bold ${
                        activePhaseNew === 1
                          ? 'text-brand-strong'
                          : 'text-text-muted'
                      }`}
                    >
                      Build & Stabilize
                    </Heading>
                    <span className='px-2 py-0.5 rounded-full bg-brand-soft text-brand-strong text-xs font-bold uppercase tracking-wider'>
                      Start Here
                    </span>
                  </div>
                  <Text variant='small' className='text-text-muted'>
                    We execute the heavy lifting to get you to production.
                  </Text>
                </div>
              </button>

              {/* Phase 2 Nav Item */}
              <button
                onClick={() => setActivePhaseNew(2)}
                className={`group flex items-center gap-6 relative text-left flex-1 lg:flex-none p-4 rounded-xl transition-all duration-300 ${
                  activePhaseNew === 2
                    ? 'bg-emerald-50 border border-emerald-200 shadow-sm'
                    : 'hover:bg-surface-alt'
                }`}
              >
                <div
                  className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                    activePhaseNew === 2
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                      : 'border-border-subtle bg-surface text-text-muted group-hover:border-emerald-500/50'
                  }`}
                >
                  <span className='font-bold text-lg'>2</span>
                </div>
                <div>
                  <Heading
                    level='h4'
                    className={`text-lg font-bold ${
                      activePhaseNew === 2
                        ? 'text-emerald-600'
                        : 'text-text-muted'
                    }`}
                  >
                    Run & Evolve
                  </Heading>
                  <Text variant='small' className='text-text-muted'>
                    We transition to a long-term partnership for stability.
                  </Text>
                </div>
              </button>
            </div>

            {/* Content Area */}
            <div className='lg:col-span-8 min-h-[500px]'>
              {activePhaseNew === 1 ? (
                <div className='animate-fade-up h-full flex flex-col justify-center'>
                  <div className='mb-8'>
                    <Heading level='h3' className='mb-3'>
                      Start with a solid foundation
                    </Heading>
                    <Text variant='lead'>
                      We execute the heavy lifting in defined milestones with
                      clear costs.
                    </Text>
                  </div>

                  {/* Phase 1 Combined Card */}
                  <Card className='overflow-hidden border-l-4 border-l-brand-strong p-0 shadow-2xl shadow-brand-strong/5'>
                    <div className='grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-subtle'>
                      {/* New Development */}
                      <div className='p-8 flex flex-col gap-6'>
                        <div>
                          <div className='flex items-center gap-3 mb-4'>
                            <span className='h-10 w-10 rounded-lg bg-brand-soft text-brand-strong flex items-center justify-center'>
                              <FiZap size={20} />
                            </span>
                            <Heading
                              level='h3'
                              variant='subtitle'
                              className='text-xl'
                            >
                              New Development
                            </Heading>
                          </div>
                          <Text variant='lead' className='mb-4'>
                            Build it right the first time.
                          </Text>
                          <Text variant='small' className='mb-6'>
                            We prioritize the architectural decisions that
                            preserve your ability to move fast indefinitely. By
                            establishing a professional engineering environment
                            immediately, we prevent the accumulation of
                            technical debt that typically paralyzes projects
                            after their first release.
                          </Text>
                        </div>
                        <div className='mt-auto pt-6 border-t border-border-subtle flex flex-col gap-4'>
                          <Text
                            variant='small'
                            className='font-medium text-text-primary'
                          >
                            Outcome: A production-ready app. We then transition
                            to our monthly retainer to keep it running smoothly.
                          </Text>
                          <Link
                            to='/start?type=new'
                            className='btn-secondary w-full justify-center'
                          >
                            Discuss your idea
                          </Link>
                        </div>
                      </div>

                      {/* Legacy Onboarding */}
                      <div className='p-8 flex flex-col gap-6'>
                        <div>
                          <div className='flex items-center gap-3 mb-4'>
                            <span className='h-10 w-10 rounded-lg bg-brand-soft text-brand-strong flex items-center justify-center'>
                              <FiRefreshCw size={20} />
                            </span>
                            <Heading
                              level='h3'
                              variant='subtitle'
                              className='text-xl'
                            >
                              Legacy Onboarding
                            </Heading>
                          </div>
                          <Text variant='lead' className='mb-4'>
                            Stabilize and modernize.
                          </Text>
                          <Text variant='small' className='mb-6'>
                            We apply forensic engineering to understand and
                            stabilize your existing system. By making the
                            system's behavior visible and predictable, we remove
                            the risk from updates and allow you to shift focus
                            from fighting fires back to innovation.
                          </Text>
                        </div>
                        <div className='mt-auto pt-6 border-t border-border-subtle flex flex-col gap-4'>
                          <Text
                            variant='small'
                            className='font-medium text-text-primary'
                          >
                            Outcome: A stable platform. We then transition to
                            our monthly retainer to maintain that health.
                          </Text>
                          <Link
                            to='/start?type=audit'
                            className='btn-secondary w-full justify-center'
                          >
                            Request an audit
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Section */}
                    <div className='bg-surface-alt border-t border-border-subtle p-8'>
                      <div className='flex flex-col gap-6'>
                        <div>
                          <Kicker className='mb-2'>
                            New Development & Legacy Onboarding
                          </Kicker>
                          <Heading
                            level='h3'
                            variant='subtitle'
                            className='text-2xl'
                          >
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
                          <strong>Legacy Onboarding</strong>, we work in
                          fixed-price milestones. We agree on scope and cost
                          upfront. You pay for results, not hours. No surprise
                          bills.
                        </Text>
                        <div className='flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-border-subtle/50'>
                          <Text variant='small' className='text-text-muted'>
                            Simple, transparent terms. No long-term lock-in.
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className='animate-fade-up h-full flex flex-col justify-center'>
                  <div className='mb-8'>
                    <Heading level='h3' className='mb-3 text-emerald-950'>
                      Your long-term engineering partner
                    </Heading>
                    <Text variant='lead'>
                      We take full responsibility for the software's health and
                      future growth.
                    </Text>
                  </div>

                  {/* Phase 2 Combined Card */}
                  <Card className='overflow-hidden border-l-4 border-l-emerald-500 p-0 shadow-2xl shadow-emerald-900/10'>
                    <div className='p-8 flex flex-col gap-6'>
                      <div>
                        <div className='flex items-center gap-3 mb-4'>
                          <span className='h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center'>
                            <FiActivity size={20} />
                          </span>
                          <Heading
                            level='h3'
                            variant='subtitle'
                            className='text-xl'
                          >
                            Core Partnership
                          </Heading>
                        </div>
                        <Text variant='lead' className='mb-4'>
                          Strategic technical partnership.
                        </Text>
                        <Text variant='small' className='mb-6'>
                          We don't just maintain code; we partner with your
                          business. We work directly with you to design
                          solutions, weigh trade-offs, and plan for the future.
                          We are also your dedicated support team, ready to
                          troubleshoot issues and answer questions whenever they
                          arise. You get the alignment and responsiveness of an
                          in-house team, focused entirely on execution and
                          stability.
                        </Text>
                      </div>
                      <div className='mt-auto pt-6 border-t border-border-subtle flex flex-col gap-4'>
                        <Text
                          variant='small'
                          className='font-medium text-text-primary'
                        >
                          Outcome: Peace of mind. A stable system and a
                          long-term technology partner.
                        </Text>
                        <Link
                          to='/start'
                          className='btn-secondary w-full justify-center'
                        >
                          View Plans
                        </Link>
                      </div>
                    </div>

                    {/* Pricing Section */}
                    <div className='bg-emerald-50/50 border-t border-emerald-100 p-8'>
                      <div className='flex flex-col gap-6'>
                        <div>
                          <Kicker className='mb-2 text-emerald-700'>
                            Ongoing Care
                          </Kicker>
                          <Heading
                            level='h3'
                            variant='subtitle'
                            className='text-2xl'
                          >
                            Core Partnership
                          </Heading>
                        </div>
                        <div className='flex items-baseline gap-2'>
                          <span className='text-sm text-text-muted'>
                            Starts at
                          </span>
                          <span className='font-display text-4xl text-text-primary'>
                            $1,000
                          </span>
                          <span className='text-text-muted'>/ month</span>
                        </div>
                        <Text variant='muted'>
                          Once your platform is stable, we transition to our{' '}
                          <strong>Core Partnership</strong> retainer. This
                          covers 24/7 monitoring, security, and the strategic
                          advice of a senior partner.
                        </Text>
                        <div className='flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-200/50'>
                          <Text variant='small' className='text-text-muted'>
                            Simple, transparent terms. No long-term lock-in.
                          </Text>
                          <Link to='/start' className='btn-primary'>
                            Start the Conversation
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </Section>
      </div>
    </Stack>
  );
};

export default Home;
