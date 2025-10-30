'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PrintButton } from '@/components/ui/print-button';
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
  
  // Filter and search state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'date' | 'pieces' | 'totalKg' | 'totalCost'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

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

  // Filter, search, and sort orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Apply date filter
    result = result.filter(order => {
      const orderDate = new Date(order.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && orderDate < start) return false;
      if (end && orderDate > end) return false;
      return true;
    });

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => {
        const searchableText = [
          order.id.toString(),
          order.date,
          order.pieces.toString(),
          order.totalKg.toFixed(2),
          order.totalCost.toFixed(2),
          formatDate(order.date),
        ].join(' ').toLowerCase();
        
        return searchableText.includes(query);
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [orders, startDate, endDate, searchQuery, sortField, sortDirection]);

  const handleExportCSV = () => {
    const ordersToExport = filteredOrders.length > 0 ? filteredOrders : orders;
    
    if (ordersToExport.length === 0) {
      alert('No orders to export');
      return;
    }

    // Prepare CSV headers
    const headers = ['Order ID', 'Date', 'Total Pieces', 'Chop Count', 'Buo Count', 'Total Weight (kg)', 'Total Cost (₱)', 'Status'];
    
    // Prepare CSV rows
    const rows = ordersToExport.map(order => [
      order.id,
      new Date(order.date).toLocaleDateString('en-US'),
      order.pieces,
      order.chopCount,
      order.buoCount,
      order.totalKg.toFixed(2),
      order.totalCost.toFixed(2),
      order.exceeded ? 'Over Budget' : 'Within Budget'
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
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = (id: number) => {
    setOrderToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      setDeletingId(orderToDelete);
      await ordersAPI.delete(orderToDelete);
      setOrders(orders.filter(o => o.id !== orderToDelete));
      setShowDeleteDialog(false);
    } catch (err: any) {
      alert(err.message || 'Failed to delete order');
    } finally {
      setDeletingId(null);
      setOrderToDelete(null);
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

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-600">⇅</span>;
    }
    return sortDirection === 'asc' ? <span className="text-white">↑</span> : <span className="text-white">↓</span>;
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
              <h1 className="text-3xl font-bold text-white">Order History</h1>
              <p className="text-gray-400 mt-1">All chicken delivery records</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <PrintButton title="Print Orders" />
              <Button 
                onClick={handleExportCSV} 
                variant="outline" 
                className="border-gray-700 text-white hover:bg-gray-800"
                disabled={orders.length === 0}
              >
                Export CSV
              </Button>
              <Link href="/orders/new">
                <Button className="bg-white hover:bg-gray-200 text-black">+ New Order</Button>
              </Link>
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

        {/* Filter and Search */}
        <Card className="mb-6 border border-gray-800 bg-black">
          <CardHeader className="bg-gray-900 border-b border-gray-800">
            <CardTitle className="text-lg text-white">Search & Filter Orders</CardTitle>
            <CardDescription className="text-gray-400">Search and filter by date range</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Search Bar */}
            <div>
              <Label htmlFor="search" className="text-sm text-gray-300">Search Orders</Label>
              <div className="relative mt-1">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by ID, date, pieces, weight, cost..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="startDate" className="text-sm text-gray-300">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm text-gray-300">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div>
                <Button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSearchQuery('');
                  }}
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                  disabled={!startDate && !endDate && !searchQuery}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
            {(startDate || endDate) && (
              <p className="text-sm text-gray-400 mt-3">
                Showing {filteredOrders.length} of {orders.length} order(s)
              </p>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-4">
            <Card className="border border-gray-800 bg-black">
              <CardHeader className="bg-gray-900">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-gray-800 rounded">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-700 bg-gray-900">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 mb-4">No orders recorded yet</p>
              <Link href="/orders/new">
                <Button className="bg-white hover:bg-gray-200 text-black">Create First Order</Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-700 bg-gray-900">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 mb-4">No orders found for the selected date range</p>
              <Button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-900">
              <h2 className="font-semibold text-white">All Orders ({filteredOrders.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900">
                    <th 
                      className="text-left py-3 px-6 text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-800 select-none"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center gap-2">
                        Date <SortIcon field="date" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-6 text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-800 select-none"
                      onClick={() => toggleSort('pieces')}
                    >
                      <div className="flex items-center gap-2">
                        Pieces <SortIcon field="pieces" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-300">Chop / Buo</th>
                    <th 
                      className="text-right py-3 px-6 text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-800 select-none"
                      onClick={() => toggleSort('totalKg')}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Weight (kg) <SortIcon field="totalKg" />
                      </div>
                    </th>
                    <th 
                      className="text-right py-3 px-6 text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-800 select-none"
                      onClick={() => toggleSort('totalCost')}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Cost <SortIcon field="totalCost" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-300">Status</th>
                    <th className="text-right py-3 px-6 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-black">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-900 hover:bg-gray-900 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-300">{formatDate(order.date)}</td>
                      <td className="py-4 px-6 font-medium text-white">{order.pieces}</td>
                      <td className="py-4 px-6 text-sm text-gray-400">
                        {order.chopCount} / {order.buoCount}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-white">
                        {order.totalKg.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-white">
                        ₱{order.totalCost.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        {order.exceeded ? (
                          <Badge className="bg-red-500 text-white hover:bg-red-600">Over Budget</Badge>
                        ) : (
                          <Badge className="bg-gray-700 text-gray-300 hover:bg-gray-600">Within Budget</Badge>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-900 text-gray-300">
                              View
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(order.id)}
                            disabled={deletingId === order.id}
                            className="border-gray-700 text-red-400 hover:bg-red-950 hover:border-red-700"
                          >
                            {deletingId === order.id ? '...' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-900 border-t-2 border-gray-700">
                    <td className="py-4 px-6 font-bold text-white" colSpan={3}>Total</td>
                    <td className="py-4 px-6 text-right font-bold text-white">
                      {filteredOrders.reduce((sum, o) => sum + o.totalKg, 0).toFixed(2)} kg
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-white">
                      ₱{filteredOrders.reduce((sum, o) => sum + o.totalCost, 0).toFixed(2)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteConfirm}
          title="Delete Order"
          description="Are you sure you want to delete this order? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
          loading={deletingId === orderToDelete}
        />
      </div>
    </div>
  );
}
