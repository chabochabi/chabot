
const EMA = require('../indicators/EMA');

var name = "BasicEMA";
var description = "Take a short and a long EMA. Mark Buy Flag whenever shortEMA goes higher than longEMA, mark Sell Flag when shortEMA goes lower than longEMA.";
var defaultParams = {
    short: 10,
    long: 19
}

var checkParams = function (params) {
    if (!params)
        return false;
    for (let p in defaultParams) {
        if (!(p in params))
            return false;
    }
    return true;
}

var BasicEMA = function (params) {
    
    this.params = defaultParams;
    if ((checkParams(params))) {
        this.params = params;
    }
    this.name = name;
    this.description = description;

    // for check function
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

    this.init();
}

BasicEMA.prototype.init = function () {
    this.ema1 = new EMA(this.params.short);
    this.ema2 = new EMA(this.params.long);
}

BasicEMA.prototype.update = function (kline) {

    this.ema1.update(kline);
    this.ema2.update(kline);

    this.updateCtr++;
    if (this.updateCtr >= this.params.long) {
        this.check(kline);
    }

    // this.ema1.calc(data);
    // this.ema2.calc(data);

    // this.check();
}

BasicEMA.prototype.check = function (kline) {
    var diff0 = this.diffs[this.diffIdx] || 0; // latest diff
    this.diffs[this.diffIdx] = this.ema1.emaValue - this.ema2.emaValue;
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

// BasicEMA.prototype.check = function () {

//     let ema1Length = this.ema1.result.length;
//     let ema2Length = this.ema2.result.length;

//     if (ema2Length >= 3) {

//         let diff1 = this.ema1.result[ema1Length - 1].value - this.ema2.result[ema2Length - 1].value; // ema1 > ema2
//         let diff2 = this.ema1.result[ema1Length - 2].value - this.ema2.result[ema2Length - 2].value; // ema1 >= ema1
//         let diff3 = this.ema1.result[ema1Length - 3].value - this.ema2.result[ema2Length - 3].value; // ema1 < ema2
//         let price = this.ema1.result[ema1Length - 1].price;
//         let time = this.ema1.result[ema1Length - 1].time + 60000; // close time + 1 ms

//         if (diff3 < 0 && diff2 >= 0 && diff1 > 0 && this.lastFlag == 0) {
//             this.flags[time] = 'buy';
//             this.lastFlag = 1;
//             this.record('buy', time, price);
//         } else if (diff2 > 0 && diff1 <= 0 && this.lastFlag == 1) {
//             this.flags[time] = 'sell';
//             this.lastFlag = 0;
//             this.record('sell', time, price);
//         }
//     }
// }

BasicEMA.prototype.record = function (action, time, price) {
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

module.exports = BasicEMA;