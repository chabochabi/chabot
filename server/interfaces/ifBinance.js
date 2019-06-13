const Binance = require('node-binance-api')

function sortSymbols(syms, pairs) {
    pairs = {
        "BTC": [],
        "ETH": [],
        "BNB": []
    };
    for (let symbol in syms) {
        var symlen = symbol.length;
        tosym = symbol.substr(symlen - 3, symlen - 1);
        if (tosym in pairs) {
            pairs[tosym].push(symbol);
        }
    }
    return pairs;
}

class IFBinance {

    constructor() {
        this.binance = Binance().options({
            APIKEY: '63vJeNyHKJrtiDb8qH4bEMwtbHIlNPoELMaV5Wjym5ZfcIbKZV4G95JxR5rbgBbw',
            APISECRET: '<secret>',
            useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
            test: true, // If you want to use sandbox mode where orders are simulated
            reconnect: false
        });
    }

    allSymbols(callback) {
        this.binance.prices(function (error, symbols) {
            var pairs = sortSymbols(symbols, this.pairs);
            callback(pairs);
        });
    }

    async getHistory(type, params, callback) {
        switch (type) {
            case "klines":
                return new Promise((resolve, reject) => {
                    this.binance.candlesticks(params.symbol, params.interval, (error, ticks, symbol) => {
                        let data = [];
                        let now = Date.now();
                        let closeTime = 0;
                        for (i = 0; i < ticks.length; i++) {
                            let tick = ticks[i];
                            closeTime = tick[6];
                            if (now > closeTime) {
                                data.push({ k: { t: tick[0], T: closeTime, o: tick[1], h: tick[2], l: tick[3], c: tick[4], v: tick[5], x: true, n: tick[8] }, i: "1m" });
                            }
                        }
                        // callback({ 'data': data });
                        callback(symbol, data);
                        resolve(symbol, data);
                    }, { limit: 500, endTime: Date.now() });
                });
                break;

            case "trades":
                return new Promise((resolve, reject) => {
                    this.binance.trades(params.symbol, (error, trades, symbol) => {
                        callback(symbol, trades);
                        resolve(symbol, trades);
                    }, { limit: 500, endTime: Date.now() });
                });
                break;
        }
    }

    async getMultipleHistory(type, params) {
        for (const symbol of params.symbols) {
            p = {
                symbol: symbol,
                interval: "1m"
            }
            await this.getHistory(type, p, dummy);
        }
    }

    openStream(type, params, callback) {
        switch (type) {
            case "klines":
                var stream = this.binance.websockets.candlesticks(params.symbols, params.interval, (candlestick) => {
                    callback(candlestick.s, candlestick, "kline");
                });
                break;

            case "trades":
                var stream = this.binance.websockets.trades(params.symbols, (trade) => {
                    callback(trade.s, trade, "trade");
                });
                break;

            case "24hr":
                var stream = this.binance.websockets.prevDay(params.symbols, (error, response) => {
                    callback("24hr", response);
                });
                break;

            case "miniTicker":
                var stream = this.binance.websockets.miniTicker(data => {
                    callback('miniTicker', data);
                })
        }
    }

    stopStream() {
        let streams = this.binance.websockets.subscriptions();
        for (const stream of streams) {
            this.binance.websockets.terminate(stream);
        }
    }
}

module.exports = IFBinance;
