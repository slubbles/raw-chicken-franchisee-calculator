'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ordersAPI } from '@/lib/api';

interface Order {
  id: number;
  date: string;
  pieces: number;
  chopCount: number;
  buoCount: number;
  totalKg: number;
  totalCost: number;
  exceeded: boolean;
  bagCount: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      setOrders(response.orders);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await ordersAPI.delete(id);
      setOrders(orders.filter(o => o.id !== id));
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
      day: 'numeric', 
      year: 'numeric' 
    });
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
              <h1 className="text-3xl font-bold text-black">Order History</h1>
              <p className="text-gray-600 mt-1">All chicken delivery records</p>
            </div>
            <Link href="/orders/new">
              <Button className="bg-black hover:bg-gray-800 text-white">+ New Order</Button>
            </Link>
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
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">No orders recorded yet</p>
              <Link href="/orders/new">
                <Button className="bg-black hover:bg-gray-800 text-white">Create First Order</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-black">All Orders ({orders.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Pieces</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Chop / Buo</th>
                    <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Weight (kg)</th>
                    <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Cost</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm">{formatDate(order.date)}</td>
                      <td className="py-4 px-6 font-medium">{order.pieces}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {order.chopCount} / {order.buoCount}
                      </td>
                      <td className="py-4 px-6 text-right font-medium">
                        {order.totalKg.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold">
                        ₱{order.totalCost.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        {order.exceeded ? (
                          <Badge className="bg-red-500 text-white hover:bg-red-600">Over Budget</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">Within Budget</Badge>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-100">
                              View
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(order.id)}
                            disabled={deletingId === order.id}
                            className="border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            {deletingId === order.id ? '...' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-300">
                    <td className="py-4 px-6 font-bold" colSpan={3}>Total</td>
                    <td className="py-4 px-6 text-right font-bold">
                      {orders.reduce((sum, o) => sum + o.totalKg, 0).toFixed(2)} kg
                    </td>
                    <td className="py-4 px-6 text-right font-bold">
                      ₱{orders.reduce((sum, o) => sum + o.totalCost, 0).toFixed(2)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
