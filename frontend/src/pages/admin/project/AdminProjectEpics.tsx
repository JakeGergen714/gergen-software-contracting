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
import { Stack } from '../../../components/ui/container';
import { Card } from '../../../components/ui/card';
import { Heading, Text } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Tag } from '../../../components/ui/tag';
import { Plus } from 'lucide-react';

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
    <Card className='space-y-6'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <Heading level='h2' className='text-xl'>
            Epics
          </Heading>
          <Text variant='body' className='text-text-muted'>
            Shape the big rocks for this project.
          </Text>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className='bg-brand-solid hover:bg-brand-solid/90 border-0 text-white'
        >
          New epic
        </Button>
      </div>
      <div className='grid gap-6 lg:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]'>
        <Stack gap={3}>
          {project.epics.map((epic) => {
            const isSelected = selectedEpic?.id === epic.id;
            return (
              <div key={epic.id}>
                <button
                  type='button'
                  onClick={() => setSelectedEpicId(epic.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'border-brand-solid bg-surface-raised shadow-[0_15px_35px_rgba(14,165,233,0.15)]'
                      : 'border-border-subtle bg-surface hover:border-brand-soft'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <span
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: epic.color }}
                    />
                    <Text weight='semibold' className='text-text-primary'>
                      {epic.name}
                    </Text>
                    <Tag variant='outline' className='ml-2'>
                      {epic.status.replace('_', ' ').toLowerCase()}
                    </Tag>
                  </div>
                  {epic.clientSummary && (
                    <Text
                      variant='caption'
                      className='mt-1 text-text-muted line-clamp-2'
                    >
                      {epic.clientSummary}
                    </Text>
                  )}
                </button>
              </div>
            );
          })}
          {project.epics.length === 0 && (
            <Text variant='small' className='text-text-muted'>
              No epics yet. Use the form above to add your first one.
            </Text>
          )}
        </Stack>

        <form onSubmit={handleQuickAdd} className='mt-4'>
          <div className='relative'>
            <Input
              type='text'
              className='w-full pr-12'
              placeholder='Quick add epic...'
              value={quickAddName}
              onChange={(e) => setQuickAddName(e.target.value)}
              disabled={quickAdding}
            />
            <button
              type='submit'
              disabled={!quickAddName.trim() || quickAdding}
              className='absolute right-2 top-2 rounded-lg bg-surface-alt p-1.5 text-text-muted hover:bg-surface-raised hover:text-text-primary disabled:opacity-50'
            >
              <Plus className='h-4 w-4' />
            </button>
          </div>
        </form>

        {selectedEpic && (
          <Card className='space-y-4 border-border-subtle shadow-[0_20px_55px_rgba(15,23,42,0.04)]'>
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
                    className='text-sm font-semibold text-text-primary bg-transparent border-b border-dashed border-border-subtle focus:outline-none focus:border-brand-solid'
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
                  <Text variant='eyebrow'>{epicStories.length} stories</Text>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-[11px] uppercase tracking-wide text-text-muted hover:text-text-primary h-auto p-0'
                    onClick={() => openEpic(selectedEpic.id)}
                  >
                    Open modal
                  </Button>
                </div>
              </div>

              <div className='grid gap-3 md:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)]'>
                <label className='flex flex-col gap-1 text-xs text-text-muted'>
                  Description
                  <Textarea
                    rows={3}
                    className='text-xs'
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
                <div className='space-y-3 text-xs text-text-muted'>
                  <label className='flex flex-col gap-1'>
                    Type
                    <select
                      className='rounded-md border border-border-subtle px-2 py-1 text-xs bg-surface'
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
                              ? 'border-text-muted ring-1 ring-border-subtle ring-offset-1'
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
                    <Textarea
                      rows={2}
                      className='text-xs'
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
                    <div className='space-y-2 border-l-2 border-brand-strong/20 pl-2'>
                      <label className='flex flex-col gap-1'>
                        Reported By
                        <Input
                          className='text-xs h-8'
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
                          className='rounded-md border border-border-subtle px-2 py-1 text-xs bg-surface'
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
                        <Textarea
                          rows={2}
                          className='text-xs'
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
                        <Textarea
                          rows={3}
                          className='text-xs'
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
                <Text variant='eyebrow'>Acceptance criteria</Text>
                <Textarea
                  rows={4}
                  className='w-full text-xs'
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
                <Text variant='eyebrow'>Stories in this epic</Text>
                {epicStories.length === 0 ? (
                  <Text variant='caption' className='text-text-muted'>
                    No stories yet. Create stories from the backlog and link
                    them to this epic.
                  </Text>
                ) : (
                  <ul className='space-y-1 text-xs text-text-primary'>
                    {epicStories.map((story) => (
                      <li
                        key={story.id}
                        className='flex items-center justify-between gap-2'
                      >
                        <Button
                          variant='link'
                          size='sm'
                          className='truncate text-left font-semibold text-text-primary hover:underline h-auto p-0'
                          onClick={() => openStory(story.id)}
                        >
                          {story.title}
                        </Button>
                        <Text variant='eyebrow'>
                          {story.stage.toLowerCase()}
                        </Text>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className='mt-2 flex flex-wrap items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-xs text-text-muted'>
                  {editingEpic && (
                    <span>Editing… changes will update this epic.</span>
                  )}
                  {updateError && (
                    <span className='text-brand-strong'>{updateError}</span>
                  )}
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setStoryPickerOpen(true)}
                    className='border-brand-soft bg-brand-soft/10 text-brand-strong'
                    disabled={updating}
                  >
                    Attach stories
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleDeleteEpic}
                    className='border-brand-strong/20 text-brand-strong'
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting…' : 'Delete epic'}
                  </Button>
                  {editingEpic && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={cancelEditEpic}
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    size='sm'
                    type='submit'
                    disabled={updating || !editingEpic}
                  >
                    {updating ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
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
            <Button
              variant='outline'
              onClick={() => setStoryPickerOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAttachStories}
              disabled={
                updating || !selectedEpic || selectedStoryIds.length === 0
              }
            >
              {updating ? 'Attaching…' : 'Attach to epic'}
            </Button>
          </>
        }
      >
        {selectedEpic ? (
          <Stack gap={4}>
            <div className='rounded-xl border border-border-subtle bg-surface-alt px-3 py-2 flex items-center justify-between gap-3'>
              <div>
                <Text variant='eyebrow'>Target epic</Text>
                <Text weight='semibold' className='text-text-primary'>
                  {selectedEpic.name}
                </Text>
              </div>
              <Text variant='caption' className='text-text-muted'>
                {selectedStoryIds.length} selected
              </Text>
            </div>
            <div className='space-y-2'>
              <Text variant='eyebrow'>Show stories from</Text>
              <div className='flex flex-wrap gap-2'>
                {project.epics.map((epic) => (
                  <label
                    key={epic.id}
                    className='inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs text-text-muted'
                  >
                    <input
                      type='checkbox'
                      className='h-3 w-3 rounded border-border-subtle'
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
              <Text variant='caption' className='text-text-muted'>
                Unassigned stories are always shown. Checked epics add their
                stories to the list with color coding.
              </Text>
            </div>
            <div className='max-h-80 overflow-y-auto rounded-xl border border-border-subtle bg-surface'>
              {filteredStoriesForPicker.length === 0 ? (
                <Text variant='caption' className='px-4 py-3 text-text-muted'>
                  No stories available to attach.
                </Text>
              ) : (
                <ul className='divide-y divide-border-subtle'>
                  {filteredStoriesForPicker.map((story) => {
                    const storyEpic = project.epics.find(
                      (e) => e.id === story.epicId
                    );
                    const isSelected = selectedStoryIds.includes(story.id);
                    return (
                      <li key={story.id}>
                        <label
                          className={`flex cursor-pointer items-start gap-3 px-4 py-3 text-xs ${
                            isSelected ? 'bg-surface-alt' : ''
                          }`}
                        >
                          <input
                            type='checkbox'
                            className='mt-1 h-3 w-3 rounded border-border-subtle'
                            checked={isSelected}
                            onChange={() => toggleStorySelection(story.id)}
                          />
                          <div className='flex-1 space-y-1'>
                            <div className='flex items-center justify-between gap-2'>
                              <Text
                                weight='semibold'
                                className='text-text-primary'
                              >
                                {story.title}
                              </Text>
                              <Text
                                variant='caption'
                                weight='semibold'
                                className='text-text-muted'
                              >
                                {story.points ?? '—'} pts
                              </Text>
                            </div>
                            <Text
                              variant='caption'
                              className='line-clamp-2 text-text-muted'
                            >
                              {story.description || 'No description yet.'}
                            </Text>
                            <div className='flex items-center justify-between gap-2 text-[11px] text-text-muted'>
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
          </Stack>
        ) : (
          <Text variant='body' className='text-text-muted'>
            Select an epic first.
          </Text>
        )}
      </Modal>
      <Modal
        title='Create epic'
        description='Capture a client-facing epic with acceptance criteria.'
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        actions={
          <>
            <Button
              variant='outline'
              onClick={() => setCreateOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              form='create-epic-form'
              disabled={saving || !draft.name.trim()}
            >
              {saving ? 'Creating…' : 'Create epic'}
            </Button>
          </>
        }
      >
        <form
          id='create-epic-form'
          className='space-y-3 text-sm text-text-primary'
          onSubmit={handleCreateEpic}
        >
          {error && (
            <div className='rounded-md border border-brand-strong/20 bg-brand-strong/5 px-3 py-2 text-sm text-brand-strong'>
              {error}
            </div>
          )}
          <label className='flex flex-col gap-1'>
            Type
            <select
              className='rounded-md border border-border-subtle px-2 py-1 bg-surface'
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
            <div className='space-y-3 border-l-2 border-brand-strong/20 pl-3'>
              <label className='flex flex-col gap-1'>
                Reported By
                <Input
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
                  className='rounded-md border border-border-subtle px-2 py-1 bg-surface'
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
                <Textarea
                  rows={2}
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
                <Textarea
                  rows={3}
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
            <Input
              placeholder='Epic name'
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
              required
            />
          </label>
          <div className='flex flex-col gap-2'>
            <span className='text-sm text-text-muted'>Color</span>
            <div className='flex flex-wrap gap-2'>
              {EPIC_COLORS.map((c) => (
                <button
                  key={c}
                  type='button'
                  className={`h-6 w-6 rounded-full border transition hover:scale-110 ${
                    draft.color === c
                      ? 'border-text-muted ring-1 ring-border-subtle ring-offset-1'
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
            <Textarea
              rows={3}
              placeholder='Short description of the outcome'
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
            />
          </label>
          <label className='flex flex-col gap-1'>
            Client summary (optional)
            <Textarea
              rows={2}
              placeholder='One or two lines you would say to the client'
              value={draft.clientSummary ?? ''}
              onChange={(e) =>
                setDraft((d) => ({ ...d, clientSummary: e.target.value }))
              }
            />
          </label>
          <label className='flex flex-col gap-1'>
            Acceptance criteria (one per line)
            <Textarea
              rows={4}
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
    </Card>
  );
}
