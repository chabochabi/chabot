
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

DeltaEMA.prototype.init = function () {
    this.shortEMA = new EMA(this.params.short);
    this.longEMA = new EMA(this.params.long);
    this.delta = this.params.delta;
}

DeltaEMA.prototype.update = function (data) {

    this.shortEMA.update(data);
    this.longEMA.update(data);
    this.updateCtr++;
    if (this.updateCtr > this.params.long) {
        this.checkFUCK();
    }

    // this.shortEMA.calc(data);
    // this.longEMA.calc(data);

    // // DO NOT CHANGE
    // this.check();
}

DeltaEMA.prototype.checkFUCK = function () {
    var shortValue = this.shortEMA.emaValue;
    var longValue = this.longEMA.emaValue;
    var diff = ((shortValue - longValue)/shortValue)*100;
    var time = this.longEMA.time;
    var price = this.longEMA.price;

    if (diff >= this.delta && this.lastFlag == 0) {
        this.flags[time] = 'buy';
        this.lastFlag = 1;
        this.record('buy', time, price);
    } else if (diff <= this.delta && this.lastFlag == 1){
        this.flags[time] = 'sell';
        this.lastFlag = 0;
        this.record('sell', time, price);
    }
}

DeltaEMA.prototype.check = function () {

    var shortLen = this.shortEMA.result.length;
    var longLen = this.longEMA.result.length;

    if (longLen >= 1) {
        var shortValue = this.shortEMA.result[shortLen - 1].value;
        var longValue = this.longEMA.result[longLen - 1].value
        var diff = ((shortValue - longValue)/shortValue)*100;
        let time = this.shortEMA.result[shortLen - 1].time + 60000; // close time + 1 ms
        let price = this.longEMA.result[longLen - 1].price;

        if (diff >= this.delta && this.lastFlag == 0) {
            this.flags[time] = 'buy';
            this.lastFlag = 1;
            this.record('buy', time, price);
        } else if (diff <= this.delta && this.lastFlag == 1){
            this.flags[time] = 'sell';
            this.lastFlag = 0;
            this.record('sell', time, price);
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