const MA = require('./MA');

function stdDev(data) {

    let mu = 0;
    let N = data.length;
    let sum = 0;

    for (let x of data) {
        mu += x;
    }

    mu = mu / N;

    for (let x of data) {
        sum += (x - mu) ** 2;
    }

    return Math.sqrt(1 / N * sum);
}

// N, K
class BOLL {
    constructor(frameLength, multiplier) {
        this.frameLength = frameLength;
        this.multiplier = multiplier;
        this.ma = new MA(frameLength);
        this.result = [];
        this.frame = [];
        this.frameIndex = 0;
        this.upperVal = 0;
        this.lowerVal = 0;
        this.midVal = 0;
    }

    setFrameLength(frameLength) {
        this.frameLength = frameLength;
    }

    setMultiplier(multiplier) {
        this.multiplier = multiplier;
    }

    update(kline) {
        this.ma.update(kline);
        if (this.ma.frame.length == this.frameLength) {
            let stdDevValue = stdDev(this.ma.frame);
            this.upperVal = this.ma.maValue + this.multiplier * stdDevValue;
            this.lowerVal = this.ma.maValue - this.multiplier * stdDevValue;
            this.midVal = this.ma.maValue;
        }
    }

    calc(data) {

        var upperBoll = [];
        var lowerBoll = [];
        var midBoll = [];

        data.forEach(kline => {
            this.update(kline);

            upperBoll.push({
                time: kline.openTime,
                value: this.upperVal
            });
            lowerBoll.push({
                time: kline.openTime,
                value: this.lowerVal
            });
            midBoll.push({
                time: kline.openTime,
                value: this.midVal
            });

            this.result = {
                ma: midBoll,
                lowerBoll: lowerBoll,
                upperBoll: upperBoll
            };
        });
    }
}

module.exports = BOLL;