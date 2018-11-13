
const Analyzer = require('../bot/analyzer');
const EventEmitter = require('events');
const BacktestManager = require('../managers/backtestManager');

var DataInterface = function (dataManager, broadcast) {

    this.dm = dataManager;

    this.bm = new BacktestManager(this);
    this.broadcast = broadcast;
    this.analyzer = new Analyzer();
    this.indicators = this.analyzer.indicators;
    this.strategies = [];
    this.emitter = new EventEmitter();
    this.emitter.on('kline', (function (symbol, data) {
        this.broadcastData('kline:' + symbol, data);
    }).bind(this));
}

DataInterface.prototype.setStrategies = function (strategies) {
    this.strategies = strategies;
}

DataInterface.prototype.write = function (name, data, event) {
    switch (event) {
        case 'backtest':
            this.dm.writeKlineBacktest(name, data);
            this.broadcastData('history:' + name, { klines: data });
            break;

        case 'kline':
            this.dm.writeKline(name, data);
            this.emitEvent(event, name, { klines: data });
            break;

        case 'trade':
            this.dm.writeTrade(name, data);
            break;

        // case 'offline':
        //     this.dm.writeKline(name, data, offline=true);
        //     break;

        case 'record':
            this.dm.saveToFile(name, data);
            break;
    }
}

DataInterface.prototype.emitEvent = function (event, symbol, data) {
    this.emitter.emit(event, symbol, data);
}

// TODO maybe move this function to backtestManager??? 
DataInterface.prototype.simulateStream = function (symbol, source) {
    let data = this.dm.readAll(symbol, source);
    for (let i = 0; i < data.length; i++) {
        this.emitEvent('backtest', data.slice(0, i + 1));
    }
    this.emitEvent('backtestDone');
}

DataInterface.prototype.getKlineDataEntry = function (symbol, source, openTime) {
    return this.dm.getData(symbol, source, openTime);
}

DataInterface.prototype.requestData = async function (type, options) {

    if (!('symbol' in options)) {
        return;
    }

    let data = {};
    let symbol = options.symbol;
    let source = options.source;

    switch (type) {

        case 'backtestSymbolsList':
            data = { backtestSymbols: await this.bm.getBacktestSymbolList() }
            break;

        // case 'backtest':
        //     // data = { backtest: Object.keys(this.dm.marketData['backtest']) };
        //     // data = { backtest: await this.bm.loadBacktestData(symbol) };
        //     console.log("BACKTEST");
        //     break;

        case 'history':
            if (symbol in this.dm.marketData[source]) {
                data = { klines: this.dm.readAll(symbol, source) };
            } else if (source === "backtest") {
                this.bm.loadBacktestData(symbol);
                return; // no need to broadcast
            }
            break;

        case 'strategies':
            data = this.strategies;
            break;

        case 'indicators':
            data = this.indicators;
            break;

        case 'indicatorsData':
            if (!('indicator' in options)) {
                return;
            }
            let indicator = options.indicator;

            switch (indicator.type) {
                case 'MA':
                    data = {
                        ma: {
                            data: this.analyzer.MA(this.dm.readAll(symbol, source), options.indicator.params.frameLength),
                            params: options.indicator.params
                        }
                    }
                    break;

                case 'EMA':
                    data = {
                        ema: {
                            data: this.analyzer.EMA(this.dm.readAll(symbol, source), indicator.params.frameLength),
                            params: options.indicator.params
                        }
                    }
                    break;
                case 'RSI':
                    data = {
                        rsi: {
                            data: this.analyzer.RSI(this.dm.readAll(symbol, source), indicator.params.frameLength),
                            params: options.indicator.params
                        }
                    }
                    break;
                case 'MACD':
                    data = {
                        macd: {
                            data: this.analyzer.MACD(this.dm.readAll(symbol, source), indicator.params.fast, indicator.params.slow, indicator.params.signal),
                            params: options.indicator.params
                        }
                    }
                    break;


                case 'BOLL':
                    data = {
                        boll: {
                            data: this.analyzer.BOLL(this.dm.readAll(symbol, source), indicator.params.frameLength, indicator.params.multiplier),
                            params: options.indicator.params
                        }
                    }
                    break;

                default:
                    let tmpData = this.dm.readAll(symbol, source);
                    data = {
                        ma: this.analyzer.MA(tmpData, 15),
                        ema: this.analyzer.EMA(tmpData, 10),
                        rsi: this.analyzer.RSI(tmpData, 14),
                        macd: this.analyzer.MACD(tmpData, 12, 26, 9)
                    };
                    break;
            }

            break;
    }
    this.broadcastData(type + ':' + symbol, data);
}

DataInterface.prototype.broadcastData = function (name, data) {
    if (this.broadcast) {
        this.broadcast.send(name, data);
    }
}

var broadcastID = function (type, symbol) {
    return type + ':' + symbol;
}

DataInterface.prototype.broadcast = function (type, symbol, data) {
    if (this.broadcast) {
        this.broadcast.send(broadcastID(type, symbol), data);
    }
}

module.exports = DataInterface;