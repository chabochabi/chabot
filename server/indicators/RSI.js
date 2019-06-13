
const MA = require('../indicators/MA');

class RSI {

    constructor(frameLength) {
        this.frameLength = frameLength;
        this.maU = new MA(this.frameLength);
        this.maD = new MA(this.frameLength);
        this.prevClose = 0;
        this.rsiValue = 0;
        this.result = [];
    }

    setFrameLength(frameLength) {
        this.frameLength = frameLength;
    }

    update(kline) {
        let U = 0, D = 0;
        if (this.prevClose != 0) {
            if (kline.close > this.prevClose) {
                U = kline.close - this.prevClose;
                D = 0;
            } else if (kline.close < this.prevClose) {
                U = 0;
                D = this.prevClose - kline.close
            }

            this.maU.update({ close: U });
            this.maD.update({ close: D });
        }

        if (this.maU.frame.length == this.frameLength) {
            let RS = this.maU.maValue / this.maD.maValue;
            this.rsiValue = 100 - (100/(1+RS));
        }

        this.prevClose = kline.close;
    }

    calc(data) {
        data.forEach(kline => {
            this.update(kline);
            this.result.push({
                time: kline.openTime,
                value: this.rsiValue,
                price: kline.close
            });
        });
    }
}

module.exports = RSI;