
const MACD = require('../indicators/MACD');

var name = "BasicMACD";
var description = "Set a buy flag whenever MACD > SIGNAL";
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
    this.params = defaultParams;
    if (checkParams(params)) {
        this.params = params;
    }
    this.name = name;
    this.description = description;
    this.init();
}

Strategy.prototype.init = function() {
    this.macd = new MACD(this.params.fast, this.params.slow, this.params.signal);
}

Strategy.prototype.update = function (data) {

    this.macd.calc(data);
    
    // DO NOT CHANGE
    this.check();
}


Strategy.prototype.check = function () {

    var signalLen = this.macd.result.signal.length;
    var macdLen = this.macd.result.macd.length;

    if (signalLen >= 3) {
        let diff1 = this.macd.result.macd[macdLen - 1].value - this.macd.result.signal[signalLen - 1].value;
        let diff2 = this.macd.result.macd[macdLen - 2].value - this.macd.result.signal[signalLen - 2].value;
        let diff3 = this.macd.result.macd[macdLen - 3].value - this.macd.result.signal[signalLen - 3].value;
        let time = this.macd.result.macd[macdLen - 1].time + 60000; // close time + 1 ms
        let price = this.macd.result.macd[macdLen - 1].price

        if (diff3 < 0 && diff2 >= 0 && diff1 > 0 && this.lastFlag == 0) {
            this.flags[time] = 'buy';
            this.lastFlag = 1;
            this.record('buy', time, price);
        } else if (diff2 > 0 && diff1 <= 0 && this.lastFlag == 1) {
            this.flags[time] = 'sell';
            this.lastFlag = 0;
            this.record('sell', time-60000, price);
        }
    }
}

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