import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../../../context/ProjectContext';
import {
  Ticket,
  TicketStatus,
  TicketStatusValues,
  TicketSeverity,
  CreateTicketInput,
} from '../../../types/domain';
import { Card, CardHeader, CardContent } from '../../../components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Tag } from '../../../components/ui/tag';
import { Loader2, Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Stack } from '../../../components/ui/container';
import { Heading, Text } from '../../../components/ui/typography';

export default function AdminProjectTickets() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projectService } = useProject();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<CreateTicketInput>({
    title: '',
    description: '',
    severity: TicketSeverity.LOW,
  });

  useEffect(() => {
    loadTickets();
  }, [projectId]);

  const loadTickets = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await projectService.getTickets(projectId);
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!projectId) return;
    try {
      await projectService.createTicket(projectId, newTicket);
      setIsCreateOpen(false);
      setNewTicket({
        title: '',
        description: '',
        severity: TicketSeverity.LOW,
      });
      loadTickets();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    if (!projectId) return;
    try {
      await projectService.updateTicketStatus(projectId, ticketId, status);
      loadTickets();
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const getSeverityVariant = (
    severity: TicketSeverity
  ): 'error' | 'warning' | 'success' | 'neutral' => {
    switch (severity) {
      case TicketSeverity.CRITICAL:
        return 'error';
      case TicketSeverity.HIGH:
        return 'warning';
      case TicketSeverity.MEDIUM:
        return 'warning';
      case TicketSeverity.LOW:
        return 'success';
      default:
        return 'neutral';
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case TicketStatusValues.OPEN:
        return <AlertCircle className='h-4 w-4 text-brand-solid' />;
      case TicketStatusValues.IN_PROGRESS:
        return <Clock className='h-4 w-4 text-amber-600' />;
      case TicketStatusValues.RESOLVED:
        return <CheckCircle2 className='h-4 w-4 text-brand-solid' />;
      case TicketStatusValues.CLOSED:
        return <CheckCircle2 className='h-4 w-4 text-text-muted' />;
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-brand-solid' />
      </div>
    );
  }

  return (
    <Stack gap={6}>
      <div className='flex justify-between items-center'>
        <div>
          <Heading
            level='h2'
            className='text-2xl font-bold tracking-tight text-text-primary'
          >
            Support Tickets
          </Heading>
          <Text variant='muted'>
            Manage support requests and issues for this project.
          </Text>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            <Stack gap={4} className='py-4'>
              <div className='space-y-2'>
                <Text variant='label'>Title</Text>
                <Input
                  value={newTicket.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewTicket({ ...newTicket, title: e.target.value })
                  }
                  placeholder='Brief summary of the issue'
                />
              </div>
              <div className='space-y-2'>
                <Text variant='label'>Severity</Text>
                <Select
                  value={newTicket.severity}
                  onValueChange={(value: string) =>
                    setNewTicket({
                      ...newTicket,
                      severity: value as TicketSeverity,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TicketSeverity.LOW}>Low</SelectItem>
                    <SelectItem value={TicketSeverity.MEDIUM}>
                      Medium
                    </SelectItem>
                    <SelectItem value={TicketSeverity.HIGH}>High</SelectItem>
                    <SelectItem value={TicketSeverity.CRITICAL}>
                      Critical
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Text variant='label'>Description</Text>
                <Textarea
                  value={newTicket.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewTicket({ ...newTicket, description: e.target.value })
                  }
                  placeholder='Detailed description of the issue...'
                  rows={4}
                />
              </div>
            </Stack>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTicket}>Create Ticket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Stack gap={4}>
        {tickets.map((ticket) => (
          <Card key={ticket.id} className='bg-surface border-border-subtle'>
            <CardHeader className='pb-2'>
              <div className='flex justify-between items-start'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Heading
                      level='h3'
                      className='text-lg font-semibold text-text-primary'
                    >
                      {ticket.title}
                    </Heading>
                    <Tag variant={getSeverityVariant(ticket.severity)}>
                      {ticket.severity}
                    </Tag>
                  </div>
                  <div className='text-sm text-text-muted flex items-center gap-2'>
                    <Text variant='caption'>
                      Created {new Date(ticket.createdAt).toLocaleDateString()}
                    </Text>
                    <Text variant='caption'>•</Text>
                    <span className='flex items-center gap-1'>
                      {getStatusIcon(ticket.status)}
                      <Text variant='caption'>{ticket.status}</Text>
                    </span>
                  </div>
                </div>
                <Select
                  value={ticket.status}
                  onValueChange={(value: string) =>
                    handleStatusChange(ticket.id, value as TicketStatus)
                  }
                >
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TicketStatusValues.OPEN}>
                      Open
                    </SelectItem>
                    <SelectItem value={TicketStatusValues.IN_PROGRESS}>
                      In Progress
                    </SelectItem>
                    <SelectItem value={TicketStatusValues.RESOLVED}>
                      Resolved
                    </SelectItem>
                    <SelectItem value={TicketStatusValues.CLOSED}>
                      Closed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Text
                variant='body'
                className='whitespace-pre-wrap text-text-primary'
              >
                {ticket.description}
              </Text>
            </CardContent>
          </Card>
        ))}
        {tickets.length === 0 && (
          <div className='text-center py-12 text-text-muted bg-surface-alt rounded-lg border border-dashed border-border-subtle'>
            <Text variant='muted'>
              No tickets found. Create one to get started.
            </Text>
          </div>
        )}
      </Stack>
    </Stack>
  );
}
