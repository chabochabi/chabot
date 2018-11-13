
const IFBinance = require('../interfaces/ifBinance');

var MarketManager = function (dataManager, emitter) {
    this.dm = dataManager;
    this.emitter = emitter;
    this.ifb = new IFBinance();
}

var parseTrade = function (trade) {
    let { E: eventTime, t: tradeID, p: price, q: quantity, b: buyerOrderID, a: sellerOrderID, T: tradeTime, m: maker, M: ignore } = trade;
    var parsedTrade = { eventTime: eventTime, tradeID: tradeID, price: parseFloat(price), quantity: parseFloat(quantity), buyerOrderID: buyerOrderID, sellerOrderID: sellerOrderID, tradeTime: tradeTime, maker: maker, ignore: ignore };
    return parsedTrade;
}

var parseKline = function (kline) {
    var data = kline;
    if ('k' in kline) {
        data = kline.k;
    }
    let { t: openTime, T: closeTime, o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: closed } = data;
    var parsedKline = { openTime: openTime, open: parseFloat(open), high: parseFloat(high), low: parseFloat(low), close: parseFloat(close), closeTime: closeTime, volume: parseFloat(volume), trades: parseInt(trades), interval: interval, closed: closed };
    return parsedKline;
}

var parseKlineArray = function (klines) {
    var parsedKlines = [];
    for (const kline of klines) {
        parsedKlines.push(parseKline(kline));
    }
    return parsedKlines;
}

// var parseKlineBacktest = function (kline) {
//     let { open_time: openTime, close_time: closeTime, open: open, high: high, low: low, close: close, volume: volume } = kline;
//     var parsedKline = { openTime: parseInt(openTime), open: parseFloat(open), high: parseFloat(high), low: parseFloat(low), close: parseFloat(close), closeTime: parseInt(closeTime), volume: parseFloat(volume), trades: 0, interval: '1m', closed: true };
//     return parsedKline;
// }

MarketManager.prototype.storeData = function (symbol, data, type) {
    // this.di.write(symbol, data, type);

    switch (type) {
        case 'backtest':
            this.dm.writeKlineBacktest(symbol, data);
            break;

        case 'kline':
            this.dm.writeKline(symbol, data);
            break;

        case 'trade':
            this.dm.writeTrade(symbol, data);
            break;

        case 'record':
            this.dm.saveToFile(symbol, data);
            break;
    }
}

MarketManager.prototype.openAllStreams = async function (type, config) {
    this.ifb.allSymbols(async (allSyms) => {
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
                        this.storeData(symbol, entries, 'kline');
                    }));
                }

                Promise.all(histories).then((symbol, data) => {
                    this.ifb.openStream(type, params, (symbol, data) => {
                        let entry = parseKline(data);
                        if (entry.closed) {
                            this.storeData(symbol, entry, 'kline');
                        }
                    });
                });
                break;

            case 'trades':

                this.ifb.openStream(type, params, (symbol, data) => {
                    let entry = parseTrade(data);
                    this.storeData(symbol, entry, 'trade');
                });

                break;

            case 'record':
                this.ifb.openStream('candlesticks', params, (symbol, data) => {
                    let entry = parseKline(data);
                    if (entry[entry.length - 1].closed) {
                        this.storeData(symbol, entry, 'record');
                    }
                });

            default:
                break;
        }

    });
}

// this function is kinda redundant... we got openAllstreams and this one... its weird TODO
MarketManager.prototype.startStreaming = function (type, params) {
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
            this.storeData(symbol, entry, 'kline' + symbol);
        }).then(this.ifb.openStream(type, params, (symbol, data) => {
            let entry = parseKline(data);
            if (entry[entry.length - 1].closed) {
                this.storeData(symbol, entry, 'kline');
            }
        }));
    }
}

MarketManager.prototype.miniTicker = function () {
    this.ifb.openStream("miniTicker", null, (symbol, data) => {
        console.log(data);
    });
}

// MarketManager.prototype.readCSV = async function (file, callback) {
//     return new Promise(function (resolve, reject) {
//         let parser = csv.parse({ delimiter: ',', columns: true }, function (err, data) {
//             let entries = [];
//             for (const entry of data) {
//                 entries.push(parseKlineBacktest(entry));
//             }
//             let symbol = file.split('_')[1].split('.')[0];
//             callback(symbol, entries);
//             resolve(symbol, entries);
//         });
//         fs.createReadStream('/Users/chabochabito/Documents/crypto/js/chabot/server/offline/data/' + file).pipe(parser);
//     });
// }

// MarketManager.prototype.loadTestData = function (writeEvent, sym) {

//     var csvFiles = [];

//     let loadSymbol = 'kline_'
//     if (sym) {
//         loadSymbol += sym;
//     }

//     fs.readdir('/Users/chabochabito/Documents/crypto/js/chabot/server/offline/data', (err, files) => {
//         files.forEach(file => {
//             if (file.startsWith(loadSymbol)) {
//                 csvFiles.push(this.readCSV(file, (symbol, data) => {
//                     for (candlestick of data) {
//                         this.storeData(symbol, candlestick, 'backtest');
//                     }
//                 }));
//             }
//         });
//         Promise.all(csvFiles).then((file) => {
//             console.log(" all csv reads done!");
//             // TODO this kinda dirtyyyy
//             this.di.emitEvent(writeEvent, "all");
//         });
//     });
// }

module.exports = MarketManager;