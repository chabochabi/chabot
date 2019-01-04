
const EMA = require('./EMA');

var TEMA = function (frameLength) {
    this.frameLength = frameLength;
    this.result = [];
    this.temaValue = 0;

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

TEMA.prototype.update = function (kline) {
    this.singleEMA.update(kline);

    // if (this.singleEMA.frame.length == this.frameLength) {
    this.doubleEMA.update({
        openTime: kline.time,
        close: this.singleEMA.emaValue,
    });
    // if (this.doubleEMA.frame.length == this.frameLength) {
    this.tripleEMA.update({
        openTime: kline.time,
        close: this.doubleEMA.emaValue,
    });
    this.temaValue = (3 * this.singleEMA.emaValue) - 3 * this.doubleEMA.emaValue + this.tripleEMA.emaValue;
    // }
    // } else {
    // this.temaValue = this.singleEMA.emaValue;
    // }
}

TEMA.prototype.calc = function (data) {

    data.forEach(kline => {
        this.update(kline);
        this.result.push({
            time: kline.openTime,
            value: this.temaValue,
            price: kline.close
        });
    });
}

// TEMA.prototype.calc = function (data) {

//     this.result = [];
//     this.singleEMA.calc(data);
//     var doubleData = [];
//     var tripleData = [];
//     var ctr = 0;
//     for (let single of this.singleEMA.result) {
//         doubleData.push({
//             openTime: single.time,
//             close: single.value
//         });
//         this.doubleEMA.calc(doubleData);
//         if (this.doubleEMA.result.length > 0) {
//             tripleData.push({
//                 openTime: this.doubleEMA.result[this.doubleEMA.result.length -1].time,
//                 close: this.doubleEMA.result[this.doubleEMA.result.length -1].value,
//             });
//         }
//         this.tripleEMA.calc(tripleData);
//         if (this.tripleEMA.result.length > 0) {
//             var lastTEMA = {
//                 time: single.time,
//                 value: (3 * single.value) - (3 * this.doubleEMA.result[this.doubleEMA.result.length -1].value) + this.tripleEMA.result[this.tripleEMA.result.length - 1].value,
//                 price: single.price
//             };
//             this.result.push(lastTEMA);
//         }
//     }
// }

module.exports = TEMA;