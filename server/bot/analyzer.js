const EMA = require('../indicators/EMA');
const MA = require('../indicators/MA');
const DEMA = require('../indicators/DEMA');
const TEMA = require('../indicators/TEMA');
const RSI = require('../indicators/RSI');
const MACD = require('../indicators/MACD');
const MAACD = require('../indicators/MAACD');
const BOLL = require('../indicators/BOLL');

class Analyzer {
    constructor() {

        this.indicators = {
            'MA': {
                frameLength: 15
            },
            'EMA': {
                frameLength: 10
            },
            'DEMA': {
                frameLength: 10
            },
            'TEMA': {
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
            'MAACD': {
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
        this.dema = new DEMA(this.indicators.DEMA.frameLength);
        this.tema = new TEMA(this.indicators.TEMA.frameLength);
        this.rsi = new RSI(this.indicators.RSI.frameLength);
        this.macd = new MACD(this.indicators.MACD.fast, this.indicators.MACD.slow, this.indicators.MACD.signal);
        this.maacd = new MAACD(this.indicators.MAACD.fast, this.indicators.MAACD.slow, this.indicators.MAACD.signal);
        this.boll = new BOLL(this.indicators.BOLL.frameLength, this.indicators.BOLL.multiplier);
    }

    getIndicators () {
        return this.indicators;
    }

    calcIndicators (symbol) {
        this.MA(symbol, 15);
        this.EMA(symbol, 10);
        this.DEMA(symbol, 10);
        this.TEMA(symbol, 10);
        this.RSI(symbol, 14);
        this.MACD(symbol, 12, 26, 9);
        this.MAACD(symbol, 12, 26, 9);
        this.BOLL(symbol, 21, 2);
    }

    MA (data, params) {

        this.ma = new MA(params.frameLength);
        this.ma.calc(data);

        return this.ma.result;
    }

    EMA (data, params) {

        this.ema = new EMA(params.frameLength);
        this.ema.calc(data);

        return this.ema.result;
    }

    DEMA (data, params) {

        this.dema = new DEMA(params.frameLength);
        this.dema.calc(data);

        return this.dema.result;
    }

    TEMA (data, params) {

        this.tema = new TEMA(params.frameLength);
        this.tema.calc(data);

        return this.tema.result;
    }

    MACD (data, params) {

        this.macd = new MACD(params.fast, params.slow, params.signal);
        this.macd.calc(data);

        return this.macd.result;
    }

    MAACD (data, params) {

        this.maacd = new MAACD(params.fast, params.slow, params.signal);
        this.maacd.calc(data);

        return this.maacd.result;
    }

    RSI (data, params) {

        this.rsi = new RSI(params.frameLength);
        this.rsi.calc(data);

        return this.rsi.result;
    }

    BOLL (data, params) {

        this.boll = new BOLL(params.frameLength, params.multiplier);
        this.boll.calc(data);

        return this.boll.result;
    }
}

module.exports = Analyzer;