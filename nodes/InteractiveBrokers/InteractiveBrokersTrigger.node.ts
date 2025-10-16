import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeOperationError,
} from 'n8n-workflow';

import { IBApiNext, Contract, SecType, ConnectionState } from '@stoqey/ib';

export class InteractiveBrokersTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Interactive Brokers Trigger',
		name: 'interactiveBrokersTrigger',
		icon: 'file:ibkr.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["symbol"]}}',
		description: 'Triggers workflow on real-time quote updates from Interactive Brokers',
		defaults: {
			name: 'IBKR Quote Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'interactiveBrokersApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'AAPL',
				description: 'Stock symbol to monitor for real-time quotes',
			},
			{
				displayName: 'Security Type',
				name: 'secType',
				type: 'options',
				options: [
					{
						name: 'Stock',
						value: 'STK',
					},
					{
						name: 'Option',
						value: 'OPT',
					},
					{
						name: 'Future',
						value: 'FUT',
					},
					{
						name: 'Forex',
						value: 'CASH',
					},
				],
				default: 'STK',
				description: 'Type of security to monitor',
			},
			{
				displayName: 'Exchange',
				name: 'exchange',
				type: 'string',
				default: 'SMART',
				description: 'Exchange to use (e.g., SMART, NYSE, NASDAQ)',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'USD',
				description: 'Currency for the contract',
			},
			{
				displayName: 'Trigger On',
				name: 'triggerOn',
				type: 'options',
				options: [
					{
						name: 'All Updates',
						value: 'all',
						description: 'Trigger on every market data update',
					},
					{
						name: 'Price Change',
						value: 'priceChange',
						description: 'Trigger only when price changes',
					},
					{
						name: 'Bid/Ask Update',
						value: 'bidAsk',
						description: 'Trigger on bid or ask price updates',
					},
				],
				default: 'all',
				description: 'When to trigger the workflow',
			},
			{
				displayName: 'Minimum Price Change (%)',
				name: 'minPriceChange',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						triggerOn: ['priceChange'],
					},
				},
				description: 'Minimum percentage price change to trigger (0 = any change)',
			},
			{
				displayName: 'Update Interval (Seconds)',
				name: 'updateInterval',
				type: 'number',
				default: 10,
				description: 'Minimum time in seconds between workflow triggers (throttling)',
				hint: 'Prevents too many executions from rapid market updates',
			},
			{
				displayName: 'Snapshot Mode',
				name: 'snapshot',
				type: 'boolean',
				default: false,
				description: 'Whether to request a snapshot instead of streaming data',
			},
			{
				displayName: 'Include Regulatory Snapshot',
				name: 'regulatorySnapshot',
				type: 'boolean',
				default: false,
				description: 'Whether to include regulatory snapshot data',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('interactiveBrokersApi');
		const host = credentials.host as string;
		const port = credentials.port as number;
		const clientId = credentials.clientId as number;

		const symbol = this.getNodeParameter('symbol') as string;
		const secType = this.getNodeParameter('secType', 'STK') as string;
		const exchange = this.getNodeParameter('exchange', 'SMART') as string;
		const currency = this.getNodeParameter('currency', 'USD') as string;
		const triggerOn = this.getNodeParameter('triggerOn', 'all') as string;
		const minPriceChange = this.getNodeParameter('minPriceChange', 0) as number;
		const updateInterval = this.getNodeParameter('updateInterval', 10) as number;
		const snapshot = this.getNodeParameter('snapshot', false) as boolean;
		const regulatorySnapshot = this.getNodeParameter('regulatorySnapshot', false) as boolean;

		// Create IBKR client with auto-reconnect enabled
		const ib = new IBApiNext({
			host,
			port,
			reconnectInterval: 5000, // Reconnect after 5 seconds
			connectionWatchdogInterval: 10, // 10 second watchdog to detect dead connections
		});

		let subscription: any = null;
		let connectionStateSubscription: any = null;
		let emitInterval: NodeJS.Timeout | null = null;
		let lastPrice: number | null = null;
		let latestTickerData: any = null;

		const contract: Contract = {
			symbol,
			secType: secType as SecType,
			exchange,
			currency,
		};

		// Map tick type IDs to readable field names
		const tickTypeMap: { [key: number]: string } = {
			1: 'bid',
			2: 'ask',
			4: 'last',
			6: 'high',
			7: 'low',
			9: 'close',
			14: 'open',
			0: 'bidSize',
			3: 'askSize',
			5: 'lastSize',
			8: 'volume',
			45: 'lastTimestamp',
		};

		// Function to subscribe to market data
		const subscribeToMarketData = () => {
			// Clean up existing subscription if any
			if (subscription) {
				try {
					subscription.unsubscribe();
				} catch (err) {
					// Ignore unsubscribe errors
				}
				subscription = null;
			}

			// Subscribe to market data - this will continuously stream data
			// IBApiNext will handle reconnection automatically and maintain the subscription
			subscription = ib.getMarketData(contract, '', snapshot, regulatorySnapshot)
				.subscribe({
					next: (update: any) => {
						try {
							// Extract ticker data from IB API tick types
							const tickerData: any = {
								symbol,
								currency,
								timestamp: new Date().toISOString(),
							};

							let hasUpdate = false;
							let hasPriceUpdate = false;
							let hasBidAskUpdate = false;

							if (update?.all && update.all instanceof Map && update.all.size > 0) {
								for (const [tickTypeId, tickData] of update.all.entries()) {
									const fieldName = tickTypeMap[tickTypeId as number];
									if (fieldName && tickData && typeof tickData === 'object' && 'value' in tickData) {
										// Only store if value is valid (not -1 which means no data)
										if (tickData.value !== -1 && tickData.value !== undefined) {
											tickerData[fieldName] = tickData.value;
											hasUpdate = true;

											// Track price updates
											if (fieldName === 'last' || fieldName === 'bid' || fieldName === 'ask') {
												if (fieldName === 'last') {
													hasPriceUpdate = true;
												}
												if (fieldName === 'bid' || fieldName === 'ask') {
													hasBidAskUpdate = true;
												}
											}

											// Store timestamp if available
											if (tickData.ingressTm) {
												tickerData[`${fieldName}Time`] = tickData.ingressTm;
											}
										}
									}
								}
							}

							// Apply trigger filters
							let shouldTrigger = false;

							if (triggerOn === 'all') {
								shouldTrigger = hasUpdate;
							} else if (triggerOn === 'priceChange') {
								if (hasPriceUpdate && tickerData.last !== undefined) {
									if (lastPrice === null) {
										// First price update
										shouldTrigger = true;
										lastPrice = tickerData.last;
									} else {
										// Check if price change exceeds minimum threshold
										const priceChange = Math.abs((tickerData.last - lastPrice) / lastPrice * 100);
										if (priceChange >= minPriceChange) {
											shouldTrigger = true;
											tickerData.priceChange = priceChange;
											tickerData.previousPrice = lastPrice;
											lastPrice = tickerData.last;
										}
									}
								}
							} else if (triggerOn === 'bidAsk') {
								shouldTrigger = hasBidAskUpdate;
							}

							// Store latest data if it meets trigger criteria
							// The interval timer will emit this periodically
							if (shouldTrigger) {
								latestTickerData = tickerData;
							}
						} catch (error: any) {
							this.logger.error(`Error processing market data: ${error.message}`);
						}
					},
					error: (err: any) => {
						this.logger.error(`Market data subscription error: ${err.message}`);
						// Note: IBApiNext will automatically handle reconnection
						// The subscription will resume once connection is re-established
					},
					complete: () => {
						this.logger.info('Market data subscription completed');
					},
				});
		};

		try {
			// Monitor connection state changes
			connectionStateSubscription = ib.connectionState.subscribe((state: ConnectionState) => {
				switch (state) {
					case ConnectionState.Connected:
						this.logger.info(`Connected to IBKR at ${host}:${port}, monitoring ${symbol}`);
						// Subscribe to market data when connected
						subscribeToMarketData();
						break;
					case ConnectionState.Disconnected:
						this.logger.warn('IBKR connection lost. Auto-reconnect will attempt to restore connection...');
						break;
					case ConnectionState.Connecting:
						this.logger.info('Connecting to IBKR...');
						break;
				}
			});

			// Connect to TWS/Gateway
			ib.connect(clientId);

			// Wait for initial connection to be established
			await new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error('Connection timeout after 10 seconds'));
				}, 10000);

				const stateSub = ib.connectionState.subscribe((state: ConnectionState) => {
					if (state === ConnectionState.Connected) {
						clearTimeout(timeout);
						stateSub.unsubscribe();
						resolve(undefined);
					}
				});
			});

			// Set up interval timer to emit data every X seconds
			emitInterval = setInterval(() => {
				if (latestTickerData) {
					this.emit([this.helpers.returnJsonArray(latestTickerData)]);
					latestTickerData = null; // Clear after emitting
				}
			}, updateInterval * 1000);

		} catch (error: any) {
			// Clean up on initial connection failure
			if (emitInterval) {
				clearInterval(emitInterval);
			}
			if (subscription) {
				subscription.unsubscribe();
			}
			if (connectionStateSubscription) {
				connectionStateSubscription.unsubscribe();
			}
			ib.disconnect();

			throw new NodeOperationError(
				this.getNode(),
				`IBKR Connection Error: ${error.message}. Ensure TWS/Gateway is running on ${host}:${port} with API enabled.`
			);
		}

		// Close function to clean up when trigger is deactivated
		const closeFunction = async () => {
			this.logger.info('Closing IBKR trigger connection');

			// Clear the emit interval timer
			if (emitInterval) {
				clearInterval(emitInterval);
				emitInterval = null;
			}

			// Unsubscribe from connection state
			if (connectionStateSubscription) {
				try {
					connectionStateSubscription.unsubscribe();
				} catch (err) {
					// Ignore unsubscribe errors
				}
				connectionStateSubscription = null;
			}

			// Unsubscribe from market data
			if (subscription) {
				try {
					subscription.unsubscribe();
				} catch (err) {
					// Ignore unsubscribe errors
				}
				subscription = null;
			}

			// Disconnect from IBKR
			try {
				ib.disconnect();
			} catch (err) {
				// Ignore disconnect errors
			}
		};

		// Manual trigger function for testing - waits for first market data update
		const manualTriggerFunction = async () => {
			// Wait for a market data update (timeout after 10 seconds)
			await new Promise((resolve) => setTimeout(resolve, 10000));
		};

		return {
			closeFunction,
			manualTriggerFunction,
		};
	}
}