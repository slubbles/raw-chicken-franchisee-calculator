'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { healthAPI } from '@/lib/api';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    healthAPI.check()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('error'));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black tracking-tight">
                Calamias Fried Chicken
              </h1>
              <p className="text-gray-600 mt-2">Franchise Reorder Calculator</p>
            </div>
            {backendStatus === 'connected' && (
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                System Online
              </Badge>
            )}
            {backendStatus === 'error' && (
              <Badge className="bg-red-500 text-white hover:bg-red-600">
                System Offline
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* New Order Card */}
          <Link href="/orders/new" className="group">
            <Card className="border-2 border-gray-200 hover:border-black transition-all duration-200 h-full bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-lg font-bold text-xl">
                    +
                  </div>
                  <div className="text-gray-400 group-hover:text-black transition-colors">→</div>
                </div>
                <CardTitle className="text-xl text-black">New Order</CardTitle>
                <CardDescription className="text-gray-600">
                  Record chicken delivery
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Dashboard Card */}
          <Link href="/dashboard" className="group">
            <Card className="border-2 border-gray-200 hover:border-black transition-all duration-200 h-full bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-lg font-bold text-xl">
                    ≡
                  </div>
                  <div className="text-gray-400 group-hover:text-black transition-colors">→</div>
                </div>
                <CardTitle className="text-xl text-black">Dashboard</CardTitle>
                <CardDescription className="text-gray-600">
                  Weekly analytics & alerts
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Budgets Card */}
          <Link href="/budgets" className="group">
            <Card className="border-2 border-gray-200 hover:border-black transition-all duration-200 h-full bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-lg font-bold text-xl">
                    ₱
                  </div>
                  <div className="text-gray-400 group-hover:text-black transition-colors">→</div>
                </div>
                <CardTitle className="text-xl text-black">Budgets</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage weekly budgets
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Orders History Card */}
          <Link href="/orders" className="group">
            <Card className="border-2 border-gray-200 hover:border-black transition-all duration-200 h-full bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-lg font-bold text-xl">
                    ⋮
                  </div>
                  <div className="text-gray-400 group-hover:text-black transition-colors">→</div>
                </div>
                <CardTitle className="text-xl text-black">Order History</CardTitle>
                <CardDescription className="text-gray-600">
                  View all past orders
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded text-sm font-bold">
                  ✓
                </div>
                Easy Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-sm">
              Record deliveries with individual bag weights and automatic cost calculations
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded text-sm font-bold">
                  !
                </div>
                Real-time Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-sm">
              Get notified when budget is exceeded or supplies need refilling
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded text-sm font-bold">
                  ↗
                </div>
                Smart Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-sm">
              Track spending patterns and optimize your weekly reorder budget
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
