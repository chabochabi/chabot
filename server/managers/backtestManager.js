
const csv = require('csv');
const fs = require('fs');
const path = require('path');

const Backtest = require('../backtest/backtest');
const Indicator = require('../backtest/indicator');

function parseKlineBacktest(kline) {
    let { open_time: openTime, close_time: closeTime, open: open, high: high, low: low, close: close, volume: volume } = kline;
    var parsedKline = { openTime: parseInt(openTime), open: parseFloat(open), high: parseFloat(high), low: parseFloat(low), close: parseFloat(close), closeTime: parseInt(closeTime), volume: parseFloat(volume), trades: 0, interval: '1m', closed: true };
    return parsedKline;
}

class BacktestManager {

    constructor(dataManager, emitter) {
        this.dm = dataManager;
        this.emitter = emitter;
    }

    async runBacktest(symbol, source, strategy, params) {
        bt = new Backtest(this, this.emitter);

        if (!this.dm.hasSymbol(symbol, source)) {
            await this.loadBacktestData(symbol);
        }

        bt.run(symbol, source, strategy, params);
    }

    async runIndicator(symbol, source, indicator, params) {
        ind = new Indicator(this);

        if (!this.dm.hasSymbol(symbol, source)) {
            await this.loadBacktestData(symbol);
        }

        ind.run(symbol, source, indicator, params);
    }

    getKlineDataEntry(symbol, source, openTime) {
        var latestEntry = this.dm.lastEntry(symbol, source);
        if (latestEntry.openTime < openTime) {
            return latestEntry;
        }
        return this.dm.getData(symbol, source, openTime)[0];
    }

    getBacktestData(symbol, source) {
        return this.dm.readAll(symbol, source);
    }

    getBacktestSymbolList() {
        return new Promise(function (resolve) {
            var csvFiles = [];
            var offlineData = path.resolve('./offline/data');
            fs.readdir(offlineData, (err, files) => {
                files.forEach(file => {
                    if (file.startsWith('kline')) {
                        csvFiles.push(file.split("_")[1].split(".")[0]);
                    }
                });
                resolve(csvFiles);
            });
        });
    }

    readCSV(file, symbol, callback) {

        let parser = csv.parse({ delimiter: ',', columns: true }, function (err, data) {
            let entries = [];
            for (const entry of data) {
                entries.push(parseKlineBacktest(entry));
            }
            callback(symbol, entries);
        });
        fs.createReadStream(file).pipe(parser);
    }

    async loadBacktestData(sym) {

        let csvFile = 'kline_';
        if (!sym) {
            console.log(' **** sym is missing for loadBacktestData', sym);
            return -1;
        }
        csvFile += sym + '.csv';
        var offlineData = path.resolve('./offline/data');
        var file = offlineData + '/' + csvFile;
        var loadDone = new Promise((resolve) => {
            this.readCSV(file, sym, (symbol, data) => {
                this.dm.writeKlineBacktest(symbol, data);
                resolve();
            });
        });
        await loadDone;
    }
}

module.exports = BacktestManager;