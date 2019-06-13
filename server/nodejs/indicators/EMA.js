const MA = require('./MA');

class EMA {
    constructor(frameLength) {
        this.frameLength = frameLength;
        this.multiplier = (2 / (this.frameLength + 1));
        this.ma = new MA(this.frameLength);
        this.emaValue = 0;
        this.result = [];
        this.sum = 0;
    }

    setFrameLength(frameLength) {
        this.frameLength = frameLength;
        this.ma.setFrameLength(this.frameLength);
    }

    update(kline) {
        this.ma.update(kline);
        if (this.ma.frame.length == this.frameLength) {
            this.emaValue = kline.close * this.multiplier + this.emaValue * (1 - this.multiplier);
        } else {
            this.emaValue = this.ma.maValue;
        }
    }

    calc(data) {

        data.forEach(kline => {
            this.update(kline);
            this.result.push({
                time: kline.openTime,
                value: this.emaValue,
                price: kline.close
            });
        });
    }
}

module.exports = EMA;