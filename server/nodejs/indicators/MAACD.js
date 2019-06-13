
const MA = require('./MA');

class MAACD {
    
    constructor(fast, slow, signal) {
        this.fast = fast;
        this.slow = slow;
        this.signal = signal;

        this.macdValue = 0;
        this.signalValue = 0;
        this.result = {};

        this.fastMA = new MA(fast);
        this.slowMA = new MA(slow);
        this.signalMA = new MA(signal);
    }

    setFast(fast) {

        this.fast = fast;
        this.fastMA = new MA(fast);
    }

    setSlow(slow) {

        this.slow = slow;
        this.slowMA = new MA(slow);
    }

    setSignal(signal) {

        this.signal = signal;
        this.signalMA = new MA(signal);
    }

    update(kline) {
        this.fastMA.update(kline);
        this.slowMA.update(kline);
        this.macdValue = this.fastMA.maValue - this.slowMA.maValue;
        this.signalMA.update({
            openTime: kline.time,   // openTime instead of time, so that EMA works
            close: this.macdValue,  // close instead of time, so that EMA works
        });
        this.signalValue = this.signalMA.maValue;
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

module.exports = MAACD;