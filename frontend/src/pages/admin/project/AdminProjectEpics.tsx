import { FormEvent, useMemo, useState } from 'react';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { useServices } from '../../../context/ServiceContext';
import {
  CreateEpicInput,
  Epic,
  Story,
  EpicType,
  DefectDetails,
} from '../../../types/domain';
import { Modal } from '../../../components/ui/Modal';
import { useDomainModal } from '../../../components/domain/DomainModalProvider';

const EPIC_COLORS = [
  '#64748b', // Slate
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
];

export default function AdminProjectEpics() {
  const { project, setProject } = useProjectWorkspace();
  const { project: projectService } = useServices();
  const { openEpic, openStory } = useDomainModal();
  const [draft, setDraft] = useState<CreateEpicInput>({
    name: '',
    description: '',
    color: EPIC_COLORS[2], // Default to Orange
    acceptanceCriteria: [],
    clientSummary: '',
    type: 'FEATURE',
    defectDetails: {
      reportedBy: '',
      severity: 'MEDIUM',
      impactSummary: '',
      stepsToReproduce: '',
    },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Quick add state
  const [quickAddName, setQuickAddName] = useState('');
  const [quickAdding, setQuickAdding] = useState(false);

  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [editingDraft, setEditingDraft] = useState({
    name: '',
    description: '',
    color: EPIC_COLORS[2],
    acceptanceCriteriaText: '',
    clientSummary: '',
    type: 'FEATURE' as EpicType,
    defectDetails: {
      reportedBy: '',
      severity: 'MEDIUM',
      impactSummary: '',
      stepsToReproduce: '',
    } as DefectDetails,
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [storyPickerOpen, setStoryPickerOpen] = useState(false);
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);
  const [filterEpicIds, setFilterEpicIds] = useState<string[]>([]);
  const selectedEpic: Epic | undefined = useMemo(
    () =>
      project.epics.find((e) => e.id === selectedEpicId) ?? project.epics[0],
    [project.epics, selectedEpicId]
  );

  const epicStories: Story[] = useMemo(() => {
    if (!selectedEpic) return [];
    return project.stories.filter((story) => story.epicId === selectedEpic.id);
  }, [project.stories, selectedEpic]);

  const unassignedStories: Story[] = useMemo(
    () => project.stories.filter((story) => !story.epicId),
    [project.stories]
  );

  const filteredStoriesForPicker: Story[] = useMemo(() => {
    const base = [...unassignedStories];
    if (filterEpicIds.length === 0) {
      return base;
    }
    const otherStories = project.stories.filter(
      (story) => story.epicId && filterEpicIds.includes(story.epicId)
    );
    return [...base, ...otherStories];
  }, [unassignedStories, filterEpicIds, project.stories]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddName.trim()) return;
    setQuickAdding(true);
    try {
      // Pick a random color for variety
      const randomColor =
        EPIC_COLORS[Math.floor(Math.random() * EPIC_COLORS.length)];
      const updated = await projectService.createEpic(project.id, {
        name: quickAddName.trim(),
        description: '',
        color: randomColor,
        acceptanceCriteria: [],
        clientSummary: '',
      });
      setProject(updated);
      setQuickAddName('');
      if (updated.epics.length > 0) {
        setSelectedEpicId(updated.epics[updated.epics.length - 1].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create epic');
    } finally {
      setQuickAdding(false);
    }
  };

  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await projectService.createEpic(project.id, draft);
      setProject(updated);
      setDraft({
        name: '',
        description: '',
        color: '#f59e42',
        acceptanceCriteria: [],
        clientSummary: '',
      });
      if (!selectedEpicId && updated.epics.length > 0) {
        setSelectedEpicId(updated.epics[updated.epics.length - 1].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create epic');
    } finally {
      setSaving(false);
    }
  };

  const beginEditEpic = (epic: Epic) => {
    setEditingEpic(epic);
    setEditingDraft({
      name: epic.name,
      description: epic.description ?? '',
      color: epic.color,
      acceptanceCriteriaText: epic.acceptanceCriteria.join('\n'),
      clientSummary: epic.clientSummary ?? '',
      type: epic.type ?? 'FEATURE',
      defectDetails: epic.defectDetails ?? {
        reportedBy: '',
        severity: 'MEDIUM',
        impactSummary: '',
        stepsToReproduce: '',
      },
    });
    setUpdateError(null);
  };

  const cancelEditEpic = () => {
    setEditingEpic(null);
    setUpdateError(null);
  };

  const handleUpdateEpic = async (evt: FormEvent) => {
    evt.preventDefault();
    if (!editingEpic) return;

    setUpdating(true);
    setUpdateError(null);

    const acceptanceCriteria = editingDraft.acceptanceCriteriaText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      const updatedProject = await projectService.updateEpic(
        project.id,
        editingEpic.id,
        {
          name: editingDraft.name.trim(),
          description: editingDraft.description.trim() || undefined,
          color: editingDraft.color,
          clientSummary: editingDraft.clientSummary.trim() || undefined,
          acceptanceCriteria,
          type: editingDraft.type,
          defectDetails:
            editingDraft.type === 'DEFECT'
              ? editingDraft.defectDetails
              : undefined,
        }
      );
      setProject(updatedProject);
      const refreshed =
        updatedProject.epics.find((e) => e.id === editingEpic.id) || null;
      setEditingEpic(refreshed);
      if (refreshed) {
        setSelectedEpicId(refreshed.id);
      }
    } catch (err) {
      setUpdateError(
        err instanceof Error
          ? err.message
          : 'Could not update epic. Please retry.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteEpic = async () => {
    if (!selectedEpic || deleting) return;

    // Soft guard: do not allow delete if there are stories in this epic.
    if (epicStories.length > 0) {
      setUpdateError(
        'Remove or reassign stories from this epic before deleting it.'
      );
      return;
    }

    setDeleting(true);
    setUpdateError(null);
    try {
      // Assume a deleteEpic method exists on the service backed by the mock datastore.
      const updatedProject = await projectService.deleteEpic(
        project.id,
        selectedEpic.id
      );
      setProject(updatedProject);
      const remaining = updatedProject.epics[0];
      setSelectedEpicId(remaining ? remaining.id : null);
      setEditingEpic(null);
    } catch (err) {
      setUpdateError(
        err instanceof Error
          ? err.message
          : 'Could not delete epic. Please retry.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const toggleFilterEpic = (epicId: string) => {
    setFilterEpicIds((prev) =>
      prev.includes(epicId)
        ? prev.filter((id) => id !== epicId)
        : [...prev, epicId]
    );
  };

  const toggleStorySelection = (storyId: string) => {
    setSelectedStoryIds((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId]
    );
  };

  const handleAttachStories = async () => {
    if (!selectedEpic || selectedStoryIds.length === 0) {
      setStoryPickerOpen(false);
      return;
    }
    setUpdating(true);
    setUpdateError(null);
    try {
      let currentProject = project;
      for (const storyId of selectedStoryIds) {
        const story = currentProject.stories.find((s) => s.id === storyId);
        if (!story) continue;
        currentProject = await projectService.updateStory(
          currentProject.id,
          storyId,
          {
            epicId: selectedEpic.id,
            title: story.title,
            description: story.description,
            acceptanceCriteria: story.acceptanceCriteria,
            points: story.points,
            sprintId: story.sprintId ?? null,
            stage: story.stage,
          }
        );
      }
      setProject(currentProject);
      setSelectedStoryIds([]);
      setStoryPickerOpen(false);
    } catch (err) {
      setUpdateError(
        err instanceof Error
          ? err.message
          : 'Could not attach stories. Please retry.'
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className='rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] space-y-6 backdrop-blur'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl font-semibold text-slate-900'>Epics</h2>
          <p className='text-sm text-slate-500'>
            Shape the big rocks for this project.
          </p>
        </div>
        <button
          type='button'
          onClick={() => setCreateOpen(true)}
          className='rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:from-sky-600 hover:to-indigo-600'
        >
          New epic
        </button>
      </div>
      <div className='grid gap-6 lg:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]'>
        <ul className='space-y-3'>
          {project.epics.map((epic) => {
            const isSelected = selectedEpic?.id === epic.id;
            return (
              <li key={epic.id}>
                <button
                  type='button'
                  onClick={() => setSelectedEpicId(epic.id)}
                  className={`w-full rounded-2xl border bg-gradient-to-r from-white via-white to-slate-50 p-4 text-left transition shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'border-sky-400 shadow-[0_15px_35px_rgba(14,165,233,0.25)]'
                      : 'border-slate-200 hover:border-sky-200'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <span
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: epic.color }}
                    />
                    <span className='font-semibold text-slate-900'>
                      {epic.name}
                    </span>
                    <span className='text-xs px-2 py-1 rounded bg-white border ml-2'>
                      {epic.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                  {epic.clientSummary && (
                    <p className='mt-1 text-xs text-slate-600 line-clamp-2'>
                      {epic.clientSummary}
                    </p>
                  )}
                </button>
              </li>
            );
          })}
          {project.epics.length === 0 && (
            <li className='text-sm text-slate-500'>
              No epics yet. Use the form above to add your first one.
            </li>
          )}
        </ul>

        <form onSubmit={handleQuickAdd} className='mt-4'>
          <div className='relative'>
            <input
              type='text'
              className='w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
              placeholder='Quick add epic...'
              value={quickAddName}
              onChange={(e) => setQuickAddName(e.target.value)}
              disabled={quickAdding}
            />
            <button
              type='submit'
              disabled={!quickAddName.trim() || quickAdding}
              className='absolute right-2 top-2 rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                className='h-4 w-4'
              >
                <path d='M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z' />
              </svg>
            </button>
          </div>
        </form>

        {selectedEpic && (
          <div className='space-y-4 rounded-2xl border border-sky-100/70 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)]'>
            <form onSubmit={handleUpdateEpic} className='space-y-4'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2'>
                  <span
                    className='w-3 h-3 rounded-full'
                    style={{
                      backgroundColor: editingEpic?.color ?? selectedEpic.color,
                    }}
                  />
                  <input
                    className='text-sm font-semibold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-sky-500'
                    value={editingEpic ? editingDraft.name : selectedEpic.name}
                    onChange={(e) => {
                      if (!editingEpic) beginEditEpic(selectedEpic);
                      setEditingDraft((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className='flex items-center gap-3'>
                  <span className='text-[11px] uppercase tracking-wide text-slate-500'>
                    {epicStories.length} stories
                  </span>
                  <button
                    type='button'
                    className='text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700'
                    onClick={() => openEpic(selectedEpic.id)}
                  >
                    Open modal
                  </button>
                </div>
              </div>

              <div className='grid gap-3 md:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)]'>
                <label className='flex flex-col gap-1 text-xs text-slate-600'>
                  Description
                  <textarea
                    rows={3}
                    className='rounded-md border border-slate-200 px-2 py-1 text-xs'
                    value={
                      editingEpic
                        ? editingDraft.description
                        : selectedEpic.description ?? ''
                    }
                    onChange={(e) => {
                      if (!editingEpic) beginEditEpic(selectedEpic);
                      setEditingDraft((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }));
                    }}
                  />
                </label>
                <div className='space-y-3 text-xs text-slate-600'>
                  <label className='flex flex-col gap-1'>
                    Type
                    <select
                      className='rounded-md border border-slate-200 px-2 py-1 text-xs'
                      value={
                        editingEpic
                          ? editingDraft.type
                          : selectedEpic.type || 'FEATURE'
                      }
                      onChange={(e) => {
                        if (!editingEpic) beginEditEpic(selectedEpic);
                        setEditingDraft((prev) => ({
                          ...prev,
                          type: e.target.value as EpicType,
                        }));
                      }}
                    >
                      <option value='FEATURE'>Feature</option>
                      <option value='DEFECT'>Defect</option>
                      <option value='MAINTENANCE'>Maintenance</option>
                      <option value='COMPLIANCE'>Compliance</option>
                      <option value='PERFORMANCE'>Performance</option>
                    </select>
                  </label>
                  <div className='flex flex-col gap-2'>
                    <span className='font-semibold'>Color</span>
                    <div className='flex flex-wrap gap-1.5'>
                      {EPIC_COLORS.map((c) => (
                        <button
                          key={c}
                          type='button'
                          className={`h-5 w-5 rounded-full border transition hover:scale-110 ${
                            (editingEpic
                              ? editingDraft.color
                              : selectedEpic.color) === c
                              ? 'border-slate-600 ring-1 ring-slate-300 ring-offset-1'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                          onClick={() => {
                            if (!editingEpic) beginEditEpic(selectedEpic);
                            setEditingDraft((prev) => ({
                              ...prev,
                              color: c,
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <label className='flex flex-col gap-1'>
                    Client summary
                    <textarea
                      rows={2}
                      className='rounded-md border border-slate-200 px-2 py-1 text-xs'
                      value={
                        editingEpic
                          ? editingDraft.clientSummary
                          : selectedEpic.clientSummary ?? ''
                      }
                      onChange={(e) => {
                        if (!editingEpic) beginEditEpic(selectedEpic);
                        setEditingDraft((prev) => ({
                          ...prev,
                          clientSummary: e.target.value,
                        }));
                      }}
                    />
                  </label>
                  {(editingEpic ? editingDraft.type : selectedEpic.type) ===
                    'DEFECT' && (
                    <div className='space-y-2 border-l-2 border-rose-200 pl-2'>
                      <label className='flex flex-col gap-1'>
                        Reported By
                        <input
                          className='rounded-md border border-slate-200 px-2 py-1 text-xs'
                          value={
                            editingEpic
                              ? editingDraft.defectDetails?.reportedBy
                              : selectedEpic.defectDetails?.reportedBy || ''
                          }
                          onChange={(e) => {
                            if (!editingEpic) beginEditEpic(selectedEpic);
                            setEditingDraft((prev) => ({
                              ...prev,
                              defectDetails: {
                                ...prev.defectDetails,
                                reportedBy: e.target.value,
                              },
                            }));
                          }}
                        />
                      </label>
                      <label className='flex flex-col gap-1'>
                        Severity
                        <select
                          className='rounded-md border border-slate-200 px-2 py-1 text-xs'
                          value={
                            editingEpic
                              ? editingDraft.defectDetails?.severity
                              : selectedEpic.defectDetails?.severity || 'MEDIUM'
                          }
                          onChange={(e) => {
                            if (!editingEpic) beginEditEpic(selectedEpic);
                            setEditingDraft((prev) => ({
                              ...prev,
                              defectDetails: {
                                ...prev.defectDetails,
                                severity: e.target.value,
                              },
                            }));
                          }}
                        >
                          <option value='LOW'>Low</option>
                          <option value='MEDIUM'>Medium</option>
                          <option value='HIGH'>High</option>
                          <option value='CRITICAL'>Critical</option>
                        </select>
                      </label>
                      <label className='flex flex-col gap-1'>
                        Impact Summary
                        <textarea
                          rows={2}
                          className='rounded-md border border-slate-200 px-2 py-1 text-xs'
                          value={
                            editingEpic
                              ? editingDraft.defectDetails?.impactSummary
                              : selectedEpic.defectDetails?.impactSummary || ''
                          }
                          onChange={(e) => {
                            if (!editingEpic) beginEditEpic(selectedEpic);
                            setEditingDraft((prev) => ({
                              ...prev,
                              defectDetails: {
                                ...prev.defectDetails,
                                impactSummary: e.target.value,
                              },
                            }));
                          }}
                        />
                      </label>
                      <label className='flex flex-col gap-1'>
                        Steps to Reproduce
                        <textarea
                          rows={3}
                          className='rounded-md border border-slate-200 px-2 py-1 text-xs'
                          value={
                            editingEpic
                              ? editingDraft.defectDetails?.stepsToReproduce
                              : selectedEpic.defectDetails?.stepsToReproduce ||
                                ''
                          }
                          onChange={(e) => {
                            if (!editingEpic) beginEditEpic(selectedEpic);
                            setEditingDraft((prev) => ({
                              ...prev,
                              defectDetails: {
                                ...prev.defectDetails,
                                stepsToReproduce: e.target.value,
                              },
                            }));
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className='space-y-1'>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                  Acceptance criteria
                </p>
                <textarea
                  rows={4}
                  className='w-full rounded-md border border-slate-200 px-2 py-1 text-xs'
                  placeholder='One check per line'
                  value={
                    editingEpic
                      ? editingDraft.acceptanceCriteriaText
                      : selectedEpic.acceptanceCriteria.join('\n')
                  }
                  onChange={(e) => {
                    if (!editingEpic) beginEditEpic(selectedEpic);
                    setEditingDraft((prev) => ({
                      ...prev,
                      acceptanceCriteriaText: e.target.value,
                    }));
                  }}
                />
              </div>

              <div className='space-y-1'>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                  Stories in this epic
                </p>
                {epicStories.length === 0 ? (
                  <p className='text-xs text-slate-500'>
                    No stories yet. Create stories from the backlog and link
                    them to this epic.
                  </p>
                ) : (
                  <ul className='space-y-1 text-xs text-slate-700'>
                    {epicStories.map((story) => (
                      <li
                        key={story.id}
                        className='flex items-center justify-between gap-2'
                      >
                        <button
                          type='button'
                          className='truncate text-left font-semibold text-slate-800 hover:underline'
                          onClick={() => openStory(story.id)}
                        >
                          {story.title}
                        </button>
                        <span className='text-[11px] uppercase tracking-wide text-slate-500'>
                          {story.stage.toLowerCase()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className='mt-2 flex flex-wrap items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-xs text-slate-500'>
                  {editingEpic && (
                    <span>Editing… changes will update this epic.</span>
                  )}
                  {updateError && (
                    <span className='text-rose-600'>{updateError}</span>
                  )}
                </div>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={() => setStoryPickerOpen(true)}
                    className='rounded-md border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm disabled:opacity-50'
                    disabled={updating}
                  >
                    Attach stories
                  </button>
                  <button
                    type='button'
                    onClick={handleDeleteEpic}
                    className='rounded-md border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 disabled:opacity-50'
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting…' : 'Delete epic'}
                  </button>
                  {editingEpic && (
                    <button
                      type='button'
                      onClick={cancelEditEpic}
                      className='rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700'
                      disabled={updating}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type='submit'
                    className='rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50'
                    disabled={updating || !editingEpic}
                  >
                    {updating ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
      <Modal
        title='Attach user stories to epic'
        description='Select one or more stories to associate with this epic. Use filters to inspect stories belonging to other epics.'
        open={storyPickerOpen}
        onClose={() => setStoryPickerOpen(false)}
        width='lg'
        actions={
          <>
            <button
              type='button'
              onClick={() => setStoryPickerOpen(false)}
              className='rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700'
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleAttachStories}
              className='rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50'
              disabled={
                updating || !selectedEpic || selectedStoryIds.length === 0
              }
            >
              {updating ? 'Attaching…' : 'Attach to epic'}
            </button>
          </>
        }
      >
        {selectedEpic ? (
          <div className='space-y-4 text-sm text-slate-700'>
            <div className='rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between gap-3'>
              <div>
                <p className='text-xs uppercase tracking-wide text-slate-500'>
                  Target epic
                </p>
                <p className='font-semibold text-slate-900'>
                  {selectedEpic.name}
                </p>
              </div>
              <span className='text-xs text-slate-500'>
                {selectedStoryIds.length} selected
              </span>
            </div>
            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Show stories from
              </p>
              <div className='flex flex-wrap gap-2'>
                {project.epics.map((epic) => (
                  <label
                    key={epic.id}
                    className='inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600'
                  >
                    <input
                      type='checkbox'
                      className='h-3 w-3 rounded border-slate-300'
                      checked={filterEpicIds.includes(epic.id)}
                      onChange={() => toggleFilterEpic(epic.id)}
                    />
                    <span
                      className='h-2 w-2 rounded-full'
                      style={{ backgroundColor: epic.color }}
                    />
                    <span className='max-w-[8rem] truncate'>{epic.name}</span>
                  </label>
                ))}
              </div>
              <p className='text-xs text-slate-500'>
                Unassigned stories are always shown. Checked epics add their
                stories to the list with color coding.
              </p>
            </div>
            <div className='max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white'>
              {filteredStoriesForPicker.length === 0 ? (
                <p className='px-4 py-3 text-xs text-slate-500'>
                  No stories available to attach.
                </p>
              ) : (
                <ul className='divide-y divide-slate-100'>
                  {filteredStoriesForPicker.map((story) => {
                    const storyEpic = project.epics.find(
                      (e) => e.id === story.epicId
                    );
                    const isSelected = selectedStoryIds.includes(story.id);
                    return (
                      <li key={story.id}>
                        <label
                          className={`flex cursor-pointer items-start gap-3 px-4 py-3 text-xs ${
                            isSelected ? 'bg-slate-50' : ''
                          }`}
                        >
                          <input
                            type='checkbox'
                            className='mt-1 h-3 w-3 rounded border-slate-300'
                            checked={isSelected}
                            onChange={() => toggleStorySelection(story.id)}
                          />
                          <div className='flex-1 space-y-1'>
                            <div className='flex items-center justify-between gap-2'>
                              <p className='font-semibold text-slate-900'>
                                {story.title}
                              </p>
                              <span className='text-[11px] font-semibold text-slate-500'>
                                {story.points ?? '—'} pts
                              </span>
                            </div>
                            <p className='line-clamp-2 text-[11px] text-slate-500'>
                              {story.description || 'No description yet.'}
                            </p>
                            <div className='flex items-center justify-between gap-2 text-[11px] text-slate-500'>
                              <span>
                                {storyEpic ? (
                                  <span className='inline-flex items-center gap-1'>
                                    <span
                                      className='h-2 w-2 rounded-full'
                                      style={{
                                        backgroundColor: storyEpic.color,
                                      }}
                                    />
                                    <span>{storyEpic.name}</span>
                                  </span>
                                ) : (
                                  'Unassigned'
                                )}
                              </span>
                              <span>{story.stage.toLowerCase()}</span>
                            </div>
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <p className='text-sm text-slate-500'>Select an epic first.</p>
        )}
      </Modal>
      <Modal
        title='Create epic'
        description='Capture a client-facing epic with acceptance criteria.'
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        actions={
          <>
            <button
              type='button'
              onClick={() => setCreateOpen(false)}
              className='rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700'
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type='submit'
              form='create-epic-form'
              className='rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50'
              disabled={saving || !draft.name.trim()}
            >
              {saving ? 'Creating…' : 'Create epic'}
            </button>
          </>
        }
      >
        <form
          id='create-epic-form'
          className='space-y-3 text-sm text-slate-700'
          onSubmit={handleCreateEpic}
        >
          {error && (
            <div className='rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700'>
              {error}
            </div>
          )}
          <label className='flex flex-col gap-1'>
            Type
            <select
              className='rounded-md border border-slate-300 px-2 py-1'
              value={draft.type}
              onChange={(e) =>
                setDraft((d) => ({ ...d, type: e.target.value as EpicType }))
              }
            >
              <option value='FEATURE'>Feature</option>
              <option value='DEFECT'>Defect</option>
              <option value='MAINTENANCE'>Maintenance</option>
              <option value='COMPLIANCE'>Compliance</option>
              <option value='PERFORMANCE'>Performance</option>
            </select>
          </label>
          {draft.type === 'DEFECT' && (
            <div className='space-y-3 border-l-2 border-rose-200 pl-3'>
              <label className='flex flex-col gap-1'>
                Reported By
                <input
                  className='rounded-md border border-slate-300 px-2 py-1'
                  value={draft.defectDetails?.reportedBy || ''}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      defectDetails: {
                        ...d.defectDetails,
                        reportedBy: e.target.value,
                      },
                    }))
                  }
                />
              </label>
              <label className='flex flex-col gap-1'>
                Severity
                <select
                  className='rounded-md border border-slate-300 px-2 py-1'
                  value={draft.defectDetails?.severity || 'MEDIUM'}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      defectDetails: {
                        ...d.defectDetails,
                        severity: e.target.value,
                      },
                    }))
                  }
                >
                  <option value='LOW'>Low</option>
                  <option value='MEDIUM'>Medium</option>
                  <option value='HIGH'>High</option>
                  <option value='CRITICAL'>Critical</option>
                </select>
              </label>
              <label className='flex flex-col gap-1'>
                Impact Summary
                <textarea
                  rows={2}
                  className='rounded-md border border-slate-300 px-2 py-1'
                  value={draft.defectDetails?.impactSummary || ''}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      defectDetails: {
                        ...d.defectDetails,
                        impactSummary: e.target.value,
                      },
                    }))
                  }
                />
              </label>
              <label className='flex flex-col gap-1'>
                Steps to Reproduce
                <textarea
                  rows={3}
                  className='rounded-md border border-slate-300 px-2 py-1'
                  value={draft.defectDetails?.stepsToReproduce || ''}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      defectDetails: {
                        ...d.defectDetails,
                        stepsToReproduce: e.target.value,
                      },
                    }))
                  }
                />
              </label>
            </div>
          )}
          <label className='flex flex-col gap-1'>
            Name
            <input
              className='rounded-md border border-slate-300 px-2 py-1'
              placeholder='Epic name'
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
              required
            />
          </label>
          <div className='flex flex-col gap-2'>
            <span className='text-sm text-slate-600'>Color</span>
            <div className='flex flex-wrap gap-2'>
              {EPIC_COLORS.map((c) => (
                <button
                  key={c}
                  type='button'
                  className={`h-6 w-6 rounded-full border transition hover:scale-110 ${
                    draft.color === c
                      ? 'border-slate-600 ring-1 ring-slate-300 ring-offset-1'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setDraft((d) => ({ ...d, color: c }))}
                />
              ))}
            </div>
          </div>
          <label className='flex flex-col gap-1'>
            Description
            <textarea
              rows={3}
              className='rounded-md border border-slate-300 px-2 py-1'
              placeholder='Short description of the outcome'
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
            />
          </label>
          <label className='flex flex-col gap-1'>
            Client summary (optional)
            <textarea
              rows={2}
              className='rounded-md border border-slate-300 px-2 py-1'
              placeholder='One or two lines you would say to the client'
              value={draft.clientSummary ?? ''}
              onChange={(e) =>
                setDraft((d) => ({ ...d, clientSummary: e.target.value }))
              }
            />
          </label>
          <label className='flex flex-col gap-1'>
            Acceptance criteria (one per line)
            <textarea
              rows={4}
              className='rounded-md border border-slate-300 px-2 py-1'
              placeholder={'User can...\nData is...\nReporting shows...'}
              value={draft.acceptanceCriteria.join('\n')}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  acceptanceCriteria: e.target.value
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean),
                }))
              }
            />
          </label>
        </form>
      </Modal>
    </section>
  );
}
