# Usage Guide: N8N Interactive Brokers Node

## Quick Start

### 1. Prerequisites

- Interactive Brokers account
- TWS (Trader Workstation) or IB Gateway installed and running
- API enabled in TWS/Gateway settings

### 2. Enable API Access in TWS/Gateway

1. Open TWS or IB Gateway
2. Navigate to: **File** → **Global Configuration** → **API** → **Settings**
3. Enable "Enable ActiveX and Socket Clients"
4. Add `127.0.0.1` to trusted IP addresses
5. Note your port number:
   - **TWS Paper Trading**: 7497
   - **TWS Live Trading**: 7496
   - **IB Gateway Paper Trading**: 4002
   - **IB Gateway Live Trading**: 4001

### 3. Install the Node

#### Option A: From npm (when published)
```bash
npm install n8n-nodes-ibkr
```

#### Option B: Local Development
```bash
# In your n8n nodes folder
cd ~/.n8n/nodes
git clone <your-repo>
cd ibkr-n8n
npm install
npm run build

# Link to n8n
cd ~/.n8n
npm link n8n-nodes-ibkr
```

### 4. Configure Credentials in N8N

1. In N8N, go to **Credentials** → **New**
2. Search for "Interactive Brokers API"
3. Fill in:
   - **Host**: `127.0.0.1`
   - **Port**: `7497` (for paper trading) or your specific port
   - **Client ID**: `0` (or any unique number if you have multiple connections)
   - **Connection Timeout**: `30000` (milliseconds)
4. Save the credentials

## Available Operations

### Account Operations

#### Get Account Summary
Retrieves account summary information including net liquidation, cash value, and position value.

**Returns**: Array of account summary items with tags like NetLiquidation, TotalCashValue, GrossPositionValue.

#### Get Positions
Gets all current positions in your account.

**Returns**: Array of positions with:
- `account`: Account ID
- `symbol`: Stock symbol
- `secType`: Security type (STK, OPT, FUT, etc.)
- `position`: Number of shares
- `avgCost`: Average cost per share

### Market Data Operations

#### Get Quote
Fetches real-time market data for a symbol.

**Parameters**:
- **Symbol**: Stock ticker (e.g., AAPL, TSLA)
- **Security Type**: STK (Stock), OPT (Option), FUT (Future), CASH (Forex)
- **Exchange**: SMART (default), NYSE, NASDAQ, etc.
- **Currency**: USD (default)

**Returns**: Market data object with bid, ask, last price, volume, etc.

### Order Operations

#### Place Order
Submits a new order to Interactive Brokers.

**Parameters**:
- **Symbol**: Stock ticker
- **Action**: BUY or SELL
- **Quantity**: Number of shares
- **Order Type**: MKT (Market), LMT (Limit), STP (Stop), STP LMT (Stop Limit)
- **Limit Price**: (Required for LMT and STP LMT orders)
- **Stop Price**: (Required for STP and STP LMT orders)
- **Security Type**: STK (default), OPT, FUT
- **Exchange**: SMART (default)
- **Currency**: USD (default)

**Returns**: Order confirmation with order ID and status.

#### Cancel Order
Cancels an existing order.

**Parameters**:
- **Order ID**: The ID of the order to cancel

**Returns**: Cancellation confirmation.

#### Get Open Orders
Retrieves all open orders.

**Returns**: Array of open orders with order details.

### Position Operations

#### Get All Positions
Gets all current positions (same as Account → Get Positions).

**Returns**: Array of positions with details.

## Example Workflows

### Example 1: Place a Market Buy Order

```
1. Add "Interactive Brokers" node
2. Select:
   - Resource: Order
   - Operation: Place Order
3. Configure:
   - Symbol: AAPL
   - Action: Buy
   - Quantity: 100
   - Order Type: Market
   - Security Type: Stock
   - Exchange: SMART
   - Currency: USD
```

### Example 2: Place a Limit Sell Order

```
1. Add "Interactive Brokers" node
2. Select:
   - Resource: Order
   - Operation: Place Order
3. Configure:
   - Symbol: TSLA
   - Action: Sell
   - Quantity: 50
   - Order Type: Limit
   - Limit Price: 250.00
   - Security Type: Stock
   - Exchange: SMART
   - Currency: USD
```

### Example 3: Get Real-Time Quote

```
1. Add "Interactive Brokers" node
2. Select:
   - Resource: Market Data
   - Operation: Get Quote
3. Configure:
   - Symbol: MSFT
   - Security Type: Stock
   - Exchange: SMART
   - Currency: USD
```

### Example 4: Monitor Account and Send Alert

```
1. Add "Schedule Trigger" (every 5 minutes)
2. Add "Interactive Brokers" node:
   - Resource: Account
   - Operation: Get Summary
3. Add "IF" node to check conditions
4. Add "Send Email" or "Slack" node for alerts
```

### Example 5: Automated Trading Strategy

```
1. Add "Webhook" trigger (to receive signals)
2. Add "Code" node to process signal
3. Add "Interactive Brokers" node to place order
4. Add another "Interactive Brokers" node to verify position
5. Add "Slack" notification for confirmation
```

## Important Notes

⚠️ **Trading Risks**:
- Always test with **paper trading** first (port 7497/4002)
- Real trading uses different ports (7496/4001)
- Orders execute immediately - be careful!
- Double-check all parameters before executing

📋 **Best Practices**:
- Use unique Client IDs for each N8N workflow
- Keep TWS/Gateway running while workflows execute
- Monitor error handling in your workflows
- Set appropriate timeouts for market data requests
- Test with small quantities first

🔧 **Troubleshooting**:

**Connection Errors**:
- Verify TWS/Gateway is running
- Check API is enabled in settings
- Confirm correct host and port
- Ensure 127.0.0.1 is in trusted IPs

**Market Data Issues**:
- Verify market data subscriptions in your IB account
- Check if market is open
- Ensure correct symbol format

**Order Failures**:
- Verify sufficient buying power
- Check order parameters are valid
- Ensure symbol exists and is tradeable
- Review IB account permissions

## Security Considerations

- Never expose your N8N instance publicly without authentication
- Use HTTPS for N8N if accessible over network
- Keep TWS/Gateway secured with strong passwords
- Use separate API credentials for automated trading
- Monitor all automated trades regularly

## Support & Resources

- [Interactive Brokers API Documentation](https://interactivebrokers.github.io/tws-api/)
- [N8N Community Forum](https://community.n8n.io/)
- [@stoqey/ib GitHub](https://github.com/stoqey/ib)

## Disclaimer

This node is not affiliated with Interactive Brokers. Use at your own risk. Automated trading involves significant financial risk. Always test thoroughly with paper trading before using real money.
