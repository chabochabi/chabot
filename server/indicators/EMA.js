const MA = require('./MA');

var EMA = function(frameLength) {
    this.frameLength = frameLength;
    this.multiplier = (2 / (this.frameLength + 1)); 
    this.ma = new MA(this.frameLength);
    this.emaValue = 0;
    this.result = [];
    this.sum = 0;
}

EMA.prototype.setFrameLength = function(frameLength) {
    this.frameLength = frameLength;
    this.ma.setFrameLength(this.frameLength);
}

EMA.prototype.update = function (kline) {
    this.ma.update(kline);
    if (this.ma.frame.length == this.frameLength) {
        // console.log(this.ma.frame.length == this.frameLength);
        this.emaValue = kline.close * this.multiplier + this.emaValue * (1 - this.multiplier);
    } else {
        this.emaValue = this.ma.maValue;
        // this.emaValue = kline.close;
    }
}

// EMA.prototype.calc = function (data) {

//     let smaSum = 0;
//     let lastEMA = 0;
//     let multiplier = (2 / (this.frameLength + 1));
//     let emaData = [];

//     if (data.length >= this.frameLength) {
//         for (let i = 0; i < data.length; i++) {
//             let entry = data[i];
//             if (i < (this.frameLength - 1)) {
//                 smaSum += entry.close;
//             } else if (i == (this.frameLength - 1)) {
//                 smaSum += entry.close;
//                 lastEMA = smaSum / this.frameLength;
//                 emaData.push({
//                     time: entry.openTime,
//                     value: lastEMA,
//                     price: entry.close
//                 });
//             } else {
//                 emaData.push({
//                     time: entry.openTime,
//                     value: (entry.close - lastEMA) * multiplier + lastEMA,
//                     price: entry.close
//                 })
//                 lastEMA = (entry.close - lastEMA) * multiplier + lastEMA;
//             }
//         }
//     }

//     this.result = emaData;
//     // return emaData;
// }

EMA.prototype.calc = function (data) {

    data.forEach(kline => {
        this.update(kline);
        this.result.push({
            time: kline.openTime,
            value: this.emaValue,
            price: kline.close
        });
    });
}

module.exports = EMA;