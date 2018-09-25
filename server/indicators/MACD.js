
const EMA = require('./EMA');

var MACD = function(fast, slow, signal) {
    this.fast = fast;
    this.slow = slow;
    this.signal = signal;

    this.result = {};

    this.fastEMA = new EMA(fast);
    this.slowEMA = new EMA(slow);
    this.signalEMA = new EMA(signal);
}

MACD.prototype.setFast = function(fast) {

    this.fast = fast;
    this.fastEMA = new EMA(fast);
}

MACD.prototype.setSlow = function(slow) {

    this.slow = slow;
    this.slowEMA = new EMA(slow);
}

MACD.prototype.setSignal = function(signal) {

    this.signal = signal;
    this.signalEMA = new EMA(signal);
}

MACD.prototype.calc = function(data) {

    this.fastEMA.calc(data);
    let fastData = this.fastEMA.result;
    this.slowEMA.calc(data);
    let slowData = this.slowEMA.result;
    
    let macdData = [];
    let macdSignal = []; // this one is for the signal data calculation, cause EMA needs the fields to be openTime and close instead of time and value .... stupid... TODO

    for (let i = 0; i < slowData.length; i++) {
        let slowEMA = slowData[i];
        let fastEMA = fastData[i + this.slow - this.fast];
        macdSignal.push({
            openTime: slowEMA.time,
            close: fastEMA.value - slowEMA.value
        })
        macdData.push({
            time: slowEMA.time,
            value: fastEMA.value - slowEMA.value
        })
    }

    this.signalEMA.calc(macdSignal);
    let signalData = this.signalEMA.result;
    this.result = { macd: macdData, signal: signalData };
}

module.exports = MACD;