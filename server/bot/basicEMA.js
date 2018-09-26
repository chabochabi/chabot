
const EMA = require('../indicators/EMA');
const MA = require('../indicators/MA');

var BasicEMA = function () {
    this.lastFlag = 0; // 1 for up, 0 for down
    this.profits = {};
    this.buy = {};
    this.flags = {};
    this.init();
}

BasicEMA.prototype.init = function() {
    this.ema10 = new EMA(10);
    this.ema20 = new EMA(19);
}

BasicEMA.prototype.update = function (data) {

    this.ema10.calc(data);
    this.ema20.calc(data);

    this.check();
}

BasicEMA.prototype.check = function () {

    let ema10Length = this.ema10.result.length;
    let ema20Length = this.ema20.result.length;

    if (ema20Length >= 3) {

        let diff1 = this.ema10.result[ema10Length - 1].value - this.ema20.result[ema20Length - 1].value; // ema10 > ema20
        let diff2 = this.ema10.result[ema10Length - 2].value - this.ema20.result[ema20Length - 2].value; // ema10 >= ema10
        let diff3 = this.ema10.result[ema10Length - 3].value - this.ema20.result[ema20Length - 3].value; // ema10 < ema20
        let price = this.ema10.result[ema10Length - 1].value;
        let time = this.ema10.result[ema10Length - 1].time + 60000; // close time + 1 ms

        if (diff3 < 0 && diff2 >= 0 && diff1 > 0 && this.lastFlag == 0) {
            this.flags[time] = 'up';
            this.lastFlag = 1;
            this.record('buy', time, price);
        } else if (diff2 > 0 && diff1 <= 0 && this.lastFlag == 1) {
            this.flags[time] = 'down';
            this.lastFlag = 0;
            this.record('sell', time, price);
        }
    }
}

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