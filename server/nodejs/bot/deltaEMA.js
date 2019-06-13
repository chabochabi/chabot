
const EMA = require('../indicators/EMA');

var name = "DeltaEMA";
var description = "Take two EMAs, short and long. Calculate %diff (short-long). Whenever %diff > DELTA (predefined), set a buy flag. Sell when %diff < DELTA";
var defaultParams = {
    short: 10,
    long: 19,
    delta: 0.0002
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

// DO NOT EDIT
class DeltaEMA {

    constructor(params) {

        this.params = defaultParams;
        if (checkParams(params)) {
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

        this.init();
    }

    init() {
        this.shortEMA = new EMA(this.params.short);
        this.longEMA = new EMA(this.params.long);
        this.delta = this.params.delta;
    }

    update(kline) {

        this.shortEMA.update(kline);
        this.longEMA.update(kline);
        this.updateCtr++;
        if (this.updateCtr > this.params.long) {
            this.check(kline);
        }
    }

    check(kline) {
        var shortValue = this.shortEMA.emaValue;
        var longValue = this.longEMA.emaValue;
        var diff = ((shortValue - longValue) / shortValue) * 100;
        var time = kline.closeTime + 1;
        var price = kline.close;

        if (diff >= this.delta && this.lastFlag == 0) {
            this.flags[time] = 'buy';
            this.lastFlag = 1;
            this.record('buy', time, price);
        } else if (diff <= this.delta && this.lastFlag == 1) {
            this.flags[time] = 'sell';
            this.lastFlag = 0;
            this.record('sell', time, price);
        }
    }

    // DO NOT CHANGE
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

module.exports = DeltaEMA;