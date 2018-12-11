
const EMA = require('./EMA');

var MACD = function(fast, slow, signal) {
    this.fast = fast;
    this.slow = slow;
    this.signal = signal;

    this.macdValue = 0;
    this.signalValue = 0;
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

MACD.prototype.update = function(kline) {
    this.fastEMA.update(kline);
    this.slowEMA.update(kline);
    this.macdValue = this.fastEMA.emaValue - this.slowEMA.emaValue;
    this.signalEMA.update({
        openTime: kline.time,   // openTime instead of time, so that EMA works
        close: this.macdValue,  // close instead of time, so that EMA works
    });
    this.signalValue = this.signalEMA.emaValue;
}

MACD.prototype.calc = function(data) {

    var macdData = [];
    var signalData = [];

    data.forEach(kline => {
        this.update(kline);
        macdData.push({
            time: kline.closeTime+1,
            value: this.macdValue,
            price: kline.close
        });
        signalData.push({
            time: kline.closeTime+1,
            value: this.signalValue,
            price: kline.close
        });
    });
    this.result = {
        macd: macdData,
        signal:signalData
    };
}

// MACD.prototype.calc = function(data) {

//     this.fastEMA.calc(data);
//     let fastData = this.fastEMA.result;
//     this.slowEMA.calc(data);
//     let slowData = this.slowEMA.result;
    
//     let macdData = [];
//     let macdSignal = []; // this one is for the signal data calculation, cause EMA needs the fields to be openTime and close instead of time and value .... stupid... TODO

//     for (let i = 0; i < slowData.length; i++) {
//         let slowEMA = slowData[i];
//         let fastEMA = fastData[i + this.slow - this.fast];
//         macdSignal.push({
//             openTime: slowEMA.time, // openTime instead of time, so that EMA works
//             close: fastEMA.value - slowEMA.value, // close instead of time, so that EMA works
//         })
//         macdData.push({
//             time: slowEMA.time,
//             value: fastEMA.value - slowEMA.value,
//             price: slowEMA.price
//         })
//     }

//     this.signalEMA.calc(macdSignal);
//     let signalData = this.signalEMA.result;
//     this.result = { macd: macdData, signal: signalData };
// }

module.exports = MACD;