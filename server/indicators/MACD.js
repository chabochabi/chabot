
const EMA = require('./EMA');

class MACD {

    constructor(fast, slow, signal) {
        this.fast = fast;
        this.slow = slow;
        this.signal = signal;

        this.macdValue = 0;
        this.signalValue = 0;
        this.result = {};

        this.fastEMA = new EMA(fast);
        this.slowEMA = new EMA(slow);
        this.signalEMA = new EMA(signal);
    }

    setFast(fast) {

        this.fast = fast;
        this.fastEMA = new EMA(fast);
    }

    setSlow(slow) {

        this.slow = slow;
        this.slowEMA = new EMA(slow);
    }

    setSignal(signal) {

        this.signal = signal;
        this.signalEMA = new EMA(signal);
    }

    update(kline) {
        this.fastEMA.update(kline);
        this.slowEMA.update(kline);
        this.macdValue = this.fastEMA.emaValue - this.slowEMA.emaValue;
        this.signalEMA.update({
            openTime: kline.time,   // openTime instead of time, so that EMA works
            close: this.macdValue,  // close instead of time, so that EMA works
        });
        this.signalValue = this.signalEMA.emaValue;
    }

    calc(data) {

        var macdData = [];
        var signalData = [];

        data.forEach(kline => {
            this.update(kline);
            macdData.push({
                time: kline.closeTime + 1,
                value: this.macdValue,
                price: kline.close
            });
            signalData.push({
                time: kline.closeTime + 1,
                value: this.signalValue,
                price: kline.close
            });
        });
        this.result = {
            macd: macdData,
            signal: signalData
        };
    }
}

module.exports = MACD;