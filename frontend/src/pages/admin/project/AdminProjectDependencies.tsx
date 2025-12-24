import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '../../../context/ServiceContext';
import {
  Dependency,
  CreateDependencyInput,
  DependencyType,
  ProjectDetail,
} from '../../../types/domain';
import { Stack } from '../../../components/ui/container';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Heading, Text } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Tag } from '../../../components/ui/tag';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';

export const AdminProjectDependencies: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useServices();
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateDependencyInput>({
    sourceId: '',
    targetId: '',
    type: 'BLOCKS',
  });

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;
    try {
      const [proj, deps] = await Promise.all([
        project.getProject(projectId),
        project.getDependencies(projectId),
      ]);
      setProjectDetail(proj);
      setDependencies(deps);
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      await project.createDependency(projectId, formData);
      setIsCreating(false);
      setFormData({
        sourceId: '',
        targetId: '',
        type: 'BLOCKS',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create dependency', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!projectId) return;
    if (!window.confirm('Are you sure you want to delete this dependency?'))
      return;
    try {
      await project.deleteDependency(projectId, id);
      loadData();
    } catch (error) {
      console.error('Failed to delete dependency', error);
    }
  };

  const getItemName = (id: string) => {
    if (!projectDetail) return id;
    const epic = projectDetail.epics.find((e) => e.id === id);
    if (epic) return `Epic: ${epic.name}`;
    const story = projectDetail.stories.find((s) => s.id === id);
    if (story) return `Story: ${story.title}`;
    return id;
  };

  const allItems = projectDetail
    ? [
        ...projectDetail.epics.map((e) => ({
          id: e.id,
          name: `Epic: ${e.name}`,
        })),
        ...projectDetail.stories.map((s) => ({
          id: s.id,
          name: `Story: ${s.title}`,
        })),
      ]
    : [];

  return (
    <Stack gap={6}>
      <div className='flex justify-between items-center'>
        <div>
          <Heading level='h2' className='text-2xl font-bold text-text-primary'>
            Dependencies
          </Heading>
          <Text variant='muted' className='text-text-muted'>
            Manage dependencies between epics and stories
          </Text>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className='bg-brand-solid hover:bg-brand-solid/90 text-white'
        >
          <Plus className='w-4 h-4 mr-2' />
          Add Dependency
        </Button>
      </div>

      {isCreating && (
        <Card className='bg-surface border-border-subtle'>
          <CardHeader>
            <Heading
              level='h3'
              className='text-lg font-medium text-text-primary'
            >
              Add Dependency
            </Heading>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate}>
              <Stack gap={4}>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <Text variant='label' className='text-text-secondary'>
                      Source (Blocker)
                    </Text>
                    <Select
                      value={formData.sourceId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, sourceId: value })
                      }
                    >
                      <SelectTrigger className='bg-surface-alt border-border-subtle text-text-primary'>
                        <SelectValue placeholder='Select Item' />
                      </SelectTrigger>
                      <SelectContent className='bg-surface border-border-subtle'>
                        {allItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Text variant='label' className='text-text-secondary'>
                      Type
                    </Text>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          type: value as DependencyType,
                        })
                      }
                    >
                      <SelectTrigger className='bg-surface-alt border-border-subtle text-text-primary'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='bg-surface border-border-subtle'>
                        <SelectItem value='BLOCKS'>Blocks</SelectItem>
                        <SelectItem value='RELATES_TO'>Relates To</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Text variant='label' className='text-text-secondary'>
                      Target (Blocked)
                    </Text>
                    <Select
                      value={formData.targetId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, targetId: value })
                      }
                    >
                      <SelectTrigger className='bg-surface-alt border-border-subtle text-text-primary'>
                        <SelectValue placeholder='Select Item' />
                      </SelectTrigger>
                      <SelectContent className='bg-surface border-border-subtle'>
                        {allItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='flex justify-end space-x-3'>
                  <Button
                    variant='outline'
                    type='button'
                    onClick={() => setIsCreating(false)}
                    className='border-border-subtle text-text-primary hover:bg-surface-alt'
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    className='bg-brand-solid hover:bg-brand-solid/90 text-white'
                  >
                    Create Link
                  </Button>
                </div>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}

      <Stack gap={4}>
        {dependencies.map((dep) => (
          <Card key={dep.id} className='bg-surface border-border-subtle'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='flex-shrink-0'>
                    <LinkIcon className='h-6 w-6 text-text-muted' />
                  </div>
                  <div>
                    <div className='flex items-center space-x-2'>
                      <Text
                        variant='body'
                        className='font-medium text-text-primary'
                      >
                        {getItemName(dep.sourceId)}
                      </Text>
                      <Tag
                        variant={dep.type === 'BLOCKS' ? 'error' : 'neutral'}
                      >
                        {dep.type}
                      </Tag>
                      <Text
                        variant='body'
                        className='font-medium text-text-primary'
                      >
                        {getItemName(dep.targetId)}
                      </Text>
                    </div>
                    <Text variant='caption' className='text-text-muted'>
                      Created at {new Date(dep.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleDelete(dep.id)}
                  className='text-text-muted hover:text-brand-strong hover:bg-surface-alt'
                  title='Delete'
                >
                  <Trash2 className='w-5 h-5' />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {dependencies.length === 0 && (
          <div className='p-6 text-center text-text-muted bg-surface-alt rounded-lg border border-dashed border-border-subtle'>
            <Text variant='muted'>No dependencies found.</Text>
          </div>
        )}
      </Stack>
    </Stack>
  );
};
