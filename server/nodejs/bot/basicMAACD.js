
const MAACD = require('../indicators/MAACD');

var name = "BasicMAACD";
var description = "Using MA: Set a buy flag whenever MACD > SIGNAL";
var defaultParams = {
    fast: 12,
    slow: 26,
    signal: 9
};

function checkParams(params) {
    if (!params)
        return false;
    for (let p in defaultParams) {
        if (!(p in params))
            return false;
    }
    return true;
}

class BasicMAACD {

    constructor(params) {
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

    init() {
        this.maacd = new MAACD(this.params.fast, this.params.slow, this.params.signal);
    }

    update(kline) {

        this.maacd.update(kline);

        this.updateCtr++;
        if (this.updateCtr >= this.params.slow) {
            this.check(kline);
        }

        // this.maacd.calc(kline);

        // // DO NOT CHANGE
        // this.check(kline);
    }

    check(kline) {
        var diff0 = this.diffs[this.diffIdx] || 0; // latest diff
        this.diffs[this.diffIdx] = this.maacd.macdValue - this.maacd.signalValue;
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

module.exports = BasicMAACD;