import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '../../../context/ServiceContext';
import {
  Budget,
  Invoice,
  InvoiceStatus,
  CreateInvoiceInput,
} from '../../../types/domain';
import { Card } from '../../../components/ui/card';
import { Modal } from '../../../components/ui/Modal';

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

  if (loading) return <div>Loading financials...</div>;

  const remaining = budget ? budget.totalAmount - budget.spentAmount : 0;
  const percentSpent =
    budget && budget.totalAmount > 0
      ? (budget.spentAmount / budget.totalAmount) * 100
      : 0;

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold tracking-tight'>Financials</h2>
        <div className='space-x-2'>
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className='rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
          >
            Update Budget
          </button>
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className='rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500'
          >
            Create Invoice
          </button>

          <Modal
            title='Update Project Budget'
            open={isBudgetModalOpen}
            onClose={() => setIsBudgetModalOpen(false)}
            actions={
              <button
                onClick={handleUpdateBudget}
                className='rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500'
              >
                Save Changes
              </button>
            }
          >
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label
                  htmlFor='budget'
                  className='text-right text-sm font-medium'
                >
                  Total Amount
                </label>
                <input
                  id='budget'
                  type='number'
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(e.target.value)}
                  className='col-span-3 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                />
              </div>
            </div>
          </Modal>

          <Modal
            title='Create New Invoice'
            open={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            actions={
              <button
                onClick={handleCreateInvoice}
                className='rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500'
              >
                Create Invoice
              </button>
            }
          >
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label
                  htmlFor='number'
                  className='text-right text-sm font-medium'
                >
                  Invoice #
                </label>
                <input
                  id='number'
                  value={newInvoiceNumber}
                  onChange={(e) => setNewInvoiceNumber(e.target.value)}
                  className='col-span-3 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label
                  htmlFor='amount'
                  className='text-right text-sm font-medium'
                >
                  Amount
                </label>
                <input
                  id='amount'
                  type='number'
                  value={newInvoiceAmount}
                  onChange={(e) => setNewInvoiceAmount(e.target.value)}
                  className='col-span-3 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label
                  htmlFor='currency'
                  className='text-right text-sm font-medium'
                >
                  Currency
                </label>
                <input
                  id='currency'
                  value={newInvoiceCurrency}
                  onChange={(e) => setNewInvoiceCurrency(e.target.value)}
                  className='col-span-3 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label
                  htmlFor='dueDate'
                  className='text-right text-sm font-medium'
                >
                  Due Date
                </label>
                <input
                  id='dueDate'
                  type='date'
                  value={newInvoiceDueDate}
                  onChange={(e) => setNewInvoiceDueDate(e.target.value)}
                  className='col-span-3 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                />
              </div>
            </div>
          </Modal>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='p-6'>
          <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <h3 className='text-sm font-medium'>Total Budget</h3>
          </div>
          <div className='text-2xl font-bold'>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: budget?.currency || 'USD',
            }).format(budget?.totalAmount || 0)}
          </div>
        </Card>
        <Card className='p-6'>
          <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <h3 className='text-sm font-medium'>Spent Amount</h3>
          </div>
          <div className='text-2xl font-bold'>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: budget?.currency || 'USD',
            }).format(budget?.spentAmount || 0)}
          </div>
          <p className='text-xs text-muted-foreground'>
            {percentSpent.toFixed(1)}% of budget
          </p>
        </Card>
        <Card className='p-6'>
          <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <h3 className='text-sm font-medium'>Remaining</h3>
          </div>
          <div className='text-2xl font-bold'>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: budget?.currency || 'USD',
            }).format(remaining)}
          </div>
        </Card>
      </div>

      <Card className='p-6'>
        <div className='mb-4'>
          <h3 className='text-lg font-semibold'>Invoices</h3>
        </div>
        <div className='relative w-full overflow-auto'>
          <table className='w-full caption-bottom text-sm'>
            <thead className='[&_tr]:border-b'>
              <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>
                  Invoice #
                </th>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>
                  Amount
                </th>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>
                  Status
                </th>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>
                  Due Date
                </th>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>
                  Paid Date
                </th>
                <th className='h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='[&_tr:last-child]:border-0'>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'
                >
                  <td className='p-4 align-middle font-medium'>
                    {invoice.invoiceNumber}
                  </td>
                  <td className='p-4 align-middle'>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: invoice.currency,
                    }).format(invoice.amount)}
                  </td>
                  <td className='p-4 align-middle'>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        invoice.status === 'PAID'
                          ? 'border-transparent bg-green-500 text-white shadow hover:bg-green-600'
                          : invoice.status === 'OVERDUE'
                          ? 'border-transparent bg-red-500 text-white shadow hover:bg-red-600'
                          : 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className='p-4 align-middle'>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td className='p-4 align-middle'>
                    {invoice.paidDate
                      ? new Date(invoice.paidDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className='p-4 align-middle text-right'>
                    <select
                      value={invoice.status}
                      onChange={(e) =>
                        handleUpdateInvoiceStatus(
                          invoice.id,
                          e.target.value as InvoiceStatus
                        )
                      }
                      className='h-9 w-[130px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      <option value='DRAFT'>Draft</option>
                      <option value='SENT'>Sent</option>
                      <option value='PAID'>Paid</option>
                      <option value='OVERDUE'>Overdue</option>
                      <option value='CANCELLED'>Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className='p-4 text-center text-muted-foreground'
                  >
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
