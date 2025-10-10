# Troubleshooting Guide

## Empty Response / No Data Returned

### Symptoms
- Workflow completes successfully
- Returns empty objects `{}` or message about no data

### Causes & Solutions

#### 1. TWS/Gateway Not Running
**Check:** Is TWS or IB Gateway running?
```bash
# On Windows, check if process is running
tasklist | findstr /i "tws"
```

**Solution:** Start TWS or IB Gateway before running workflows

#### 2. API Not Enabled
**Check:** TWS/Gateway API settings
1. Open TWS/Gateway
2. Go to: **File** → **Global Configuration** → **API** → **Settings**
3. Verify:
   - ✅ "Enable ActiveX and Socket Clients" is checked
   - ✅ "127.0.0.1" is in trusted IP addresses
   - ✅ Socket port matches your credentials (7497 or 7496)

**Solution:** Enable API and add 127.0.0.1 to trusted IPs

#### 3. Wrong Port Configuration
**Check:** Your N8N credentials
- **Paper Trading TWS:** Port 7497
- **Live Trading TWS:** Port 7496
- **Paper Trading Gateway:** Port 4002
- **Live Trading Gateway:** Port 4001

**Solution:** Update credentials with correct port

#### 4. Client ID Conflict
**Check:** Are multiple applications using the same Client ID?

**Solution:** Use unique Client IDs for each connection
- N8N workflow 1: Client ID = 0
- N8N workflow 2: Client ID = 1
- Other apps: Different IDs

#### 5. Account Not Logged In
**Check:** Is TWS/Gateway logged in and connected to IB servers?

**Solution:** Ensure you're logged into TWS/Gateway with valid credentials

#### 6. No Positions/Orders
**Check:** Do you actually have positions or orders?

**Response:** If you have no positions, you'll see:
```json
{
  "message": "No positions found or TWS not connected",
  "connected": true
}
```

This is normal if your account has no open positions.

## Connection Errors

### Error: "Connection refused" or "ECONNREFUSED"
**Cause:** TWS/Gateway not listening on specified port

**Solutions:**
1. Verify TWS/Gateway is running
2. Check firewall isn't blocking the port
3. Verify correct host (usually `127.0.0.1`)
4. Restart TWS/Gateway

### Error: "Connection timeout"
**Cause:** TWS/Gateway not responding

**Solutions:**
1. Increase timeout in credentials (default: 30000ms)
2. Check network connectivity
3. Restart TWS/Gateway

## Market Data Issues

### Error: "No market data permissions"
**Cause:** Your IB account doesn't have market data subscriptions

**Solutions:**
1. Check your IB account subscriptions
2. For paper trading, ensure you have free delayed data enabled
3. Try during market hours

### Empty Market Data Response
**Cause:** Symbol not found or market closed

**Solutions:**
1. Verify symbol is correct (e.g., "AAPL", not "Apple")
2. Check if market is open
3. Ensure security type matches (STK for stocks)

## Order Issues

### Orders Not Executing
**Cause:** Various order validation issues

**Solutions:**
1. Check symbol exists and is tradeable
2. Verify sufficient buying power
3. Check order parameters (price, quantity)
4. Review TWS Activity log for errors

### Permission Denied for Order
**Cause:** Trading permissions not enabled

**Solutions:**
1. Check IB account permissions
2. For paper trading, verify Paper Trading is enabled
3. Check if security type is allowed

## Debugging Steps

### 1. Check N8N Logs
```bash
tail -f ~/.n8n/n8nEventLog.log
```

### 2. Check Connection Status
The node now returns `connected: true/false` in responses. Check if it's `true`.

### 3. Test with TWS Activity Log
1. Open TWS
2. Go to **Edit** → **Global Configuration** → **API** → **Settings**
3. Enable "Create API message log file"
4. Check log files in TWS logs directory

### 4. Verify with Simple Test
Create a minimal workflow:
1. Manual Trigger
2. Interactive Brokers node
   - Resource: Account
   - Operation: Get Summary
3. Execute and check response

Expected good response:
```json
{
  "account": "DU123456",
  "tag": "NetLiquidation",
  "value": "100000.00",
  "currency": "USD"
}
```

Expected bad response:
```json
{
  "message": "No account data received...",
  "connected": false
}
```

### 5. Test Connection Manually
Use a simple Node.js script to test:
```javascript
const { IBApiNext } = require('@stoqey/ib');

const ib = new IBApiNext({
  host: '127.0.0.1',
  port: 7497
});

ib.connect(0).then(() => {
  console.log('Connected!');
  ib.disconnect();
}).catch(err => {
  console.error('Failed:', err);
});
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "IBKR Connection Error" | Can't connect to TWS | Start TWS/Gateway |
| "No account data received" | API not sending data | Check API enabled |
| "No positions found" | No open positions | Normal if no positions |
| "Market data error" | No data subscription | Check IB subscriptions |
| "Connection timeout" | TWS not responding | Increase timeout, restart TWS |

## Getting Help

If issues persist:
1. Check TWS/Gateway logs
2. Verify IB account status and permissions
3. Test with IB's sample applications
4. Review [IBKR API Documentation](https://interactivebrokers.github.io/tws-api/)
5. Create issue on GitHub with:
   - N8N version
   - TWS/Gateway version
   - Error messages
   - Node configuration
   - Response data

## Advanced Debugging

### Enable Verbose Logging
Start N8N with debug logging:
```bash
N8N_LOG_LEVEL=debug n8n start
```

### Check Observatory Data Structure
Add a Code node after IBKR node:
```javascript
// Log the full response structure
console.log('IBKR Response:', JSON.stringify($input.all(), null, 2));
return $input.all();
```

### Monitor Network Traffic
Use Wireshark or tcpdump to inspect TWS API traffic on your port.
