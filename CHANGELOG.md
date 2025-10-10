# Changelog

## [0.1.4] - 2025-10-07

### Fixed
- **MARKET DATA WORKING!** Properly extract market data from IB API tick type structure
  - Map contains numeric tick type IDs (1=bid, 2=ask, 4=last, etc.) rather than field names
  - Now correctly maps tick type IDs to readable field names (bid, ask, last, high, low, close, open, volume, bidSize, askSize, lastSize)
  - Accumulates all tick data during subscription period
  - Includes timestamp for each tick field (bidTime, askTime, lastTime, etc.)

- **POSITIONS WORKING!** Fixed positions data extraction
  - Positions Map is directly on `update.all` (no `.value` property like account data)
  - Map structure is `accountId -> array of position objects`
  - Now correctly iterates through accounts and extracts position arrays
  - Adds account ID to each position for reference
  - Returns full contract details (symbol, conId, exchange, currency), position size, and average cost

- **OPEN ORDERS WORKING!** Fixed open orders data extraction
  - Orders returned as simple array on `update.all` (not a Map)
  - Handles both array and Map structures for flexibility
  - Returns empty array with helpful message when no orders exist

### Changed
- Simplified market data logging to show only tick type IDs received on first update
- Filters out invalid values (-1 indicates no data from TWS)
- Enhanced positions logging to debug data structure

## [0.1.3] - 2025-10-06

### Fixed
- **WORKING!** Properly extract data from deeply nested Map structures
- Account data now correctly unwraps from `MutableAccountSummaries` → Account ID → Tag → Currency → Value
- Market data extracts from nested Map (contract ID → ticker data)
- Positions extract from Map structure
- Orders extract from Map structure
- All operations now return actual data from TWS

### Changed
- Switched from `getAccountSummary()` to `getAccountUpdates()` for better compatibility
- Added `getManagedAccounts()` to get account list before requesting data
- All Map-based responses now properly iterate and extract values
- Enhanced error messages with troubleshooting hints
- Added update counters for debugging

## [0.1.2] - 2025-10-06

### Fixed
- **CRITICAL FIX**: Corrected data extraction from Observable updates
- Observable data comes in `update.added` and `update.all` as **objects**, not arrays
- Now properly extracts account summary, positions, orders, and market data
- All operations now return actual data instead of empty objects

### Changed
- Account Summary: Collects data from both `added` and `all` properties
- Positions: Extracts position data from map structure
- Market Data: Captures latest ticker from updates
- Open Orders: Properly aggregates order data from map
- All data is converted from maps to arrays for N8N output

## [0.1.1] - 2025-10-06

### Fixed
- Fixed infinite execution issue with Observable streams by implementing `bufferTime()` with timeout
- Observable streams now properly complete after collecting data for 3 seconds
- Added error handling for empty responses from TWS/Gateway
- Improved connection stability

### Changed
- Replaced `toArray()` with `bufferTime(3000) + filter() + take(1)` pattern for all Observable operations
- This ensures streams complete even when TWS doesn't emit a completion signal

## [0.1.0] - 2025-10-06

### Added
- Initial release
- Support for Interactive Brokers TWS API integration
- Account operations (get summary, get positions)
- Market data operations (get quotes)
- Order operations (place, cancel, get open orders)
- Position tracking
- Credentials management
- Support for multiple security types (stocks, options, futures, forex)
- Support for multiple order types (market, limit, stop, stop-limit)
