import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from '../../context/AuthContext';
import { useServices } from '../../context/ServiceContext';
import type { CreateIntakeProjectInput } from '../../services/BusinessService';

type WizardStep = 'BASICS' | 'INDUSTRY' | 'REVIEW';

const industries = ['LOGISTICS', 'HEALTHCARE', 'SAAS', 'FINTECH', 'EDTECH'];

export default function IntakeWizard() {
  const { session } = useAuthContext();
  const { business } = useServices();
  const [step, setStep] = useState<WizardStep>('BASICS');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const [form, setForm] = useState<CreateIntakeProjectInput>(() => ({
    projectName: '',
    description: '',
    industry: industries[0],
    questionnaireAnswers: {},
    kickoffCallAt: new Date().toISOString().slice(0, 16),
  }));

  const canContinueBasics =
    form.projectName.trim().length > 2 && form.description.trim().length > 10;
  const canContinueIndustry = !!form.industry;

  const handleCreate = async () => {
    if (!session) return;
    setCreating(true);
    setError(null);
    try {
      const project = await business.createIntakeProject(
        session.business.id,
        form
      );
      setCreatedProjectId(project.id);
      setStep('REVIEW');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className='space-y-8' data-testid='intake-wizard'>
      <Helmet>
        <title>New Project Intake | Business workspace</title>
      </Helmet>
      <section className='surface-card rounded-3xl p-8'>
        <h1 className='text-2xl font-semibold text-slate-900'>
          New Project Intake
        </h1>
        <p className='text-slate-600 mt-2'>
          Provide structured context to seed initial epics and accelerate
          proposal drafting.
        </p>
      </section>

      <nav className='flex gap-2 text-sm'>
        {(['BASICS', 'INDUSTRY', 'REVIEW'] as WizardStep[]).map((s) => (
          <button
            key={s}
            type='button'
            onClick={() => setStep(s)}
            disabled={s === 'REVIEW' && !createdProjectId}
            className={`px-4 py-2 rounded-full border text-xs font-semibold ${
              step === s
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200'
            } disabled:opacity-40`}
          >
            {s}
          </button>
        ))}
      </nav>

      {step === 'BASICS' && (
        <section className='surface-card rounded-3xl p-6 space-y-4'>
          <h2 className='text-lg font-semibold text-slate-900'>Basics</h2>
          <label className='flex flex-col gap-2 text-sm text-slate-600'>
            Project name
            <input
              className='rounded-2xl border border-slate-200 px-4 py-2'
              value={form.projectName}
              onChange={(e) =>
                setForm((f) => ({ ...f, projectName: e.target.value }))
              }
            />
            {form.projectName.length > 0 && form.projectName.length < 3 && (
              <span className='text-xs text-rose-600'>
                Name must be at least 3 characters
              </span>
            )}
          </label>
          <label className='flex flex-col gap-2 text-sm text-slate-600'>
            Description / goals
            <textarea
              rows={4}
              className='rounded-2xl border border-slate-200 px-4 py-2'
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
            {form.description.length > 0 && form.description.length <= 10 && (
              <span className='text-xs text-rose-600'>
                Please provide a bit more detail (min 10 chars)
              </span>
            )}
          </label>
          <label className='flex flex-col gap-2 text-sm text-slate-600'>
            Preferred kickoff time
            <input
              type='datetime-local'
              className='rounded-2xl border border-slate-200 px-4 py-2'
              value={form.kickoffCallAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, kickoffCallAt: e.target.value }))
              }
            />
          </label>
          <div className='flex justify-end'>
            <button
              type='button'
              disabled={!canContinueBasics}
              onClick={() => setStep('INDUSTRY')}
              className='rounded-full bg-slate-900 text-white px-6 py-2 text-sm font-semibold disabled:opacity-40'
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 'INDUSTRY' && (
        <section className='surface-card rounded-3xl p-6 space-y-4'>
          <h2 className='text-lg font-semibold text-slate-900'>
            Industry & Questionnaire
          </h2>
          <label className='flex flex-col gap-2 text-sm text-slate-600'>
            Industry
            <select
              className='rounded-2xl border border-slate-200 px-4 py-2'
              value={form.industry}
              onChange={(e) =>
                setForm((f) => ({ ...f, industry: e.target.value }))
              }
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </label>
          <div className='grid md:grid-cols-2 gap-4'>
            <QuestionInput
              label='Primary pain point'
              field='painPoint'
              form={form}
              setForm={setForm}
            />
            <QuestionInput
              label='Users (estimated)'
              field='userCount'
              type='number'
              form={form}
              setForm={setForm}
            />
            <QuestionInput
              label='Requires compliance (e.g., HIPAA)?'
              field='needsCompliance'
              type='checkbox'
              form={form}
              setForm={setForm}
            />
            <QuestionInput
              label='Data integration count'
              field='integrationCount'
              type='number'
              form={form}
              setForm={setForm}
            />
          </div>
          <div className='flex justify-between'>
            <button
              type='button'
              onClick={() => setStep('BASICS')}
              className='text-sm font-semibold text-slate-600 px-4 py-2'
            >
              Back
            </button>
            <button
              type='button'
              disabled={!canContinueIndustry}
              onClick={handleCreate}
              className='rounded-full bg-slate-900 text-white px-6 py-2 text-sm font-semibold disabled:opacity-40'
            >
              {creating ? 'Seeding…' : 'Seed project'}
            </button>
          </div>
          {error && <p className='text-sm text-rose-600'>{error}</p>}
        </section>
      )}

      {step === 'REVIEW' && (
        <section className='surface-card rounded-3xl p-6 space-y-4'>
          <h2 className='text-lg font-semibold text-slate-900'>
            Intake Complete
          </h2>
          {createdProjectId ? (
            <div className='space-y-2 text-sm text-slate-600'>
              <p>
                Project created with starter epics based on{' '}
                <strong>{form.industry}</strong> context.
              </p>
              <a
                href={`/business/projects/${createdProjectId}`}
                className='inline-block rounded-full bg-slate-900 text-white px-5 py-2 text-sm font-semibold'
              >
                Go to project
              </a>
            </div>
          ) : (
            <p className='text-sm text-slate-600'>No project created yet.</p>
          )}
        </section>
      )}
    </div>
  );
}

interface QuestionInputProps {
  label: string;
  field: string;
  type?: 'text' | 'number' | 'checkbox';
  form: CreateIntakeProjectInput;
  setForm: React.Dispatch<React.SetStateAction<CreateIntakeProjectInput>>;
}

function QuestionInput({
  label,
  field,
  type = 'text',
  form,
  setForm,
}: QuestionInputProps) {
  return (
    <label className='flex flex-col gap-1 text-xs font-medium text-slate-600'>
      {label}
      {type === 'checkbox' ? (
        <input
          type='checkbox'
          checked={Boolean(form.questionnaireAnswers[field])}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              questionnaireAnswers: {
                ...f.questionnaireAnswers,
                [field]: e.target.checked,
              },
            }))
          }
          className='h-5 w-5 accent-slate-900'
        />
      ) : (
        <input
          type={type}
          value={String(form.questionnaireAnswers[field] ?? '')}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              questionnaireAnswers: {
                ...f.questionnaireAnswers,
                [field]:
                  type === 'number' ? Number(e.target.value) : e.target.value,
              },
            }))
          }
          className='rounded-2xl border border-slate-200 px-3 py-2'
        />
      )}
    </label>
  );
}
