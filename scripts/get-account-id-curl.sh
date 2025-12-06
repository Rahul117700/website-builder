#!/bin/bash

# Script to get Razorpay Account ID using curl
# Replace YOUR_KEY_ID and YOUR_KEY_SECRET with your actual credentials

KEY_ID="YOUR_KEY_ID"
KEY_SECRET="YOUR_KEY_SECRET"

echo "🔍 Fetching Razorpay Account ID..."
echo ""

# Create base64 encoded credentials
CREDENTIALS=$(echo -n "${KEY_ID}:${KEY_SECRET}" | base64)

# Try to get account details
echo "📡 Making API call to Razorpay..."
curl -X GET "https://api.razorpay.com/v1/account" \
  -H "Authorization: Basic $CREDENTIALS" \
  -H "Content-Type: application/json" \
  -s | jq '.'

echo ""
echo "💡 If you see an 'id' field above, that's your Account ID!"
echo "📝 It should start with 'acc_'"