
const EMA = require('./EMA');

class TEMA {

    constructor(frameLength) {
        this.frameLength = frameLength;
        this.result = [];
        this.temaValue = 0;

        this.singleEMA = new EMA(frameLength);
        this.doubleEMA = new EMA(frameLength);
        this.tripleEMA = new EMA(frameLength);
    }

    setFrameLength(frameLength) {

        this.frameLength = frameLength;
        this.singleEMA = new EMA(frameLength);
        this.doubleEMA = new EMA(frameLength);
        this.tripleEMA = new EMA(frameLength);
    }

    update(kline) {
        this.singleEMA.update(kline);

        this.doubleEMA.update({
            openTime: kline.time,
            close: this.singleEMA.emaValue,
        });

        this.tripleEMA.update({
            openTime: kline.time,
            close: this.doubleEMA.emaValue,
        });
        this.temaValue = (3 * this.singleEMA.emaValue) - 3 * this.doubleEMA.emaValue + this.tripleEMA.emaValue;
    }

    calc(data) {

        data.forEach(kline => {
            this.update(kline);
            this.result.push({
                time: kline.openTime,
                value: this.temaValue,
                price: kline.close
            });
        });
    }
}

module.exports = TEMA;