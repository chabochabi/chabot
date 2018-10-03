const Binance = require('node-binance-api')

var IFBinance = function () {
    this.binance = Binance().options({
        APIKEY: '63vJeNyHKJrtiDb8qH4bEMwtbHIlNPoELMaV5Wjym5ZfcIbKZV4G95JxR5rbgBbw',
        APISECRET: '<secret>',
        useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
        test: true, // If you want to use sandbox mode where orders are simulated
        reconnect: false
    });
}

// IFBinance.prototype = Object.create(Object.prototype, {
//     constructor: { value: IFBinance }
// });

sortSymbols = function (syms, pairs) {
    for (let symbol in syms) {
        var symlen = symbol.length;
        tosym = symbol.substr(symlen - 3, symlen - 1);
        if (tosym in pairs) {
            pairs[tosym].push(symbol);
        }
    }
}

IFBinance.prototype.allSymbols = function (callback) {
    pairs = {
        "BTC": [],
        "ETH": [],
        "BNB": []
    };
    return new Promise((resolve, reject) => {
        this.binance.prices(function (error, symbols) {
            sortSymbols(symbols, this.pairs);
            callback(this.pairs);
        });
        resolve(this.pairs);
    });
}

IFBinance.prototype.getHistory = async function (type, params, callback) {
    switch (type) {
        case "candlesticks":
            return new Promise((resolve, reject) => {
                this.binance.candlesticks(params.symbol, params.interval, (error, ticks, symbol) => {
                    let data = [];
                    let now = Date.now();
                    let closeTime = 0;
                    for (i = 0; i < ticks.length; i++) {
                        let tick = ticks[i];
                        closeTime = tick[6];
                        if (now > closeTime) {
                            data.push({ k: { t: tick[0], T: closeTime, o: tick[1], h: tick[2], l: tick[3], c: tick[4], v: tick[5], x: true, n: tick[8]}, i: "1m"});
                        }
                    }
                    // callback({ 'data': data });
                    callback(symbol,data);
                    resolve(symbol,data);
                }, { limit: 500, endTime: Date.now() });
            });
            break;

        case "trades":
            this.binance.trades(params.symbol, (error, trades, symbol) => {
                console.log(symbol + " trade history", trades);
            });
            break;
    }
}

IFBinance.prototype.getMultipleHistory = async function (type, params) {
    for (const symbol of params.symbols) {
        p = {
            symbol: symbol,
            interval: "1m"
        }
        await this.getHistory(type, p, dummy);
    }
}

IFBinance.prototype.openStream = function (type, params, callback) {
    switch (type) {
        case "candlesticks":
            // for(a in params.symbols)console.log(params.symbols[a])
            var stream = this.binance.websockets.candlesticks(params.symbols, params.interval, (candlesticks) => {
                // callback({ 'stream': stream, 'data': candlesticks });
                callback(candlesticks.s, candlesticks);
            });
            break;

        case "trades":
            var stream = this.binance.websockets.trades(params.symbols, (trades) => {
                callback({ 'stream': stream, 'data': trades });
            });
            break;

        case "24hr":
            var stream = this.binance.websockets.prevDay(params.symbols, (error, response) => {
                // callback({ 'stream': stream, 'data': response });
                callback("24hr", response);
            });
            break;

        case "miniTicker":
            var stream = this.binance.websockets.miniTicker(data => {
                callback('miniTicker', data);
                // callback({'stream': stream, 'data': data})
            })
    }
}

IFBinance.prototype.stopStream = function () {
    let streams = this.binance.websockets.subscriptions();
    for (const stream of streams) {
        this.binance.websockets.terminate(stream);
    }
}

function dummy(symbol, data) {
    console.log(symbol);
}

params = {
    // symbol: "ETHBTC",
    // symbols: "ETHBTC",
    symbols: ["ETHBTC", "TRXBTC", "ETHBTC", "TRXBTC", "ETHBTC", "TRXBTC", "ETHBTC", "TRXBTC", "ETHBTC", "TRXBTC"],
    // symbols: false,
    interval: "1m"
}

module.exports = IFBinance;

// var ifb = new IFBinance();
// ifb.getMultipleHistory("candlesticks", params);
// ifb.getHistory("candlesticks", params, dummy).then(ifb.openStream("candlesticks", params, dummy));
// ifb.openStream("candlesticks", params, dummy);
// ifb.allSymbols(dummy);

// module.exports.getHistory("trades", params, dummy);
// module.exports.openStream("chart", params, dummy);
// module.exports.openStream("candlesticks", params, dummy);
// module.exports.openStream("trades", params, dummy);
// module.exports.allSymbols(dummy);
