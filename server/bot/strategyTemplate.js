
/*
*  IMPORT INDICATORS
*  e.g. const EMA = require('../indicators/EMA');
*/

var name = "<<NAME>>";
var description = "<<DESCRIPTION>>";
var defaultParams = "<<DEFAULT_PARAMS>>";

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
    /*
    *  INIT INDICATORS
    */
}

Strategy.prototype.update = function (data) {

    /*
    *  CALC INDICATORS
    *  e.g. this.ema.calc(data);
    */
    
    // DO NOT CHANGE
    this.check();
}


Strategy.prototype.check = function () {
    /*
    *  DO ALL YOUR CHECKS AND DICISIONS
    *  e.g 
       if (diff3 < 0 && diff2 >= 0 && diff1 > 0 && this.lastFlag == 0) {
            this.flags[time] = 'buy';
            this.lastFlag = 1;
            this.record('buy', time, price);
        } else if (diff2 > 0 && diff1 <= 0 && this.lastFlag == 1) {
            this.flags[time] = 'sell';
            this.lastFlag = 0;
            this.record('sell', time, price);
        }
    */
}

// DO NOT CHANGE
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