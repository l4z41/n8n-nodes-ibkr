# N8N Interactive Brokers (IBKR) Node

This is an n8n community node that allows you to connect to Interactive Brokers TWS API for automated trading.

## Features

- **Account Management**: Get account summary and positions
- **Market Data**: Retrieve real-time quotes and historical data
- **Real-Time Triggers**: Automatically trigger workflows on market data updates
- **Order Management**: Place, cancel, and monitor orders
- **Position Tracking**: View current positions

## Prerequisites

Before using this node, you need:

1. An Interactive Brokers account
2. TWS (Trader Workstation) or IB Gateway installed and running
3. API connections enabled in TWS/Gateway settings

## Installation

### Community Node Installation

1. Go to **Settings** > **Community Nodes** in your n8n instance
2. Search for `n8n-nodes-ibkr`
3. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-ibkr
```

Or in your n8n root directory:

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-ibkr
```

## Configuration

### Enable API in TWS/Gateway

1. Open TWS or IB Gateway
2. Go to **File** > **Global Configuration** > **API** > **Settings**
3. Enable "Enable ActiveX and Socket Clients"
4. Add `127.0.0.1` to trusted IP addresses
5. Note your socket port:
   - TWS Paper Trading: 7497
   - TWS Live Trading: 7496
   - IB Gateway Paper Trading: 4002
   - IB Gateway Live Trading: 4001

### Configure Credentials in N8N

1. Create a new credential of type "Interactive Brokers API"
2. Enter the following:
   - **Host**: `127.0.0.1` (or your TWS/Gateway host)
   - **Port**: Your socket port (e.g., 7497 for paper trading)
   - **Client ID**: A unique number for this connection (default: 0)
   - **Connection Timeout**: Timeout in milliseconds (default: 30000)

## Usage

### Nodes Available

This package provides two nodes:

1. **Interactive Brokers** - Execute operations on demand
2. **Interactive Brokers Trigger** - Automatically trigger workflows on real-time market data

### Interactive Brokers Node (Regular)

#### Account
- **Get Summary**: Retrieve account summary information
- **Get Positions**: Get all current positions

#### Market Data
- **Get Quote**: Get real-time market data for a symbol
- **Get Historical Data**: Retrieve historical price data

#### Order
- **Place Order**: Submit a new order
  - Supports Market, Limit, Stop, and Stop Limit orders
  - Buy or Sell actions
- **Cancel Order**: Cancel an existing order
- **Get Open Orders**: Retrieve all open orders

#### Position
- **Get All**: Get all current positions

### Interactive Brokers Trigger Node (Real-Time)

The trigger node automatically executes your workflow when new market data arrives from Interactive Brokers.

#### Configuration Options

**Common Settings:**
- **Data Mode**: Choose between "Ticks" or "5-Second Bars"
  - **Ticks (Real-Time Quotes)**: Stream tick-by-tick market data updates (default)
  - **5-Second Bars (OHLCV)**: Receive complete OHLC candles every 5 seconds
- **Symbol**: Stock symbol to monitor (e.g., AAPL, TSLA)
- **Security Type**: Stock, Option, Future, or Forex
- **Exchange**: Exchange to use (default: SMART)
- **Currency**: Contract currency (default: USD)

**Ticks Mode Options:**
- **Trigger On**:
  - **All Updates**: Trigger on every market data update
  - **Price Change**: Trigger only when last price changes
  - **Bid/Ask Update**: Trigger on bid or ask price updates
- **Minimum Price Change (%)**: For price change mode, set minimum % change required
- **Update Interval (Seconds)**: Throttle triggers to prevent too many executions (default: 10 seconds)
- **Snapshot Mode**: Request a snapshot instead of streaming data
- **Include Regulatory Snapshot**: Include regulatory snapshot data

**5-Second Bars Mode Options:**
- **What to Show**: Type of data (Trades, Midpoint, Bid, Ask)
- **Use Regular Trading Hours**: Include only RTH data or all hours

#### Data Provided

Each trigger event includes:
- Symbol and currency
- Current prices (bid, ask, last)
- Volume and sizes (bidSize, askSize, lastSize)
- OHLC data (open, high, low, close) - **See limitations below**
- Timestamps for updates
- Previous price and change % (for price change mode)

#### Understanding OHLC Data in Real-Time Streams

**Important**: OHLC (Open, High, Low, Close) data behaves differently in real-time market data streams compared to historical data:

- **Open (tick 14)**: Only sent once at market open for the current session
- **High (tick 6)**: Only updated when a new intraday high is reached
- **Low (tick 7)**: Only updated when a new intraday low is reached
- **Close (tick 9)**: Previous day's closing price (sent once at session start)
- **Volume (tick 8)**: Cumulative volume for the current trading day

These are **event-driven updates**, not continuously streaming values. This means:

✅ **You WILL receive**:
- Bid, ask, and last prices on every tick
- Volume updates throughout the day
- Close price (previous day) at the start of session
- High/low prices when new intraday extremes are reached
- Open price at the start of the trading session

❌ **You WILL NOT always receive**:
- Open, high, and low on every single market data update
- Complete OHLC bars at regular intervals (like 5-second or 1-minute candles)

**For building OHLC candles**: If you need regular OHLC bars:
1. **Use 5-Second Bars Mode** - Select "5-Second Bars (OHLCV)" in Data Mode to receive complete OHLC candles every 5 seconds
2. Build your own candles from the tick-by-tick data using the `last` price and timestamps
3. Use historical data APIs with appropriate bar sizes

#### 5-Second Bars Mode

**NEW in v0.2.2**: The trigger node now supports IBKR's Real-Time Bars API, providing complete OHLC candles every 5 seconds.

**Benefits:**
- ✅ Complete OHLC data (Open, High, Low, Close, Volume)
- ✅ Guaranteed 5-second intervals (not event-driven)
- ✅ Includes WAP (Weighted Average Price) and trade count
- ✅ Perfect for building real-time candle charts
- ✅ Automatic reconnection support

**Data Provided in Bars Mode:**
Each 5-second bar includes:
- `symbol`, `currency`: Contract identification
- `timestamp`, `date`: Bar timestamp
- `open`, `high`, `low`, `close`: OHLC prices
- `volume`: Trading volume for the 5-second period
- `wap`: Weighted Average Price
- `count`: Number of trades in the period
- `barType`: Always "realtime-5sec"

**Important Limitations:**
- Bar size is **fixed at 5 seconds** (IBKR API limitation)
- Subject to IBKR's pacing rules (max 60 new bar requests per 10 minutes)
- Only one active real-time bars subscription per contract per client ID
- Requires live market data subscriptions for the instrument

### Example Workflows

#### Place a Market Order

1. Add an Interactive Brokers node
2. Select Resource: **Order**
3. Select Operation: **Place Order**
4. Configure:
   - Symbol: `AAPL`
   - Action: `Buy`
   - Quantity: `100`
   - Order Type: `Market`
   - Exchange: `SMART`
   - Currency: `USD`

#### Get Real-Time Quote

1. Add an Interactive Brokers node
2. Select Resource: **Market Data**
3. Select Operation: **Get Quote**
4. Configure:
   - Symbol: `TSLA`
   - Security Type: `Stock`
   - Exchange: `SMART`
   - Currency: `USD`

#### Automated Trading on Price Changes

1. Add an **Interactive Brokers Trigger** node
2. Configure:
   - Symbol: `AAPL`
   - Trigger On: `Price Change`
   - Minimum Price Change (%): `0.5`
   - Update Interval (Seconds): `10`
3. Add an **IF** node to check price conditions
4. Add an **Interactive Brokers** node to place orders based on conditions

This workflow will automatically execute every 10 seconds when AAPL's price changes by 0.5% or more.

#### Monitor Multiple Stocks with Real-Time Triggers

Create separate workflows for each symbol you want to monitor:
- One workflow with trigger for AAPL
- Another workflow with trigger for TSLA
- Each workflow can have different logic and update intervals

#### Webhook Notifications on Market Events

1. Add an **Interactive Brokers Trigger** node
2. Configure for your desired symbol and trigger conditions
3. Add a **Webhook** node or **Slack/Discord/Email** node to send notifications
4. Activate the workflow

Now you'll receive automatic notifications whenever market conditions are met!

## Important Notes

� **Risk Warning**: This node allows you to place real trades. Always test with paper trading first!

### Connection Settings
- Use port 7497 (TWS) or 4002 (Gateway) for paper trading
- Use port 7496 (TWS) or 4001 (Gateway) for live trading
- Each connection requires a unique Client ID
- Ensure TWS/Gateway is running before executing workflows
- API must be enabled in TWS/Gateway settings

### Trigger Node Best Practices
- **Update Interval**: Set to at least 5-10 seconds to avoid excessive workflow executions
- **Testing**: Always test triggers in development mode before activating in production
- **Market Hours**: Triggers only receive data when markets are open
- **Resource Usage**: Each active trigger maintains a connection to TWS/Gateway
- **Multiple Symbols**: Create separate workflows for each symbol you want to monitor
- **Client IDs**: Use different Client IDs for each trigger to avoid connection conflicts

## Development

### Build

```bash
npm install
npm run build
```

### Development Mode

```bash
npm run dev
```

### Lint

```bash
npm run lint
npm run lintfix
```

## Use Cases

### Automated Trading Strategies
- Trigger trades based on real-time price movements
- Implement algorithmic trading strategies
- Execute orders based on technical indicators

### Market Monitoring
- Get instant notifications when specific price levels are reached
- Monitor multiple symbols simultaneously across different workflows
- Track bid/ask spreads and volume changes

### Portfolio Management
- Automatically rebalance portfolio based on market conditions
- Set up stop-loss orders triggered by price movements
- Monitor position values in real-time

### Data Collection
- Stream market data to databases or spreadsheets
- Build custom analytics dashboards
- Archive historical tick data

## Resources

- [Interactive Brokers TWS API Documentation](https://interactivebrokers.github.io/tws-api/)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [@stoqey/ibkr npm package](https://www.npmjs.com/package/@stoqey/ibkr)

## License

MIT

## Support

For issues and questions:
- Create an issue on GitHub
- Visit the n8n community forum

## Disclaimer

This node is not affiliated with, endorsed by, or connected to Interactive Brokers. Use at your own risk. Trading involves risk of financial loss.
