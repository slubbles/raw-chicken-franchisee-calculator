'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { healthAPI } from '@/lib/api';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    healthAPI.check()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('error'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">�� Franchise Reorder Calculator</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your chicken orders, budgets, and supplies in one place
          </p>
        </div>

        {backendStatus === 'error' && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              ⚠️ Cannot connect to backend server. Make sure it is running on port 3001.
            </AlertDescription>
          </Alert>
        )}

        {backendStatus === 'connected' && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              ✅ Backend connected successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📦 New Order</CardTitle>
              <CardDescription>Record chicken delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/orders/new">
                <Button className="w-full">Add Order</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Dashboard</CardTitle>
              <CardDescription>View weekly summary</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">View Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💰 Budgets</CardTitle>
              <CardDescription>Manage budgets</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/budgets">
                <Button variant="outline" className="w-full">Manage Budgets</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
