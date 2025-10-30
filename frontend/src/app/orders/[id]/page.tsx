'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ordersAPI } from '@/lib/api';

interface OrderDetails {
  id: number;
  date: string;
  pieces: number;
  chopCount: number;
  buoCount: number;
  totalKg: number;
  bags: Array<{
    id: number;
    weightKg: number;
    bagType: string;
  }>;
  cost: {
    pricePerKg: number;
    chickenCost: number;
    sauceDaily: number;
    seasoningDaily: number;
    totalCost: number;
    exceeded: boolean;
    exceededBy: number;
  };
  budget: {
    id: number;
    startDate: string;
    amount: number;
  };
  createdAt: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      loadOrder(parseInt(params.id as string));
    }
  }, [params.id]);

  const loadOrder = async (id: number) => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(id);
      setOrder(response.order);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <Card className="border border-gray-800 bg-black">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">Loading order details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6 bg-red-950 border-red-800">
            <AlertDescription className="text-red-300">{error || 'Order not found'}</AlertDescription>
          </Alert>
          <Link href="/orders">
            <Button className="bg-white hover:bg-gray-200 text-black">← Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/orders" className="text-gray-400 hover:text-white hover:underline">
            ← Back to Orders
          </Link>
          {order.cost.exceeded && (
            <Badge variant="destructive" className="bg-red-500 text-white">Budget Exceeded</Badge>
          )}
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Order #{order.id}</h1>
          <p className="text-gray-400">
            {formatDate(order.date)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Order Info */}
          <Card className="border border-gray-800 bg-black">
            <CardHeader className="bg-gray-900 border-b border-gray-800">
              <CardTitle className="text-white">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Pieces:</span>
                <span className="font-medium text-white">{order.pieces}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chop Count:</span>
                <span className="font-medium text-white">{order.chopCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Buo Count:</span>
                <span className="font-medium text-white">{order.buoCount}</span>
              </div>
              <div className="flex justify-between border-t border-gray-800 pt-3">
                <span className="text-gray-400">Total Weight:</span>
                <span className="font-bold text-white">{order.totalKg.toFixed(2)} kg</span>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="border border-gray-800 bg-black">
            <CardHeader className="bg-gray-900 border-b border-gray-800">
              <CardTitle className="text-white">Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Price per kg:</span>
                <span className="font-medium text-white">₱{order.cost.pricePerKg.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chicken Cost:</span>
                <span className="font-medium text-white">₱{order.cost.chickenCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sauce (daily):</span>
                <span className="font-medium text-white">₱{order.cost.sauceDaily.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Seasoning (daily):</span>
                <span className="font-medium text-white">₱{order.cost.seasoningDaily.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-800 pt-3">
                <span className="font-bold text-white">Total Cost:</span>
                <span className="font-bold text-lg text-white">₱{order.cost.totalCost.toFixed(2)}</span>
              </div>
              {order.cost.exceeded && (
                <Alert variant="destructive" className="bg-red-950 border-red-800">
                  <AlertDescription className="text-red-300">
                    Exceeded budget by ₱{order.cost.exceededBy.toFixed(2)}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bag Weights */}
        <Card className="mb-6 border border-gray-800 bg-black">
          <CardHeader className="bg-gray-900 border-b border-gray-800">
            <CardTitle className="text-white">Bag Weights</CardTitle>
            <CardDescription className="text-gray-400">{order.bags.length} bag(s) total</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {order.bags.map((bag, index) => (
                <div key={bag.id} className="flex justify-between items-center p-3 bg-gray-900 border border-gray-800 rounded">
                  <span className="text-gray-400">
                    Bag {index + 1} ({bag.bagType === 'full_bag' ? 'Full Bag' : 'Manual'})
                  </span>
                  <span className="font-medium text-white">{bag.weightKg.toFixed(2)} kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Info */}
        <Card className="border border-gray-800 bg-black">
          <CardHeader className="bg-gray-900 border-b border-gray-800">
            <CardTitle className="text-white">Budget Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div className="flex justify-between">
              <span className="text-gray-400">Budget ID:</span>
              <span className="font-medium text-white">#{order.budget.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Budget Start Date:</span>
              <span className="font-medium text-white">{formatDate(order.budget.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Budget Amount:</span>
              <span className="font-medium text-white">₱{order.budget.amount.toFixed(2)}</span>
            </div>
            <div className="pt-3">
              <Link href="/budgets">
                <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-800">View Budget Details</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
