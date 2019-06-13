
const EMA = require('../indicators/EMA');

var name = "BasicEMA";
var description = "Take a short and a long EMA. Mark Buy Flag whenever shortEMA goes higher than longEMA, mark Sell Flag when shortEMA goes lower than longEMA.";
var defaultParams = {
    short: 10,
    long: 19
}

function checkParams(params) {
    if (!params)
        return false;
    for (let p in defaultParams) {
        if (!(p in params))
            return false;
    }
    return true;
}

class BasicEMA {

    constructor(params) {
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

    init() {
        this.ema1 = new EMA(this.params.short);
        this.ema2 = new EMA(this.params.long);
    }

    update(kline) {

        this.ema1.update(kline);
        this.ema2.update(kline);

        this.updateCtr++;
        if (this.updateCtr >= this.params.long) {
            this.check(kline);
        }
    }

    check(kline) {
        var diff0 = this.diffs[this.diffIdx] || 0; // latest diff
        this.diffs[this.diffIdx] = this.ema1.emaValue - this.ema2.emaValue;
        this.diffIdx = (this.diffIdx + 1) % 3;

        if (this.diffs.length > 2) {
            var diff0 = this.diffs[(this.diffIdx + 2) % 3];
            var diff1 = this.diffs[(this.diffIdx + 1) % 3];
            var diff2 = this.diffs[this.diffIdx];
            var time = kline.closeTime + 1;
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

    record(action, time, price) {
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
}

module.exports = BasicEMA;