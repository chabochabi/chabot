
const TEMA = require('../indicators/TEMA');

var name = "BasicTEMA";
var description = "Take a short and a long TEMA. Mark Buy Flag whenever shortTEMA goes higher than longTEMA, mark Sell Flag when shortTEMA goes lower than longTEMA.";
var defaultParams = {
    short: 15,
    long: 30
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

var BasicTEMA = function (params) {
    
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

BasicTEMA.prototype.init = function () {
    this.tema1 = new TEMA(this.params.short);
    this.tema2 = new TEMA(this.params.long);
}

BasicTEMA.prototype.update = function (kline) {

    this.tema1.update(kline);
    this.tema2.update(kline);

    this.updateCtr++;
    if (this.updateCtr >= this.params.long) {
        this.check(kline);
    }
}

BasicTEMA.prototype.check = function (kline) {
    var diff0 = this.diffs[this.diffIdx] || 0; // latest diff
    this.diffs[this.diffIdx] = this.tema1.temaValue - this.tema2.temaValue;
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

// BasicTEMA.prototype.check = function () {

//     let tema1Length = this.tema1.result.length;
//     let tema2Length = this.tema2.result.length;

//     if (tema2Length >= 3) {

//         let diff1 = this.tema1.result[tema1Length - 1].value - this.tema2.result[tema2Length - 1].value; // tema1 > tema2
//         let diff2 = this.tema1.result[tema1Length - 2].value - this.tema2.result[tema2Length - 2].value; // tema1 >= tema1
//         let diff3 = this.tema1.result[tema1Length - 3].value - this.tema2.result[tema2Length - 3].value; // tema1 < tema2
//         let price = this.tema1.result[tema1Length - 1].price;
//         let time = this.tema1.result[tema1Length - 1].time + 60000; // close time + 1 ms

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

BasicTEMA.prototype.record = function (action, time, price) {
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

module.exports = BasicTEMA;