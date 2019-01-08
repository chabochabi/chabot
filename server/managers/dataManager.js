const loki = require('lokijs');
const fs = require('fs');

class DataManager {

    MAXCOUNT_KLINE = 1440; // 24 hrs
    MAXCOUNT_TRADE = 1440; // 24 hrs
    DATADIR = '/Users/chabochabito/Documents/crypto/data/';

    constructor(emitter) {
        this.db = new loki('coins.json')
        this.emitter = emitter;
        this.marketData = {
            backtest: {},
            kline: {},
            trade: {}
        };
    }

    lastEntry(symbol, source) {
        var last = this.marketData[source][symbol].count();
        return this.readAll(symbol, source)[last - 1];
    }

    writeKlineBacktest(symbol, data) {
        this.addData(symbol, 'backtest');
        this.marketData.backtest[symbol].insert(data);
        this.emitter.emit('klineHistory', symbol, { klines: data });
    }

    writeKline(symbol, data) {
        this.addData(symbol, 'kline');

        if (this.marketData.kline[symbol].count() >= MAXCOUNT_KLINE) {
            let first = this.readAll(symbol, 'kline')[0];
            this.marketData.kline[symbol].remove(first);
            this.marketData.kline[symbol].insert(data);
        } else {
            this.marketData.kline[symbol].insert(data);
        }
        this.emitter.emit('kline', symbol, { klines: data });
    }

    insertTrade(symbol, tradeBundle, offline = false) {

        if ((this.marketData.trade[symbol].count() >= MAXCOUNT_TRADE) && !offline) { // ignore limit if its offline, cause we'll probably be backtesting
            let first = this.readAll(symbol, 'trade')[0];
            this.marketData.trade[symbol].remove(first);
            this.marketData.trade[symbol].insert(tradeBundle);
        } else {
            this.marketData.trade[symbol].insert(tradeBundle);
        }
        this.emitter.emit('tradesBundle', symbol, { trades: tradeBundle });
    }

    writeTrade(symbol, data) {

        this.addData(symbol, 'trade');
        this.emitter.emit('trade', symbol, { trade: data });

        let now = Date.now();
        let openTime = now - (now % 60000);
        let makers = 0;
        let takers = 0;
        let makerQuantity = 0;
        let takerQuantity = 0;
        let lastEntry = this.marketData.trade[symbol].find({ 'openTime': openTime })[0];

        if (data.maker) {
            makers++;
            makerQuantity = data.quantity;
        } else {
            takers++;
            takerQuantity = data.quantity;
        }

        let newTradeEntry = {
            openTime: openTime,
            closeTime: openTime + 59999,
            makers: makers,
            takers: takers,
            open: data.price,
            high: data.price,
            low: data.price,
            close: data.price,
            makerQuantity: makerQuantity,
            takerQuantity: takerQuantity
        }

        if (lastEntry && (data.eventTime < lastEntry.closeTime)) {
            if (data.maker) {
                lastEntry.makers++;
                lastEntry.makerQuantity += data.quantity;
            } else {
                lastEntry.takers++;
                lastEntry.takerQuantity += data.quantity;
            }

            if (data.price > lastEntry.high)
                lastEntry.high = data.price;

            if (data.price < lastEntry.low)
                lastEntry.low = data.price;

            lastEntry.close = data.price;
        } else {
            this.insertTrade(symbol, newTradeEntry);
        }
    }

    saveToFile(symbol, data) {
        let file = DATADIR + symbol + '.json';
        let jsonString = JSON.stringify(data[0]) + ',\n'; // 0 cause its always only one entry, we're just gonna ignore the json root thing and always just append a ',' at the end... TODO
        fs.appendFile(file, jsonString, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }

    readLastItems(symbol, source, amount) {
        let len = this.marketData[source][symbol].count();
        if (amount <= len) {
            return this.marketData[source][symbol].chain().data().slice(len - amount, len);
        }
    }

    hasSymbol(symbol, source) {
        if (this.getCoinList(source).lastIndexOf(symbol) >= 0) {
            return true;
        }
        return false;
    }

    readAll(symbol, source) {
        if (this.hasSymbol(symbol, source)) {
            return this.marketData[source][symbol].chain().data();
        }
        return [];
    }

    getCoinList(source) {
        return Object.keys(this.marketData[source]);
    }

    getData(symbol, source, openTime) {
        if (this.hasSymbol(symbol, source)) {
            return this.marketData[source][symbol].find({ 'openTime': openTime });
        }
    }

    addData(symbol, source) {
        if (!this.marketData[source].hasOwnProperty(symbol)) {
            this.marketData[source][symbol] = this.db.addCollection(source + "_" + symbol);
        }
    }

    hasSymbol(symbol, source) {
        return (symbol in this.marketData[source]);
    }
}

module.exports = DataManager;