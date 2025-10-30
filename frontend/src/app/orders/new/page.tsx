'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ordersAPI, type BagWeight } from '@/lib/api';

interface BagInput {
  id: string;
  weightKg: string;
  bagType: 'full_bag' | 'manual';
}

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Form state
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [pieces, setPieces] = useState('40');
  const [chopCount, setChopCount] = useState('25');
  const [buoCount, setBuoCount] = useState('15');
  const [pricePerKg, setPricePerKg] = useState('150');
  const [bags, setBags] = useState<BagInput[]>([
    { id: '1', weightKg: '', bagType: 'full_bag' },
  ]);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validate individual fields
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'date':
        if (!value) return 'Date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) return 'Cannot select future date';
        return '';
      
      case 'pieces':
        if (!value) return 'Total pieces is required';
        const pcs = parseInt(value);
        if (isNaN(pcs) || pcs <= 0) return 'Must be greater than 0';
        if (pcs > 500) return 'Seems too high, please verify';
        return '';
      
      case 'chopCount':
        if (!value) return 'Chop count is required';
        const chop = parseInt(value);
        if (isNaN(chop) || chop < 0) return 'Cannot be negative';
        const totalPieces = parseInt(pieces) || 0;
        const buo = parseInt(buoCount) || 0;
        if (chop + buo !== totalPieces && totalPieces > 0) {
          return `Chop (${chop}) + Buo (${buo}) must equal Total (${totalPieces})`;
        }
        return '';
      
      case 'buoCount':
        if (!value) return 'Buo count is required';
        const buoVal = parseInt(value);
        if (isNaN(buoVal) || buoVal < 0) return 'Cannot be negative';
        const totalPcs = parseInt(pieces) || 0;
        const chopVal = parseInt(chopCount) || 0;
        if (chopVal + buoVal !== totalPcs && totalPcs > 0) {
          return `Chop (${chopVal}) + Buo (${buoVal}) must equal Total (${totalPcs})`;
        }
        return '';
      
      case 'pricePerKg':
        if (!value) return 'Price per kg is required';
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0) return 'Must be greater than 0';
        if (price < 100) return 'Price seems too low, please verify';
        if (price > 300) return 'Price seems too high, please verify';
        return '';
      
      default:
        return '';
    }
  };

  // Validate bag weight
  const validateBagWeight = (weight: string): string => {
    if (!weight) return 'Weight is required';
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return 'Must be greater than 0';
    if (w < 5) return 'Weight seems too low';
    if (w > 20) return 'Weight seems too high';
    return '';
  };

  // Mark field as touched
  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Update validation errors
  const updateValidationError = (field: string, error: string) => {
    setValidationErrors(prev => {
      if (error) {
        return { ...prev, [field]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
    });
  };

  // Calculations
  const totalKg = bags.reduce((sum, bag) => sum + (parseFloat(bag.weightKg) || 0), 0);
  const chickenCost = totalKg * (parseFloat(pricePerKg) || 0);
  const sauceDaily = 200;
  const seasoningDaily = 200;
  const totalCost = chickenCost + sauceDaily + seasoningDaily;

  // Add bag
  const addBag = () => {
    setBags([...bags, { id: Date.now().toString(), weightKg: '', bagType: 'full_bag' }]);
  };

  // Remove bag
  const removeBag = (id: string) => {
    if (bags.length > 1) {
      setBags(bags.filter(bag => bag.id !== id));
    }
  };

  // Update bag weight
  const updateBagWeight = (id: string, weightKg: string) => {
    setBags(bags.map(bag => bag.id === id ? { ...bag, weightKg } : bag));
    const error = validateBagWeight(weightKg);
    updateValidationError(`bag-${id}`, error);
  };

  // Update bag type
  const updateBagType = (id: string, bagType: 'full_bag' | 'manual') => {
    setBags(bags.map(bag => bag.id === id ? { ...bag, bagType } : bag));
  };

  // Form validation
  const isValid = () => {
    if (!date) return false;
    if (!pieces || parseInt(pieces) <= 0) return false;
    if (!chopCount || parseInt(chopCount) < 0) return false;
    if (!buoCount || parseInt(buoCount) < 0) return false;
    if (parseInt(chopCount) + parseInt(buoCount) !== parseInt(pieces)) return false;
    if (!pricePerKg || parseFloat(pricePerKg) <= 0) return false;
    if (bags.length === 0) return false;
    if (bags.some(bag => !bag.weightKg || parseFloat(bag.weightKg) <= 0)) return false;
    if (Object.keys(validationErrors).length > 0) return false;
    return true;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid()) {
      setError('Please fill in all fields correctly');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        date,
        pieces: parseInt(pieces),
        chopCount: parseInt(chopCount),
        buoCount: parseInt(buoCount),
        pricePerKg: parseFloat(pricePerKg),
        bags: bags.map(bag => ({
          weightKg: parseFloat(bag.weightKg),
          bagType: bag.bagType,
        })),
      };

      const result = await ordersAPI.create(orderData);
      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-gray-800 bg-black">
        <div className="container mx-auto px-6 py-6 max-w-3xl">
          <Link href="/" className="text-sm text-gray-400 hover:text-white mb-2 inline-block">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-white">New Order</h1>
          <p className="text-gray-400 mt-1">Record today's chicken delivery</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <Card className="border border-gray-800 bg-black shadow-sm">
          <CardHeader className="bg-gray-900 border-b border-gray-800">
            <CardTitle className="text-xl text-white">Order Details</CardTitle>
            <CardDescription className="text-gray-400">Fill in all delivery information</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-950 border-red-800">
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-950 border-green-800">
                <AlertDescription className="text-green-300 font-semibold">
                  Order created successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date */}
              <div>
                <Label htmlFor="date" className="text-sm font-semibold text-gray-300">Delivery Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (touched.date) {
                      const error = validateField('date', e.target.value);
                      updateValidationError('date', error);
                    }
                  }}
                  onBlur={() => {
                    markTouched('date');
                    const error = validateField('date', date);
                    updateValidationError('date', error);
                  }}
                  required
                  className={`mt-1 bg-gray-900 border-gray-700 text-white focus:border-white focus:ring-white ${
                    validationErrors.date && touched.date ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.date && touched.date && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.date}</p>
                )}
              </div>

              {/* Pieces */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pieces" className="text-sm font-semibold text-gray-300">Total Pieces</Label>
                  <Input
                    id="pieces"
                    type="number"
                    value={pieces}
                    onChange={(e) => {
                      setPieces(e.target.value);
                      if (touched.pieces) {
                        const error = validateField('pieces', e.target.value);
                        updateValidationError('pieces', error);
                      }
                      // Re-validate chop and buo counts
                      if (touched.chopCount) {
                        const error = validateField('chopCount', chopCount);
                        updateValidationError('chopCount', error);
                      }
                      if (touched.buoCount) {
                        const error = validateField('buoCount', buoCount);
                        updateValidationError('buoCount', error);
                      }
                    }}
                    onBlur={() => {
                      markTouched('pieces');
                      const error = validateField('pieces', pieces);
                      updateValidationError('pieces', error);
                    }}
                    required
                    min="1"
                    className={`mt-1 bg-gray-900 border-gray-700 text-white focus:border-white focus:ring-white ${
                      validationErrors.pieces && touched.pieces ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors.pieces && touched.pieces && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.pieces}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="chopCount" className="text-sm font-semibold text-gray-300">Chop Count</Label>
                  <Input
                    id="chopCount"
                    type="number"
                    value={chopCount}
                    onChange={(e) => {
                      setChopCount(e.target.value);
                      if (touched.chopCount) {
                        const error = validateField('chopCount', e.target.value);
                        updateValidationError('chopCount', error);
                      }
                      // Re-validate buo count
                      if (touched.buoCount) {
                        const error = validateField('buoCount', buoCount);
                        updateValidationError('buoCount', error);
                      }
                    }}
                    onBlur={() => {
                      markTouched('chopCount');
                      const error = validateField('chopCount', chopCount);
                      updateValidationError('chopCount', error);
                    }}
                    required
                    min="0"
                    className={`mt-1 bg-gray-900 border-gray-700 text-white focus:border-white focus:ring-white ${
                      validationErrors.chopCount && touched.chopCount ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors.chopCount && touched.chopCount && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.chopCount}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="buoCount" className="text-sm font-semibold text-gray-300">Buo Count</Label>
                  <Input
                    id="buoCount"
                    type="number"
                    value={buoCount}
                    onChange={(e) => {
                      setBuoCount(e.target.value);
                      if (touched.buoCount) {
                        const error = validateField('buoCount', e.target.value);
                        updateValidationError('buoCount', error);
                      }
                      // Re-validate chop count
                      if (touched.chopCount) {
                        const error = validateField('chopCount', chopCount);
                        updateValidationError('chopCount', error);
                      }
                    }}
                    onBlur={() => {
                      markTouched('buoCount');
                      const error = validateField('buoCount', buoCount);
                      updateValidationError('buoCount', error);
                    }}
                    required
                    min="0"
                    className={`mt-1 bg-gray-900 border-gray-700 text-white focus:border-white focus:ring-white ${
                      validationErrors.buoCount && touched.buoCount ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors.buoCount && touched.buoCount && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.buoCount}</p>
                  )}
                </div>
              </div>

              {/* Price per kg */}
              <div>
                <Label htmlFor="pricePerKg" className="text-sm font-semibold text-gray-300">Price per kg (₱)</Label>
                <Input
                  id="pricePerKg"
                  type="number"
                  step="0.01"
                  value={pricePerKg}
                  onChange={(e) => {
                    setPricePerKg(e.target.value);
                    if (touched.pricePerKg) {
                      const error = validateField('pricePerKg', e.target.value);
                      updateValidationError('pricePerKg', error);
                    }
                  }}
                  onBlur={() => {
                    markTouched('pricePerKg');
                    const error = validateField('pricePerKg', pricePerKg);
                    updateValidationError('pricePerKg', error);
                  }}
                  required
                  min="0"
                  className={`mt-1 bg-gray-900 border-gray-700 text-white focus:border-white focus:ring-white ${
                    validationErrors.pricePerKg && touched.pricePerKg ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.pricePerKg && touched.pricePerKg && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.pricePerKg}</p>
                )}
              </div>

              {/* Bag Weights */}
              <div className="border-t border-gray-800 pt-6">
                <Label className="text-sm font-semibold text-gray-300 mb-3 block">Bag Weights</Label>
                <div className="space-y-3">
                  {bags.map((bag, index) => (
                    <div key={bag.id} className="flex gap-3 items-start p-4 bg-gray-900 rounded-lg border border-gray-800">
                      <div className="flex-1">
                        <Label htmlFor={`bag-${bag.id}`} className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          Bag {index + 1} Weight (kg)
                        </Label>
                        <Input
                          id={`bag-${bag.id}`}
                          type="number"
                          step="0.01"
                          value={bag.weightKg}
                          onChange={(e) => updateBagWeight(bag.id, e.target.value)}
                          onBlur={() => markTouched(`bag-${bag.id}`)}
                          placeholder="13.68"
                          required
                          min="0"
                          className={`mt-1 bg-black border-gray-700 text-white focus:border-white focus:ring-white ${
                            validationErrors[`bag-${bag.id}`] && touched[`bag-${bag.id}`] ? 'border-red-500' : ''
                          }`}
                        />
                        {validationErrors[`bag-${bag.id}`] && touched[`bag-${bag.id}`] && (
                          <p className="text-red-400 text-xs mt-1">{validationErrors[`bag-${bag.id}`]}</p>
                        )}
                      </div>
                      <div className="w-32">
                        <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Type</Label>
                        <Select
                          value={bag.bagType}
                          onValueChange={(value) => updateBagType(bag.id, value as 'full_bag' | 'manual')}
                        >
                          <SelectTrigger className="mt-1 bg-black border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800">
                            <SelectItem value="full_bag">Full Bag</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {bags.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeBag(bag.id)}
                          className="border-gray-700 text-red-400 hover:bg-red-950 mt-6"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBag}
                  className="mt-3 border-gray-700 text-white hover:bg-gray-800"
                >
                  + Add Another Bag
                </Button>
              </div>

              {/* Summary */}
              <div className="bg-white text-black p-6 rounded-lg space-y-3">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Total Weight:</span>
                  <span className="font-semibold">{totalKg.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Chicken Cost:</span>
                  <span className="font-semibold">₱{chickenCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Sauce (daily):</span>
                  <span className="font-semibold">₱{sauceDaily.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Seasoning (daily):</span>
                  <span className="font-semibold">₱{seasoningDaily.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t border-gray-300 pt-3 mt-3">
                  <span>Total Cost:</span>
                  <span>₱{totalCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex gap-3 pt-4">
                <Link href="/" className="flex-1">
                  <Button type="button" variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-800">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-white hover:bg-gray-200 text-black disabled:bg-gray-700 disabled:text-gray-500"
                  disabled={loading || !isValid()}
                >
                  {loading ? 'Saving...' : 'Save Order'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
