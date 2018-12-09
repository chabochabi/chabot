
const EMA = require('./EMA');

var DEMA = function (frameLength) {
    this.frameLength = frameLength;
    this.result = [];

    this.innerEMA = new EMA(frameLength);
    this.outerEMA = new EMA(frameLength);
}

DEMA.prototype.setFrameLength = function (frameLength) {

    this.frameLength = frameLength;
    this.innerEMA = new EMA(frameLength);
    this.outerEMA = new EMA(frameLength);
}

DEMA.prototype.calc = function (data) {

    this.result = [];
    this.innerEMA.calc(data);
    var outerData = [];

    for (let entry of this.innerEMA.result) {
        outerData.push({
            openTime: entry.time,
            close: entry.value
        });
        this.outerEMA.calc(outerData);
        if (this.outerEMA.result.length > 0) {
            var outerLen = this.outerEMA.result.length;
            var lastDEMA = {
                time: entry.time,
                value: (2 * entry.value) - this.outerEMA.result[outerLen - 1].value,
                price: entry.price
            };
            this.result.push(lastDEMA);
        }
    }
}

module.exports = DEMA;