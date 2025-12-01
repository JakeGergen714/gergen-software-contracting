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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../components/ui/card';
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
import { Badge } from '../../../components/ui/badge';
import { Loader2, Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

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

  const getSeverityColor = (severity: TicketSeverity) => {
    switch (severity) {
      case TicketSeverity.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case TicketSeverity.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case TicketSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TicketSeverity.LOW:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case TicketStatusValues.OPEN:
        return <AlertCircle className='h-4 w-4 text-blue-500' />;
      case TicketStatusValues.IN_PROGRESS:
        return <Clock className='h-4 w-4 text-yellow-500' />;
      case TicketStatusValues.RESOLVED:
        return <CheckCircle2 className='h-4 w-4 text-green-500' />;
      case TicketStatusValues.CLOSED:
        return <CheckCircle2 className='h-4 w-4 text-gray-500' />;
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Support Tickets</h2>
          <p className='text-muted-foreground'>
            Manage support requests and issues for this project.
          </p>
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
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Title</label>
                <Input
                  value={newTicket.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewTicket({ ...newTicket, title: e.target.value })
                  }
                  placeholder='Brief summary of the issue'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Severity</label>
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
                <label className='text-sm font-medium'>Description</label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewTicket({ ...newTicket, description: e.target.value })
                  }
                  placeholder='Detailed description of the issue...'
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTicket}>Create Ticket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className='grid gap-4'>
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader className='pb-2'>
              <div className='flex justify-between items-start'>
                <div className='space-y-1'>
                  <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                    {ticket.title}
                    <Badge
                      variant='outline'
                      className={getSeverityColor(ticket.severity)}
                    >
                      {ticket.severity}
                    </Badge>
                  </CardTitle>
                  <div className='text-sm text-muted-foreground flex items-center gap-2'>
                    <span>
                      Created {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className='flex items-center gap-1'>
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
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
              <p className='text-sm whitespace-pre-wrap'>
                {ticket.description}
              </p>
            </CardContent>
          </Card>
        ))}
        {tickets.length === 0 && (
          <div className='text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed'>
            <p>No tickets found. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
