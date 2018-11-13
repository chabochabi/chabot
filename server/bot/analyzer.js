const EMA = require('../indicators/EMA');
const MA = require('../indicators/MA');
const RSI = require('../indicators/RSI');
const MACD = require('../indicators/MACD');
const BOLL = require('../indicators/BOLL');

var Analyzer = function () {

    this.indicators = {
        'MA': {
            frameLength: 15
        },
        'EMA': {
            frameLength: 10
        },
        'RSI': {
            frameLength: 14
        },
        'MACD': {
            fast: 12,
            slow: 26,
            signal: 9
        },
        'BOLL': {
            frameLength: 21,
            multiplier: 2
        }
    };

    this.ma = new MA(this.indicators.MA.frameLength);
    this.ema = new EMA(this.indicators.EMA.frameLength);
    this.rsi = new RSI(this.indicators.RSI.frameLength);
    this.macd = new MACD(this.indicators.MACD.fast, this.indicators.MACD.slow, this.indicators.MACD.signal);
    this.boll = new BOLL(this.indicators.BOLL.frameLength, this.indicators.BOLL.multiplier);
}

Analyzer.prototype.getIndicators = function () {
    return this.indicators;
}

Analyzer.prototype.calcIndicators = function (symbol) {
    this.MA(symbol, 15);
    this.RSI(symbol, 14);
    this.EMA(symbol, 10);
    this.MACD(symbol, 12, 26, 9);
    this.BOLL(symbol, 21, 2);
}

Analyzer.prototype.MA = function (data, params) {
    
    this.ma.setFrameLength(params.frameLength);
    this.ma.calc(data);

    return this.ma.result;
}

Analyzer.prototype.EMA = function (data, params) {

    this.ema.setFrameLength(params.frameLength);
    this.ema.calc(data);

    return this.ema.result;
}

Analyzer.prototype.MACD = function (data, params) {

    this.macd.setFast(params.fast);
    this.macd.setSlow(params.slow);
    this.macd.setSignal(params.signal);
    this.macd.calc(data);

    return this.macd.result;
}

Analyzer.prototype.RSI = function (data, params) {
    
    this.rsi.setFrameLength(params.frameLength);
    this.rsi.calc(data);
    
    return this.rsi.result;
}

Analyzer.prototype.BOLL = function (data, params) {

    this.boll.setFrameLength(params.frameLength);
    this.boll.setMultiplier(params.multiplier);
    this.boll.calc(data);

    return this.boll.result;
}

module.exports = Analyzer;