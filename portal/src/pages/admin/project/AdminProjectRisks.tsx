import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '../../../context/ServiceContext';
import {
  Risk,
  CreateRiskInput,
  RiskStatus,
  RiskProbability,
  RiskImpact,
} from '../../../types/domain';
import { Stack } from '../../../components/ui/container';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Heading, Text } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Tag } from '../../../components/ui/tag';
import { Plus, AlertTriangle, CheckCircle, XCircle, Edit } from 'lucide-react';

export const AdminProjectRisks: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useServices();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [formData, setFormData] = useState<CreateRiskInput>({
    title: '',
    description: '',
    probability: 'LOW',
    impact: 'NEGLIGIBLE',
    mitigationPlan: '',
  });

  useEffect(() => {
    if (projectId) {
      loadRisks();
    }
  }, [projectId]);

  const loadRisks = async () => {
    if (!projectId) return;
    try {
      const data = await project.getRisks(projectId);
      setRisks(data);
    } catch (error) {
      console.error('Failed to load risks', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      await project.createRisk(projectId, formData);
      setIsCreating(false);
      setFormData({
        title: '',
        description: '',
        probability: 'LOW',
        impact: 'NEGLIGIBLE',
        mitigationPlan: '',
      });
      loadRisks();
    } catch (error) {
      console.error('Failed to create risk', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !editingRisk) return;
    try {
      await project.updateRisk(projectId, editingRisk.id, formData);
      setEditingRisk(null);
      setFormData({
        title: '',
        description: '',
        probability: 'LOW',
        impact: 'NEGLIGIBLE',
        mitigationPlan: '',
      });
      loadRisks();
    } catch (error) {
      console.error('Failed to update risk', error);
    }
  };

  const handleStatusChange = async (riskId: string, status: RiskStatus) => {
    if (!projectId) return;
    try {
      await project.updateRiskStatus(projectId, riskId, status);
      loadRisks();
    } catch (error) {
      console.error('Failed to update risk status', error);
    }
  };

  const startEdit = (risk: Risk) => {
    setEditingRisk(risk);
    setFormData({
      title: risk.title,
      description: risk.description,
      probability: risk.probability,
      impact: risk.impact,
      mitigationPlan: risk.mitigationPlan,
      linkedEpicId: risk.linkedEpicId,
      linkedStoryId: risk.linkedStoryId,
    });
    setIsCreating(true);
  };

  const getProbabilityVariant = (prob: RiskProbability) => {
    switch (prob) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'warning';
      case 'CERTAIN':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getImpactVariant = (impact: RiskImpact) => {
    switch (impact) {
      case 'NEGLIGIBLE':
        return 'success';
      case 'MARGINAL':
        return 'warning';
      case 'CRITICAL':
        return 'warning';
      case 'CATASTROPHIC':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getStatusVariant = (status: RiskStatus) => {
    switch (status) {
      case 'OPEN':
        return 'warning';
      case 'MITIGATED':
        return 'success';
      case 'REALIZED':
        return 'error';
      case 'CLOSED':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <Stack gap={6}>
      <div className='flex justify-between items-center'>
        <div>
          <Heading level='h2' className='text-2xl font-bold text-text-primary'>
            Risk Management
          </Heading>
          <Text variant='muted' className='text-text-muted'>
            Identify and track project risks
          </Text>
        </div>
        <Button
          onClick={() => {
            setIsCreating(true);
            setEditingRisk(null);
            setFormData({
              title: '',
              description: '',
              probability: 'LOW',
              impact: 'NEGLIGIBLE',
              mitigationPlan: '',
            });
          }}
          className='bg-brand-solid hover:bg-brand-solid/90 text-white'
        >
          <Plus className='w-4 h-4 mr-2' />
          Log Risk
        </Button>
      </div>

      {isCreating && (
        <Card className='bg-surface border-border-subtle'>
          <CardHeader>
            <Heading
              level='h3'
              className='text-lg font-medium text-text-primary'
            >
              {editingRisk ? 'Edit Risk' : 'Log New Risk'}
            </Heading>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingRisk ? handleUpdate : handleCreate}>
              <Stack gap={4}>
                <div className='space-y-2'>
                  <Text variant='label' className='text-text-secondary'>
                    Title
                  </Text>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className='bg-surface-alt border-border-subtle text-text-primary'
                  />
                </div>
                <div className='space-y-2'>
                  <Text variant='label' className='text-text-secondary'>
                    Description
                  </Text>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    required
                    className='bg-surface-alt border-border-subtle text-text-primary'
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Text variant='label' className='text-text-secondary'>
                      Probability
                    </Text>
                    <Select
                      value={formData.probability}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          probability: value as RiskProbability,
                        })
                      }
                    >
                      <SelectTrigger className='bg-surface-alt border-border-subtle text-text-primary'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='bg-surface border-border-subtle'>
                        <SelectItem value='LOW'>Low</SelectItem>
                        <SelectItem value='MEDIUM'>Medium</SelectItem>
                        <SelectItem value='HIGH'>High</SelectItem>
                        <SelectItem value='CERTAIN'>Certain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Text variant='label' className='text-text-secondary'>
                      Impact
                    </Text>
                    <Select
                      value={formData.impact}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          impact: value as RiskImpact,
                        })
                      }
                    >
                      <SelectTrigger className='bg-surface-alt border-border-subtle text-text-primary'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='bg-surface border-border-subtle'>
                        <SelectItem value='NEGLIGIBLE'>Negligible</SelectItem>
                        <SelectItem value='MARGINAL'>Marginal</SelectItem>
                        <SelectItem value='CRITICAL'>Critical</SelectItem>
                        <SelectItem value='CATASTROPHIC'>
                          Catastrophic
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='space-y-2'>
                  <Text variant='label' className='text-text-secondary'>
                    Mitigation Plan
                  </Text>
                  <Textarea
                    value={formData.mitigationPlan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mitigationPlan: e.target.value,
                      })
                    }
                    rows={3}
                    required
                    className='bg-surface-alt border-border-subtle text-text-primary'
                  />
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
                    {editingRisk ? 'Update Risk' : 'Log Risk'}
                  </Button>
                </div>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}

      <Stack gap={4}>
        {risks.map((risk) => (
          <Card key={risk.id} className='bg-surface border-border-subtle'>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3'>
                    <Heading
                      level='h3'
                      className='text-lg font-medium text-text-primary'
                    >
                      {risk.title}
                    </Heading>
                    <Tag variant={getStatusVariant(risk.status)}>
                      {risk.status}
                    </Tag>
                  </div>
                  <Text variant='body' className='mt-1 text-text-muted'>
                    {risk.description}
                  </Text>
                  <div className='mt-2 flex items-center space-x-4'>
                    <Tag variant={getProbabilityVariant(risk.probability)}>
                      Prob: {risk.probability}
                    </Tag>
                    <Tag variant={getImpactVariant(risk.impact)}>
                      Impact: {risk.impact}
                    </Tag>
                  </div>
                  <div className='mt-2 text-sm'>
                    <Text
                      variant='body'
                      className='font-semibold inline text-text-primary'
                    >
                      Mitigation:{' '}
                    </Text>
                    <Text variant='body' className='inline text-text-secondary'>
                      {risk.mitigationPlan}
                    </Text>
                  </div>
                </div>
                <div className='flex items-center space-x-2 ml-4'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => startEdit(risk)}
                    title='Edit'
                    className='text-text-muted hover:text-text-primary hover:bg-surface-alt'
                  >
                    <Edit className='w-5 h-5' />
                  </Button>
                  {risk.status === 'OPEN' && (
                    <>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleStatusChange(risk.id, 'MITIGATED')}
                        className='text-brand-solid hover:text-brand-solid/80 hover:bg-brand-soft'
                        title='Mark Mitigated'
                      >
                        <CheckCircle className='w-5 h-5' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleStatusChange(risk.id, 'REALIZED')}
                        className='text-brand-strong hover:text-brand-strong/80 hover:bg-brand-strong/10'
                        title='Mark Realized'
                      >
                        <AlertTriangle className='w-5 h-5' />
                      </Button>
                    </>
                  )}
                  {risk.status !== 'CLOSED' && (
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleStatusChange(risk.id, 'CLOSED')}
                      className='text-text-muted hover:text-text-primary hover:bg-surface-alt'
                      title='Close Risk'
                    >
                      <XCircle className='w-5 h-5' />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {risks.length === 0 && (
          <div className='p-6 text-center text-text-muted bg-surface-alt rounded-lg border border-dashed border-border-subtle'>
            <Text variant='muted'>No risks logged yet.</Text>
          </div>
        )}
      </Stack>
    </Stack>
  );
};
