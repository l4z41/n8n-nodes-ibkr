# TWS/IB Gateway Setup Guide

## Critical Configuration Steps

### 1. Enable API Access

1. Open **TWS** or **IB Gateway**
2. Navigate to: **File** → **Global Configuration** → **API** → **Settings**
3. **Enable these options:**
   - ✅ **"Enable ActiveX and Socket Clients"** (REQUIRED)
   - ✅ **"Download open orders on connection"** (Recommended)
   - ✅ **"Use negative numbers to bind automatic orders"** (Optional)

4. **Trusted IP Addresses:**
   - Add: `127.0.0.1`
   - Click **OK** to save

5. **Socket Port:**
   - **Paper Trading TWS:** Default is **7497**
   - **Live Trading TWS:** Default is **7496**
   - **Paper Trading Gateway:** Default is **4002**
   - **Live Trading Gateway:** Default is **4001**
   - Note your port for N8N credentials

6. **IMPORTANT - Master API Client ID (if exists):**
   - If you see "Master API client ID" field, leave it **empty** or set to **0**
   - Each N8N workflow should use a unique Client ID

### 2. Account Data Permissions

**For Paper Trading Accounts:**
1. Go to: **File** → **Global Configuration** → **API** → **Precautions**
2. Review and accept any warnings about API trading

**Check Account Sharing (if available):**
1. Some TWS versions have: **Edit** → **Global Configuration** → **API** → **Settings**
2. Look for options like:
   - "Share account data with API"
   - "Allow account updates via API"
3. Enable if present

### 3. Market Data Subscriptions

**For Real-Time Data:**
- Requires paid market data subscriptions in your IB account
- Check: [IB Account Management](https://www.interactivebrokers.com/portal) → Market Data Subscriptions

**For Paper Trading (Free Delayed Data):**
1. In TWS: **Account** → **Account Window**
2. Check that you have at least delayed market data permissions
3. Paper accounts typically include delayed data

### 4. Verify Connection

**In TWS:**
1. Check connection status (top-left corner should show "Connected")
2. Look for your account ID (e.g., DU123456)
3. Ensure you're logged in (not just started)

**Test Connection:**
- Socket port should show as "Listening" in API settings
- No firewall blocking the port
- TWS/Gateway fully started (not in startup screen)

## Common Issues

### Issue: "No account data received"

**Possible Causes:**
1. **API not enabled** → Enable "ActiveX and Socket Clients"
2. **Wrong port** → Check port matches (7497 for paper TWS)
3. **Not logged in** → Ensure TWS is fully logged into IB servers
4. **Account permissions** → Paper accounts may have restrictions
5. **TWS not ready** → Wait 30 seconds after TWS starts before connecting

**Solutions:**
```
✓ Check TWS shows "Connected" status
✓ Verify green light next to socket port in API settings
✓ Restart TWS/Gateway completely
✓ Try port 7496 if 7497 doesn't work (and vice versa)
✓ Check Windows Firewall isn't blocking the port
```

### Issue: Connection works but empty data

**This usually means:**
- TWS is connected ✓
- API is enabled ✓
- But account data permission is missing ✗

**Fix:**
1. File → Global Configuration → API → Settings
2. Look for ANY option related to:
   - "Account data"
   - "Portfolio updates"
   - "Position updates"
3. Enable ALL such options
4. **Restart TWS completely**

### Issue: Market data shows as empty

**Cause:** No market data permissions

**Solutions:**
- Paper trading: Use delayed data (should be included)
- Live trading: Subscribe to market data in Account Management
- Try requesting data during market hours
- Check symbol format (use "AAPL" not "AAPL.NASDAQ")

## Configuration Checklist

Before using N8N node, verify:

- [ ] TWS/Gateway is running and showing "Connected"
- [ ] API is enabled in Global Configuration → API → Settings
- [ ] "Enable ActiveX and Socket Clients" is checked
- [ ] 127.0.0.1 is in trusted IP addresses
- [ ] Correct port noted (7497 for paper, 7496 for live)
- [ ] Logged into IB account (not just TWS open)
- [ ] Account window shows your account ID
- [ ] No firewall blocking the port
- [ ] Wait 30-60 seconds after TWS starts before connecting

## Testing

### Quick Test (Windows Command Line):
```bash
# Test if port is listening
netstat -an | findstr "7497"
```
Should show: `LISTENING` on that port

### Test with N8N:
1. Create simple workflow:
   - Manual Trigger
   - Interactive Brokers node → Account → Get Summary
2. Execute
3. Check response has `"connected": true`
4. If connected but no data → Check TWS permissions above

## Advanced: Account Update Methods

The node tries two methods to get account data:

1. **getManagedAccounts()** - Gets your account list
2. **getAccountUpdates()** - Gets account balance/portfolio data

If both fail, TWS likely needs configuration changes above.

## Need Help?

1. Check TWS Activity Log: **Edit** → **Global Configuration** → **API** → **Settings** → Enable "Create API message log file"
2. Logs location: `C:\TWS API\Logs` (or IB Gateway equivalent)
3. Review [IBKR API Documentation](https://interactivebrokers.github.io/tws-api/)
4. Contact IB Support about API permissions
