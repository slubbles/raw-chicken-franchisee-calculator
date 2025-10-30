#!/bin/bash
# Test script for creating an order

echo "Testing POST /api/orders endpoint..."
echo ""

curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-29",
    "pieces": 40,
    "chopCount": 25,
    "buoCount": 15,
    "pricePerKg": 150,
    "bags": [
      {"weightKg": 13.68, "bagType": "full_bag"},
      {"weightKg": 13.78, "bagType": "full_bag"},
      {"weightKg": 8.9, "bagType": "manual"}
    ]
  }'

echo ""
echo ""
echo "Test completed!"
