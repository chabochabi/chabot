
const MAACD = require('../indicators/MAACD');

var name = "BasicMAACD";
var description = "Using MA: Set a buy flag whenever MACD > SIGNAL";
var defaultParams = {
    fast: 12,
    slow: 26,
    signal: 9
};

var checkParams = function (params) {
    if (!params)
        return false;
    for (let p in defaultParams) {
        if (!(p in params))
            return false;
    }
    return true;
}

// DO NOT EDIT
var Strategy = function (params) {
    this.lastFlag = 0; // 1 for up, 0 for down
    this.profits = {};
    this.buy = {};
    this.flags = {};
    this.updateCtr = 0;
    this.diffs = [];
    this.diff0 = false;
    this.diff1 = false;
    this.diff2 = false;
    this.diffIdx = 0;

    this.params = defaultParams;
    if (checkParams(params)) {
        this.params = params;
    }
    this.name = name;
    this.description = description;
    this.init();
}

Strategy.prototype.init = function() {
    this.maacd = new MAACD(this.params.fast, this.params.slow, this.params.signal);
}

Strategy.prototype.update = function (kline) {

    this.maacd.update(kline);

    this.updateCtr++;
    if (this.updateCtr >= this.params.slow) {
        this.check(kline);
    }

    // this.maacd.calc(kline);
    
    // // DO NOT CHANGE
    // this.check(kline);
}

Strategy.prototype.check = function (kline) {
    var diff0 = this.diffs[this.diffIdx] || 0; // latest diff
    this.diffs[this.diffIdx] = this.maacd.macdValue - this.maacd.signalValue;
    this.diffIdx = (this.diffIdx + 1) % 3;

    if (this.diffs.length > 2) {
        var diff0 = this.diffs[(this.diffIdx + 2) % 3];
        var diff1 = this.diffs[(this.diffIdx + 1) % 3];
        var diff2 = this.diffs[this.diffIdx];
        var time = kline.closeTime+1;
        var price = kline.close;

        if (diff2 < 0 && diff1 >= 0 && diff0 > 0 && this.lastFlag == 0) {
            this.flags[time] = 'buy';
            this.lastFlag = 1;
            this.record('buy', time, price);
        } else if (diff1 > 0 && diff0 <= 0 && this.lastFlag == 1) {
            this.flags[time] = 'sell';
            this.lastFlag = 0;
            this.record('sell', time, price);
        }
    }
}

// Strategy.prototype.check = function () {

//     var signalLen = this.maacd.result.signal.length;
//     var macdLen = this.maacd.result.macd.length;

//     if (signalLen >= 3) {
//         let diff1 = this.maacd.result.macd[macdLen - 1].value - this.maacd.result.signal[signalLen - 1].value;
//         let diff2 = this.maacd.result.macd[macdLen - 2].value - this.maacd.result.signal[signalLen - 2].value;
//         let diff3 = this.maacd.result.macd[macdLen - 3].value - this.maacd.result.signal[signalLen - 3].value;
//         let time = this.maacd.result.macd[macdLen - 1].time + 60000; // close time + 1 ms
//         let price = this.maacd.result.macd[macdLen - 1].price

//         if (diff3 < 0 && diff2 >= 0 && diff1 > 0 && this.lastFlag == 0) {
//             this.flags[time] = 'buy';
//             this.lastFlag = 1;
//             this.record('buy', time, price);
//         } else if (diff2 > 0 && diff1 <= 0 && this.lastFlag == 1) {
//             this.flags[time] = 'sell';
//             this.lastFlag = 0;
//             this.record('sell', time-60000, price);
//         }
//     }
// }

// CHANGE ACCORDING TO YOUR INDICATORS
Strategy.prototype.record = function (action, time, price) {
    if (action == 'buy') {
        this.buy = {
            time: time,
            price: price
        }
    } else if (action == 'sell') {
        this.profits[time] = {
            buy: this.buy,
            sell: {
                time: time,
                price: price
            }
        }
    }
}

module.exports = Strategy;