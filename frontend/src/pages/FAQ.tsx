import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';

const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    {
      q: 'What does the $999/mo baseline support include?',
      a: 'Incidents, defects, and routine maintenance updates; CI/CD deployments and environment care; monitoring, alerts, and error tracking; security patches and dependency hygiene; and keeping docs/runbooks current. Business-hours support with typical <24h replies.',
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

  const RaindropsBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const draw = () => {
        const { innerWidth: w, innerHeight: h } = window;
        canvas.width = Math.floor(w * DPR);
        canvas.height = Math.floor(h * DPR);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(DPR, DPR);
        ctx.clearRect(0, 0, w, h);

        const reduceMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;
        const smallScreen = w < 768;
        if (reduceMotion || smallScreen) return;

        const drops = Math.min(44, Math.floor((w * h) / 52000));
        for (let i = 0; i < drops; i++) {
          const x = Math.random() * w;
          const y = Math.random() * h;
          const r = 6 + Math.random() * 16;
          const grad = ctx.createRadialGradient(
            x - r * 0.35,
            y - r * 0.35,
            r * 0.1,
            x,
            y,
            r
          );
          grad.addColorStop(0, 'rgba(255,255,255,0.52)');
          grad.addColorStop(0.45, 'rgba(255,255,255,0.20)');
          grad.addColorStop(1, 'rgba(255,255,255,0.06)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.12)';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      };
      const onResize = () => draw();
      window.addEventListener('resize', onResize);
      draw();
      return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
      <canvas
        aria-hidden
        ref={canvasRef}
        className='absolute inset-0 w-full h-full opacity-30'
      />
    );
  };

  return (
    <main className='flex flex-col mx-auto font-sans w-full bg-white min-h-screen text-slate-900 relative z-10'>
      <Helmet>
        <title>FAQ | Gergen Software</title>
        <meta
          name='description'
          content='Answers about our subscription-based, full-service software engineering partnership: ownership, cancel-anytime, support, and how we work.'
        />
      </Helmet>
      <div aria-hidden className='pointer-events-none fixed inset-0 z-0'>
        <div className='absolute -top-40 left-1/2 -translate-x-1/2 h-[18rem] w-[40rem] md:h-[26rem] md:w-[76rem] rounded-full bg-gradient-to-b from-sky-300 via-sky-200 to-transparent blur-xl md:blur-3xl opacity-50 md:opacity-80'></div>
        <div className='hidden md:block absolute -right-24 top-10 h-64 w-64 rounded-full bg-cyan-300 blur-2xl opacity-20'></div>
        <div className='hidden md:block absolute left-1/5 bottom-10 h-56 w-56 rounded-full bg-sky-300 blur-2xl opacity-16'></div>
        <RaindropsBackground />
      </div>

      <section className='relative w-full flex justify-center px-4 pt-8 pb-12'>
        <div className='relative z-10 max-w-5xl w-full'>
          <div className='rounded-2xl border border-white/30 bg-white/70 md:bg-white/40 md:backdrop-blur-xl p-6 md:p-10 ring-1 ring-white/20 shadow-[0_10px_40px_rgba(2,132,199,0.06)]'>
            <h1 className='text-slate-900 font-semibold text-4xl md:text-5xl'>
              FAQ
            </h1>
            <p className='mt-3 text-slate-700 md:text-lg'>
              Straight answers about how our subscription partnership works.
            </p>

            <div className='space-y-3 mt-6'>
              {faqs.map((item, idx) => {
                const expanded = open === idx;
                const buttonId = `faq-q-${idx}`;
                const panelId = `faq-a-${idx}`;
                return (
                  <div
                    key={idx}
                    className='rounded-xl border border-white/30 bg-white/70 md:bg-white/50 md:backdrop-blur p-1'
                  >
                    <button
                      id={buttonId}
                      aria-controls={panelId}
                      aria-expanded={expanded}
                      type='button'
                      className='w-full text-left px-4 py-3 flex justify-between items-center rounded-lg'
                      onClick={() => setOpen(expanded ? null : idx)}
                    >
                      <span className='text-slate-900 font-medium'>
                        {item.q}
                      </span>
                      <span className='text-slate-500 text-xl leading-none'>
                        {expanded ? '−' : '+'}
                      </span>
                    </button>
                    {expanded && (
                      <div
                        id={panelId}
                        role='region'
                        aria-labelledby={buttonId}
                        className='px-4 pb-4 text-slate-700'
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default FAQ;
