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
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
                ← Back
              </Link>
              <h1 className="text-3xl font-bold text-black">Budget Management</h1>
              <p className="text-gray-600 mt-1">Weekly budget allocation tracking</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-black hover:bg-gray-800 text-white">+ New Budget</Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Create New Budget</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    This will mark the current budget as completed and create a new active budget.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateBudget} className="space-y-4">
                  <div>
                    <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">Amount (₱)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="1000"
                      className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Notes (optional)</Label>
                    <Input
                      id="notes"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Weekly allocation for Nov 1"
                      className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      className="flex-1 border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating} className="flex-1 bg-black hover:bg-gray-800 text-white">
                      {creating ? 'Creating...' : 'Create Budget'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
            <p className="text-gray-600">Loading budgets...</p>
          </div>
        ) : budgets.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">No budgets created yet</p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-black hover:bg-gray-800 text-white">
                Create First Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {budgets.map((budget) => (
              <Card key={budget.id} className="border border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">Budget #{budget.id}</CardTitle>
                      <CardDescription className="text-gray-600">
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
                        className="text-red-600 hover:bg-red-50"
                      >
                        {deletingId === budget.id ? '...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {budget.notes && (
                    <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded border border-gray-200">{budget.notes}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Allocated</p>
                      <p className="text-2xl font-bold text-black">₱{budget.amount.toFixed(2)}</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Spent</p>
                      <p className="text-2xl font-bold text-black">₱{budget.spent.toFixed(2)}</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Remaining</p>
                      <p className={`text-2xl font-bold ${budget.remaining < 0 ? 'text-red-600' : 'text-black'}`}>
                        ₱{budget.remaining.toFixed(2)}
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Orders</p>
                      <p className="text-2xl font-bold text-black">{budget.orderCount}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">Budget Usage</span>
                      <span className={`font-bold ${getPercentageColor(budget.percentage)}`}>
                        {budget.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
                      <div
                        className={`h-full transition-all ${
                          budget.percentage >= 90 ? 'bg-red-600' :
                          budget.percentage >= 75 ? 'bg-yellow-500' :
                          'bg-gray-900'
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
