
const Analyzer = require('../bot/analyzer');
const strategies = require('../bot/strategies');

var AnalysisManager = function (dataManager) {
    this.dm = dataManager;
    this.strategies = strategies;
    this.analyzer = new Analyzer();
}

AnalysisManager.prototype.getStrategies = function () {
    return this.strategies;
}

AnalysisManager.prototype.getIndicators = function () {
    return this.analyzer.getIndicators();
}

AnalysisManager.prototype.calcIndicator = function (options) {
    var indicatorData = {};
    switch (options.indicator.type) {
        case 'MA':
            indicatorData = {
                ma: {
                    data: this.analyzer.MA(this.dm.readAll(options.symbol, options.source), options.indicator.params),
                    params: options.indicator.params
                }
            }
            break;
        case 'EMA':
            indicatorData = {
                ema: {
                    data: this.analyzer.EMA(this.dm.readAll(options.symbol, options.source), options.indicator.params),
                    params: options.indicator.params
                }
            }
            break;
        case 'DEMA':
            indicatorData = {
                dema: {
                    data: this.analyzer.DEMA(this.dm.readAll(options.symbol, options.source), options.indicator.params),
                    params: options.indicator.params
                }
            }
            break;
        case 'TEMA':
            indicatorData = {
                tema: {
                    data: this.analyzer.TEMA(this.dm.readAll(options.symbol, options.source), options.indicator.params),
                    params: options.indicator.params
                }
            }
            break;
        case 'RSI':
            indicatorData = {
                rsi: {
                    data: this.analyzer.RSI(this.dm.readAll(options.symbol, options.source), options.indicator.params),
                    params: options.indicator.params
                }
            }
            break;
        case 'MACD':
            indicatorData = {
                macd: {
                    data: this.analyzer.MACD(this.dm.readAll(options.symbol, options.source), options.indicator.params),
                    params: options.indicator.params
                }
            }
            break;
        case 'MAACD':
            indicatorData = {
                maacd: {
                    data: this.analyzer.MAACD(this.dm.readAll(options.symbol, options.source), options.indicator.params),
                    params: options.indicator.params
                }
            }
            break;
        case 'BOLL':
            indicatorData = {
                boll: {
                    data: this.analyzer.BOLL(this.dm.readAll(options.symbol, options.source), options.indicator.params),
                    params: options.indicator.params
                }
            }
            break;

        default:
            break;
    }
    return indicatorData;
}

module.exports = AnalysisManager;
