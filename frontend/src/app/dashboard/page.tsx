'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { dashboardAPI, suppliesAPI, ordersAPI } from '@/lib/api';

interface DashboardData {
  week: {
    start: string;
    end: string;
  };
  budget: {
    id: number;
    allocated: number;
    spent: number;
    remaining: number;
    percentage: number;
  } | null;
  weekly: {
    orderCount: number;
    totalKg: number;
    totalCost: number;
  };
  dailyBreakdown: Array<{
    date: string;
    orders: number;
    totalKg: number;
    totalCost: number;
    exceeded: boolean;
  }>;
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
}

interface Supply {
  id: number;
  type: string;
  lastRefill: string;
  nextRefillDue: string;
  daysUntilDue: number;
  status: string;
  message: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadDashboardData();
    loadSupplies();
    loadRecentOrders();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getWeekly();
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadSupplies = async () => {
    try {
      const response = await suppliesAPI.getAll();
      setSupplies(response.supplies);
    } catch (err: any) {
      console.error('Failed to load supplies:', err);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setRecentOrders(response.orders.slice(0, 5)); // Get last 5 orders
    } catch (err: any) {
      console.error('Failed to load recent orders:', err);
    }
  };

  const handleRefillSupply = async (id: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await suppliesAPI.refill(id, today);
      loadSupplies();
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to refill supply');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      setDeletingId(id);
      await ordersAPI.delete(id);
      setRecentOrders(recentOrders.filter(o => o.id !== id));
      loadDashboardData(); // Refresh dashboard stats
    } catch (err: any) {
      alert(err.message || 'Failed to delete order');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-8">
          <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{error || 'Failed to load dashboard'}</AlertDescription>
          </Alert>
          <Link href="/">
            <Button className="bg-black hover:bg-gray-800 text-white">← Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
                ← Back
              </Link>
              <h1 className="text-3xl font-bold text-black">Weekly Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {formatDate(data.week.start)} - {formatDate(data.week.end)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">

        {/* Alerts */}
        {data.alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {data.alerts.map((alert, index) => (
              <Alert
                key={index}
                variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                className={
                  alert.severity === 'critical' 
                    ? 'bg-red-50 border-red-300' 
                    : 'bg-yellow-50 border-yellow-300'
                }
              >
                <AlertDescription className={
                  alert.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                }>
                  <span className="font-semibold">
                    {alert.severity === 'critical' ? 'Critical: ' : 'Warning: '}
                  </span>
                  {alert.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Budget Overview */}
        {data.budget ? (
          <Card className="mb-6 border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-xl">Budget Overview</CardTitle>
              <CardDescription className="text-gray-600">Current period budget status</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Allocated</p>
                  <p className="text-2xl font-bold text-black">₱{data.budget.allocated.toFixed(2)}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Spent</p>
                  <p className="text-2xl font-bold text-black">₱{data.budget.spent.toFixed(2)}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Remaining</p>
                  <p className={`text-2xl font-bold ${
                    data.budget.remaining < 0 ? 'text-red-600' : 'text-black'
                  }`}>
                    ₱{data.budget.remaining.toFixed(2)}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Usage</p>
                  <p className={`text-2xl font-bold ${
                    data.budget.percentage >= 90 ? 'text-red-600' :
                    data.budget.percentage >= 75 ? 'text-yellow-600' :
                    'text-black'
                  }`}>
                    {data.budget.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">Budget Progress</span>
                  <span className={`font-bold ${
                    data.budget.percentage >= 90 ? 'text-red-600' :
                    data.budget.percentage >= 75 ? 'text-yellow-600' :
                    'text-black'
                  }`}>
                    {data.budget.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
                  <div
                    className={`h-full transition-all ${
                      data.budget.percentage >= 90 ? 'bg-red-600' :
                      data.budget.percentage >= 75 ? 'bg-yellow-500' :
                      'bg-gray-900'
                    }`}
                    style={{ width: `${Math.min(data.budget.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert className="mb-6 border-2 border-dashed border-gray-300 bg-gray-50">
            <AlertDescription className="text-gray-700">
              No active budget. <Link href="/budgets" className="underline font-semibold text-black">Create one now</Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Weekly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg">Orders This Week</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-4xl font-bold text-black">{data.weekly.orderCount}</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg">Total Weight</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-4xl font-bold text-black">{data.weekly.totalKg.toFixed(2)} <span className="text-2xl text-gray-600">kg</span></p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg">Total Cost</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-4xl font-bold text-black">₱{data.weekly.totalCost.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Breakdown */}
        <Card className="mb-6 border border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl">Daily Breakdown</CardTitle>
            <CardDescription className="text-gray-600">Orders by day this week</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {data.dailyBreakdown.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No orders recorded this week</p>
            ) : (
              <div className="space-y-2">
                {data.dailyBreakdown.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="w-20">
                        <p className="font-bold text-black">{getDayName(day.date)}</p>
                        <p className="text-xs text-gray-600">{formatDate(day.date)}</p>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <span className="text-gray-700">{day.orders} order(s)</span>
                        <span className="text-gray-700">{day.totalKg.toFixed(2)} kg</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-black">₱{day.totalCost.toFixed(2)}</span>
                      {day.exceeded && (
                        <Badge className="bg-red-500 text-white">Over Budget</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supplies */}
        <Card className="mb-6 border border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl">Supply Status</CardTitle>
            <CardDescription className="text-gray-600">Sauce & seasoning tracking</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {supplies.length === 0 ? (
              <p className="text-center text-gray-600 py-4">
                No supplies tracked yet
              </p>
            ) : (
              <div className="space-y-3">
                {supplies.map((supply) => (
                  <div key={supply.id} className={`p-4 rounded border-2 ${
                    supply.status === 'overdue' ? 'bg-red-50 border-red-300' :
                    supply.status === 'due_soon' ? 'bg-yellow-50 border-yellow-300' :
                    'bg-white border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg capitalize text-black">{supply.type}</h3>
                        <p className={`text-sm mt-1 ${
                          supply.status === 'overdue' ? 'text-red-700' :
                          supply.status === 'due_soon' ? 'text-yellow-700' :
                          'text-gray-600'
                        }`}>{supply.message}</p>
                      </div>
                      <Badge className={
                        supply.status === 'overdue' ? 'bg-red-600 text-white' :
                        supply.status === 'due_soon' ? 'bg-yellow-500 text-white' :
                        'bg-gray-600 text-white'
                      }>
                        {supply.status === 'overdue' ? 'Overdue' :
                         supply.status === 'due_soon' ? 'Due Soon' :
                         'On Track'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-600">
                        Last refill: {formatDate(supply.lastRefill)}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleRefillSupply(supply.id)}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        Mark as Refilled
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Recent Orders</CardTitle>
                <CardDescription className="text-gray-600">Last 5 orders</CardDescription>
              </div>
              <Link href="/orders">
                <Button variant="outline" size="sm" className="border-gray-300">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-600 py-4">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-black">{formatDate(order.date)}</p>
                        <p className="text-sm text-gray-600">{order.pieces} pieces • {order.totalKg.toFixed(2)} kg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-black">₱{order.totalCost.toFixed(2)}</span>
                      {order.exceeded && (
                        <Badge className="bg-red-500 text-white">Over Budget</Badge>
                      )}
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="border-gray-300">View</Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={deletingId === order.id}
                        className="border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        {deletingId === order.id ? '...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
