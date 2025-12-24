import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Stack,
  Section,
  Container,
  Heading,
  Text,
  Card,
} from '../components/ui/design-system';

const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    {
      q: 'What does the $1,000/mo baseline support include?',
      a: 'Incidents, defects, and routine maintenance updates; CI/CD deployments and environment care; monitoring, alerts, and error tracking; security patches and dependency hygiene; and keeping docs/runbooks current. Business-hours support with typical <24h replies.',
    },
    {
      q: 'How does the initial engagement work?',
      a: 'We start with either a New Development project (to build your MVP) or a Legacy Onboarding project (to stabilize your existing app). These are scoped and billed as fixed-price or hourly projects. Once the platform is stable, you transition to the $1,000/mo plan for ongoing care and growth.',
    },
    {
      q: 'What work is billed hourly?',
      a: 'New features, special requests, onboarding a new product, or significant legacy upgrades. These are scoped during backlog refinement with estimates and acceptance criteria, then tracked in your agile tool.',
    },
    {
      q: 'How are tasks categorized during refinement?',
      a: 'We review each item and place it in the correct lane: if it fits the baseline support categories (incidents/defects/maintenance), it is covered by the subscription. Otherwise, it becomes project work and is billed hourly. This keeps billing fair and visible.',
    },
    {
      q: 'Which tools do you use for backlog tracking?',
      a: 'Jira works well, and I am happy to use it in your workspace. If you prefer open‑source, solid options include OpenProject, Taiga, and Redmine. I’ll adapt to your stack and keep the board tidy and current.',
    },
    {
      q: 'Who owns the code and infrastructure?',
      a: 'You do—100%. We build in your repos/accounts or transfer everything to you. We manage on your behalf, but ownership is always yours.',
    },
    {
      q: 'Can we cancel or pause?',
      a: 'Yes. Cancel anytime. You can also pause and resume without losing context. We keep docs and backlog current so restarting is easy.',
    },
    {
      q: 'How fast can we start?',
      a: 'Typically within 1–2 weeks. We begin with a kickoff and a living roadmap, then ship your first live demo the following week.',
    },
    {
      q: 'What support do we get?',
      a: 'Business-hours response is typically under 24 hours. Critical incidents are addressed as fast as possible per your plan. We handle updates, monitoring, and security patches.',
    },
    {
      q: 'Are you a solo engineer or a team?',
      a: 'Solo. You work directly with me—a principal-level engineer. That means clear accountability, faster communication, and consistent quality. When needed, I coordinate with specialists (e.g., design, legal) transparently.',
    },
    {
      q: 'How many clients do you support at once?',
      a: 'Up to ~10 small/medium businesses, depending on complexity and active project phase. I onboard gradually and standardize infra, logs, and docs so maintenance stays efficient and reliable.',
    },
    {
      q: 'What are the SLAs?',
      a: 'Business-hours replies typically <24h. Incidents are triaged immediately and addressed as fast as possible. You receive a concise monthly Ops & Improvements report; if you want live reviews, we can schedule sprint reviews on demand. For stricter SLAs, we can define a custom plan.',
    },
    {
      q: 'How do you handle spikes or launches?',
      a: 'We plan ahead when possible. For spikes or launches, I can run short, focused sprints billed hourly with increased availability. We’ll scope it in refinement, estimate it, and track it transparently in the backlog.',
    },
    {
      q: 'What stack do you use?',
      a: 'Modern, proven stacks—React/Next.js, Node/TypeScript, cloud-native infra. We align to your context and keep dependencies current.',
    },
  ];

  return (
    <Stack>
      <Helmet>
        <title>FAQ | Gergen Software</title>
        <meta
          name='description'
          content='Answers about our subscription-based, full-service software engineering partnership: ownership, cancel-anytime, support, and how we work.'
        />
      </Helmet>

      <Section>
        <Container size='prose'>
          <Heading level='h1'>FAQ</Heading>
          <Text variant='lead' className='mt-4'>
            Straight answers about how our subscription partnership works.
          </Text>

          <div className='space-y-4 mt-8'>
            {faqs.map((item, idx) => {
              const expanded = open === idx;
              return (
                <Card key={idx} className='p-0 overflow-hidden'>
                  <button
                    type='button'
                    className='w-full text-left px-6 py-4 flex justify-between items-center hover:bg-surface-hover transition-colors'
                    onClick={() => setOpen(expanded ? null : idx)}
                  >
                    <span className='font-medium text-text-primary'>
                      {item.q}
                    </span>
                    <span className='text-text-muted text-xl leading-none ml-4'>
                      {expanded ? '−' : '+'}
                    </span>
                  </button>
                  {expanded && (
                    <div className='px-6 pb-6 pt-2 border-t border-border-subtle'>
                      <Text>{item.a}</Text>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>
    </Stack>
  );
};

export default FAQ;
