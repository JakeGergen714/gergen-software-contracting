import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '../../../context/ServiceContext';
import {
  Budget,
  Invoice,
  InvoiceStatus,
  CreateInvoiceInput,
} from '../../../types/domain';
import { Stack } from '../../../components/ui/container';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Heading, Text } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Tag } from '../../../components/ui/tag';
import { Modal } from '../../../components/ui/Modal';
import { Loader2, Plus } from 'lucide-react';

export const AdminProjectFinancials: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { project: projectService } = useServices();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Budget Form
  const [newBudgetAmount, setNewBudgetAmount] = useState<string>('');

  // Invoice Form
  const [newInvoiceNumber, setNewInvoiceNumber] = useState('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('');
  const [newInvoiceCurrency, setNewInvoiceCurrency] = useState('USD');
  const [newInvoiceDueDate, setNewInvoiceDueDate] = useState('');

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [budgetData, invoicesData] = await Promise.all([
        projectService.getBudget(projectId),
        projectService.getInvoices(projectId),
      ]);
      setBudget(budgetData);
      setInvoices(invoicesData);
      if (budgetData) {
        setNewBudgetAmount(budgetData.totalAmount.toString());
      }
    } catch (error) {
      console.error('Failed to load financial data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!projectId) return;
    try {
      const updated = await projectService.updateBudget(projectId, {
        totalAmount: parseFloat(newBudgetAmount),
      });
      setBudget(updated);
      setIsBudgetModalOpen(false);
    } catch (error) {
      console.error('Failed to update budget', error);
    }
  };

  const handleCreateInvoice = async () => {
    if (!projectId) return;
    try {
      const input: CreateInvoiceInput = {
        invoiceNumber: newInvoiceNumber,
        amount: parseFloat(newInvoiceAmount),
        currency: newInvoiceCurrency,
        dueDate: new Date(newInvoiceDueDate).toISOString(),
      };
      const created = await projectService.createInvoice(projectId, input);
      setInvoices([created, ...invoices]);
      setIsInvoiceModalOpen(false);
      // Reset form
      setNewInvoiceNumber('');
      setNewInvoiceAmount('');
      setNewInvoiceDueDate('');
    } catch (error) {
      console.error('Failed to create invoice', error);
    }
  };

  const handleUpdateInvoiceStatus = async (
    invoiceId: string,
    status: InvoiceStatus
  ) => {
    if (!projectId) return;
    try {
      const updated = await projectService.updateInvoiceStatus(
        projectId,
        invoiceId,
        status
      );
      setInvoices(
        invoices.map((inv) => (inv.id === invoiceId ? updated : inv))
      );
      // Reload budget as it might have changed
      const updatedBudget = await projectService.getBudget(projectId);
      setBudget(updatedBudget);
    } catch (error) {
      console.error('Failed to update invoice status', error);
    }
  };

  const getInvoiceStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'OVERDUE':
        return 'error';
      case 'SENT':
        return 'warning';
      case 'CANCELLED':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-brand-solid' />
      </div>
    );
  }

  const remaining = budget ? budget.totalAmount - budget.spentAmount : 0;
  const percentSpent =
    budget && budget.totalAmount > 0
      ? (budget.spentAmount / budget.totalAmount) * 100
      : 0;

  return (
    <Stack gap={6}>
      <div className='flex justify-between items-center'>
        <Heading
          level='h2'
          className='text-2xl font-bold tracking-tight text-text-primary'
        >
          Financials
        </Heading>
        <div className='space-x-2'>
          <Button
            variant='outline'
            onClick={() => setIsBudgetModalOpen(true)}
            className='border-border-subtle text-text-primary hover:bg-surface-alt'
          >
            Update Budget
          </Button>
          <Button
            onClick={() => setIsInvoiceModalOpen(true)}
            className='bg-brand-solid hover:bg-brand-solid/90 text-white'
          >
            <Plus className='mr-2 h-4 w-4' />
            Create Invoice
          </Button>

          <Modal
            title='Update Project Budget'
            open={isBudgetModalOpen}
            onClose={() => setIsBudgetModalOpen(false)}
            actions={
              <>
                <Button
                  variant='outline'
                  onClick={() => setIsBudgetModalOpen(false)}
                  className='border-border-subtle text-text-primary hover:bg-surface-alt'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateBudget}
                  className='bg-brand-solid hover:bg-brand-solid/90 text-white'
                >
                  Save Changes
                </Button>
              </>
            }
          >
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Text
                  variant='label'
                  className='text-right text-text-secondary'
                >
                  Total Amount
                </Text>
                <div className='col-span-3'>
                  <Input
                    type='number'
                    value={newBudgetAmount}
                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                    className='bg-surface-alt border-border-subtle text-text-primary'
                  />
                </div>
              </div>
            </div>
          </Modal>

          <Modal
            title='Create New Invoice'
            open={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            actions={
              <>
                <Button
                  variant='outline'
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className='border-border-subtle text-text-primary hover:bg-surface-alt'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateInvoice}
                  className='bg-brand-solid hover:bg-brand-solid/90 text-white'
                >
                  Create Invoice
                </Button>
              </>
            }
          >
            <Stack gap={4} className='py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Text
                  variant='label'
                  className='text-right text-text-secondary'
                >
                  Invoice #
                </Text>
                <div className='col-span-3'>
                  <Input
                    value={newInvoiceNumber}
                    onChange={(e) => setNewInvoiceNumber(e.target.value)}
                    className='bg-surface-alt border-border-subtle text-text-primary'
                  />
                </div>
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Text
                  variant='label'
                  className='text-right text-text-secondary'
                >
                  Amount
                </Text>
                <div className='col-span-3'>
                  <Input
                    type='number'
                    value={newInvoiceAmount}
                    onChange={(e) => setNewInvoiceAmount(e.target.value)}
                    className='bg-surface-alt border-border-subtle text-text-primary'
                  />
                </div>
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Text
                  variant='label'
                  className='text-right text-text-secondary'
                >
                  Currency
                </Text>
                <div className='col-span-3'>
                  <Input
                    value={newInvoiceCurrency}
                    onChange={(e) => setNewInvoiceCurrency(e.target.value)}
                    className='bg-surface-alt border-border-subtle text-text-primary'
                  />
                </div>
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Text
                  variant='label'
                  className='text-right text-text-secondary'
                >
                  Due Date
                </Text>
                <div className='col-span-3'>
                  <Input
                    type='date'
                    value={newInvoiceDueDate}
                    onChange={(e) => setNewInvoiceDueDate(e.target.value)}
                    className='bg-surface-alt border-border-subtle text-text-primary'
                  />
                </div>
              </div>
            </Stack>
          </Modal>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='bg-surface border-border-subtle'>
          <CardContent className='p-6'>
            <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Text variant='label' className='font-medium text-text-secondary'>
                Total Budget
              </Text>
            </div>
            <div className='text-2xl font-bold text-text-primary'>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: budget?.currency || 'USD',
              }).format(budget?.totalAmount || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className='bg-surface border-border-subtle'>
          <CardContent className='p-6'>
            <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Text variant='label' className='font-medium text-text-secondary'>
                Spent Amount
              </Text>
            </div>
            <div className='text-2xl font-bold text-text-primary'>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: budget?.currency || 'USD',
              }).format(budget?.spentAmount || 0)}
            </div>
            <Text variant='caption' className='text-text-muted'>
              {percentSpent.toFixed(1)}% of budget
            </Text>
          </CardContent>
        </Card>
        <Card className='bg-surface border-border-subtle'>
          <CardContent className='p-6'>
            <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Text variant='label' className='font-medium text-text-secondary'>
                Remaining
              </Text>
            </div>
            <div className='text-2xl font-bold text-text-primary'>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: budget?.currency || 'USD',
              }).format(remaining)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='bg-surface border-border-subtle'>
        <CardHeader>
          <Heading
            level='h3'
            className='text-lg font-semibold text-text-primary'
          >
            Invoices
          </Heading>
        </CardHeader>
        <CardContent>
          <div className='relative w-full overflow-auto'>
            <table className='w-full caption-bottom text-sm'>
              <thead className='[&_tr]:border-b border-border-subtle'>
                <tr className='border-b border-border-subtle transition-colors hover:bg-surface-alt data-[state=selected]:bg-surface-alt'>
                  <th className='h-12 px-4 text-left align-middle font-medium text-text-muted [&:has([role=checkbox])]:pr-0'>
                    Invoice #
                  </th>
                  <th className='h-12 px-4 text-left align-middle font-medium text-text-muted [&:has([role=checkbox])]:pr-0'>
                    Amount
                  </th>
                  <th className='h-12 px-4 text-left align-middle font-medium text-text-muted [&:has([role=checkbox])]:pr-0'>
                    Status
                  </th>
                  <th className='h-12 px-4 text-left align-middle font-medium text-text-muted [&:has([role=checkbox])]:pr-0'>
                    Due Date
                  </th>
                  <th className='h-12 px-4 text-left align-middle font-medium text-text-muted [&:has([role=checkbox])]:pr-0'>
                    Paid Date
                  </th>
                  <th className='h-12 px-4 text-right align-middle font-medium text-text-muted [&:has([role=checkbox])]:pr-0'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='[&_tr:last-child]:border-0'>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className='border-b border-border-subtle transition-colors hover:bg-surface-alt data-[state=selected]:bg-surface-alt'
                  >
                    <td className='p-4 align-middle font-medium text-text-primary'>
                      {invoice.invoiceNumber}
                    </td>
                    <td className='p-4 align-middle text-text-primary'>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: invoice.currency,
                      }).format(invoice.amount)}
                    </td>
                    <td className='p-4 align-middle'>
                      <Tag variant={getInvoiceStatusVariant(invoice.status)}>
                        {invoice.status}
                      </Tag>
                    </td>
                    <td className='p-4 align-middle text-text-primary'>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className='p-4 align-middle text-text-primary'>
                      {invoice.paidDate
                        ? new Date(invoice.paidDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className='p-4 align-middle text-right'>
                      <Select
                        value={invoice.status}
                        onValueChange={(value) =>
                          handleUpdateInvoiceStatus(
                            invoice.id,
                            value as InvoiceStatus
                          )
                        }
                      >
                        <SelectTrigger className='w-[130px] bg-surface-alt border-border-subtle text-text-primary'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='bg-surface border-border-subtle'>
                          <SelectItem value='DRAFT'>Draft</SelectItem>
                          <SelectItem value='SENT'>Sent</SelectItem>
                          <SelectItem value='PAID'>Paid</SelectItem>
                          <SelectItem value='OVERDUE'>Overdue</SelectItem>
                          <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className='p-4 text-center text-text-muted'>
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Stack>
  );
};
