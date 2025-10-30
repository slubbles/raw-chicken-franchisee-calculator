'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { budgetsAPI } from '@/lib/api';

interface Budget {
  id: number;
  startDate: string;
  amount: number;
  status: string;
  notes: string | null;
  orderCount: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [amount, setAmount] = useState('25000');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetsAPI.getAll();
      setBudgets(response.budgets);
    } catch (err: any) {
      setError(err.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCreating(true);
      await budgetsAPI.create({
        startDate,
        amount: parseFloat(amount),
        notes: notes || undefined,
      });
      
      setShowCreateDialog(false);
      setNotes('');
      loadBudgets();
    } catch (err: any) {
      setError(err.message || 'Failed to create budget');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number, orderCount: number) => {
    if (orderCount > 0) {
      alert(`Cannot delete budget with ${orderCount} existing order(s). Delete orders first.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      setDeletingId(id);
      await budgetsAPI.delete(id);
      setBudgets(budgets.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete budget');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (budgets.length === 0) {
      alert('No budgets to export');
      return;
    }

    // Prepare CSV headers
    const headers = ['Budget ID', 'Start Date', 'Allocated Amount (₱)', 'Spent (₱)', 'Remaining (₱)', 'Usage %', 'Orders Count', 'Status', 'Notes'];
    
    // Prepare CSV rows
    const rows = budgets.map(budget => [
      budget.id,
      new Date(budget.startDate).toLocaleDateString('en-US'),
      budget.amount.toFixed(2),
      budget.spent.toFixed(2),
      budget.remaining.toFixed(2),
      budget.percentage.toFixed(1),
      budget.orderCount,
      budget.status,
      `"${budget.notes || ''}"`
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `budgets_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600 text-white hover:bg-green-700">Active</Badge>;
      case 'completed':
        return <Badge className="bg-gray-600 text-white hover:bg-gray-700">Completed</Badge>;
      case 'exceeded':
        return <Badge className="bg-red-600 text-white hover:bg-red-700">Exceeded</Badge>;
      default:
        return <Badge className="bg-gray-200 text-gray-700">{status}</Badge>;
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-gray-300';
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-gray-800 bg-black">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-sm text-gray-400 hover:text-white mb-2 inline-block">
                ← Back
              </Link>
              <h1 className="text-3xl font-bold text-white">Budget Management</h1>
              <p className="text-gray-400 mt-1">Weekly budget allocation tracking</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleExportCSV} 
                variant="outline" 
                className="border-gray-700 text-white hover:bg-gray-800"
                disabled={budgets.length === 0}
              >
                Export CSV
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-white hover:bg-gray-200 text-black">+ New Budget</Button>
                </DialogTrigger>
                <DialogContent className="bg-black border border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Create New Budget</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      This will mark the current budget as completed and create a new active budget.
                    </DialogDescription>
                  </DialogHeader>
                <form onSubmit={handleCreateBudget} className="space-y-4">
                  <div>
                    <Label htmlFor="startDate" className="text-sm font-semibold text-gray-300">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="mt-1 border-gray-700 bg-gray-900 text-white focus:border-white focus:ring-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount" className="text-sm font-semibold text-gray-300">Amount (₱)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="1000"
                      className="mt-1 border-gray-700 bg-gray-900 text-white focus:border-white focus:ring-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-300">Notes (optional)</Label>
                    <Input
                      id="notes"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Weekly allocation for Nov 1"
                      className="mt-1 border-gray-700 bg-gray-900 text-white focus:border-white focus:ring-white placeholder:text-gray-600"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-900"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating} className="flex-1 bg-white hover:bg-gray-200 text-black">
                      {creating ? 'Creating...' : 'Create Budget'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading budgets...</p>
          </div>
        ) : budgets.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-700 bg-gray-900">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 mb-4">No budgets created yet</p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-white hover:bg-gray-200 text-black">
                Create First Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {budgets.map((budget) => (
              <Card key={budget.id} className="border border-gray-800 bg-black">
                <CardHeader className="bg-gray-900 border-b border-gray-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-white">Budget #{budget.id}</CardTitle>
                      <CardDescription className="text-gray-400">
                        Started {formatDate(budget.startDate)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 items-center">
                      {getStatusBadge(budget.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(budget.id, budget.orderCount)}
                        disabled={deletingId === budget.id}
                        className="text-red-400 hover:bg-red-950"
                      >
                        {deletingId === budget.id ? '...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {budget.notes && (
                    <p className="text-sm text-gray-400 mb-4 bg-gray-900 p-3 rounded border border-gray-800">{budget.notes}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="border border-gray-800 rounded-lg p-4 bg-gray-900">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Allocated</p>
                      <p className="text-2xl font-bold text-white">₱{budget.amount.toFixed(2)}</p>
                    </div>
                    <div className="border border-gray-800 rounded-lg p-4 bg-gray-900">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Spent</p>
                      <p className="text-2xl font-bold text-white">₱{budget.spent.toFixed(2)}</p>
                    </div>
                    <div className="border border-gray-800 rounded-lg p-4 bg-gray-900">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Remaining</p>
                      <p className={`text-2xl font-bold ${budget.remaining < 0 ? 'text-red-400' : 'text-white'}`}>
                        ₱{budget.remaining.toFixed(2)}
                      </p>
                    </div>
                    <div className="border border-gray-800 rounded-lg p-4 bg-gray-900">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Orders</p>
                      <p className="text-2xl font-bold text-white">{budget.orderCount}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300 font-medium">Budget Usage</span>
                      <span className={`font-bold ${getPercentageColor(budget.percentage)}`}>
                        {budget.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700">
                      <div
                        className={`h-full transition-all ${
                          budget.percentage >= 90 ? 'bg-red-500' :
                          budget.percentage >= 75 ? 'bg-yellow-500' :
                          'bg-white'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
