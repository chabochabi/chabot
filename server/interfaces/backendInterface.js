
var BackendInterface = function (dataManager, backtestManager, analysisManager, emitter, broadcaster) {
    this.dm = dataManager;
    this.bm = backtestManager;
    this.am = analysisManager;
    this.emitter = emitter;
    this.broadcaster = broadcaster;
    this.initEventHandling();

    this.REQUEST_PARAMS = {
        'backtestSymbolsList': ['symbol'],
        'history': ['symbol', 'source'],
        'backtestHistory': ['symbol'],
        'indicatorsData': ['symbol', 'source', 'indicator'],
        'strategies': ['symbol'],
        'indicators': ['symbol']
    }
}

BackendInterface.prototype.validOptions = function (reqType, options) {
    if (reqType in this.REQUEST_PARAMS) {
        for (let param of this.REQUEST_PARAMS[reqType]) {
            if (!(param in options)) {
                console.log('  * paramater ' + param + ' missing in ' + options);
                return false;
            }
        }
    }
    return true;
}

BackendInterface.prototype.initEventHandling = function () {
    this.emitter.on('klineHistory', (function (symbol, data) {
        this.broadcast('history' + ':' + symbol, data);
    }).bind(this));

    this.emitter.on('kline', (function (symbol, data) {
        this.broadcast('kline' + ':' + symbol, data);
    }).bind(this));

    this.emitter.on('trade', (function (symbol, data) {
        this.broadcast('trade' + ':' + symbol, data);
    }).bind(this));

    this.emitter.on('backtestData', (function (data) {
        this.broadcast('backtestData', data);
    }).bind(this));

    this.emitter.on('24hr', (function (data) {
        this.broadcast('24hr', data);
    }).bind(this));
}

BackendInterface.prototype.broadcast = function (type, data) {
    if (this.broadcaster) {
        this.broadcaster.send(type, data);
    }
}

BackendInterface.prototype.clientRequest = async function (req, options) {

    if (!this.validOptions(req, options))
        return;

    switch (req) {
        case 'backtestSymbolsList':
            data = { backtestSymbols: await this.bm.getBacktestSymbolList() }
            this.broadcast(req + ':' + options.symbol, data);
            break;

        case 'history':
            if (this.dm.hasSymbol(options.symbol, options.source)) {
                data = { klines: this.dm.readAll(options.symbol, options.source) };
                this.broadcast(req + ':' + options.symbol, data);
            } 
            break;

        case 'backtestHistory':
            if (this.dm.hasSymbol(options.symbol, 'backtest')) {
                data = { klines: this.dm.readAll(options.symbol, 'backtest') };
                this.broadcast('history:' + options.symbol, data);
            } else {
                this.bm.loadBacktestData(options.symbol);
            }
            break;

        case 'strategies':
            this.broadcast(req + ':' + options.symbol, this.am.getStrategies());
            break;

        case 'indicators':
            this.broadcast(req + ':' + options.symbol, this.am.getIndicators());
            break;

        case 'indicatorsData':
            this.broadcast(req + ':' + options.symbol, this.am.calcIndicator(options));
            break;

        case 'run-backtest':
            this.bm.runBacktest(options.symbol, options.source, options.strategy);
            break;

        default:
            break;
    }

}

module.exports = BackendInterface;