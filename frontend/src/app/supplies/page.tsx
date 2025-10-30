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
import { suppliesAPI } from '@/lib/api';

interface Supply {
  id: number;
  type: string;
  lastRefill: string;
  nextRefillDue: string;
  daysUntilDue: number;
  status: string;
  message: string;
}

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSupplies();
  }, []);

  const loadSupplies = async () => {
    try {
      setLoading(true);
      const response = await suppliesAPI.getAll();
      setSupplies(response.supplies);
    } catch (err: any) {
      setError(err.message || 'Failed to load supplies');
    } finally {
      setLoading(false);
    }
  };

  const handleRefill = async (id: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await suppliesAPI.refill(id, today);
      loadSupplies();
    } catch (err: any) {
      alert(err.message || 'Failed to refill supply');
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

  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-gray-800 bg-black">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-sm text-gray-400 hover:text-white mb-2 inline-block">
                ← Back
              </Link>
              <h1 className="text-3xl font-bold text-white">Supply Management</h1>
              <p className="text-gray-400 mt-1">Track sauce and seasoning refill schedules</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-950 border-red-800">
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading supplies...</p>
          </div>
        ) : supplies.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-700 bg-gray-900">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 mb-4">No supplies tracked yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supplies.map((supply) => (
              <Card key={supply.id} className={`border-2 ${
                supply.status === 'overdue' ? 'border-red-800 bg-red-950' :
                supply.status === 'due_soon' ? 'border-yellow-800 bg-yellow-950' :
                'border-gray-800 bg-black'
              }`}>
                <CardHeader className="border-b border-gray-800">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl capitalize text-white">{supply.type}</CardTitle>
                    <Badge className={
                      supply.status === 'overdue' ? 'bg-red-600 text-white' :
                      supply.status === 'due_soon' ? 'bg-yellow-500 text-white' :
                      'bg-green-600 text-white'
                    }>
                      {supply.status === 'overdue' ? 'Overdue' :
                       supply.status === 'due_soon' ? 'Due Soon' :
                       'On Track'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p className={`text-sm ${
                      supply.status === 'overdue' ? 'text-red-300' :
                      supply.status === 'due_soon' ? 'text-yellow-300' :
                      'text-gray-400'
                    }`}>
                      {supply.message}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Refill:</span>
                        <span className="text-white">{formatDate(supply.lastRefill)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Next Due:</span>
                        <span className="text-white">{formatDate(supply.nextRefillDue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Days Until Due:</span>
                        <span className={`font-semibold ${
                          supply.daysUntilDue < 0 ? 'text-red-400' :
                          supply.daysUntilDue <= 2 ? 'text-yellow-400' :
                          'text-white'
                        }`}>
                          {supply.daysUntilDue} day{supply.daysUntilDue !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleRefill(supply.id)}
                      className="w-full bg-white hover:bg-gray-200 text-black mt-4"
                    >
                      Mark as Refilled Today
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 border border-gray-800 bg-black">
          <CardHeader className="bg-gray-900 border-b border-gray-800">
            <CardTitle className="text-white">Refill Schedule</CardTitle>
            <CardDescription className="text-gray-400">Automatic tracking intervals</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-gray-900 border border-gray-800 rounded">
                <p className="font-semibold text-white mb-1">Sauce</p>
                <p className="text-gray-400">Refill every 7 days</p>
              </div>
              <div className="p-4 bg-gray-900 border border-gray-800 rounded">
                <p className="font-semibold text-white mb-1">Seasoning</p>
                <p className="text-gray-400">Refill every 14 days</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Supply tracking helps you maintain consistent quality and avoid running out of essential ingredients.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
