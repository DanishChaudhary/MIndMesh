# PhonePe Webhook Setup Guide

## Environment Variables Required

Add these to your `.env` file:

```env
# PhonePe Webhook Authentication
PP_WEBHOOK_USERNAME=webhook_mindmesh
PP_WEBHOOK_PASSWORD=your_strong_webhook_password_here

# Server Base URL (for webhook notifications)
SERVER_BASE_URL=https://your-domain.com
# OR use existing
SITE_BASE_URL=https://BrainMesh-5iap.onrender.com
```

## PhonePe Business Dashboard Configuration

1. **Login to PhonePe Business Dashboard**
   - Go to [PhonePe Business Portal](https://business.phonepe.com/)
   - Navigate to **Developer Settings** → **Webhooks**

2. **Configure Webhook URL**
   ```
   Webhook URL: https://your-domain.com/api/webhook/phonepe
   Authentication: SHA256 Hash
   Username: webhook_mindmesh
   Password: [your_strong_webhook_password_here]
   ```

3. **Enable Events**
   - ✅ `checkout.order.completed` (Payment Success)
   - ✅ `checkout.order.failed` (Payment Failed)
   - ✅ `pg.refund.completed` (Refund Success)
   - ✅ `pg.refund.failed` (Refund Failed)

## Webhook Authentication

The webhook uses SHA256 hash authentication:
- **Format**: `SHA256(username:password)`
- **Header**: `Authorization: SHA256 <hash>`
- **Example**: If username=`webhook_mindmesh` and password=`mypass123`, then:
  ```
  Authorization: SHA256 a1b2c3d4e5f6...
  ```

## Testing Webhooks

### Local Development (with ngrok)
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 5000

# Use ngrok URL in PhonePe dashboard
# Example: https://abc123.ngrok.io/api/webhook/phonepe
```

### Production
- Use your live domain: `https://brainmesh.in/api/webhook/phonepe`
- Ensure HTTPS is enabled
- Test with small amounts first

## Webhook Events Handled

| Event Type | Description | Action |
|------------|-------------|---------|
| `checkout.order.completed` | Payment successful | Activate subscription, update user |
| `checkout.order.failed` | Payment failed | Mark order as failed |
| `pg.refund.completed` | Refund processed | Update order status, handle subscription |
| `pg.refund.failed` | Refund failed | Log failure |

## Security Features

- ✅ **SHA256 Authentication**: Prevents unauthorized webhook calls
- ✅ **Idempotency**: Prevents duplicate event processing
- ✅ **Raw Body Capture**: For HMAC verification if needed
- ✅ **Event Tracking**: All webhook events logged in database

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check username/password in `.env`
   - Verify SHA256 hash calculation
   - Ensure PhonePe dashboard has correct credentials

2. **404 Not Found**
   - Verify webhook URL is correct
   - Check server is running and accessible
   - Test endpoint manually: `POST /api/webhook/phonepe`

3. **Webhook Not Triggered**
   - Verify PhonePe dashboard webhook configuration
   - Check webhook URL is publicly accessible
   - Ensure events are enabled in dashboard

### Testing Webhook Locally

```bash
# Test webhook endpoint
curl -X POST http://localhost:5000/api/webhook/phonepe \
  -H "Content-Type: application/json" \
  -H "Authorization: SHA256 your_calculated_hash" \
  -d '{"event":"checkout.order.completed","data":{"transactionId":"test123"}}'
```

## Subscription Logic

When payment succeeds:
1. **Find Order**: Locate order by `merchantTransactionId`
2. **Calculate Days**: Based on amount paid (₹19=7days, ₹129=90days, etc.)
3. **Add to Existing**: If user has active subscription, add days to current expiry
4. **Activate Features**: All features unlock with any active subscription
5. **Track History**: Store purchase in user's `purchaseHistory`

## Monitoring

Check webhook processing in server logs:
```bash
# Success
📨 PhonePe Webhook: checkout.order.completed for transaction: plan_123456
💰 Processing payment success for order: plan_123456
✅ Subscription updated for user user@example.com: 97 days, expires 2024-12-01

# Failure
❌ Processing payment failure for order: plan_123456
💔 Payment failed for order: plan_123456 - Insufficient funds
```
