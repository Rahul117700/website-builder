# Replace with your actual Razorpay credentials
$KEY_ID = "YOUR_KEY_ID_HERE"
$KEY_SECRET = "YOUR_KEY_SECRET_HERE"

# Create base64 encoded credentials
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${KEY_ID}:${KEY_SECRET}"))

Write-Host "🔍 Fetching Razorpay Account ID using PowerShell..." -ForegroundColor Green

# Method 1: Try Account API
Write-Host "📡 Trying Account API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.razorpay.com/v1/accounts" -Method Get -Headers @{
        "Authorization" = "Basic $credentials"
        "Content-Type" = "application/json"
    }
    Write-Host "✅ Account API Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Account API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📡 Trying Orders API..." -ForegroundColor Yellow
# Method 2: Try Orders API
try {
    $response = Invoke-RestMethod -Uri "https://api.razorpay.com/v1/orders?count=1" -Method Get -Headers @{
        "Authorization" = "Basic $credentials"
        "Content-Type" = "application/json"
    }
    Write-Host "✅ Orders API Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Orders API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📡 Trying Payments API..." -ForegroundColor Yellow
# Method 3: Try Payments API
try {
    $response = Invoke-RestMethod -Uri "https://api.razorpay.com/v1/payments?count=1" -Method Get -Headers @{
        "Authorization" = "Basic $credentials"
        "Content-Type" = "application/json"
    }
    Write-Host "✅ Payments API Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Payments API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n💡 Look for 'account_id' or 'id' fields in the responses above!" -ForegroundColor Cyan
Write-Host "💡 Account ID usually starts with 'acc_' followed by alphanumeric characters." -ForegroundColor Cyan
