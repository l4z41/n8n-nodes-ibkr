import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { IBApiNext, Contract, Order, OrderAction, OrderType, SecType } from '@stoqey/ib';

export class InteractiveBrokers implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Interactive Brokers',
		name: 'interactiveBrokers',
		icon: 'file:ibkr.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Interactive Brokers TWS API',
		defaults: {
			name: 'Interactive Brokers',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'interactiveBrokersApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Market Data',
						value: 'marketData',
					},
					{
						name: 'Order',
						value: 'order',
					},
					{
						name: 'Position',
						value: 'position',
					},
				],
				default: 'account',
			},

			// Account Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
				options: [
					{
						name: 'Get Summary',
						value: 'getSummary',
						description: 'Get account summary',
						action: 'Get account summary',
					},
					{
						name: 'Get Positions',
						value: 'getPositions',
						description: 'Get all positions',
						action: 'Get all positions',
					},
				],
				default: 'getSummary',
			},

			// Market Data Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['marketData'],
					},
				},
				options: [
					{
						name: 'Get Quote',
						value: 'getQuote',
						description: 'Get real-time quote for a symbol',
						action: 'Get real-time quote',
					},
				],
				default: 'getQuote',
			},

			// Symbol field for Market Data
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['marketData'],
					},
				},
				default: '',
				description: 'Stock symbol (e.g., AAPL, TSLA)',
			},

			{
				displayName: 'Security Type',
				name: 'secType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['marketData'],
					},
				},
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
			},

			{
				displayName: 'Exchange',
				name: 'exchange',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['marketData'],
					},
				},
				default: 'SMART',
				description: 'Exchange (e.g., SMART, NYSE, NASDAQ)',
			},

			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['marketData'],
					},
				},
				default: 'USD',
			},

			// Order Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['order'],
					},
				},
				options: [
					{
						name: 'Place Order',
						value: 'placeOrder',
						description: 'Place a new order',
						action: 'Place a new order',
					},
					{
						name: 'Cancel Order',
						value: 'cancelOrder',
						description: 'Cancel an existing order',
						action: 'Cancel an order',
					},
					{
						name: 'Get Open Orders',
						value: 'getOpenOrders',
						description: 'Get all open orders',
						action: 'Get all open orders',
					},
				],
				default: 'placeOrder',
			},

			// Order fields
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['placeOrder'],
					},
				},
				default: '',
				description: 'Stock symbol',
			},

			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['placeOrder'],
					},
				},
				options: [
					{
						name: 'Buy',
						value: 'BUY',
					},
					{
						name: 'Sell',
						value: 'SELL',
					},
				],
				default: 'BUY',
			},

			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['placeOrder'],
					},
				},
				default: 100,
				description: 'Number of shares',
			},

			{
				displayName: 'Order Type',
				name: 'orderType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['placeOrder'],
					},
				},
				options: [
					{
						name: 'Market',
						value: 'MKT',
					},
					{
						name: 'Limit',
						value: 'LMT',
					},
					{
						name: 'Stop',
						value: 'STP',
					},
					{
						name: 'Stop Limit',
						value: 'STP LMT',
					},
				],
				default: 'MKT',
			},

			{
				displayName: 'Limit Price',
				name: 'limitPrice',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['placeOrder'],
						orderType: ['LMT', 'STP LMT'],
					},
				},
				default: 0,
				description: 'Limit price for the order',
			},

			{
				displayName: 'Stop Price',
				name: 'stopPrice',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['placeOrder'],
						orderType: ['STP', 'STP LMT'],
					},
				},
				default: 0,
				description: 'Stop price for the order',
			},

			{
				displayName: 'Security Type',
				name: 'secType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['placeOrder'],
					},
				},
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
				],
				default: 'STK',
			},

			{
				displayName: 'Exchange',
				name: 'exchange',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['placeOrder'],
					},
				},
				default: 'SMART',
			},

			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['placeOrder'],
					},
				},
				default: 'USD',
			},

			{
				displayName: 'Order ID',
				name: 'orderId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['cancelOrder'],
					},
				},
				default: 0,
				description: 'ID of the order to cancel',
			},

			// Position Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['position'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all positions',
						action: 'Get all positions',
					},
				],
				default: 'getAll',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('interactiveBrokersApi');
		const host = credentials.host as string;
		const port = credentials.port as number;
		const clientId = credentials.clientId as number;

		// Create IBKR client
		const ib = new IBApiNext({
			host,
			port,
		});

		let isConnected = false;

		try {
			// Connect to TWS/Gateway
			await ib.connect(clientId);
			isConnected = true;

			// Wait for connection to be fully established
			await new Promise((resolve) => setTimeout(resolve, 2000));

			for (let i = 0; i < items.length; i++) {
				try {
					const resource = this.getNodeParameter('resource', i) as string;
					const operation = this.getNodeParameter('operation', i) as string;

					let responseData: any;

					if (resource === 'account') {
						if (operation === 'getSummary') {
							// First, try to get managed accounts
							let managedAccounts: string[] = [];

							try {
								// Get the list of managed accounts
								const accountsList = await ib.getManagedAccounts();
								if (accountsList && accountsList.length > 0) {
									managedAccounts = accountsList;
									console.log('Managed accounts:', managedAccounts);
								}
							} catch (err: any) {
								console.log('Could not get managed accounts:', err.message);
							}

							// Try account updates method instead of summary
							const accountData: any = {};
							let updateCount = 0;
							let latestAccountMap: any = null;

							const accountCode = managedAccounts.length > 0 ? managedAccounts[0] : '';
							console.log('Using account code:', accountCode || 'empty (will use default)');

							const subscription = ib.getAccountUpdates(accountCode)
								.subscribe({
									next: (update: any) => {
										updateCount++;

										// Store the latest complete update
										if (update.all && update.all.value) {
											latestAccountMap = update.all.value;
										}
									},
									error: (err: any) => {
										console.error('Account updates error:', err);
									}
								});

							// Wait for data
							await new Promise((resolve) => setTimeout(resolve, 5000));
							subscription.unsubscribe();

							console.log(`Total account updates: ${updateCount}`);

							// Extract data from the Map structure
							const accountSummary: any[] = [];

							if (latestAccountMap && latestAccountMap instanceof Map) {
								// Iterate through accounts in the Map
								for (const [accountId, tagMap] of latestAccountMap.entries()) {
									if (tagMap instanceof Map) {
										// Iterate through tags (NetLiquidation, BuyingPower, etc.)
										for (const [tag, valueMap] of tagMap.entries()) {
											if (valueMap instanceof Map) {
												// Get the actual values
												for (const [currency, value] of valueMap.entries()) {
													accountSummary.push({
														account: accountId,
														tag: tag,
														value: value,
														currency: currency
													});
												}
											}
										}
									}
								}
							}

							console.log('Extracted account summary:', accountSummary.length, 'items');

							responseData = accountSummary.length > 0 ? accountSummary : [{
								message: 'No account data received. Check TWS API permissions in Global Configuration > API > Settings.',
								connected: isConnected,
								managedAccounts: managedAccounts,
								updatesReceived: updateCount,
								troubleshooting: 'In TWS: File > Global Configuration > API > Settings > Enable account data sharing'
							}];

						} else if (operation === 'getPositions') {
							// Get positions with promise-based collection
							let latestPositionsMap: any = null;
							let updateCount = 0;

							const subscription = ib.getPositions()
								.subscribe({
									next: (update: any) => {
										updateCount++;

										// Log first update to understand structure
										if (updateCount === 1) {
											console.log('\n=== Positions Update #1 ===');
											console.log('Full update object:', update);
											console.log('Update keys:', Object.keys(update || {}));

											if (update?.all) {
												console.log('update.all type:', update.all?.constructor?.name);
												console.log('update.all is Map:', update.all instanceof Map);
												if (update.all instanceof Map) {
													console.log('update.all Map size:', update.all.size);
													console.log('update.all Map keys:', Array.from(update.all.keys()));
												}

												if (update.all.value) {
													console.log('update.all.value type:', update.all.value?.constructor?.name);
													console.log('update.all.value is Map:', update.all.value instanceof Map);
													if (update.all.value instanceof Map) {
														console.log('update.all.value Map size:', update.all.value.size);
														console.log('update.all.value Map keys:', Array.from(update.all.value.keys()));
													}
												}
											}
										}

										// Store latest positions map
										// Unlike account data, positions Map is directly on update.all (no .value)
										if (update.all && update.all instanceof Map) {
											latestPositionsMap = update.all;
										}
									},
									error: (err: any) => {
										console.error('Positions error:', err);
									},
								});

							// Wait for data collection
							await new Promise((resolve) => setTimeout(resolve, 5000));
							subscription.unsubscribe();

							console.log(`\nTotal position updates: ${updateCount}`);

							// Extract positions from Map
							// Map structure: accountId -> array of position objects
							const positions: any[] = [];

							if (latestPositionsMap && latestPositionsMap instanceof Map) {
								console.log('Extracting from Map with', latestPositionsMap.size, 'account(s)');
								for (const [accountId, positionsArray] of latestPositionsMap.entries()) {
									console.log('Account:', accountId, 'Positions:', positionsArray);
									// Each account has an array of position objects
									if (Array.isArray(positionsArray)) {
										for (const position of positionsArray) {
											if (position && typeof position === 'object') {
												// Add account ID to position object for reference
												positions.push({
													account: accountId,
													...position
												});
											}
										}
									}
								}
							} else {
								console.log('latestPositionsMap is null or not a Map:', latestPositionsMap);
							}

							console.log('Extracted positions:', positions.length);

							responseData = positions.length > 0 ? positions : [{
								message: 'No positions found or TWS not connected',
								connected: isConnected,
								updatesReceived: updateCount
							}];
						}
					} else if (resource === 'marketData') {
						const symbol = this.getNodeParameter('symbol', i) as string;
						const secType = this.getNodeParameter('secType', i, 'STK') as string;
						const exchange = this.getNodeParameter('exchange', i, 'SMART') as string;
						const currency = this.getNodeParameter('currency', i, 'USD') as string;

						const contract: Contract = {
							symbol,
							secType: secType as SecType,
							exchange,
							currency,
						};

						if (operation === 'getQuote') {
							// Get market data - accumulate tick-by-tick updates
							let tickerData: any = { symbol, currency };
							let updateCount = 0;

							const subscription = ib.getMarketData(contract, '', false, false)
								.subscribe({
									next: (update: any) => {
										updateCount++;

										// Log first update to show tick types received
										if (updateCount === 1 && update?.all instanceof Map) {
											console.log(`Market data tick types received: ${Array.from(update.all.keys()).join(', ')}`);
										}

										// Extract ticker data from IB API tick types
										// update.all is a Map with numeric keys representing tick type IDs
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

										if (update?.all && update.all instanceof Map && update.all.size > 0) {
											for (const [tickTypeId, tickData] of update.all.entries()) {
												const fieldName = tickTypeMap[tickTypeId as number];
												if (fieldName && tickData && typeof tickData === 'object' && 'value' in tickData) {
													// Only store if value is valid (not -1 which means no data)
													if (tickData.value !== -1 && tickData.value !== undefined) {
														tickerData[fieldName] = tickData.value;
														// Store timestamp if available
														if (tickData.ingressTm) {
															tickerData[`${fieldName}Time`] = tickData.ingressTm;
														}
													}
												}
											}
										}
									},
									error: (err: any) => {
										console.error('Market data error:', err);
									},
								});

							// Wait for market data ticks
							await new Promise((resolve) => setTimeout(resolve, 5000));
							subscription.unsubscribe();

							console.log(`\n=== Final Results ===`);
							console.log(`Total updates received: ${updateCount}`);
							console.log('Accumulated ticker data:', tickerData);
							console.log('Ticker data fields:', Object.keys(tickerData));

							// Return data if we got more than just symbol and currency
							responseData = Object.keys(tickerData).length > 2 ? {
								...tickerData,
								connected: isConnected,
								updatesReceived: updateCount
							} : {
								symbol,
								message: 'No market data received from TWS. Updates received but contained no ticker fields.',
								connected: isConnected,
								updatesReceived: updateCount,
								updateStructure: 'Check console logs for update structure details'
							};
						}
					} else if (resource === 'order') {
						if (operation === 'placeOrder') {
							const symbol = this.getNodeParameter('symbol', i) as string;
							const action = this.getNodeParameter('action', i) as string;
							const quantity = this.getNodeParameter('quantity', i) as number;
							const orderType = this.getNodeParameter('orderType', i) as string;
							const secType = this.getNodeParameter('secType', i, 'STK') as string;
							const exchange = this.getNodeParameter('exchange', i, 'SMART') as string;
							const currency = this.getNodeParameter('currency', i, 'USD') as string;

							const contract: Contract = {
								symbol,
								secType: secType as SecType,
								exchange,
								currency,
							};

							const order: Order = {
								action: action as OrderAction,
								totalQuantity: quantity,
								orderType: orderType as OrderType,
							};

							if (orderType === 'LMT' || orderType === 'STP LMT') {
								order.lmtPrice = this.getNodeParameter('limitPrice', i) as number;
							}

							if (orderType === 'STP' || orderType === 'STP LMT') {
								order.auxPrice = this.getNodeParameter('stopPrice', i) as number;
							}

							// Get next order ID
							const nextOrderId = await ib.getNextValidOrderId();

							// Place order
							ib.placeOrder(nextOrderId, contract, order);

							// Wait for order submission
							await new Promise((resolve) => setTimeout(resolve, 2000));

							responseData = {
								orderId: nextOrderId,
								symbol,
								action,
								quantity,
								orderType,
								status: 'Submitted',
								connected: isConnected,
							};

						} else if (operation === 'cancelOrder') {
							const orderId = this.getNodeParameter('orderId', i) as number;
							ib.cancelOrder(orderId);
							await new Promise((resolve) => setTimeout(resolve, 1000));
							responseData = { orderId, status: 'Cancelled', connected: isConnected };

						} else if (operation === 'getOpenOrders') {
							// Get open orders with promise-based collection
							let latestOrdersData: any = null;
							let updateCount = 0;

							const subscription = ib.getOpenOrders()
								.subscribe({
									next: (update: any) => {
										updateCount++;

										// Log first update to understand structure
										if (updateCount === 1) {
											console.log('Open orders update.all type:', Array.isArray(update?.all) ? 'Array' : update?.all?.constructor?.name);
											console.log('Open orders update.all length/size:', Array.isArray(update?.all) ? update.all.length : 'N/A');
										}

										// Store latest orders - handle both array and Map structures
										if (update.all) {
											if (Array.isArray(update.all)) {
												// update.all is an array of order objects
												latestOrdersData = update.all;
											} else if (update.all instanceof Map) {
												// update.all is a Map
												latestOrdersData = update.all;
											} else if (update.all.value) {
												// update.all has a .value property
												latestOrdersData = update.all.value;
											}
										}
									},
									error: (err: any) => {
										console.error('Open orders error:', err);
									},
								});

							// Wait for data collection
							await new Promise((resolve) => setTimeout(resolve, 5000));
							subscription.unsubscribe();

							console.log(`Total order updates: ${updateCount}`);

							// Extract orders from array or Map
							const openOrders: any[] = [];

							if (Array.isArray(latestOrdersData)) {
								// Orders are already in an array
								console.log('Orders in array, length:', latestOrdersData.length);
								openOrders.push(...latestOrdersData);
							} else if (latestOrdersData && latestOrdersData instanceof Map) {
								// Orders in a Map
								console.log('Orders in Map, size:', latestOrdersData.size);
								for (const [orderId, orderData] of latestOrdersData.entries()) {
									if (orderData && typeof orderData === 'object') {
										openOrders.push({ orderId, ...orderData });
									}
								}
							}

							console.log('Extracted open orders:', openOrders.length);

							responseData = openOrders.length > 0 ? openOrders : [{
								message: 'No open orders found',
								connected: isConnected,
								updatesReceived: updateCount
							}];
						}
					} else if (resource === 'position') {
						if (operation === 'getAll') {
							// Get positions with promise-based collection
							let latestPositionsMap: any = null;
							let updateCount = 0;

							const subscription = ib.getPositions()
								.subscribe({
									next: (update: any) => {
										updateCount++;
										// Store latest positions map - directly on update.all (no .value)
										if (update.all && update.all instanceof Map) {
											latestPositionsMap = update.all;
										}
									},
									error: (err: any) => {
										console.error('Positions error:', err);
									},
								});

							// Wait for data collection
							await new Promise((resolve) => setTimeout(resolve, 5000));
							subscription.unsubscribe();

							// Extract positions from Map - structure: accountId -> array of positions
							const positions: any[] = [];

							if (latestPositionsMap && latestPositionsMap instanceof Map) {
								for (const [accountId, positionsArray] of latestPositionsMap.entries()) {
									// Each account has an array of position objects
									if (Array.isArray(positionsArray)) {
										for (const position of positionsArray) {
											if (position && typeof position === 'object') {
												positions.push({
													account: accountId,
													...position
												});
											}
										}
									}
								}
							}

							console.log('Extracted positions:', positions.length);

							responseData = positions.length > 0 ? positions : [{
								message: 'No positions found or TWS not connected',
								connected: isConnected,
								updatesReceived: updateCount
							}];
						}
					}

					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(responseData),
						{ itemData: { item: i } },
					);

					returnData.push(...executionData);

				} catch (error: any) {
					if (this.continueOnFail()) {
						returnData.push({
							json: {
								error: error.message,
								connected: isConnected,
							},
							pairedItem: { item: i },
						});
						continue;
					}
					throw error;
				}
			}

			// Disconnect
			ib.disconnect();

			return [returnData];

		} catch (error: any) {
			if (isConnected) {
				ib.disconnect();
			}
			throw new NodeOperationError(
				this.getNode(),
				`IBKR Connection Error: ${error.message}. Ensure TWS/Gateway is running on ${host}:${port} with API enabled.`
			);
		}
	}
}
