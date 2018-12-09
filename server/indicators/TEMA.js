
const EMA = require('./EMA');

var TEMA = function (frameLength) {
    this.frameLength = frameLength;
    this.result = [];

    this.singleEMA = new EMA(frameLength);
    this.doubleEMA = new EMA(frameLength);
    this.tripleEMA = new EMA(frameLength);
}

TEMA.prototype.setFrameLength = function (frameLength) {

    this.frameLength = frameLength;
    this.singleEMA = new EMA(frameLength);
    this.doubleEMA = new EMA(frameLength);
    this.tripleEMA = new EMA(frameLength);
}

TEMA.prototype.calc = function (data) {

    this.result = [];
    this.singleEMA.calc(data);
    var doubleData = [];
    var tripleData = [];
    var ctr = 0;
    for (let single of this.singleEMA.result) {
        doubleData.push({
            openTime: single.time,
            close: single.value
        });
        this.doubleEMA.calc(doubleData);
        if (this.doubleEMA.result.length > 0) {
            tripleData.push({
                openTime: this.doubleEMA.result[this.doubleEMA.result.length -1].time,
                close: this.doubleEMA.result[this.doubleEMA.result.length -1].value,
            });
        }
        this.tripleEMA.calc(tripleData);
        if (this.tripleEMA.result.length > 0) {
            var lastTEMA = {
                time: single.time,
                value: (3 * single.value) - (3 * this.doubleEMA.result[this.doubleEMA.result.length -1].value) + this.tripleEMA.result[this.tripleEMA.result.length - 1].value,
                price: single.price
            };
            this.result.push(lastTEMA);
        }
    }
}

module.exports = TEMA;