
const MA = require('./MA');

var MAACD = function(fast, slow, signal) {
    this.fast = fast;
    this.slow = slow;
    this.signal = signal;

    this.macdValue = 0;
    this.signalValue = 0;
    this.result = {};

    this.fastMA = new MA(fast);
    this.slowMA = new MA(slow);
    this.signalMA = new MA(signal);
}

MAACD.prototype.setFast = function(fast) {

    this.fast = fast;
    this.fastMA = new MA(fast);
}

MAACD.prototype.setSlow = function(slow) {

    this.slow = slow;
    this.slowMA = new MA(slow);
}

MAACD.prototype.setSignal = function(signal) {

    this.signal = signal;
    this.signalMA = new MA(signal);
}

MAACD.prototype.update = function(kline) {
    this.fastMA.update(kline);
    this.slowMA.update(kline);
    this.macdValue = this.fastMA.maValue - this.slowMA.maValue;
    this.signalMA.update({
        openTime: kline.time,   // openTime instead of time, so that EMA works
        close: this.macdValue,  // close instead of time, so that EMA works
    });
    this.signalValue = this.signalMA.maValue;
}

MAACD.prototype.calc = function(data) {
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

// MAACD.prototype.calc = function(data) {

//     this.fastMA.calc(data);
//     let fastData = this.fastMA.result;
//     this.slowMA.calc(data);
//     let slowData = this.slowMA.result;
    
//     let macdData = [];
//     let macdSignal = []; // this one is for the signal data calculation, cause EMA needs the fields to be openTime and close instead of time and value .... stupid... TODO

//     for (let i = 0; i < slowData.length; i++) {
//         let slowMA = slowData[i];
//         let fastMA = fastData[i + this.slow - this.fast];
//         macdSignal.push({
//             openTime: slowMA.time, // openTime instead of time, so that EMA works
//             close: fastMA.value - slowMA.value, // close instead of time, so that EMA works
//         })
//         macdData.push({
//             time: slowMA.time,
//             value: fastMA.value - slowMA.value,
//             price: slowMA.price
//         })
//     }

//     this.signalMA.calc(macdSignal);
//     let signalData = this.signalMA.result;
//     this.result = { macd: macdData, signal: signalData };
// }

module.exports = MAACD;