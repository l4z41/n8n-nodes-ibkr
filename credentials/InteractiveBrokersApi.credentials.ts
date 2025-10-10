import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class InteractiveBrokersApi implements ICredentialType {
	name = 'interactiveBrokersApi';
	displayName = 'Interactive Brokers API';
	documentationUrl = 'https://interactivebrokers.github.io/tws-api/';
	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: '127.0.0.1',
			description: 'TWS or IB Gateway host address',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: 7497,
			description: 'TWS port (7497 for paper trading, 7496 for live) or IB Gateway port (4002 for paper, 4001 for live)',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'number',
			default: 0,
			description: 'Unique client ID for this connection',
		},
		{
			displayName: 'Connection Timeout',
			name: 'timeout',
			type: 'number',
			default: 30000,
			description: 'Connection timeout in milliseconds',
		},
	];
}
