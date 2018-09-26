
/*
*  IMPORT INDICATORS
*  e.g. const EMA = require('../indicators/EMA');
*/


// DO NOT EDIT
var Strategy = function () {
    this.lastFlag = 0; // 1 for up, 0 for down
    this.profits = {};
    this.buy = {};
    this.flags = {};
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