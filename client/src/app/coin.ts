// export class Coin {
// 	id: number;
// 	name: string;
// 	price: number;
// }

export class OfflineCoin {
	openTime: number;
	closeTime: number;
	open: number;
	close: number;
	high: number;
	low: number;
	volume: number;
	closed: boolean;
}

export class Coin24hr {
	eventTime: number;
	symbol: string;
	priceChange: string;
	percentChange: string;
	averagePrice: string;
	prevClose: string;
	close: string;
	closeQty: string;
	bestBid: string;
	bestBidQty: string;
	bestAsk: string;
	bestAskQty: string;
	open: string;
	high: string;
	low: string;
	volume: string;
	quoteVolume: string;
	openTime: number;
	closeTime: number;
	firstTradeId: number;
	lastTradeId: number;
	numTrades: number;
}