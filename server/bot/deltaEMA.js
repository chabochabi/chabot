
const EMA = require('../indicators/EMA');

var name = "DeltaEMA";
var description = "Take two EMAs, short and long. Calculate %diff (short-long). Whenever %diff > DELTA (predefined), set a buy flag. Sell when %diff < DELTA";
var defaultParams = {
    short: 10,
    long: 19,
    delta: 0.0002
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

// DO NOT EDIT
var DeltaEMA = function (params) {
    this.lastFlag = 0; // 1 for up, 0 for down
    this.profits = {};
    this.buy = {};
    this.flags = {};
    this.params = defaultParams;
    if (checkParams(params)) {
        this.params = params;
    }
    this.name = name;
    this.description = description;
    this.init();
}

DeltaEMA.prototype.init = function () {
    this.shortEMA = new EMA(this.params.short);
    this.longEMA = new EMA(this.params.long);
    this.delta = this.params.delta;
}

DeltaEMA.prototype.update = function (data) {

    this.shortEMA.calc(data);
    this.longEMA.calc(data);

    // DO NOT CHANGE
    this.check();
}


DeltaEMA.prototype.check = function () {

    var shortLen = this.shortEMA.result.length;
    var longLen = this.longEMA.result.length;

    if (longLen >= 1) {
        var shortPrice = this.shortEMA.result[shortLen - 1].value;
        var longPrice = this.longEMA.result[longLen - 1].value
        var diff = ((shortPrice - longPrice)/shortPrice)*100;
        let time = this.shortEMA.result[shortLen - 1].time + 60000; // close time + 1 ms

        if (diff >= this.delta && this.lastFlag == 0) {
            this.flags[time] = 'buy';
            this.lastFlag = 1;
            this.record('buy', time, shortPrice);
        } else if (diff <= this.delta && this.lastFlag == 1){
            this.flags[time] = 'sell';
            this.lastFlag = 0;
            this.record('sell', time, shortPrice);
        }
    }
}

// DO NOT CHANGE
DeltaEMA.prototype.record = function (action, time, price) {
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

module.exports = DeltaEMA;