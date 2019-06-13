
class MA {

    constructor(frameLength) {
        this.frameLength = frameLength;
        this.sum = 0;
        this.frame = [];
        this.frameIndex = 0;
        this.maValue = 0;
        this.result = [];
    }

    setFrameLength(frameLength) {
        this.frameLength = frameLength;
    }

    update(kline) {

        var last = this.frame[this.frameIndex] || 0;
        this.frame[this.frameIndex] = kline.close;
        this.sum += kline.close - last;
        this.frameIndex = (this.frameIndex + 1) % this.frameLength;
        this.maValue = this.sum / this.frame.length;
    }

    calc(data) {
        // reset all
        this.sum = 0;
        this.frame = [];
        this.frameIndex = 0;
        this.maValue = 0;
        this.result = [];

        data.forEach(kline => {
            this.update(kline);
            this.result.push({
                time: kline.closeTime + 1,
                value: this.maValue
            });
        });
    }
}

module.exports = MA;