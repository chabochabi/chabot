
const Analyzer = require('./analyzer');
const EventEmitter = require('events');

var DataInterface = function(dataManager, broadcast) {
    
    this.dm = dataManager;

    this.broadcast = broadcast
    this.analyzer = new Analyzer();
    this.emitter = new EventEmitter();
    this.emitter.on('kline', (function(symbol, data) {
        this.broadcastData('kline:' + symbol, data);
    }).bind(this));
}

DataInterface.prototype.write = function (name, coin, event) {
    this.dm.write(name, coin, event);
    switch (event) {
        case 'backtest':
            this.emitEvent(event, name, this.dm.readAll(name));
            break;
    
        case 'kline':
            this.emitEvent(event, name, { klines: coin});
            break;
    }
}

DataInterface.prototype.emitEvent = function (event, symbol, data) {
    this.emitter.emit(event, symbol, data);
}

DataInterface.prototype.simulateStream = function (symbol) {
    let data = this.dm.readAll(symbol);
    for (let i=0; i<data.length; i++) {
        // this.emitEvent('backtest', data.length, data.slice(0,i+1));
        this.emitEvent('backtest', data.slice(0,i+1));
    }
    this.emitEvent('backtestDone');
}

DataInterface.prototype.getCoinList = function() {
    return this.dm.getCoinList();
}

DataInterface.prototype.getCoinData = function(symbol) {
    return this.dm.readAll(symbol);
}

DataInterface.prototype.getCoinDataEntry = function(symbol, openTime) {
    return this.dm.getData(symbol,openTime);
}

DataInterface.prototype.requestData = function (type, options) {

    if (!('symbol' in options)) {
        return;
    }

    let data = {};
    let symbol = options.symbol;

    switch (type) {

        case 'offline':
            data = { offline: Object.keys(this.dm.coins) };
            break;

        case 'history':
            if (symbol in this.dm.coins) {
                data = {
                    klines: this.dm.readAll(symbol)
                }
            }
            break;

        case 'indicators':
            data = this.analyzer.indicators;
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
                            data: this.analyzer.MA(this.dm.readAll(symbol), options.indicator.params.frameLength),
                            params: options.indicator.params
                        }
                    }
                    break;

                case 'EMA':
                    data = {
                        ema: {
                            data: this.analyzer.EMA(this.dm.readAll(symbol), indicator.params.frameLength),
                            params: options.indicator.params
                        }
                    }
                    break;
                case 'RSI':
                    data = {
                        rsi: {
                            data: this.analyzer.RSI(this.dm.readAll(symbol), indicator.params.frameLength),
                            params: options.indicator.params
                        }
                    }
                    break;
                case 'MACD':
                    data = {
                        macd: {
                            data: this.analyzer.MACD(this.dm.readAll(symbol), indicator.params.fast, indicator.params.slow, indicator.params.signal),
                            params: options.indicator.params
                        }
                    }
                    break;

                default:
                    let tmpData = this.dm.readAll(symbol);
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

module.exports = DataInterface;