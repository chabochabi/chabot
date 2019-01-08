
const EMA = require('./EMA');

class DEMA {
    constructor(frameLength) {
        this.frameLength = frameLength;
        this.result = [];
        this.demaValue = 0;

        this.innerEMA = new EMA(frameLength);
        this.outerEMA = new EMA(frameLength);
    }

    setFrameLength(frameLength) {

        this.frameLength = frameLength;
        this.innerEMA = new EMA(frameLength);
        this.outerEMA = new EMA(frameLength);
    }

    update(kline) {
        this.innerEMA.update(kline);
        this.outerEMA.update({
            openTime: kline.time,
            close: this.innerEMA.emaValue,
        });

        this.demaValue = (2 * this.innerEMA.emaValue) - this.outerEMA.emaValue;
    }

    calc(data) {

        data.forEach(kline => {
            this.update(kline);
            this.result.push({
                time: kline.openTime,
                value: this.demaValue,
                price: kline.close
            });
        });
    }
}

module.exports = DEMA;