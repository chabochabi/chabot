
const IFBinance = require('../interfaces/ifBinance');

function parseTrade(trade) {
    let { E: eventTime, t: tradeID, p: price, q: quantity, b: buyerOrderID, a: sellerOrderID, T: tradeTime, m: maker, M: ignore } = trade;
    var parsedTrade = { eventTime: eventTime, tradeID: tradeID, price: parseFloat(price), quantity: parseFloat(quantity), buyerOrderID: buyerOrderID, sellerOrderID: sellerOrderID, tradeTime: tradeTime, maker: maker, ignore: ignore };
    return parsedTrade;
}

function parseKline(kline) {
    var data = kline;
    if ('k' in kline) {
        data = kline.k;
    }
    let { t: openTime, T: closeTime, o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: closed } = data;
    var parsedKline = { openTime: openTime, open: parseFloat(open), high: parseFloat(high), low: parseFloat(low), close: parseFloat(close), closeTime: closeTime, volume: parseFloat(volume), trades: parseInt(trades), interval: interval, closed: closed };
    return parsedKline;
}

function parseKlineArray(klines) {
    var parsedKlines = [];
    for (const kline of klines) {
        parsedKlines.push(parseKline(kline));
    }
    return parsedKlines;
}

class MarketManager {

    constructor(dataManager, emitter) {
        this.dm = dataManager;
        this.emitter = emitter;
        this.ifb = new IFBinance();
    }

    storeData(symbol, data, type) {

        switch (type) {
            case 'backtest':
                this.dm.writeKlineBacktest(symbol, data);
                break;

            case 'klines':
                this.dm.writeKline(symbol, data);
                break;

            case 'trades':
                this.dm.writeTrade(symbol, data);
                break;

            case 'record':
                this.dm.saveToFile(symbol, data);
                break;
        }
    }

    openAllStreams(type, config) {
        this.ifb.allSymbols((allSyms) => {
            btcs = allSyms[config.tosym]; // either BTC, ETH or BNB ... for Binance that is
            params = {
                symbols: btcs,
                // symbols: ["ETHBTC"],
                interval: config.interval
            }

            const histories = [];

            switch (type) {
                case 'klines':
                    for (const symbol of params.symbols) {
                        p = {
                            symbol: symbol,
                            interval: params.interval
                        }
                        histories.push(this.ifb.getHistory(type, p, (symbol, data) => {
                            let entries = parseKlineArray(data);
                            this.storeData(symbol, entries, type);
                        }));
                    }

                    Promise.all(histories).then((symbol, data) => {
                        this.ifb.openStream(type, params, (symbol, data) => {
                            let entry = parseKline(data);
                            if (entry.closed) {
                                this.storeData(symbol, entry, type);
                            }
                        });
                    });
                    break;

                case 'trades':
                    this.ifb.openStream(type, params, (symbol, data) => {
                        let entry = parseTrade(data);
                        this.storeData(symbol, entry, type);
                    });

                    break;

                case 'record':
                    this.ifb.openStream('candlesticks', params, (symbol, data) => {
                        let entry = parseKline(data);
                        if (entry[entry.length - 1].closed) {
                            this.storeData(symbol, entry, type);
                        }
                    });

                default:
                    break;
            }

        });
    }

    // this function is kinda redundant... we got openAllstreams and this one... its weird TODO
    startStreaming(type, params) {
        if (type === "24hr") {
            this.ifb.openStream(type, params, (type, data) => {
                if (data.symbol.endsWith("BTC")) {
                    // this.di.broadcastData(type, data);
                    this.emitter.emit(type, data);
                }
            });
        } else {
            this.ifb.getHistory(type, params, (symbol, data) => {
                let entry = parseKlineArray(data);
                this.storeData(symbol, entry, 'klines' + symbol);
            }).then(this.ifb.openStream(type, params, (symbol, data) => {
                let entry = parseKline(data);
                if (entry[entry.length - 1].closed) {
                    this.storeData(symbol, entry, 'klines');
                }
            }));
        }
    }

    miniTicker() {
        this.ifb.openStream("miniTicker", null, (symbol, data) => {
            console.log(data);
        });
    }
}

module.exports = MarketManager;