# N8N Interactive Brokers (IBKR) Node

This is an n8n community node that allows you to connect to Interactive Brokers TWS API for automated trading.

## Features

- **Account Management**: Get account summary and positions
- **Market Data**: Retrieve real-time quotes and historical data
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

### Resources

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

## Important Notes

  **Risk Warning**: This node allows you to place real trades. Always test with paper trading first!

- Use port 7497 (TWS) or 4002 (Gateway) for paper trading
- Use port 7496 (TWS) or 4001 (Gateway) for live trading
- Each connection requires a unique Client ID
- Ensure TWS/Gateway is running before executing workflows
- API must be enabled in TWS/Gateway settings

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
