'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { healthAPI, budgetsAPI } from '@/lib/api';

interface ActiveBudget {
  id: number;
  percentage: number;
  remaining: number;
  amount: number;
  spent: number;
}

export default function Home() {
  const router = useRouter();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [activeBudget, setActiveBudget] = useState<ActiveBudget | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(true);

  useEffect(() => {
    checkBackend();
    loadActiveBudget();
  }, []);

  const checkBackend = async () => {
    try {
      await healthAPI.check();
      setBackendStatus('connected');
    } catch {
      setBackendStatus('error');
    }
  };

  const loadActiveBudget = async () => {
    try {
      setLoadingBudget(true);
      const response = await budgetsAPI.getAll();
      const active = response.budgets.find((b: any) => b.status === 'active');
      if (active) {
        setActiveBudget({
          id: active.id,
          percentage: active.percentage,
          remaining: active.remaining,
          amount: active.amount,
          spent: active.spent
        });
      }
    } catch (err) {
      console.error('Failed to load budget:', err);
    } finally {
      setLoadingBudget(false);
    }
  };

  const getBudgetAlert = () => {
    if (!activeBudget) return null;

    if (activeBudget.percentage >= 100) {
      return {
        variant: 'destructive' as const,
        title: 'Budget Exceeded',
        message: `You have exceeded your budget by ₱${Math.abs(activeBudget.remaining).toFixed(2)}. Consider adjusting spending or creating a new budget.`,
        className: 'bg-red-950 border-red-800'
      };
    }

    if (activeBudget.percentage >= 90) {
      return {
        variant: 'destructive' as const,
        title: 'Budget Critical',
        message: `Only ${(100 - activeBudget.percentage).toFixed(1)}% remaining (₱${activeBudget.remaining.toFixed(2)}). You're approaching your budget limit.`,
        className: 'bg-red-950 border-red-800'
      };
    }

    if (activeBudget.percentage >= 75) {
      return {
        variant: 'default' as const,
        title: 'Budget Warning',
        message: `${(100 - activeBudget.percentage).toFixed(1)}% remaining (₱${activeBudget.remaining.toFixed(2)}). Monitor your spending carefully.`,
        className: 'bg-yellow-950 border-yellow-800'
      };
    }

    return null;
  };

  const budgetAlert = getBudgetAlert();

  // Quick navigation function for buttons
  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-950 to-black">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Calamias Fried Chicken
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Franchise Reorder Calculator</p>
            </div>
            <div className="flex items-center gap-3">
              {backendStatus === 'checking' && (
                <Badge className="bg-gray-700 text-gray-300 hover:bg-gray-700 animate-pulse">
                  <span className="mr-2">●</span> Checking...
                </Badge>
              )}
              {backendStatus === 'connected' && (
                <Badge className="bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20">
                  <span className="mr-2 animate-pulse">●</span> System Online
                </Badge>
              )}
              {backendStatus === 'error' && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20">
                    <span className="mr-2">●</span> System Offline
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={checkBackend}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12"
>
        {/* Budget Alert */}
        {!loadingBudget && budgetAlert && (
          <Alert 
            variant={budgetAlert.variant} 
            className={`mb-6 sm:mb-8 ${budgetAlert.className} animate-in fade-in slide-in-from-top-2 duration-500 shadow-lg`}
          >
            <AlertDescription className={budgetAlert.variant === 'destructive' ? 'text-red-300' : 'text-yellow-300'}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>
                  <span className="font-bold">{budgetAlert.title}:</span> {budgetAlert.message}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateTo('/budgets')}
                  className="border-current text-current hover:bg-white/10 whitespace-nowrap"
                >
                  View Budgets →
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {/* New Order Card */}
          <button
            onClick={() => navigateTo('/orders/new')}
            className="group text-left transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-lg"
          >
            <Card className="border-2 border-gray-800 hover:border-white hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 h-full bg-black cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white text-black flex items-center justify-center rounded-lg font-bold text-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-90">
                    +
                  </div>
                  <div className="text-gray-600 group-hover:text-white transition-all duration-300 group-hover:translate-x-1 text-xl">→</div>
                </div>
                <CardTitle className="text-xl text-white group-hover:text-white transition-colors">New Order</CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Record chicken delivery
                </CardDescription>
              </CardHeader>
            </Card>
          </button>

          {/* Dashboard Card */}
          <button
            onClick={() => navigateTo('/dashboard')}
            className="group text-left transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-lg"
          >
            <Card className="border-2 border-gray-800 hover:border-white hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 h-full bg-black cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white text-black flex items-center justify-center rounded-lg font-bold text-xl transition-all duration-300 group-hover:scale-110">
                    ≡
                  </div>
                  <div className="text-gray-600 group-hover:text-white transition-all duration-300 group-hover:translate-x-1 text-xl">→</div>
                </div>
                <CardTitle className="text-xl text-white group-hover:text-white transition-colors">Dashboard</CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Weekly analytics & alerts
                </CardDescription>
              </CardHeader>
            </Card>
          </button>

          {/* Budgets Card */}
          <button
            onClick={() => navigateTo('/budgets')}
            className="group text-left transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-lg"
          >
            <Card className="border-2 border-gray-800 hover:border-white hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 h-full bg-black cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white text-black flex items-center justify-center rounded-lg font-bold text-xl transition-all duration-300 group-hover:scale-110">
                    ₱
                  </div>
                  <div className="text-gray-600 group-hover:text-white transition-all duration-300 group-hover:translate-x-1 text-xl">→</div>
                </div>
                <CardTitle className="text-xl text-white group-hover:text-white transition-colors">Budgets</CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Manage weekly budgets
                </CardDescription>
              </CardHeader>
            </Card>
          </button>

          {/* Orders History Card */}
          <button
            onClick={() => navigateTo('/orders')}
            className="group text-left transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-lg"
          >
            <Card className="border-2 border-gray-800 hover:border-white hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 h-full bg-black cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white text-black flex items-center justify-center rounded-lg font-bold text-xl transition-all duration-300 group-hover:scale-110">
                    ⋮
                  </div>
                  <div className="text-gray-600 group-hover:text-white transition-all duration-300 group-hover:translate-x-1 text-xl">→</div>
                </div>
                <CardTitle className="text-xl text-white group-hover:text-white transition-colors">Order History</CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  View all past orders
                </CardDescription>
              </CardHeader>
            </Card>
          </button>

          {/* Supplies Card */}
          <button
            onClick={() => navigateTo('/supplies')}
            className="group text-left transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-lg"
          >
            <Card className="border-2 border-gray-800 hover:border-white hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 h-full bg-black cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white text-black flex items-center justify-center rounded-lg font-bold text-xl transition-all duration-300 group-hover:scale-110">
                    🧂
                  </div>
                  <div className="text-gray-600 group-hover:text-white transition-all duration-300 group-hover:translate-x-1 text-xl">→</div>
                </div>
                <CardTitle className="text-xl text-white group-hover:text-white transition-colors">Supplies</CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Track refill schedules
                </CardDescription>
              </CardHeader>
            </Card>
          </button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border border-gray-800 bg-gray-900 hover:bg-gray-850 transition-all duration-300 hover:border-gray-700 group">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3 text-white">
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded text-sm font-bold transition-transform duration-300 group-hover:scale-110">
                  ✓
                </div>
                Easy Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 text-sm">
              Record deliveries with individual bag weights and automatic cost calculations
            </CardContent>
          </Card>

          <Card className="border border-gray-800 bg-gray-900 hover:bg-gray-850 transition-all duration-300 hover:border-gray-700 group">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3 text-white">
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded text-sm font-bold transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                  !
                </div>
                Real-time Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 text-sm">
              Get notified when budget is exceeded or supplies need refilling
            </CardContent>
          </Card>

          <Card className="border border-gray-800 bg-gray-900 hover:bg-gray-850 transition-all duration-300 hover:border-gray-700 group">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3 text-white">
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded text-sm font-bold transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </div>
                Smart Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 text-sm">
              Track spending patterns and optimize your weekly reorder budget
            </CardContent>
          </Card>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-8 sm:mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <p className="text-sm text-gray-500 mb-3 flex items-center justify-center gap-2">
            <span className="text-base">⌨️</span> 
            <span>Keyboard Shortcuts</span>
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors cursor-help" title="Press H to go Home">H</kbd>
              <span className="text-gray-600 text-xs hidden sm:inline">Home</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors cursor-help" title="Press N for New Order">N</kbd>
              <span className="text-gray-600 text-xs hidden sm:inline">New Order</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors cursor-help" title="Press O for Orders">O</kbd>
              <span className="text-gray-600 text-xs hidden sm:inline">Orders</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors cursor-help" title="Press B for Budgets">B</kbd>
              <span className="text-gray-600 text-xs hidden sm:inline">Budgets</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors cursor-help" title="Press D for Dashboard">D</kbd>
              <span className="text-gray-600 text-xs hidden sm:inline">Dashboard</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors cursor-help" title="Press S for Supplies">S</kbd>
              <span className="text-gray-600 text-xs hidden sm:inline">Supplies</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
