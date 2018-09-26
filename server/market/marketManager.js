const IFBinance = require('./ifBinance');
const csv = require('csv');
const fs = require('fs');

var MarketManager = function (dataInterface) {
    this.di = dataInterface;
    this.ifb = new IFBinance();
}

var parseData = function (data, offline = false) {
    let result = [];
    if (offline) {
        for (const entry of data) {
            let { open_time: openTime, close_time: closeTime, open: open, high: high, low: low, close: close, volume: volume } = entry;
            result.push({ openTime: parseInt(openTime), open: parseFloat(open), high: parseFloat(high), low: parseFloat(low), close: parseFloat(close), closeTime: parseInt(closeTime), volume: parseFloat(volume), trades: 0, interval: '1m', closed: true });
        }
    } else {
        if (Array.isArray(data)) {
            for (const entry of data) {
                let { t: openTime, T: closeTime, o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: closed } = entry.k;
                result.push({ openTime: openTime, open: parseFloat(open), high: parseFloat(high), low: parseFloat(low), close: parseFloat(close), closeTime: closeTime, volume: parseFloat(volume), trades: parseInt(trades), interval: interval, closed: closed });
            }
        } else {
            let { t: openTime, T: closeTime, o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: closed } = data;
            result.push({ openTime: openTime, open: parseFloat(open), high: parseFloat(high), low: parseFloat(low), close: parseFloat(close), closeTime: closeTime, volume: parseFloat(volume), trades: parseInt(trades), interval: interval, closed: closed });
        }
    }
    return result;
}

MarketManager.prototype.openAllStreams = async function (type) {
    this.ifb.allSymbols(async (pairs) => {
        btcs = pairs["BTC"];
        params = {
            symbols: btcs,
            interval: "1m"
        }

        const histories = [];

        for (const symbol of params.symbols) {
            p = {
                symbol: symbol,
                interval: "1m"
            }
            histories.push(this.ifb.getHistory(type, p, (symbol, data) => {
                let entry = parseData(data);
                this.di.write(symbol, entry, 'kline');
            }));
        }

        Promise.all(histories).then((symbol, data) => {
            this.ifb.openStream(type, params, (symbol, data) => {
                let entry = parseData(data.k);
                if (entry[entry.length - 1].closed) {
                    this.di.write(symbol, entry, 'kline');
                }
            });
        });
    });
}

MarketManager.prototype.startStreaming = function (type, params) {
    if (type == "24hr") {
        this.ifb.openStream(type, params, (symbol, data) => {
            if (data.symbol.endsWith("BTC")) {
                this.di.broadcastData(symbol, data);
            }
        });
    } else {
        this.ifb.getHistory(type, params, (symbol, data) => {
            let entry = parseData(data);
            this.di.write(symbol, entry, 'kline'+symbol);
        }).then(this.ifb.openStream(type, params, (symbol, data) => {
            let entry = parseData(data.k);
            if (entry[entry.length - 1].closed) {
                this.di.write(symbol, entry, 'kline');
            }
        }));
    }
}

MarketManager.prototype.miniTicker = function () {
    this.ifb.openStream("miniTicker", null, (symbol, data) => {
        console.log(data);
    });
}

MarketManager.prototype.readCSV = async function (file, callback) {
    return new Promise(function (resolve, reject) {
        let parser = csv.parse({ delimiter: ',', columns: true }, function (err, data) {
            let entry = parseData(data, true);
            let symbol = file.split('_')[1].split('.')[0];
            callback(symbol, entry);
            resolve(symbol, entry);
        });
        fs.createReadStream('/Users/chabochabito/Documents/crypto/js/chabot/server/offline/data/' + file).pipe(parser);
    });
}

MarketManager.prototype.loadTestData = function (writeEvent, sym) {

    var csvFiles = [];

    let loadSymbol = 'kline_'
    if (sym) {
        loadSymbol += sym;
    }

    fs.readdir('/Users/chabochabito/Documents/crypto/js/chabot/server/offline/data', (err, files) => {
        files.forEach(file => {
            if (file.startsWith(loadSymbol)) {
                csvFiles.push(this.readCSV(file, (symbol, data) => {
                    for (candlestick of data) {
                        this.di.write(symbol, candlestick, 'offline');
                    }
                }));
            }
        });
        Promise.all(csvFiles).then((file) => {
            console.log(" all csv reads done!");
            // TODO this kinda dirtyyyy
            this.di.emitEvent(writeEvent, 'offlineData', this.di.getCoinList());
        });
    });
}

module.exports = MarketManager;