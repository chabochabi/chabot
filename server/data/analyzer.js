const EMA = require('../indicators/EMA');
const MA = require('../indicators/MA');
const RSI = require('../indicators/RSI');
const MACD = require('../indicators/MACD');

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
    };

    this.ma = new MA(this.indicators.MA.frameLength);
    this.ema = new EMA(this.indicators.EMA.frameLength);
    this.rsi = new RSI(this.indicators.RSI.frameLength);
    this.macd = new MACD(this.indicators.MACD.fast, this.indicators.MACD.slow, this.indicators.MACD.signal);
}

Analyzer.prototype.calcIndicators = function (symbol) {
    this.MA(symbol, 15);
    this.RSI(symbol, 14);
    this.EMA(symbol, 10);
    this.MACD(symbol, 12, 26, 9);
}

Analyzer.prototype.MA = function (data, frameLength) {
    
    this.ma.setFrameLength(frameLength);
    this.ma.calc(data);

    return this.ma.result;
}

Analyzer.prototype.EMA = function (data, frameLength) {

    this.ema.setFrameLength(frameLength);
    this.ema.calc(data);

    return this.ema.result;
}

Analyzer.prototype.MACD = function (data, fast, slow, signal) {

    this.macd.setFast(fast);
    this.macd.setSlow(slow);
    this.macd.setSignal(signal);
    this.macd.calc(data);

    return this.macd.result;
}

Analyzer.prototype.RSI = function (data, frameLength) {
    
    this.rsi.setFrameLength(frameLength);
    this.rsi.calc(data);
    
    return this.rsi.result;
}

module.exports = Analyzer;